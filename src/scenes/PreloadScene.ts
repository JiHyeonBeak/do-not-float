import Phaser from "phaser";
import { loadGameFont } from "../utils/FontLoader";
import { AssetKeys } from "../utils/AssetKeys";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("Preload");
  }

  preload(): void {
    // TODO: AssetKeys 기준으로 나머지 이미지/오디오도 로드 + 로딩바 표시
    // player.png는 512x512 프레임 4장이 2x2로 배치된 스프라이트시트(유영 애니메이션)다.
    this.load.spritesheet(AssetKeys.images.player, "assets/images/characters/player.png", {
      frameWidth: 512,
      frameHeight: 512,
    });
  }

  create(): void {
    this.anims.create({
      key: AssetKeys.animations.playerIdle,
      frames: this.anims.generateFrameNumbers(AssetKeys.images.player, { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });

    loadGameFont().then(() => this.scene.start("MainMenu"));
  }
}
