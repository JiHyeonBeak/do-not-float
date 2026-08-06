export const DEPTH_MAX = 1000;
export const DEPTH_SAFE_THRESHOLD = 500;
export const DEPTH_DANGER_THRESHOLD = 100;
export const DEPTH_SURFACE = 0;

export const PLAYER_INITIAL_DEPTH = 1000;
export const PLAYER_INITIAL_DIVE_POWER = 0;

export const ENEMY_ACTION_WEIGHTS = {
  attack: 0.4,
  defense: 0.2,
  dive: 0.2,
  special: 0.2,
} as const;

export const HAND_SIZE = 4;

// 게임 전체에서 쓰는 픽셀 폰트. public/assets/fonts/neodgm.ttf로 로드된다.
export const FONT_NAME = "NeoDunggeunmo";
export const FONT_FAMILY = `"${FONT_NAME}", monospace`;
