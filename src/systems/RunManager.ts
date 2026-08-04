import { Card } from "../cards/Card";

export class RunManager {
  private static instance: RunManager;

  private currentRegion = 0;
  private ownedCards: Card[] = [];

  static getInstance(): RunManager {
    if (!this.instance) this.instance = new RunManager();
    return this.instance;
  }

  private constructor() {}

  getCurrentRegion(): number {
    return this.currentRegion;
  }

  advanceRegion(): void {
    this.currentRegion += 1;
  }

  addCard(card: Card): void {
    this.ownedCards.push(card);
  }

  getOwnedCards(): readonly Card[] {
    return this.ownedCards;
  }

  reset(): void {
    this.currentRegion = 0;
    this.ownedCards = [];
  }
}
