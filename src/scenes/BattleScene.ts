import Phaser from "phaser";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { BattleManager } from "../systems/BattleManager";
import { Deck } from "../cards/Deck";
import { Card } from "../cards/Card";
import { CardDatabase } from "../cards/CardDatabase";
import { HandView } from "../ui/HandView";
import { DepthTrack } from "../ui/DepthTrack";
import { StatPanel } from "../ui/StatPanel";
import { SurfaceLine } from "../ui/SurfaceLine";
import { DialogBox } from "../ui/DialogBox";
import { formatCardEffects } from "../ui/formatCardEffects";
import { EventBus, GameEvents } from "../utils/EventBus";
import { HAND_SIZE, FONT_FAMILY } from "../config/Constants";
import { FusionShark } from "../enemies/FusionShark";
import { AssetKeys } from "../utils/AssetKeys";

const PLAYER_COLOR = 0x4fc3f7;
const ENEMY_COLOR = 0xff8080;

export class BattleScene extends Phaser.Scene {
  private battleManager!: BattleManager;
  private deck!: Deck;
  private handView!: HandView;
  private player!: Player;
  private enemy!: Enemy;
  private playerDepthTrack!: DepthTrack;
  private enemyDepthTrack!: DepthTrack;
  private playerPanel!: StatPanel;
  private enemyPanel!: StatPanel;
  private dialogBox!: DialogBox;
  private selectedCard: Card | null = null;

  constructor() {
    super("Battle");
  }

  create(): void {
    this.player = new Player();
    this.enemy = new FusionShark({ depth: 800, divePower: 20 }); // TODO: 지역별 적 데이터 연결
    this.battleManager = new BattleManager(this.player, this.enemy);
    this.deck = new Deck([...CardDatabase.getAll()]);

    new SurfaceLine(this, 45, 1280);

    this.playerDepthTrack = new DepthTrack(
      this,
      320,
      420,
      280,
      PLAYER_COLOR,
      AssetKeys.images.player,
      AssetKeys.animations.playerIdle
    );
    this.enemyDepthTrack = new DepthTrack(this, 1000, 420, 280, ENEMY_COLOR);

    this.playerPanel = new StatPanel(this, 60, 440, "플레이어", true);
    this.enemyPanel = new StatPanel(this, 800, 60, this.enemy.name, false);

    this.handView = new HandView(
      this,
      300,
      650,
      (card) => this.onCardClicked(card),
      (card) => this.onCardDoubleClicked(card)
    );

    this.add
      .text(950, 690, "턴 종료", { fontSize: "20px", fontFamily: FONT_FAMILY })
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.onEndTurn());

    this.dialogBox = new DialogBox(this, 640, 360);

    this.handView.render(this.deck.draw(HAND_SIZE));
    this.refreshGauges();

    EventBus.on(GameEvents.CardPlayed, (card: { description: string }) => {
      this.dialogBox.show(card.description);
    });

    EventBus.on(GameEvents.BattleEnded, (result: "victory" | "defeat") => {
      this.scene.start(result === "victory" ? "Reward" : "GameOver");
    });
  }

  // 카드를 클릭하면 즉시 사용되지 않고 "선택"만 된다. 같은 카드를 다시 클릭하면 선택 해제,
  // 사용할 수 없는 카드를 클릭하면 흔들림으로 경고한다. 실제 사용은 턴 종료 시 이뤄진다.
  private onCardClicked(card: Card): void {
    if (this.selectedCard?.id === card.id) {
      this.selectedCard = null;
      this.handView.setSelected(null);
      this.dialogBox.hide();
      return;
    }

    if (!this.battleManager.canPlayCard(card)) {
      this.handView.shakeCard(card.id);
      this.dialogBox.show("수심이 최대치임으로 잠수 카드를 사용할 수 없습니다.");
      return;
    }

    this.selectedCard = card;
    this.handView.setSelected(card.id);
    this.dialogBox.showPersistent(
      [card.description, "", formatCardEffects(card.effects)].join("\n")
    );
  }

  // 더블클릭은 "선택 + 즉시 턴 종료(사용)"를 한 번에 수행하는 단축 동작이다.
  private onCardDoubleClicked(card: Card): void {
    if (!this.battleManager.canPlayCard(card)) {
      this.handView.shakeCard(card.id);
      this.dialogBox.show("수심이 최대치임으로 잠수 카드를 사용할 수 없습니다.");
      return;
    }

    this.selectedCard = card;
    this.onEndTurn();
  }

  private onEndTurn(): void {
    if (this.selectedCard) {
      const played = this.deck.playFromHand(this.selectedCard.id);
      if (played) this.battleManager.playCard(played);
      this.selectedCard = null;
    }

    this.battleManager.endPlayerTurn();
    this.handView.render(this.deck.getHand());
    this.refreshGauges();
  }

  private refreshGauges(): void {
    this.playerDepthTrack.updateDepth(this.player.getDepth());
    this.enemyDepthTrack.updateDepth(this.enemy.getDepth());
    this.playerPanel.refresh(this.player);
    this.enemyPanel.refresh(this.enemy);
  }
}
