import Phaser from "phaser";
import { RunManager } from "../systems/RunManager";
import { EnemyFactory } from "../entities/EnemyFactory";
import { EnemyDatabase } from "../entities/EnemyDatabase";
import { FONT_FAMILY, STAGE_ENEMY_ORDER } from "../config/Constants";
import { BattleSceneData } from "./BattleScene";
import { fitSpriteToSquare } from "../utils/SpriteFit";
import { AssetKeys } from "../utils/AssetKeys";

// roardmap.png 안의 금속 원형 틀 4개 중심 좌표(캔버스 1280x720 기준으로 실측).
// 배경 이미지를 캔버스에 꽉 채워 그리므로, 이 좌표도 원본 이미지가 아니라 화면 좌표계 그대로다.
// 배열 순서 = STAGE_ENEMY_ORDER 순서(원형 틀을 잇는 금속 경로를 따라 좌하단 -> 상단 -> 중앙 -> 우측).
const STAGE_NODE_POSITIONS: readonly { x: number; y: number }[] = [
  { x: 214, y: 420 },
  { x: 470, y: 200 },
  { x: 754, y: 400 },
  { x: 1080, y: 289 },
];
const STAGE_NODE_ICON_SIZE = 110;
const CURRENT_STAGE_ALPHA = 1;
const OTHER_STAGE_ALPHA = 0.4;
const CURRENT_STAGE_PULSE_SCALE = 1.15;
const BUTTON_POSITION = { x: 635, y: 620 };

// 다음 스테이지에서 만날 적을 미리 보여주고, "전투 시작"을 누르면 Battle로 넘어간다.
// STAGE_ENEMY_ORDER를 다 돌았으면(=보스까지 클리어) 런이 끝난 것이므로 Victory로 보낸다.
export class MapScene extends Phaser.Scene {
  private bgm?: Phaser.Sound.BaseSound;

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

    this.add
      .image(this.scale.width / 2, this.scale.height / 2, AssetKeys.images.backgroundMap)
      .setDisplaySize(this.scale.width, this.scale.height);

    this.bgm = this.sound.add(AssetKeys.audio.bgmMap);
    this.bgm.play({ loop: true });
    // BGM은 씬이 아니라 게임 전역 사운드 매니저 위에서 재생되므로, 씬을 나갈 때 직접 멈춰야
    // 다음 화면(전투 등)까지 계속 흘러나오지 않는다.
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.bgm?.stop());

    let currentEnemyName = "";
    STAGE_ENEMY_ORDER.forEach((stageEnemyId, index) => {
      const position = STAGE_NODE_POSITIONS[index];
      const enemyPreview = EnemyFactory.create(stageEnemyId, EnemyDatabase.getStats(stageEnemyId));
      const isCurrent = index === region;
      if (isCurrent) currentEnemyName = enemyPreview.name;

      if (!enemyPreview.spriteKey || !position) return;

      const sprite = this.add.sprite(position.x, position.y, enemyPreview.spriteKey);
      if (enemyPreview.idleAnimKey) sprite.play(enemyPreview.idleAnimKey);
      fitSpriteToSquare(sprite, STAGE_NODE_ICON_SIZE);
      sprite.setAlpha(isCurrent ? CURRENT_STAGE_ALPHA : OTHER_STAGE_ALPHA);

      // 현재 진행할 스테이지만 은은하게 커졌다 작아지며 강조된다.
      if (isCurrent) {
        this.tweens.add({
          targets: sprite,
          scaleX: sprite.scaleX * CURRENT_STAGE_PULSE_SCALE,
          scaleY: sprite.scaleY * CURRENT_STAGE_PULSE_SCALE,
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }
    });

    this.add
      .text(640, 35, isBoss ? `STAGE ${region + 1} - BOSS` : `STAGE ${region + 1}`, {
        fontSize: "22px",
        fontFamily: FONT_FAMILY,
      })
      .setOrigin(0.5);

    this.add
      .text(640, 65, currentEnemyName, {
        fontSize: "16px",
        color: "#9fb8c8",
        fontFamily: FONT_FAMILY,
      })
      .setOrigin(0.5);

    this.add
      .text(BUTTON_POSITION.x, BUTTON_POSITION.y, "전투 시작", { fontSize: "24px", fontFamily: FONT_FAMILY })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        const data: BattleSceneData = { enemyId };
        this.scene.start("Battle", data);
      });
  }
}
