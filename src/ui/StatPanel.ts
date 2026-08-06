import Phaser from "phaser";
import { Character } from "../entities/Character";
import { formatStatusEffects } from "./formatStatusEffects";
import { FONT_FAMILY } from "../config/Constants";

// 캐릭터 하나의 방어력/수심(선택)/현재 효과를 텍스트로 보여주는 상태창.
export class StatPanel extends Phaser.GameObjects.Text {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private title: string,
    private showDepth: boolean
  ) {
    super(scene, x, y, "", {
      fontSize: "16px",
      color: "#ffffff",
      lineSpacing: 6,
      fontFamily: FONT_FAMILY,
    });
    scene.add.existing(this);
  }

  refresh(character: Character): void {
    const lines = [this.title, `잠수력: ${character.getDivePower()}`];
    if (this.showDepth) lines.push(`수심: ${character.getDepth()}m`);
    lines.push(formatStatusEffects(character.getStatusEffects()));
    this.setText(lines.join("\n"));
  }
}
