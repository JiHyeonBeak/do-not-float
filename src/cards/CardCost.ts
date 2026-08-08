import { CardEffect } from "./Card";
import { CARD_COST_AMOUNT_DIVISOR } from "../config/Constants";

// 카드 코스트는 cards.json에 직접 값을 적지 않고, 이펙트의 amount 합계로부터 매번 유도한다.
// (대미지든 방어든 수심 회복이든 "세기"를 나타내는 amount는 공통이라 종류 구분 없이 합산한다)
// 이렇게 하면 밸런스(amount) 수치를 바꿔도 코스트를 별도로 손볼 필요가 없다.
export function getCardCost(effects: readonly CardEffect[]): number {
  const totalAmount = effects.reduce((sum, effect) => {
    return "amount" in effect ? sum + Math.abs(effect.amount) : sum;
  }, 0);
  return Math.ceil(totalAmount / CARD_COST_AMOUNT_DIVISOR);
}
