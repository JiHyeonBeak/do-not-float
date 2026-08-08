import Phaser from "phaser";
import { RunManager } from "../systems/RunManager";
import { EnemyFactory } from "../entities/EnemyFactory";
import { EnemyDatabase } from "../entities/EnemyDatabase";
import { FONT_FAMILY, STAGE_ENEMY_ORDER } from "../config/Constants";
import { BattleSceneData } from "./BattleScene";
import { fitSpriteToSquare } from "../utils/SpriteFit";

// 다음 스테이지에서 만날 적을 미리 보여주고, "전투 시작"을 누르면 Battle로 넘어간다.
// STAGE_ENEMY_ORDER를 다 돌았으면(=보스까지 클리어) 런이 끝난 것이므로 Victory로 보낸다.
export class MapScene extends Phaser.Scene {
  constructor() {
    super("Map");
  }

  create(): void {
    const region = RunManager.getInstance().getCurrentRegion();
    const enemyId: string | undefined = STAGE_ENEMY_ORDER[region];

    if (!enemyId) {
      this.scene.start("Victory");
      return;
    }

    const isBoss = region === STAGE_ENEMY_ORDER.length - 1;
    // 화면에 보여줄 이름/스프라이트만 필요한 미리보기용 인스턴스라 실제 전투 스탯은 중요하지 않다.
    const enemyPreview = EnemyFactory.create(enemyId, EnemyDatabase.getStats(enemyId));

    this.add
      .text(640, 160, isBoss ? `STAGE ${region + 1} - BOSS` : `STAGE ${region + 1}`, {
        fontSize: "28px",
        fontFamily: FONT_FAMILY,
      })
      .setOrigin(0.5);

    if (enemyPreview.spriteKey) {
      const sprite = this.add.sprite(640, 360, enemyPreview.spriteKey);
      if (enemyPreview.idleAnimKey) sprite.play(enemyPreview.idleAnimKey);
      fitSpriteToSquare(sprite, 220);
    }

    this.add
      .text(640, 480, enemyPreview.name, { fontSize: "22px", fontFamily: FONT_FAMILY })
      .setOrigin(0.5);

    this.add
      .text(640, 560, "전투 시작", { fontSize: "24px", fontFamily: FONT_FAMILY })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        const data: BattleSceneData = { enemyId };
        this.scene.start("Battle", data);
      });
  }
}
