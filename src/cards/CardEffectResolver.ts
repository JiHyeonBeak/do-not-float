import { Card } from "./Card";
import { Character } from "../entities/Character";
import { CardEffectRegistry } from "./effects/CardEffectRegistry";

export class CardEffectResolver {
  static resolve(card: Card, source: Character, target: Character): void {
    const ctx = { source, target };
    card.effects.forEach((effect) => CardEffectRegistry.resolve(effect, ctx));
  }

  // 효과 중 하나라도 적용 가능하면 카드를 낼 수 있다(every가 아니라 some).
  // 예: 피해+스태미너 회복처럼 여러 효과를 가진 카드는, 스태미너가 이미 최대치라 회복 효과가
  // 낭비되더라도 피해 효과는 유효하므로 카드 자체는 낼 수 있어야 한다. 아무 효과도 없는 카드는
  // (있다면) 어차피 의미가 없으므로 항상 막는다.
  static canPlay(card: Card, source: Character, target: Character): boolean {
    if (card.effects.length === 0) return false;
    const ctx = { source, target };
    return card.effects.some((effect) => CardEffectRegistry.canApply(effect, ctx));
  }
}
