import "./cards/effects"; // CardDatabase/EnemyCardDatabase 검증보다 먼저 이펙트 핸들러가 등록되어야 함
import Phaser from "phaser";
import { GameConfig } from "./config/GameConfig";

new Phaser.Game(GameConfig);
