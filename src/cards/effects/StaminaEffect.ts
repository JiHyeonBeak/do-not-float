import { CardEffectRegistry } from "./CardEffectRegistry";
import { RunManager } from "../../systems/RunManager";
import { PLAYER_MAX_STAMINA } from "../../config/Constants";

// 스태미너는 전투(Player 인스턴스)가 아니라 런 전체에 귀속되는 자원이라 RunManager를 직접 다룬다.
// (RunManager.ts 주석 참고: Player는 전투가 시작될 때마다 새로 생성되므로 여기 두면 안 됨)
CardEffectRegistry.register(
  "stamina",
  (effect) => {
    RunManager.getInstance().restoreStamina(effect.amount);
  },
  (effect) => {
    // 회복 효과는 이미 최대 스태미너이면 사용할 수 없다 (피해 효과는 항상 허용)
    if (effect.amount <= 0) return true;
    return RunManager.getInstance().getStamina() < PLAYER_MAX_STAMINA;
  }
);
