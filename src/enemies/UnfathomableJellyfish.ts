import { Enemy } from "../entities/Enemy";
import { AssetKeys } from "../utils/AssetKeys";

export class UnfathomableJellyfish extends Enemy {
  readonly id = "unfathomable_jellyfish";
  readonly name = "불가해파리";
  readonly spriteKey = AssetKeys.images.unfathomableJellyfish;
  readonly idleAnimKey = AssetKeys.animations.unfathomableJellyfishIdle;
  readonly attackAnimKey = AssetKeys.animations.unfathomableJellyfishAttack;
  readonly bgmKey = AssetKeys.audio.bgmJellyfishBattle;
}
