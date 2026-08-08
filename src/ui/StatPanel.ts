import Phaser from "phaser";
import { Character } from "../entities/Character";
import { formatStatusEffects } from "./formatStatusEffects";
import { FONT_FAMILY, PLAYER_MAX_STAMINA } from "../config/Constants";

// 캐릭터 하나의 방어력/수심(선택)/스태미나(선택)/현재 효과를 텍스트로 보여주는 상태창.
export class StatPanel extends Phaser.GameObjects.Text {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private title: string,
    private showDepth: boolean,
    private showStamina: boolean = false
  ) {
    super(scene, x, y, "", {
      fontSize: "16px",
      color: "#ffffff",
      lineSpacing: 6,
      fontFamily: FONT_FAMILY,
    });
    scene.add.existing(this);
  }

  // stamina는 Character가 아니라 런(RunManager) 단위 자원이라 별도 인자로 받는다.
  refresh(character: Character, stamina?: number): void {
    const lines = [this.title, `잠수력: ${character.getDivePower()}`];
    if (this.showDepth) lines.push(`수심: ${character.getDepth()}m`);
    if (this.showStamina && stamina !== undefined) {
      lines.push(`스태미나: ${stamina}/${PLAYER_MAX_STAMINA}`);
    }
    lines.push(formatStatusEffects(character.getStatusEffects()));
    this.setText(lines.join("\n"));
  }
}
