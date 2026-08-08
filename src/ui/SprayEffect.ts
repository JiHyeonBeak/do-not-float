import Phaser from "phaser";
import { AssetKeys } from "../utils/AssetKeys";
import { fitSpriteToSquare } from "../utils/SpriteFit";

const DISPLAY_DURATION_MS = 1000;
const SPRAY_SIZE = 80;

// 수심 변화(피해/잠수) 때 캐릭터 발밑에 잠깐 띄우는 물보라 이펙트.
// durationMs 후 스스로 사라지므로 호출한 쪽에서 따로 정리할 필요가 없다.
export class SprayEffect extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, AssetKeys.images.effectSpray);
    // 상단 중앙을 기준점으로 삼아, 좌표(캐릭터 발밑)에서 아래쪽으로만 그려지게 한다.
    // 캐릭터와 겹치지 않고 수직으로 나란히(캐릭터 위, 물보라 아래) 배치된다.
    this.setOrigin(0.5, 0);
    scene.add.existing(this);
    fitSpriteToSquare(this, SPRAY_SIZE);
    this.play(AssetKeys.animations.effectSpray);

    scene.time.delayedCall(DISPLAY_DURATION_MS, () => this.destroy());
  }
}
