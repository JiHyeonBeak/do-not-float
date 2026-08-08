import Phaser from "phaser";
import { BootScene } from "../scenes/BootScene";
import { PreloadScene } from "../scenes/PreloadScene";
import { MainMenuScene } from "../scenes/MainMenuScene";
import { LicenseScene } from "../scenes/LicenseScene";
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
  // 기본값(선형 필터링)은 스프라이트시트 프레임 경계(특히 그림이 프레임 끝까지 꽉 찬 kraken)에서
  // 인접 프레임 픽셀이 섞여 보이는 번짐 현상을 만든다. 픽셀아트라 nearest 필터가 맞기도 하다.
  pixelArt: true,
  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    LicenseScene,
    MapScene,
    BattleScene,
    RewardScene,
    GameOverScene,
    VictoryScene,
  ],
};
