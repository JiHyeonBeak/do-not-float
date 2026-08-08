import "./cards/effects"; // CardDatabase/EnemyCardDatabase 검증보다 먼저 이펙트 핸들러가 등록되어야 함
import "./entities/statusEffects"; // 상태이상 핸들러도 전투 로직(BattleManager 등)보다 먼저 등록되어야 함
import Phaser from "phaser";
import { GameConfig } from "./config/GameConfig";

new Phaser.Game(GameConfig);
