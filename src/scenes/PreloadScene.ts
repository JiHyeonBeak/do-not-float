import Phaser from "phaser";
import { loadGameFont } from "../utils/FontLoader";
import { AssetKeys } from "../utils/AssetKeys";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("Preload");
  }

  preload(): void {
    // TODO: AssetKeys 기준으로 나머지 이미지/오디오도 로드 + 로딩바 표시
    // player.png는 384x384 프레임 4장이 가로 1x4로 배치된 스프라이트시트(유영 애니메이션)다.
    this.load.spritesheet(AssetKeys.images.player, "assets/images/characters/player.png", {
      frameWidth: 384,
      frameHeight: 384,
    });
    // player_attack.png도 384x384 프레임 4장이 가로 1x4로 배치된 스프라이트시트(공격 애니메이션)다.
    this.load.spritesheet(
      AssetKeys.images.playerAttack,
      "assets/images/characters/player_attack.png",
      {
        frameWidth: 384,
        frameHeight: 384,
      }
    );
    // fusion_shark.png / fusion_shark_attack.png는 64x64 프레임 4장이 가로 1x4로 배치된 스프라이트시트다.
    this.load.spritesheet(AssetKeys.images.fusionShark, "assets/images/enemies/fusion_shark.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet(
      AssetKeys.images.fusionSharkAttack,
      "assets/images/enemies/fusion_shark_attack.png",
      {
        frameWidth: 64,
        frameHeight: 64,
      }
    );
    // 전투 배경은 정적 베이스 1장 + 그 위에 겹쳐 재생하는 fx 오버레이(애니메이션)로 구성된다.
    // battle_static.png는 1280x720(캔버스와 동일 크기) 단일 이미지.
    this.load.image(AssetKeys.images.backgroundBattleStatic, "assets/images/backgrounds/battle_static.png");
    // battle_fx_overly_8.png는 1280x720 프레임 8장이 4x2로 배치된 스프라이트시트(물빛/광선 애니메이션).
    this.load.spritesheet(
      AssetKeys.images.backgroundBattleFx,
      "assets/images/backgrounds/battle_fx_overly_8.png",
      {
        frameWidth: 1280,
        frameHeight: 720,
      }
    );
    // 타이틀 배경은 battle_static과 같은 구성: 로고가 포함된 정적 베이스 1장 위에
    // 애니메이션 오버레이 2겹(광원/물결, 떠오르는 기포)을 겹쳐 재생한다.
    // title_static.png는 1280x720 단일 이미지.
    this.load.image(AssetKeys.images.backgroundTitle, "assets/images/backgrounds/title_static.png");
    // title_overlay_1.png(기포)/title_overlay_2.png(광원/물결)는 1280x720 프레임 8장이
    // 가로 1x8로 배치된 스프라이트시트(반투명 앰비언트 애니메이션).
    this.load.spritesheet(
      AssetKeys.images.backgroundTitleOverlay1,
      "assets/images/backgrounds/title_overlay_1.png",
      { frameWidth: 1280, frameHeight: 720 }
    );
    this.load.spritesheet(
      AssetKeys.images.backgroundTitleOverlay2,
      "assets/images/backgrounds/title_overlay_2.png",
      { frameWidth: 1280, frameHeight: 720 }
    );
    // kraken.png / kraken_attack.png는 프레임 4장이 가로로 나열돼 있지만, 프레임마다 폭과
    // 프레임 사이 간격이 제각각이라(그림마다 개별적으로 트리밍됨) frameWidth/spacing을 쓰는
    // 균일 그리드 스프라이트시트로는 자를 수 없다. 그냥 이미지로 로드하고 create()에서
    // defineIrregularFrames()로 프레임마다 실측한 좌표를 직접 등록한다.
    this.load.image(AssetKeys.images.kraken, "assets/images/enemies/kraken.png");
    this.load.image(AssetKeys.images.krakenAttack, "assets/images/enemies/kraken_attack.png");
    // unfathomable_jellyfish*.png는 원본에 위아래 여백이 커서(실제 그림은 프레임의 30~40%만
    // 차지) 정사각형 토큰에 맞추면 플레이어보다 훨씬 작아 보였다. 그래서 각 프레임을 그림이
    // 실제로 있는 범위만 남기고 세로로 잘라냈다(가로 4프레임 배치는 동일, 프레임 크기는 균일).
    this.load.spritesheet(
      AssetKeys.images.unfathomableJellyfish,
      "assets/images/enemies/unfathomable_jellyfish.png",
      {
        frameWidth: 384,
        frameHeight: 560,
      }
    );
    this.load.spritesheet(
      AssetKeys.images.unfathomableJellyfishAttack,
      "assets/images/enemies/unfathomable_jellyfish_attack.png",
      {
        frameWidth: 227,
        frameHeight: 272,
      }
    );
    // 수심 변화 이펙트: 384x274 프레임 4장, 프레임 사이 8px 간격(kraken과 동일한 이유로 추가).
    this.load.spritesheet(AssetKeys.images.effectSpray, "assets/images/effects/spray.png", {
      frameWidth: 384,
      frameHeight: 274,
      spacing: 8,
    });

    // 카드 사용 효과음(attack/dive/defense 타입 공용, 플레이어/적 공용)과 사망 효과음.
    this.load.audio(AssetKeys.audio.sfxAttack, "assets/audio/sfx/attack.mp3");
    this.load.audio(AssetKeys.audio.sfxDive, "assets/audio/sfx/dive.mp3");
    this.load.audio(AssetKeys.audio.sfxDefend, "assets/audio/sfx/defense.mp3");
    this.load.audio(AssetKeys.audio.sfxDeath, "assets/audio/sfx/death.mp3");
    // Enemy 전투 전용 BGM. 
    this.load.audio(AssetKeys.audio.bgmFusionSharkBattle, "assets/audio/bgm/shark_battle.mp3");
    this.load.audio(AssetKeys.audio.bgmJellyfishBattle, "assets/audio/bgm/jellyfish_battle.mp3");
    this.load.audio(AssetKeys.audio.bgmKrakenBattle, "assets/audio/bgm/kraken_battle.mp3");
    this.load.audio(AssetKeys.audio.bgmTitle, "assets/audio/bgm/title.mp3");
  }

  create(): void {
    // kraken/krakenAttack은 프레임 폭이 균일하지 않아 실측한 x/폭으로 프레임 0~3을 직접 등록한다.
    // 높이는 이미지 전체 높이를 그대로 써서 프레임마다 세로로 잘리는 일이 없게 한다.
    this.defineIrregularFrames(
      AssetKeys.images.kraken,
      [
        { x: 24, width: 282 },
        { x: 392, width: 282 },
        { x: 761, width: 276 },
        { x: 1107, width: 271 },
      ],
      387
    );
    this.defineIrregularFrames(
      AssetKeys.images.krakenAttack,
      [
        { x: 51, width: 259 },
        { x: 384, width: 285 },
        { x: 727, width: 332 },
        { x: 1124, width: 268 },
      ],
      351
    );

    this.anims.create({
      key: AssetKeys.animations.playerIdle,
      frames: this.anims.generateFrameNumbers(AssetKeys.images.player, { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: AssetKeys.animations.playerAttack,
      frames: this.anims.generateFrameNumbers(AssetKeys.images.playerAttack, { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: AssetKeys.animations.fusionSharkIdle,
      frames: this.anims.generateFrameNumbers(AssetKeys.images.fusionShark, { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: AssetKeys.animations.fusionSharkAttack,
      frames: this.anims.generateFrameNumbers(AssetKeys.images.fusionSharkAttack, { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: AssetKeys.animations.backgroundBattleFxAmbient,
      frames: this.anims.generateFrameNumbers(AssetKeys.images.backgroundBattleFx, {
        start: 0,
        end: 7,
      }),
      frameRate: 4,
      repeat: -1,
    });

    this.anims.create({
      key: AssetKeys.animations.backgroundTitleOverlay1Ambient,
      frames: this.anims.generateFrameNumbers(AssetKeys.images.backgroundTitleOverlay1, {
        start: 0,
        end: 7,
      }),
      frameRate: 5,
      repeat: -1,
    });

    this.anims.create({
      key: AssetKeys.animations.backgroundTitleOverlay2Ambient,
      frames: this.anims.generateFrameNumbers(AssetKeys.images.backgroundTitleOverlay2, {
        start: 0,
        end: 7,
      }),
      frameRate: 3,
      repeat: -1,
    });

    this.anims.create({
      key: AssetKeys.animations.krakenIdle,
      frames: this.anims.generateFrameNumbers(AssetKeys.images.kraken, { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: AssetKeys.animations.krakenAttack,
      frames: this.anims.generateFrameNumbers(AssetKeys.images.krakenAttack, { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: AssetKeys.animations.unfathomableJellyfishIdle,
      frames: this.anims.generateFrameNumbers(AssetKeys.images.unfathomableJellyfish, {
        start: 0,
        end: 3,
      }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: AssetKeys.animations.unfathomableJellyfishAttack,
      frames: this.anims.generateFrameNumbers(AssetKeys.images.unfathomableJellyfishAttack, {
        start: 0,
        end: 3,
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: AssetKeys.animations.effectSpray,
      frames: this.anims.generateFrameNumbers(AssetKeys.images.effectSpray, { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    loadGameFont().then(() => this.scene.start("MainMenu"));
  }

  // frameWidth 하나로는 표현할 수 없는(프레임마다 폭이 제각각인) 스프라이트시트용으로,
  // 실측한 x/폭 목록을 그대로 텍스처 프레임 0, 1, 2...로 등록한다.
  private defineIrregularFrames(
    key: string,
    frames: readonly { x: number; width: number }[],
    height: number
  ): void {
    const texture = this.textures.get(key);
    frames.forEach((frame, index) => {
      texture.add(index, 0, frame.x, 0, frame.width, height);
    });
  }
}
