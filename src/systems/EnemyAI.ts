import { Enemy } from "../entities/Enemy";
import { Player } from "../entities/Player";
import { pickWeighted } from "../utils/RandomUtils";
import { ENEMY_ACTION_WEIGHTS, DEPTH_DANGER_THRESHOLD } from "../config/Constants";

export type EnemyDecision = "attack" | "defense" | "dive" | "special";

export class EnemyAI {
  static decide(enemy: Enemy, player: Player): EnemyDecision {
    if (enemy.getDepth() <= DEPTH_DANGER_THRESHOLD) return "dive";
    if (player.getDepth() <= DEPTH_DANGER_THRESHOLD) return "attack";
    if (enemy.getDivePower() === 0) return "defense";

    return pickWeighted(ENEMY_ACTION_WEIGHTS);
  }
}
