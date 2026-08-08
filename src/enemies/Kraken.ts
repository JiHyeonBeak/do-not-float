import { Enemy } from "../entities/Enemy";
import { AssetKeys } from "../utils/AssetKeys";

export class Kraken extends Enemy {
  readonly id = "kraken";
  readonly name = "크라켄 인어";
  readonly spriteKey = AssetKeys.images.kraken;
  readonly idleAnimKey = AssetKeys.animations.krakenIdle;
  readonly attackAnimKey = AssetKeys.animations.krakenAttack;
  readonly bgmKey = AssetKeys.audio.bgmKrakenBattle;
}
