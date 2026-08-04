import Phaser from "phaser";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { BattleManager } from "../systems/BattleManager";
import { Deck } from "../cards/Deck";
import { Card } from "../cards/Card";
import { CardDatabase } from "../cards/CardDatabase";
import { HandView } from "../ui/HandView";
import { DepthGauge } from "../ui/DepthGauge";
import { DivePowerGauge } from "../ui/DivePowerGauge";
import { EnemyView } from "../ui/EnemyView";
import { DialogBox } from "../ui/DialogBox";
import { EventBus, GameEvents } from "../utils/EventBus";
import { HAND_SIZE } from "../config/Constants";
import { FusionShark } from "../enemies/FusionShark";

export class BattleScene extends Phaser.Scene {
  private battleManager!: BattleManager;
  private deck!: Deck;
  private handView!: HandView;
  private player!: Player;
  private enemy!: Enemy;
  private playerDepthGauge!: DepthGauge;
  private playerDivePowerGauge!: DivePowerGauge;
  private enemyView!: EnemyView;
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

    this.enemyView = new EnemyView(this, 100, 40, this.enemy);

    this.add.text(100, 540, "플레이어", { fontSize: "18px" });
    this.playerDepthGauge = new DepthGauge(this, 100, 600);
    this.playerDivePowerGauge = new DivePowerGauge(this, 100, 630);
    this.handView = new HandView(this, 300, 650, (card) => this.onCardClicked(card));

    this.add
      .text(950, 690, "턴 종료", { fontSize: "20px" })
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.onEndTurn());

    this.dialogBox = new DialogBox(this, 640, 380);

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
      return;
    }

    if (!this.battleManager.canPlayCard(card)) {
      this.handView.shakeCard(card.id);
      return;
    }

    this.selectedCard = card;
    this.handView.setSelected(card.id);
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
    this.playerDepthGauge.updateDepth(this.player.getDepth());
    this.playerDivePowerGauge.setDivePower(this.player.getDivePower());
    this.enemyView.refresh();
  }
}
