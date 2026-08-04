import Phaser from "phaser";
import { DEPTH_MAX } from "../config/Constants";

export class DepthGauge extends Phaser.GameObjects.Container {
  private bar: Phaser.GameObjects.Rectangle;
  private label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.bar = scene.add.rectangle(0, 0, 200, 20, 0x1e88e5).setOrigin(0, 0.5);
    this.label = scene.add.text(0, -20, "", { fontSize: "14px" });
    this.add([this.bar, this.label]);
    scene.add.existing(this);
  }

  updateDepth(depth: number): void {
    const ratio = Phaser.Math.Clamp(depth / DEPTH_MAX, 0, 1);
    this.bar.width = 200 * ratio;
    this.label.setText(`수심: ${depth}`);
  }
}
