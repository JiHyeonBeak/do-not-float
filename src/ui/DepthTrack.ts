import Phaser from "phaser";
import { DEPTH_MAX } from "../config/Constants";
import { fitSpriteToSquare } from "../utils/SpriteFit";

const TRACK_WIDTH = 40;
const TOKEN_RADIUS = 46; // 기존 20에서 2.3배

// 캐릭터 하나의 수심을 세로 게이지 바 + 캐릭터 토큰으로 보여준다.
// (물줄기 등 세부 그래픽은 나중에 아트 리소스로 대체될 예정 — 지금은 단순 바 형태)
// 채워진 막대가 현재 수심이고 캐릭터 토큰은 항상 그 위에 올라탄다.
// 수심이 줄어들수록 막대가 짧아지면서 캐릭터도 함께 아래로 내려간다.
export class DepthTrack extends Phaser.GameObjects.Container {
  //private fill: Phaser.GameObjects.Rectangle;
  private token: Phaser.GameObjects.Arc | Phaser.GameObjects.Sprite;
  private readonly idleAnimKey?: string;
  private readonly trackHeight: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    bottomY: number,
    trackHeight: number,
    color: number,
    textureKey?: string,
    animKey?: string
  ) {
    super(scene, x, bottomY);
    this.idleAnimKey = animKey;
    this.trackHeight = trackHeight;

    // 수심 계산/토큰 이동 등 실제 기능은 그대로 두고, 게이지 바 자체는 화면에 그리지 않는다.
    const outline = scene.add
      .rectangle(0, -trackHeight / 2, TRACK_WIDTH, trackHeight)
      .setStrokeStyle(2, color, 0.5)
      .setVisible(false);
    // this.fill = scene.add
    //   .rectangle(0, 0, TRACK_WIDTH - 8, 0, color, 0.35)
    //   .setOrigin(0.5, 1);

    if (textureKey) {
      const sprite = scene.add.sprite(0, 0, textureKey);
      fitSpriteToSquare(sprite, TOKEN_RADIUS * 2);
      if (animKey) this.playSpriteAnimation(sprite, animKey);
      this.token = sprite;
    } else {
      this.token = scene.add.circle(0, 0, TOKEN_RADIUS, 0x021627).setStrokeStyle(3, color);
    }

    this.add([outline, this.token]);
    scene.add.existing(this);

    this.updateDepth(DEPTH_MAX);
  }

  // depth가 DEPTH_MAX(가장 깊음)일 때 토큰은 트랙 바닥(y=0)에, 0(해수면)일 때는
  // 트랙 꼭대기(y=-trackHeight)에 위치하도록 옮긴다.
  updateDepth(depth: number): void {
    const ratio = Phaser.Math.Clamp(depth / DEPTH_MAX, 0, 1);
    const surfaceProgress = 1 - ratio;
    this.token.y = -this.trackHeight * surfaceProgress;
  }

  // 캐릭터 토큰의 "발밑"(하단 경계) 월드 좌표. 토큰이 정사각형 박스(TOKEN_RADIUS*2)에 맞춰
  // 그려지므로 중심에서 TOKEN_RADIUS만큼 아래를 하단 경계로 근사한다. 수심 변화 이펙트처럼
  // 캐릭터 위치를 기준으로 삼는 다른 이펙트를 붙일 때 사용한다.
  getTokenBottomWorldPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y + this.token.y + TOKEN_RADIUS };
  }

  // animKey 애니메이션을 durationMs 동안 재생한 뒤 원래 유영 애니메이션으로 되돌아온다.
  // (애니메이션 프레임에 텍스처 정보가 포함되어 있어 play()만으로 텍스처도 함께 전환된다)
  playTemporaryAnimation(animKey: string, durationMs: number): void {
    if (!(this.token instanceof Phaser.GameObjects.Sprite)) return;

    const sprite = this.token;
    this.playSpriteAnimation(sprite, animKey);

    this.scene.time.delayedCall(durationMs, () => {
      if (this.idleAnimKey) this.playSpriteAnimation(sprite, this.idleAnimKey);
    });
  }

  // 텍스처마다 원본 프레임 크기가 달라(플레이어 384x384, 공격 모션 64x64 등) setDisplaySize가
  // 잡아둔 스케일이 그대로면 토큰 크기가 어긋난다. 애니메이션을 바꿀 때마다 목표 크기로 다시 맞춘다.
  private playSpriteAnimation(sprite: Phaser.GameObjects.Sprite, animKey: string): void {
    sprite.play(animKey);
    fitSpriteToSquare(sprite, TOKEN_RADIUS * 2);
  }
}
