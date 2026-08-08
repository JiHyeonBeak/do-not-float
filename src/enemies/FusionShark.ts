import { Enemy } from "../entities/Enemy";
import { AssetKeys } from "../utils/AssetKeys";

export class FusionShark extends Enemy {
  readonly id = "fusion_shark";
  readonly name = "핵융합 상어";
  readonly spriteKey = AssetKeys.images.fusionShark;
  readonly idleAnimKey = AssetKeys.animations.fusionSharkIdle;
  readonly attackAnimKey = AssetKeys.animations.fusionSharkAttack;
  readonly bgmKey = AssetKeys.audio.bgmFusionSharkBattle;
}
