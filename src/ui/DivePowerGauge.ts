import Phaser from "phaser";

export class DivePowerGauge extends Phaser.GameObjects.Container {
  private label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.label = scene.add.text(0, 0, "잠수력: 0", { fontSize: "14px" });
    this.add(this.label);
    scene.add.existing(this);
  }

  setDivePower(value: number): void {
    this.label.setText(`잠수력: ${value}`);
  }
}
