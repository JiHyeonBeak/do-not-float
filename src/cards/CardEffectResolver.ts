import { Card } from "./Card";
import { Character } from "../entities/Character";
import { CardEffectRegistry } from "./effects/CardEffectRegistry";

export class CardEffectResolver {
  static resolve(card: Card, source: Character, target: Character): void {
    const ctx = { source, target };
    card.effects.forEach((effect) => CardEffectRegistry.resolve(effect, ctx));
  }

  static canPlay(card: Card, source: Character, target: Character): boolean {
    const ctx = { source, target };
    return card.effects.every((effect) => CardEffectRegistry.canApply(effect, ctx));
  }
}
