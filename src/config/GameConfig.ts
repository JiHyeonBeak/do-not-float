import Phaser from "phaser";
import { BootScene } from "../scenes/BootScene";
import { PreloadScene } from "../scenes/PreloadScene";
import { MainMenuScene } from "../scenes/MainMenuScene";
import { MapScene } from "../scenes/MapScene";
import { BattleScene } from "../scenes/BattleScene";
import { RewardScene } from "../scenes/RewardScene";
import { GameOverScene } from "../scenes/GameOverScene";
import { VictoryScene } from "../scenes/VictoryScene";

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: "game-container",
  backgroundColor: "#021627",
  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    MapScene,
    BattleScene,
    RewardScene,
    GameOverScene,
    VictoryScene,
  ],
};
