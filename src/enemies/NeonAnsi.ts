import { Enemy } from "../entities/Enemy";
import { AssetKeys } from "../utils/AssetKeys";

export class NeonAnsi extends Enemy {
  readonly id = "neon_ansi";
  readonly name = "네온 안시";
  readonly spriteKey = AssetKeys.images.neonAnsi;
  readonly idleAnimKey = AssetKeys.animations.neonAnsiIdle;
  readonly attackAnimKey = AssetKeys.animations.neonAnsiAttack;
  readonly bgmKey = AssetKeys.audio.bgmNeonAnsiBattle;
  readonly rewardCardId = "ansis_curious"; // 안시의 호기심 (cards.json에 등록된 실제 id)
}
