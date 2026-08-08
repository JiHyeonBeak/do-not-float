import Phaser from "phaser";

export const EventBus = new Phaser.Events.EventEmitter();

export const GameEvents = {
  CardPlayed: "card:played",
  EnemyCardPlayed: "enemyCard:played",
  DepthChanged: "depth:changed",
  DivePowerChanged: "divePower:changed",
  TurnChanged: "turn:changed",
  BattleEnded: "battle:ended",
} as const;
