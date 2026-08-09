import Phaser from "phaser";
import { Card } from "../cards/Card";
import { RunManager } from "../systems/RunManager";
import { CardView, CARD_HEIGHT } from "../ui/CardView";
import { formatCardEffects } from "../ui/formatCardEffects";
import { FONT_FAMILY } from "../config/Constants";
import { AssetKeys } from "../utils/AssetKeys";

export interface RewardSceneData {
  grantedCard?: Card;
}

const DISPLAY_DURATION_MS = 3000;
const CARD_DISPLAY_SCALE = 1.8;
const CARD_CENTER_Y = 330;

export class RewardScene extends Phaser.Scene {
  constructor() {
    super("Reward");
  }

  create(data: RewardSceneData): void {
    // TODO: 카드 획득 외에 강화 / 최대 잠수력 증가 중 선택하는 보상 종류가 추가되면 분기.
    RunManager.getInstance().advanceRegion();

    if (!data?.grantedCard) {
      this.scene.start("Map");
      return;
    }

    this.showCardRewardScreen(data.grantedCard);
  }

  private showCardRewardScreen(card: Card): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.add
      .image(centerX, centerY, AssetKeys.images.backgroundBattleStatic)
      .setDisplaySize(this.scale.width, this.scale.height);
    // 배경이 화려해서 카드가 묻히므로, 반투명 어두운 막을 깔아 카드를 도드라지게 한다.
    this.add.rectangle(centerX, centerY, this.scale.width, this.scale.height, 0x000000, 0.6);

    this.add
      .text(centerX, 70, "카드를 얻었습니다!", {
        fontSize: "36px",
        fontFamily: FONT_FAMILY,
        color: "#ffd23f",
      })
      .setOrigin(0.5);

    new CardView(this, centerX, CARD_CENTER_Y, card).setScale(CARD_DISPLAY_SCALE);

    const cardBottomY = CARD_CENTER_Y + (CARD_HEIGHT / 2) * CARD_DISPLAY_SCALE;
    this.add
      .text(
        centerX,
        cardBottomY + 40,
        [card.description, "", formatCardEffects(card.effects)].join("\n"),
        {
          fontSize: "18px",
          fontFamily: FONT_FAMILY,
          align: "center",
          wordWrap: { width: 700 },
        }
      )
      .setOrigin(0.5, 0);

    this.time.delayedCall(DISPLAY_DURATION_MS, () => this.scene.start("Map"));
  }
}
