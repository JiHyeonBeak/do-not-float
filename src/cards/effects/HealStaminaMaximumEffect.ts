import { CardEffectRegistry } from "./CardEffectRegistry";
import { RunManager } from "../../systems/RunManager";
import { PLAYER_MAX_STAMINA } from "../../config/Constants";

// 스태미너는 StaminaEffect.ts와 마찬가지로 RunManager 소속 자원이라 여기서 직접 다룬다.
CardEffectRegistry.register("healStaminaMaximum", () => {
  RunManager.getInstance().restoreStamina(PLAYER_MAX_STAMINA);
});
