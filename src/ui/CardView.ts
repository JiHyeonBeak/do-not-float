import Phaser from "phaser";
import { Card } from "../cards/Card";
import { getCardCost } from "../cards/CardCost";
import { FONT_FAMILY } from "../config/Constants";
import { AssetKeys } from "../utils/AssetKeys";

export const CARD_WIDTH = 170;
export const CARD_HEIGHT = 220; // card.png 원본(1024x1536)과 같은 2:3 비율

const SELECTED_STROKE = { width: 4, color: 0xffd23f };
const DOUBLE_CLICK_THRESHOLD_MS = 300;

// card.png 안에 그려진 이름칸(긴 직사각형)/코스트칸(팔각형)의 중심 좌표를, 카드 이미지를
// CARD_WIDTH x CARD_HEIGHT로 표시했을 때의 로컬 좌표로 환산해둔 값(원본 이미지에서 실측).
const NAME_SLOT = { x: -11, y: -64, wrapWidth: 79 };
const COST_SLOT = { x: 51, y: -64 };

interface CardArtOverride {
  frameKey: string;
  nameSlot: typeof NAME_SLOT;
  costSlot: typeof COST_SLOT;
}

// 히든 카드는 카드마다 개별 원화가 들어간 전용 프레임을 쓰며, 프레임마다 이름칸/코스트칸
// 위치가 다를 수 있다. 카드 id -> (프레임 이미지 키 + 그 프레임에 맞는 슬롯 좌표).
// 새 히든 카드를 추가할 땐 AssetKeys/PreloadScene에 이미지를 등록한 뒤 여기 한 항목만
// 추가하면 된다(슬롯 좌표는 원본 이미지에서 실측 후 NAME_SLOT/COST_SLOT과 같은 방식으로 환산).
const CARD_ART_OVERRIDES: Partial<Record<string, CardArtOverride>> = {
  crazy_shark_eye: {
    frameKey: AssetKeys.images.cardFrameCrazySharkEye,
    nameSlot: { x: -19, y: -92, wrapWidth: 85 },
    costSlot: { x: 48, y: -91 },
  },
  ansis_curious: {
    frameKey: AssetKeys.images.cardFrameAnsisCurious,
    nameSlot: { x: -19, y: -95, wrapWidth: 85 },
    costSlot: { x: 48, y: -95 },
  },
  jellyfish_airpump: {
    frameKey: AssetKeys.images.cardFrameJellyfishAirpump,
    nameSlot: { x: -19, y: -92, wrapWidth: 85 },
    costSlot: { x: 48, y: -92 },
  }
};

export class CardView extends Phaser.GameObjects.Container {
  readonly card: Card;
  private frame: Phaser.GameObjects.Image;
  private selectionBorder: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    card: Card,
    onClick?: (card: Card) => void,
    onDoubleClick?: (card: Card) => void
  ) {
    super(scene, x, y);
    this.card = card;

    const artOverride = CARD_ART_OVERRIDES[card.id];
    const frameKey = artOverride?.frameKey ?? AssetKeys.images.cardFrame;
    const nameSlot = artOverride?.nameSlot ?? NAME_SLOT;
    const costSlot = artOverride?.costSlot ?? COST_SLOT;

    this.frame = scene.add.image(0, 0, frameKey).setDisplaySize(CARD_WIDTH, CARD_HEIGHT);
    // 선택되었을 때만 노란 테두리를 그려 보여줄 사각형. 평소엔 투명하다(테두리 없음).
    this.selectionBorder = scene.add.rectangle(0, 0, CARD_WIDTH, CARD_HEIGHT);

    const nameText = scene.add
      .text(nameSlot.x, nameSlot.y, card.name, {
        fontSize: "12px",
        fontFamily: FONT_FAMILY,
        color: "#000000",
        align: "center",
        wordWrap: { width: nameSlot.wrapWidth },
      })
      .setOrigin(0.5);
    const costText = scene.add
      .text(costSlot.x, costSlot.y, `${getCardCost(card.effects)}`, {
        fontSize: "13px",
        fontFamily: FONT_FAMILY,
        color: "#ffd23f",
      })
      .setOrigin(0.5);

    this.frame.setInteractive({ useHandCursor: true });

    // 짧은 시간 안에 두 번 클릭되면 더블클릭으로 취급한다 (선택 + 즉시 사용).
    let lastClickTime = 0;
    this.frame.on("pointerdown", () => {
      const now = scene.time.now;
      if (onDoubleClick && now - lastClickTime < DOUBLE_CLICK_THRESHOLD_MS) {
        lastClickTime = 0;
        onDoubleClick(card);
      } else {
        lastClickTime = now;
        onClick?.(card);
      }
    });

    this.add([this.frame, this.selectionBorder, nameText, costText]);
    scene.add.existing(this);
  }

  setSelected(selected: boolean): void {
    if (selected) {
      this.selectionBorder.setStrokeStyle(SELECTED_STROKE.width, SELECTED_STROKE.color);
    } else {
      this.selectionBorder.setStrokeStyle(0);
    }
  }

  shake(): void {
    this.scene.tweens.add({
      targets: this,
      angle: { from: -6, to: 6 },
      duration: 50,
      yoyo: true,
      repeat: 3,
      onComplete: () => this.setAngle(0),
    });
  }
}
