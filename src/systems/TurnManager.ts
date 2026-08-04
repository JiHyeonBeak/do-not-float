import { TurnPhase } from "../types/GameTypes";
import { EventBus, GameEvents } from "../utils/EventBus";

export class TurnManager {
  private phase: TurnPhase = "playerTurn";

  getPhase(): TurnPhase {
    return this.phase;
  }

  endPlayerTurn(): void {
    this.setPhase("enemyTurn");
  }

  endEnemyTurn(): void {
    this.setPhase("playerTurn");
  }

  endBattle(): void {
    this.setPhase("battleEnd");
  }

  private setPhase(phase: TurnPhase): void {
    this.phase = phase;
    EventBus.emit(GameEvents.TurnChanged, phase);
  }
}
