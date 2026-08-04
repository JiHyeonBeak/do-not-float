import { Character } from "./Character";
import { PLAYER_INITIAL_DEPTH, PLAYER_INITIAL_DIVE_POWER } from "../config/Constants";

export class Player extends Character {
  constructor() {
    super({ depth: PLAYER_INITIAL_DEPTH, divePower: PLAYER_INITIAL_DIVE_POWER });
  }
}
