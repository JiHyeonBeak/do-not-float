import Phaser from "phaser";
import { FONT_FAMILY } from "../config/Constants";
import { AssetKeys } from "../utils/AssetKeys";
import { RunManager } from "../systems/RunManager";

const LICENSE_BGM_VOLUME = 0.5;

export class MainMenuScene extends Phaser.Scene {
  private bgm?: Phaser.Sound.BaseSound & { setVolume(value: number): unknown };

  constructor() {
    super("MainMenu");
  }

  create(): void {
    // 라이선스 화면에서 돌아왔을 때도 같은 BGM 인스턴스가 이미 재생 중일 수 있어(그때는 음량만
    // 낮춰뒀을 뿐 멈추지 않았다), 재사용 가능하면 새로 만들지 않고 음량만 원래대로 되돌린다.
    this.bgm = this.sound.get(AssetKeys.audio.bgmTitle) ?? this.sound.add(AssetKeys.audio.bgmTitle);
    this.bgm.setVolume(1);
    if (!this.bgm.isPlaying) {
      this.bgm.play({ loop: true });
    }

    // 타이틀 배경 3겹: 로고가 포함된 정적 베이스 위에 옅은 광원/물결, 떠오르는 기포를 순서대로 겹쳐
    // 잔잔하게 움직이는 수중 분위기를 낸다. 로고가 이미 베이스에 포함되어 있어 별도 텍스트 로고는 없다.
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.add
      .image(centerX, centerY, AssetKeys.images.backgroundTitle)
      .setDisplaySize(this.scale.width, this.scale.height);

    this.add
      .sprite(centerX, centerY, AssetKeys.images.backgroundTitleOverlay2)
      .setDisplaySize(this.scale.width, this.scale.height)
      .play(AssetKeys.animations.backgroundTitleOverlay2Ambient);

    this.add
      .sprite(centerX, centerY, AssetKeys.images.backgroundTitleOverlay1)
      .setDisplaySize(this.scale.width, this.scale.height)
      .play(AssetKeys.animations.backgroundTitleOverlay1Ambient);

    const startText = this.add
      .text(640, 580, "시작하기", { fontSize: "24px", fontFamily: FONT_FAMILY })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    startText.on("pointerdown", () => {
      // GameOver 등에서 "처음으로"로 돌아온 뒤 다시 시작할 수도 있으므로, 이전 런의 진행 상태
      // (스테이지, 스태미너, 획득 카드 등)가 새 런에 남아있지 않도록 항상 초기화하고 시작한다.
      RunManager.getInstance().reset();
      this.bgm?.stop();
      this.scene.start("Map");
    });

    const licenseText = this.add
      .text(640, 630, "라이선스", { fontSize: "18px", color: "#9fb8c8", fontFamily: FONT_FAMILY })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // 라이선스 화면에서는 BGM을 멈추지 않고 음량만 낮춰서 계속 무한 재생한다.
    licenseText.on("pointerdown", () => {
      this.bgm?.setVolume(LICENSE_BGM_VOLUME);
      this.scene.start("License");
    });
  }
}
