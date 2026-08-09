import Phaser from "phaser";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { BattleManager, CardBlockReason } from "../systems/BattleManager";
import { RunManager } from "../systems/RunManager";
import { Deck } from "../cards/Deck";
import { Card, CardType } from "../cards/Card";
import { EnemyCard } from "../cards/EnemyCard";
import { CardDatabase } from "../cards/CardDatabase";
import { HandView } from "../ui/HandView";
import { Button } from "../ui/Button";
import { DepthTrack } from "../ui/DepthTrack";
import { StatPanel } from "../ui/StatPanel";
import { SurfaceLine } from "../ui/SurfaceLine";
import { DialogBox } from "../ui/DialogBox";
import { SprayEffect } from "../ui/SprayEffect";
import { formatCardEffects } from "../ui/formatCardEffects";
import { EventBus, GameEvents } from "../utils/EventBus";
import { Character } from "../entities/Character";
import {
  HAND_SIZE,
  ATTACK_ANIMATION_MS,
  MAX_RESHUFFLES_PER_STAGE,
} from "../config/Constants";
import { EnemyFactory } from "../entities/EnemyFactory";
import { EnemyDatabase } from "../entities/EnemyDatabase";
import { AssetKeys } from "../utils/AssetKeys";
import { RewardSceneData } from "./RewardScene";

export interface BattleSceneData {
  enemyId: string;
}

const PLAYER_COLOR = 0x4fc3f7;
const ENEMY_COLOR = 0xff8080;
const ENEMY_TURN_BANNER_FONT_SIZE = "22px";
const ENEMY_TURN_DELAY_MS = 1500;

// 플레이어 수심이 이 값 이하(=해수면에 거의 도달)면 위기감을 주기 위해 전투 BGM을 빠르게 재생한다.
const LOW_DEPTH_BGM_THRESHOLD = 200;
const LOW_DEPTH_BGM_RATE = 1.5;

// 배경(battle.png)의 수면 광선/포말이 대략 y=0~45 구간에 걸쳐 있어, 그 경계에 맞춘 값이다.
// DepthTrack의 top(=수심 0, "해수면 도달" 위치)이 항상 이 값과 일치하도록 트랙 높이를 역산한다.
const SURFACE_Y = 45;
const DEPTH_TRACK_BOTTOM_Y = 420;
const DEPTH_TRACK_HEIGHT = DEPTH_TRACK_BOTTOM_Y - SURFACE_Y;

const BLOCK_REASON_MESSAGES: Record<CardBlockReason, string> = {
  insufficientStamina: "스태미나가 부족하여 카드를 사용할 수 없습니다.",
  depthMax: "수심이 최대치임으로\n잠수 카드를 사용할 수 없습니다.",
  staminaMax: "스태미너가 최대치임으로\n스태미너 카드를 사용할 수 없습니다.",
  stunned: "기절 상태라 카드를 사용할 수 없습니다.",
  noDebuffToCancel: "제거할 상태이상이 없어\n카드를 사용할 수 없습니다.",
};

const HAND_FULL_MESSAGE = "손에 들 수 있는 카드가 최대치입니다.";
const NO_RESHUFFLES_LEFT_MESSAGE = "이번 스테이지에서 재셔플을 더 사용할 수 없습니다.";

// 카드 타입별 사용 효과음. 플레이어/적 공용이며(둘 다 GameEvents.CardPlayed로 들어옴),
// 매핑이 없는 타입(special)은 소리 없이 넘어간다.
const CARD_TYPE_SOUND_KEYS: Partial<Record<CardType, string>> = {
  attack: AssetKeys.audio.sfxAttack,
  dive: AssetKeys.audio.sfxDive,
  defense: AssetKeys.audio.sfxDefend,
};

