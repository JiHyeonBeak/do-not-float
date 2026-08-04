import { CardEffect, EffectTarget } from "../Card";
import { Character } from "../../entities/Character";

export interface EffectContext {
  source: Character;
  target: Character;
}

type EffectHandler<E extends CardEffect = CardEffect> = (effect: E, ctx: EffectContext) => void;
type EffectGuard<E extends CardEffect = CardEffect> = (effect: E, ctx: EffectContext) => boolean;

export function resolveEffectTarget(target: EffectTarget, ctx: EffectContext): Character {
  return target === "self" ? ctx.source : ctx.target;
}

export class CardEffectRegistry {
  private static handlers = new Map<CardEffect["kind"], EffectHandler>();
  private static guards = new Map<CardEffect["kind"], EffectGuard>();

  static register<K extends CardEffect["kind"]>(
    kind: K,
    handler: EffectHandler<Extract<CardEffect, { kind: K }>>,
    guard?: EffectGuard<Extract<CardEffect, { kind: K }>>
  ): void {
    this.handlers.set(kind, handler as EffectHandler);
    if (guard) this.guards.set(kind, guard as EffectGuard);
  }

  static has(kind: CardEffect["kind"]): boolean {
    return this.handlers.has(kind);
  }

  // 등록된 guard가 없으면 항상 적용 가능(true)
  static canApply(effect: CardEffect, ctx: EffectContext): boolean {
    const guard = this.guards.get(effect.kind);
    return guard ? guard(effect, ctx) : true;
  }

  static resolve(effect: CardEffect, ctx: EffectContext): void {
    const handler = this.handlers.get(effect.kind);
    if (!handler) throw new Error(`No handler registered for effect kind: ${effect.kind}`);
    handler(effect, ctx);
  }
}
