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
  }
}
