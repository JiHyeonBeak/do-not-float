import { Enemy } from "./Enemy";
import { Stats } from "../types/CharacterTypes";
import { FusionShark } from "../enemies/FusionShark";
import { Kraken } from "../enemies/Kraken";
import { UnfathomableJellyfish } from "../enemies/UnfathomableJellyfish";
import { NeonAnsi } from "../enemies/NeonAnsi";

// 적 id로부터 알맞은 Enemy 서브클래스를 조립한다. 새 적을 추가할 때는 서브클래스를 만들고
// 여기 매핑 한 줄만 추가하면 된다(EnemyAI/BattleManager 등 다른 곳은 건드릴 필요 없음).
const ENEMY_CONSTRUCTORS: Record<string, new (stats: Stats) => Enemy> = {
  fusion_shark: FusionShark,
  kraken: Kraken,
  unfathomable_jellyfish: UnfathomableJellyfish,
  neon_ansi: NeonAnsi,
};

export class EnemyFactory {
  static create(id: string, stats: Stats): Enemy {
    const EnemyClass = ENEMY_CONSTRUCTORS[id];
    if (!EnemyClass) throw new Error(`Unknown enemy id: ${id}`);
    return new EnemyClass(stats);
  }
}
