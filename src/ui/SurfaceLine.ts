import Phaser from "phaser";

const AMPLITUDE = 8;
const STEP = 20;

// 화면 상단의 수면을 나타내는 장식용 물결선.
export class SurfaceLine extends Phaser.GameObjects.Graphics {
  constructor(scene: Phaser.Scene, y: number, width: number) {
    super(scene);
    this.lineStyle(2, 0x4fc3f7, 0.8);
    this.beginPath();
    this.moveTo(0, y);
    for (let x = 0; x <= width; x += STEP) {
      this.lineTo(x, y + Math.sin(x / 60) * AMPLITUDE);
    }
    this.strokePath();
    scene.add.existing(this);
    // 화면에는 그리지 않되(디자인 변경으로 UI에서 숨김), 해수면 y좌표를 기준으로 삼는
    // 다른 로직(DepthTrack 높이 계산 등)에는 영향이 없도록 오브젝트 자체는 유지한다.
    this.setVisible(false);
  }
}
