import Phaser from "phaser";

// setDisplaySize(w, h)는 원본 프레임 비율과 무관하게 가로/세로를 강제로 늘려 찌그러뜨린다.
// 적 스프라이트마다 프레임 원본 크기가 제각각이라(플레이어 384x384, 크라켄/불가해파리 384x1024 등)
// 정사각형 슬롯 안에 비율을 유지한 채 최대한 크게 들어가도록 스케일만 조정한다.
export function fitSpriteToSquare(sprite: Phaser.GameObjects.Sprite, size: number): void {
  const frame = sprite.frame;
  const scale = Math.min(size / frame.width, size / frame.height);
  sprite.setScale(scale);
}
