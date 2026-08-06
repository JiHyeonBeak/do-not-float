# Do Not Float — 개발 진행 기록

Phaser 3 + TypeScript 기반 해양 판타지 1:1 카드 배틀 게임. 이 문서는 지금까지 구현된 내용을 정리한 기록이다.

## 1. 프로젝트 스캐폴딩

- Vite + Phaser 3 + TypeScript로 초기 세팅 (`package.json`, `tsconfig.json`, `vite.config.ts`)
- 폴더 구조: `scenes/`(씬), `entities/`(캐릭터), `enemies/`(적 클래스), `cards/`(카드 데이터·로직), `systems/`(전투 로직), `ui/`(Phaser 표시 컴포넌트), `utils/`, `config/`, `types/`, `data/`(JSON)
- 씬 흐름: `Boot → Preload → MainMenu → Map → Battle → Reward/GameOver/Victory`

## 2. 카드 이펙트 시스템 (100장+ 확장 가능한 구조)

카드 100장 이상으로 확장 가능하도록 설계한 핵심 아키텍처.

- **[Card.ts](src/cards/Card.ts)**: 카드는 `damage`/`shield` 같은 플랫 필드 대신 `effects: CardEffect[]` 배열로 표현. `CardEffect`는 `kind`로 구분되는 discriminated union(`damage`/`shield`/`depthChange`/`statusEffect`/`cancelNextEnemyAction`)이라 카드 1장에 효과 여러 개를 합성할 수 있다.
- **[cards/effects/](src/cards/effects/)**: `CardEffectRegistry`가 `kind → 핸들러` 맵을 관리하는 Strategy 패턴. 새 이펙트 종류를 추가할 때 `effects/` 밑에 파일 하나 만들고 `index.ts`에 import 한 줄만 추가하면 되고, 기존 코드는 건드리지 않는다.
- **가드(guard) 메커니즘**: 각 이펙트 핸들러가 선택적으로 "지금 적용 가능한가"를 판단하는 guard를 함께 등록할 수 있음 (`CardEffectRegistry.canApply`). 예: `DepthChangeEffect`는 대상이 이미 최대 수심이면 회복형 효과를 막는다.
- **[CardValidation.ts](src/cards/CardValidation.ts)**: `CardDatabase`와 `EnemyCardDatabase`가 공유하는 검증 로직 — 부팅 시 모든 카드의 `effect.kind`가 실제 등록된 핸들러인지 확인하고, 문제가 있으면 즉시 예외를 던진다.
- **적도 같은 이펙트 어휘 사용**: [Enemy.ts](src/entities/Enemy.ts)의 `useSkill()`이 카드와 동일한 `CardEffectRegistry`를 호출하므로, 플레이어 카드와 적 스킬이 로직을 중복 없이 공유한다.

## 3. 전투 시스템

- **[BattleManager.ts](src/systems/BattleManager.ts)**: 카드 사용(`playCard`), 적 턴 진행(`runEnemyTurn`), 승패 판정을 담당. 카드 사용/적 행동마다 `console.log`로 로그를 남긴다.
- **[EnemyAI.ts](src/systems/EnemyAI.ts)**: 확률 기반 행동 결정(공격 40%/방어 20%/잠수 20%/특수 20%) + 위험 수심일 때 생존 행동 우선하는 규칙.
- **턴 구조**: 카드를 클릭하면 즉시 사용되지 않고 "선택"만 된다 (테두리가 금색으로 켜짐). 별도 **"턴 종료"** 버튼을 눌러야 선택된 카드가 실제로 사용되고 턴이 넘어간다 — 기획서의 "카드 사용"과 "턴 종료"가 별개 행동이라는 설계를 반영. 카드를 **더블클릭**하면 선택+턴종료가 한 번에 실행된다.
- **수심 상한 클램프**: [Character.ts](src/entities/Character.ts)의 `changeDepth()`가 항상 0~`DEPTH_MAX`(1000) 범위로 고정. 수심이 이미 최대일 때 잠수(회복) 카드를 클릭하면 카드가 흔들리며 "수심이 최대치임으로 잠수 카드를 사용할 수 없습니다." 경고가 뜬다.

## 4. 적 전용 카드 덱

- **[EnemyCard.ts](src/cards/EnemyCard.ts)** / **[EnemyCardDatabase.ts](src/cards/EnemyCardDatabase.ts)**: 플레이어의 `cards.json`과 별도로 [data/enemyCards.json](src/data/enemyCards.json)에서 적 전용 카드를 관리. `enemyId`로 어떤 적의 카드인지 표시.
- 각 적(`Kraken`/`FusionShark`/`UnfathomableJellyfish`)은 더 이상 스킬을 하드코딩하지 않고, `id`만 가지고 있으며 `useSkill()` 호출 시 `EnemyCardDatabase.getByEnemyId(this.id)`에서 카드를 무작위로 뽑아 사용한다.

