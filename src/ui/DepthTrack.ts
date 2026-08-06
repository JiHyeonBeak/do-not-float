import Phaser from "phaser";
import { DEPTH_MAX } from "../config/Constants";

const TRACK_WIDTH = 40;
const TOKEN_RADIUS = 20;

// 캐릭터 하나의 수심을 세로 게이지 바 + 캐릭터 토큰으로 보여준다.
// (물줄기 등 세부 그래픽은 나중에 아트 리소스로 대체될 예정 — 지금은 단순 바 형태)
// 채워진 막대가 현재 수심이고 캐릭터 토큰은 항상 그 위에 올라탄다.
// 수심이 줄어들수록 막대가 짧아지면서 캐릭터도 함께 아래로 내려간다.
export class DepthTrack extends Phaser.GameObjects.Container {
  private fill: Phaser.GameObjects.Rectangle;
  private token: Phaser.GameObjects.Arc | Phaser.GameObjects.Sprite;

  constructor(
    scene: Phaser.Scene,
    x: number,
    bottomY: number,
    private trackHeight: number,
    color: number,
    textureKey?: string,
    animKey?: string
  ) {
    super(scene, x, bottomY);

    const outline = scene.add
      .rectangle(0, -trackHeight / 2, TRACK_WIDTH, trackHeight)
      .setStrokeStyle(2, color, 0.5);
    this.fill = scene.add
      .rectangle(0, 0, TRACK_WIDTH - 8, 0, color, 0.35)
      .setOrigin(0.5, 1);

    if (textureKey) {
      const sprite = scene.add.sprite(0, 0, textureKey).setDisplaySize(TOKEN_RADIUS * 2, TOKEN_RADIUS * 2);
      if (animKey) sprite.play(animKey);
      this.token = sprite;
    } else {
      this.token = scene.add.circle(0, 0, TOKEN_RADIUS, 0x021627).setStrokeStyle(3, color);
    }

    this.add([outline, this.fill, this.token]);
    scene.add.existing(this);

    this.updateDepth(DEPTH_MAX);
  }

  updateDepth(depth: number): void {
    const ratio = Phaser.Math.Clamp(depth / DEPTH_MAX, 0, 1);
    const fillHeight = this.trackHeight * ratio;
    this.fill.height = fillHeight;
    this.token.y = -fillHeight;
  }
}