export class BattleScene extends Phaser.Scene {
  private battleManager!: BattleManager;
  private deck!: Deck<Card>;
  private handView!: HandView;
  private player!: Player;
  private enemy!: Enemy;
  private playerDepthTrack!: DepthTrack;
  private enemyDepthTrack!: DepthTrack;
  private playerPanel!: StatPanel;
  private enemyPanel!: StatPanel;
  private dialogBox!: DialogBox;
  private reshuffleButton!: Button;
  private selectedCard: Card | null = null;
  private bgm?: Phaser.Sound.BaseSound & { setRate(value: number): unknown };

  constructor() {
    super("Battle");
  }

  create(data: BattleSceneData): void {
    // 가장 먼저 추가해야 다른 모든 요소 뒤에 깔린다. 정적 베이스 위에 fx 애니메이션을
    // 일반 투명도(알파)로 겹쳐서 물빛 효과를 낸다.
    const backgroundCenterX = this.scale.width / 2;
    const backgroundCenterY = this.scale.height / 2;

    this.add
      .image(backgroundCenterX, backgroundCenterY, AssetKeys.images.backgroundBattleStatic)
      .setDisplaySize(this.scale.width, this.scale.height);

    this.add
      .sprite(backgroundCenterX, backgroundCenterY, AssetKeys.images.backgroundBattleFx)
      .setDisplaySize(this.scale.width, this.scale.height)
      .play(AssetKeys.animations.backgroundBattleFxAmbient);

    this.player = new Player();
    this.enemy = EnemyFactory.create(data.enemyId, EnemyDatabase.getStats(data.enemyId));
    this.battleManager = new BattleManager(this.player, this.enemy);
    // 기본 카드 + 이 런에서 처치한 적에게서 얻은 히든 카드(RunManager.addCard로 지급됨)를 합친다.
    this.deck = new Deck([
      ...CardDatabase.getAll().filter((card) => !card.hidden),
      ...RunManager.getInstance().getOwnedCards(),
    ]);

    if (this.enemy.bgmKey) {
      this.bgm = this.sound.add(this.enemy.bgmKey);
      this.bgm.play({ loop: true });
    }

    new SurfaceLine(this, SURFACE_Y, this.scale.width);

    this.playerDepthTrack = new DepthTrack(
      this,
      320,
      DEPTH_TRACK_BOTTOM_Y,
      DEPTH_TRACK_HEIGHT,
      PLAYER_COLOR,
      AssetKeys.images.player,
      AssetKeys.animations.playerIdle
    );
    this.enemyDepthTrack = new DepthTrack(
      this,
      1000,
      DEPTH_TRACK_BOTTOM_Y,
      DEPTH_TRACK_HEIGHT,
      ENEMY_COLOR,
      this.enemy.spriteKey,
      this.enemy.idleAnimKey
    );

    this.playerPanel = new StatPanel(this, 60, 440, "플레이어", true, true);
    this.enemyPanel = new StatPanel(this, 800, 60, this.enemy.name, true);

    this.handView = new HandView(
      this,
      300,
      650,
      (card) => this.onCardClicked(card),
      (card) => this.onCardDoubleClicked(card)
    );

    this.reshuffleButton = new Button(this, 1090, 580, this.getReshuffleButtonLabel(), () =>
      this.onReshuffle()
    );
    new Button(this, 1090, 630, "카드 뽑기", () => this.onDrawCard());
    new Button(this, 1090, 680, "턴 종료", () => this.onEndTurn());

    this.dialogBox = new DialogBox(this, 640, 360);

    this.handView.render(this.deck.draw(HAND_SIZE));
    this.refreshGauges();

    EventBus.on(GameEvents.CardPlayed, this.onCardPlayedShowDialog, this);
    EventBus.on(GameEvents.CardPlayed, this.onCardPlayedSound, this);
    EventBus.on(GameEvents.EnemyCardPlayed, this.onEnemyCardPlayed, this);
    EventBus.on(GameEvents.BattleEnded, this.onBattleEnded, this);
    EventBus.on(GameEvents.DepthChanged, this.onDepthChanged, this);

    // EventBus는 씬과 무관하게 앱 전역에서 계속 살아있는 싱글턴이라, 씬이 재시작될 때마다
    // (스테이지마다 반복) 여기서 등록한 리스너를 반드시 해제해야 계속 쌓여 버벅이지 않는다.
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off(GameEvents.CardPlayed, this.onCardPlayedShowDialog, this);
      EventBus.off(GameEvents.CardPlayed, this.onCardPlayedSound, this);
      EventBus.off(GameEvents.EnemyCardPlayed, this.onEnemyCardPlayed, this);
      EventBus.off(GameEvents.BattleEnded, this.onBattleEnded, this);
      EventBus.off(GameEvents.DepthChanged, this.onDepthChanged, this);
      // BGM도 씬과 무관한 전역 사운드 매니저 위에서 재생되므로, 씬을 나갈 때 직접 멈춰야
      // 다음 화면(보상/게임오버/다음 스테이지)까지 계속 흘러나오지 않는다.
      this.bgm?.stop();
    });
  }

  private onCardPlayedShowDialog(card: Pick<Card, "name" | "description" | "effects">): void {
    this.dialogBox.show(
      [card.name, "", card.description, "", formatCardEffects(card.effects)].join("\n")
    );
  }

  private onCardPlayedSound(card: Pick<Card, "type">): void {
    const soundKey = CARD_TYPE_SOUND_KEYS[card.type];
    if (soundKey) this.sound.play(soundKey);
  }

  private onEnemyCardPlayed(card: Pick<EnemyCard, "type">): void {
    if ((card.type === "attack" || card.type === "special") && this.enemy.attackAnimKey) {
      this.enemyDepthTrack.playTemporaryAnimation(this.enemy.attackAnimKey, ATTACK_ANIMATION_MS);
    }
  }

  // 플레이어든 적이든 수심이 실제로 바뀔 때마다(피해/잠수 카드 등) 그 캐릭터 발밑에 물보라를 띄운다.
  private onDepthChanged(character: Character): void {
    const track = character === this.player ? this.playerDepthTrack : this.enemyDepthTrack;
    const { x, y } = track.getTokenBottomWorldPosition();
    new SprayEffect(this, x, y);
  }

  private onBattleEnded(result: "victory" | "defeat"): void {
    // 플레이어든 적이든 수심 0에 도달해 전투가 끝난 상황이라 승패와 무관하게 재생한다.
    this.sound.play(AssetKeys.audio.sfxDeath);
    if (result === "victory") {
      const grantedCard = this.battleManager.getLastGrantedCard();
      this.scene.start("Reward", { grantedCard } as RewardSceneData);
    } else {
      this.scene.start("GameOver");
    }
  }

  // 카드를 클릭하면 즉시 사용되지 않고 "선택"만 된다. 같은 카드를 다시 클릭하면 선택 해제,
  // 사용할 수 없는 카드를 클릭하면 흔들림으로 경고한다. 실제 사용은 턴 종료 시 이뤄진다.
  private onCardClicked(card: Card): void {
    if (this.selectedCard === card) {
      this.selectedCard = null;
      this.handView.setSelected(null);
      this.dialogBox.hide();
      return;
    }

    const blockReason = this.battleManager.getBlockReason(card);
    if (blockReason) {
      this.handView.shakeCard(card);
      this.dialogBox.show(BLOCK_REASON_MESSAGES[blockReason]);
      return;
    }

    this.selectedCard = card;
    this.handView.setSelected(card);
    this.dialogBox.showPersistent(
      [card.description, "", formatCardEffects(card.effects)].join("\n")
    );
  }

  // 더블클릭은 "선택 + 즉시 턴 종료(사용)"를 한 번에 수행하는 단축 동작이다.
  private onCardDoubleClicked(card: Card): void {
    const blockReason = this.battleManager.getBlockReason(card);
    if (blockReason) {
      this.handView.shakeCard(card);
      this.dialogBox.show(BLOCK_REASON_MESSAGES[blockReason]);
      return;
    }

    this.selectedCard = card;
    this.onEndTurn();
  }

  // "카드 뽑기": 빈 슬롯 수만큼만 채워 뽑는다. 스테이지당 횟수 제한은 없고, 손패가 이미
  // 최대치일 때만 안내만 띄운다.
  private onDrawCard(): void {
    if (this.deck.getHand().length >= HAND_SIZE) {
      this.dialogBox.show(HAND_FULL_MESSAGE);
      return;
    }

    this.deck.draw(HAND_SIZE - this.deck.getHand().length);
    this.handView.render(this.deck.getHand());
    this.sound.play(AssetKeys.audio.sfxCardDraw);
  }

  // "재셔플": 아직 사용하지 않은 현재 손패를 전부 되돌리고 그 중에서 무작위로 다시 뽑아
  // 손패를 재배열한다. 이미 사용(버림더미로 이동)된 카드는 대상에서 제외된다.
  // 스테이지당 MAX_RESHUFFLES_PER_STAGE번까지만 사용할 수 있다.
  private onReshuffle(): void {
    const runManager = RunManager.getInstance();
    if (runManager.getRemainingReshuffles() <= 0) {
      this.dialogBox.show(NO_RESHUFFLES_LEFT_MESSAGE);
      return;
    }

    runManager.useReshuffle();
    this.deck.reshuffleHand(HAND_SIZE);
    this.handView.render(this.deck.getHand());
    this.reshuffleButton.setText(this.getReshuffleButtonLabel());
  }

  private getReshuffleButtonLabel(): string {
    const remaining = RunManager.getInstance().getRemainingReshuffles();
    return `재셔플 (${remaining}/${MAX_RESHUFFLES_PER_STAGE})`;
  }

  private onEndTurn(): void {
    if (this.selectedCard) {
      const played = this.deck.playFromHand(this.selectedCard);
      if (played) this.battleManager.playCard(played);

      if (this.selectedCard.type === "attack" || this.selectedCard.type === "special") {
        this.playerDepthTrack.playTemporaryAnimation(
          AssetKeys.animations.playerAttack,
          ATTACK_ANIMATION_MS
        );
      }

      this.selectedCard = null;

      // 카드 효과(상태이상 부여 등)를 즉시 반영해서 보여준다. 특히 1턴짜리 상태이상은 곧이어
      // 적 턴이 진행되며 바로 소모되므로, 여기서 갱신하지 않으면 상태창에 뜰 기회 자체가 없다.
      this.refreshGauges();
    }

    // 플레이어 턴이 끝났음을 잠깐 알린 뒤 적 턴을 진행한다.
    this.dialogBox.show("Enemy Turn !", ENEMY_TURN_BANNER_FONT_SIZE);

    this.time.delayedCall(ENEMY_TURN_DELAY_MS, () => {
      this.battleManager.endPlayerTurn();

      // 손패를 다 쓰면 덱(히든 카드 제외)에서 다시 4장을 뽑아 채운다.
      if (this.deck.getHand().length === 0) {
        this.handView.render(this.deck.draw(HAND_SIZE));
      } else {
        this.handView.render(this.deck.getHand());
      }

      this.refreshGauges();
    });
  }

  private refreshGauges(): void {
    this.playerDepthTrack.updateDepth(this.player.getDepth());
    this.enemyDepthTrack.updateDepth(this.enemy.getDepth());
    this.playerPanel.refresh(this.player, RunManager.getInstance().getStamina());
    this.enemyPanel.refresh(this.enemy);
    this.updateBgmRate();
  }

  private updateBgmRate(): void {
    const isLowDepth = this.player.getDepth() <= LOW_DEPTH_BGM_THRESHOLD;
    this.bgm?.setRate(isLowDepth ? LOW_DEPTH_BGM_RATE : 1);
  }
}