## 5. 전투 화면 UI

사용자가 그려준 손그림 목업을 기준으로 여러 차례 반복 수정.

- **[SurfaceLine.ts](src/ui/SurfaceLine.ts)**: 화면 상단 물결 모양 수면선.
- **[DepthTrack.ts](src/ui/DepthTrack.ts)**: 캐릭터 토큰 + 세로 게이지 바. 채워진 막대가 현재 수심이고 캐릭터 토큰이 그 위에 올라탄 채로 함께 움직인다 — 수심이 줄면 막대가 짧아지며 캐릭터가 아래로 내려감. (물줄기 그래픽 시안도 만들었으나, 나중에 아트 리소스로 교체할 예정이라 단순 바 형태로 확정)
- **[StatPanel.ts](src/ui/StatPanel.ts)** + **[formatStatusEffects.ts](src/ui/formatStatusEffects.ts)**: 플레이어(좌하단)/적(우상단) 상태창 — 방어력, 수심(플레이어만), 현재 상태이상 목록.
- **[DialogBox.ts](src/ui/DialogBox.ts)**: 카드 설명/효과를 보여주는 반투명 알림창. 고정 크기(520×150)로 텍스트 길이와 무관하게 항상 동일하게 뜨고, 화면 정중앙에 정렬. `show()`(잠깐 떴다 자동으로 사라짐, 카드 사용 알림)와 `showPersistent()`/`hide()`(카드 선택 미리보기, 명시적으로 없앨 때까지 유지) 두 모드 지원.
- **[formatCardEffects.ts](src/ui/formatCardEffects.ts)**: 카드를 선택하면 테두리가 금색으로 켜지면서 설명 + 효과("- 상대에게 피해 200" 등)가 함께 뜬다.
- **[CardView.ts](src/ui/CardView.ts)**: 선택 시 테두리 강조, 사용 불가 시 흔들림 애니메이션, 더블클릭 감지(300ms 이내 재클릭).

## 6. 폰트 & 아트 리소스

- **NeoDunggeunmo(Neo둥근모)** 픽셀 폰트를 게임 전체 텍스트에 적용. [FontLoader.ts](src/utils/FontLoader.ts)가 브라우저 CSS Font Loading API로 씬 생성 전에 폰트를 미리 로드해서, 텍스트가 기본 폰트로 그려지는 문제를 방지.
- 라이선스 텍스트를 메인 메뉴 → **"라이선스"** 메뉴 → [LicenseScene.ts](src/scenes/LicenseScene.ts)에 표시.
- 플레이어 캐릭터 스프라이트(`public/assets/images/characters/player.png`, 512×512 프레임 4장의 유영 애니메이션 스프라이트시트)를 로드해 전투 화면의 플레이어 토큰에 4프레임 반복 애니메이션(`player-idle`)으로 적용. 적 쪽은 아직 전용 이미지가 없어 기존 원형 토큰 그대로.

## 7. 카드 데이터

- **[data/cards.json](src/data/cards.json)**: 플레이어 카드 20장 (초기 5장 + 공격/잠수/방어 60:20:20 비율로 추가한 15장). 전부 심해·해양생물 테마.
- **[data/enemyCards.json](src/data/enemyCards.json)**: 적 카드 6장 (크라켄 2장, 핵융합 상어 2장, 불가해파리 2장).

## 8. 아직 안 한 것 / TODO

- 로그라이크 진행(`MapScene`, `RewardScene`, `RunManager`)은 스캐폴드만 있고 실제 지역 선택·카드 보상·강화 로직은 미구현.
- 적 UI에도 전용 스프라이트/애니메이션 없음(플레이어만 적용됨).
- 사운드(BGM/효과음) 전혀 미구현 — `AssetKeys.audio`만 정의된 상태.
- `EnemyAI`의 "defense"/"dive"/"special" 결정에 대응하는 실제 행동 로직 없음(현재는 "attack"만 실제로 카드를 사용함).
- 라이선스 화면에는 짧은 저작권 고지만 있고, SIL OFL 전문은 아직 넣지 않음(사용자 확인 대기 중이었음).
- git: 최초 스캐폴딩 커밋(`4217da8`) 이후의 모든 작업이 아직 커밋되지 않은 상태 (git 사용자 정보 미설정으로 커밋 보류됨).
