import Phaser from "phaser";
import { FONT_FAMILY } from "../config/Constants";
import { AssetKeys } from "../utils/AssetKeys";
import { RunManager } from "../systems/RunManager";
import { EnemyDatabase } from "../entities/EnemyDatabase";
import { CREDITS_SECTIONS, CREDITS_TITLE, CREDITS_SUBTITLE } from "../data/credits";

// 크레딧이 화면을 위로 흘러가는 속도(px/초). 값이 클수록 빨리 지나간다.
const SCROLL_SPEED_PX_PER_SEC = 40;
const SECTION_GAP = 60;
const LINE_GAP = 34;
// 텍스트가 지나가는 자리에 깔아둘 반투명 카펫의 폭. 화면 전체 높이를 덮어서, 스크롤 위치와
// 무관하게 그 순간 보이는 줄은 항상 카펫 위에 있게 한다.
const CARPET_WIDTH = 820;

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export class VictoryScene extends Phaser.Scene {
  private bgm?: Phaser.Sound.BaseSound;

  constructor() {
    super("Victory");
  }

  create(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // 해저 궁전 배경: 정적 베이스 위에 광원/파티클 애니메이션 레이어를 겹쳐 재생한다.
    this.add
      .image(centerX, centerY, AssetKeys.images.backgroundEnding)
      .setDisplaySize(this.scale.width, this.scale.height);
    this.add
      .sprite(centerX, centerY, AssetKeys.images.backgroundEndingLayer1)
      .setDisplaySize(this.scale.width, this.scale.height)
      .play(AssetKeys.animations.backgroundEndingLayer1Ambient);

    // 배경이 화려해 글자가 묻히므로, 스크롤 경로 자리에 반투명 카펫을 깔아 가독성을 높인다.
    this.add.rectangle(centerX, centerY, CARPET_WIDTH, this.scale.height, 0x000000, 0.5);

    this.bgm = this.sound.add(AssetKeys.audio.bgmEnding);
    this.bgm.play({ loop: true });

    this.createScrollingCredits(centerX);

    // 스태프롤이 화면 정중앙을 계속 지나가므로, 안내 문구는 그 경로를 피해 구석에 둔다.
    const exitText = this.add
      .text(this.scale.width - 24, this.scale.height - 24, "ESC를 눌러 처음화면으로", {
        fontSize: "22px",
        fontFamily: FONT_FAMILY,
        color: "#FFFFFF",
      })
      .setOrigin(1, 1)
      .setInteractive({ useHandCursor: true });
    const goToMainMenu = () => this.scene.start("MainMenu");
    exitText.on("pointerdown", goToMainMenu);
    this.input.keyboard?.on("keydown-ESC", goToMainMenu);

    // 옅어졌다 진해졌다를 반복하며 은은하게 반짝이는 느낌을 준다.
    this.tweens.add({
      targets: exitText,
      alpha: { from: 1, to: 0.25 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.bgm?.stop();
    });
  }

  // 화면 하단 밖에서 시작해 위로 끝없이 흘러가는 스태프롤. 크레딧 내용은 data/credits.ts에서
  // 가져오므로, 크레딧을 추가/수정할 땐 이 메서드가 아니라 그 파일만 고치면 된다.
  private createScrollingCredits(centerX: number): void {
    const container = this.add.container(centerX, 0);

    let y = 0;
    const titleText = this.add
      .text(0, y, CREDITS_TITLE, { fontSize: "40px", fontFamily: FONT_FAMILY, color: "#ffd23f" })
      .setOrigin(0.5);
    container.add(titleText);
    y += SECTION_GAP;

    const subtitleText = this.add
      .text(0, y, CREDITS_SUBTITLE, { fontSize: "18px", fontFamily: FONT_FAMILY })
      .setOrigin(0.5);
    container.add(subtitleText);
    y += SECTION_GAP * 1.5;

    y = this.addStageClearTimes(container, y);

    CREDITS_SECTIONS.forEach((section) => {
      const sectionTitle = this.add
        .text(0, y, section.title, {
          fontSize: "22px",
          fontFamily: FONT_FAMILY,
          color: "#ffd23f",
        })
        .setOrigin(0.5);
      container.add(sectionTitle);
      y += LINE_GAP;

      section.names.forEach((name) => {
        const nameText = this.add
          .text(0, y, name, { fontSize: "18px", fontFamily: FONT_FAMILY })
          .setOrigin(0.5);
        container.add(nameText);
        y += LINE_GAP;
      });

      y += SECTION_GAP - LINE_GAP;
    });

    const contentHeight = y;
    const startY = this.scale.height;
    const endY = -contentHeight;
    container.setY(startY);

    this.tweens.add({
      targets: container,
      y: endY,
      duration: ((startY - endY) / SCROLL_SPEED_PX_PER_SEC) * 1000,
      repeat: -1,
    });
  }

  // 스태프롤 첫머리에 스테이지별 클리어 타임을 보여준다. 이번 런에 기록이 없으면(예: 개발 중
  // 씬을 바로 열어 확인하는 경우) 아무것도 추가하지 않는다.
  private addStageClearTimes(container: Phaser.GameObjects.Container, startY: number): number {
    const clearTimes = RunManager.getInstance().getStageClearTimes();
    if (clearTimes.length === 0) return startY;

    let y = startY;
    const recordTitle = this.add
      .text(0, y, "스테이지 클리어 기록", {
        fontSize: "22px",
        fontFamily: FONT_FAMILY,
        color: "#ffd23f",
      })
      .setOrigin(0.5);
    container.add(recordTitle);
    y += LINE_GAP;

    clearTimes.forEach(({ enemyId, seconds }) => {
      const line = this.add
        .text(0, y, `${EnemyDatabase.getName(enemyId)} - ${formatDuration(seconds)}`, {
          fontSize: "18px",
          fontFamily: FONT_FAMILY,
        })
        .setOrigin(0.5);
      container.add(line);
      y += LINE_GAP;
    });

    y += SECTION_GAP - LINE_GAP;
    return y;
  }
}
