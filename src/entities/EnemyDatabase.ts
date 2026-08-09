import { Stats } from "../types/CharacterTypes";
import enemiesData from "../data/enemies.json";

interface EnemyStatsEntry {
  id: string;
  name: string;
  depth: number;
  divePower: number;
}

const ENEMY_STATS: EnemyStatsEntry[] = enemiesData as EnemyStatsEntry[];

// enemies.json에서 적의 기본 스탯(수심/잠수력)만 읽어온다. 스프라이트 등 클래스 고유 정보는
// 각 Enemy 서브클래스(FusionShark 등)가 스스로 들고 있으므로 여기서는 다루지 않는다.
export class EnemyDatabase {
  private static byId = new Map(ENEMY_STATS.map((entry) => [entry.id, entry]));

  static getStats(id: string): Stats {
    const entry = this.byId.get(id);
    if (!entry) throw new Error(`Unknown enemy id: ${id}`);
    return { depth: entry.depth, divePower: entry.divePower };
  }

  static getName(id: string): string {
    const entry = this.byId.get(id);
    if (!entry) throw new Error(`Unknown enemy id: ${id}`);
    return entry.name;
  }
}
