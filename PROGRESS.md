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

## 8. 타이틀 화면

- **[MainMenuScene.ts](src/scenes/MainMenuScene.ts)**: 로고가 포함된 정적 베이스(`title_static.png`) 위에 광원/물결·기포 오버레이 2겹을 겹쳐 잔잔하게 움직이는 수중 타이틀 화면 구성.
- 타이틀 BGM(`bgm-title`)을 무한루프 재생. **"라이선스"** 로 이동할 때는 멈추지 않고 같은 사운드 인스턴스를 유지한 채 음량만 50%로 낮추고, 돌아오면 100%로 복원. **"시작하기"** 를 눌러 실제 게임을 시작할 때만 정지.
- 오버레이 스프라이트시트를 8프레임 한 줄(10240px 폭)로 배치했더니 WebGL 최대 텍스처 크기를 넘어 타이틀 화면이 통째로 까맣게 나오던 문제가 있어, 기존 `battle_fx_overly_8.png`와 같은 4×2 그리드로 재배치해서 해결.

## 9. 사운드 시스템 (BGM/SFX)

- **[Enemy.ts](src/entities/Enemy.ts)**의 `bgmKey`(선택 필드)로 적마다 다른 전투 BGM을 지정할 수 있게 하고, 핵융합 상어/크라켄/불가해파리 각각에 전용 BGM 연결. **[BattleScene.ts](src/scenes/BattleScene.ts)**가 전투 시작 시 재생하고 씬을 나갈 때(승리/패배/다음 스테이지 어떤 경로든) 반드시 정지.
- 플레이어 수심이 `LOW_DEPTH_BGM_THRESHOLD`(200) 이하로 내려가면 전투 BGM 재생 속도를 `LOW_DEPTH_BGM_RATE`(1.5배)로 높여 위기감 연출. 수심이 회복되면 정상 속도로 복귀.

## 10. 상태이상 시스템 (poison / attackDown / stunned)

카드 이펙트 시스템과 동일한 Strategy 패턴으로 구현.

- **[StatusEffectRegistry.ts](src/entities/statusEffects/StatusEffectRegistry.ts)**: 상태이상 종류별로 `onTurnStart`(턴 시작 시 발동, 예: poison 도트 피해), `modifyOutgoingDamage`(공격력 보정, 예: attackDown), `blocksAction`(행동 차단, 예: stunned) 훅을 등록. 새 상태이상을 추가할 때 `src/entities/statusEffects/` 밑에 파일 하나 + `index.ts` 한 줄만 추가하면 되고 `Character`/`BattleManager`는 건드리지 않는다.
- **[Character.ts](src/entities/Character.ts)**: `resolveTurnStartStatusEffects()`(턴 시작 훅 발동 + 남은 지속시간 차감/만료 제거), `isActionBlocked()`, `getOutgoingDamageModifier()` 추가.
- **[BattleManager.ts](src/systems/BattleManager.ts)**: 적 턴 시작 시 stunned면 행동을 스킵, 플레이어는 stunned면 `getBlockReason`에서 모든 카드 선택을 차단.
- 기존엔 상태이상을 걸어도 지속시간이 전혀 줄지 않아 화면에 "(N턴)"이 영구히 남아있던 버그가 있었는데, 이번에 근본 원인(턴 경계에서 tick하는 코드가 아예 없었음)을 고치면서 위 기능 전체를 같이 구현.

## 11. 전투 연출 추가

- **[SprayEffect.ts](src/ui/SprayEffect.ts)**: 수심이 실제로 바뀔 때(피해/잠수 등) 캐릭터 발밑에 1초간 물보라를 띄우는 이펙트. 캐릭터와 겹치지 않도록 캐릭터 아래쪽에 수직으로 배치. **[Character.ts](src/entities/Character.ts)**의 `applyDamage`/`changeDepth`가 (기존엔 정의만 있고 아무도 쓰지 않던) `GameEvents.DepthChanged`를 실제로 발생시키도록 연결해서 트리거.
- **[DepthTrack.ts](src/ui/DepthTrack.ts)**: 세로 게이지 바 테두리와 상단 수면 물결선(**[SurfaceLine.ts](src/ui/SurfaceLine.ts)**)을 화면에서 숨김(`setVisible(false)`) — 수심 계산·캐릭터 토큰 이동 등 실제 기능은 그대로 유지.
- 캐릭터 토큰(플레이어/적 공용) 크기를 기존의 2.3배로 확대.

## 12. 스프라이트 리소스 수정

- **[GameConfig.ts](src/config/GameConfig.ts)**에 `pixelArt: true` 추가 — 기본 선형 필터링 탓에 스프라이트시트 인접 프레임 픽셀이 축소 렌더링 시 섞여 보이던 문제 해결.
- 크라켄/불가해파리 스프라이트가 프레임 대비 그림이 차지하는 비율이 너무 낮아(위아래 여백이 커서) 플레이어보다 훨씬 작게 보이던 문제 — 그림이 실제로 있는 범위만 남기고 각 프레임을 다시 크롭.
- 크라켄은 그림이 프레임 가로 폭 끝까지 거의 꽉 차 있어 GPU가 인접 프레임을 살짝 침범해 샘플링하는 번짐이 있었음 — 프레임 사이에 실제 투명 간격(spacing)을 둬서 해결.
- 크라켄 스프라이트가 이후 프레임마다 폭과 간격이 제각각인 형태로 다시 편집되면서 `frameWidth` 기반 균일 그리드 로더로는 자를 수 없게 됨 — **[PreloadScene.ts](src/scenes/PreloadScene.ts)**의 `defineIrregularFrames()`로 프레임마다 실측한 좌표를 직접 텍스처에 등록하는 방식으로 전환.
- 불가해파리 공격 포즈가 idle 포즈보다 여백 비율이 훨씬 커서 공격 애니메이션 재생 시 캐릭터가 순간적으로 작아져 보이던 문제도 같은 방식으로 재크롭.
- **[SpriteFit.ts](src/utils/SpriteFit.ts)**: 원본 프레임 비율을 유지한 채 정사각형 슬롯에 맞추는 공용 헬퍼(`setDisplaySize`가 비율을 무시하고 찌그러뜨리는 문제 방지). `DepthTrack`/`MapScene` 등에서 공용으로 사용.

## 13. 버그 수정

- **EventBus 리스너 누수**: `BattleScene`이 매 전투(스테이지)마다 `EventBus.on`을 새로 등록하면서 이전 전투의 리스너를 해제하지 않아, 스테이지를 진행할수록 카드 한 장 낼 때마다 중복 호출이 쌓여 점점 버벅이던 문제. 씬 종료(`SHUTDOWN`) 시 리스너를 해제하도록 수정.
- **카드 선택 하이라이트 버그**: 손패에 같은 카드가 2장 있으면(예: 창 카드 2장) `id` 기준으로 비교하던 탓에 하나만 클릭해도 둘 다 노란 테두리로 선택 표시되던 문제. `HandView`/`Deck.playFromHand`/`Enemy.useSkill`을 전부 카드 id가 아닌 객체 참조 기준으로 비교하도록 수정.
- **다중 효과 카드 차단 버그**: 피해+스태미너 회복처럼 효과 2개를 가진 카드가, 스태미너가 이미 최대치라 부가 효과 하나만 막혀도 카드 전체가 통째로 막히던 문제. `CardEffectResolver.canPlay`를 "모든 효과가 유효해야 함"(`every`)에서 "하나라도 유효하면 됨"(`some`)으로 변경.
- **스태미너 관련 상태 이중 관리 버그**: `RunManager`(실제 표시/소비되는 자원)와 `Character`(쓰이지 않던 별도 필드) 두 곳에서 스태미너를 따로 들고 있던 탓에 "최대치" 판정이 화면과 안 맞던 문제들을 스태미너 회복 로직 전체를 `RunManager` 하나로 통일해서 해결.
- **런 재시작 버그**: `GameOverScene`에 처음으로 돌아갈 방법이 없었고, `RunManager.reset()`도 어디서도 호출된 적이 없어 재시작해도 이전 런의 스테이지 진행도·스태미너·획득 카드가 남아있던 문제. **"처음으로"** 버튼 추가 + `RunManager.reset()`을 실제 시작 시점에 연결.
- **부팅 실패 버그**: `cards.json`에 `CardEffectRegistry`에 등록되지 않은 이펙트(`healStaminaMaximum`, 오타가 있던 `cancelEnemysheid`)가 추가되면서 앱이 아예 부팅되지 않던 문제. 두 핸들러를 정식 구현하고 오타는 `resetEnemyDivePower`로 정정.

## 14. 히든 카드 전용 아트 & 프레임 오버레이

- **[CardView.ts](src/ui/CardView.ts)**: `CARD_ART_OVERRIDES` 맵(카드 id → 전용 프레임 이미지 키 + 이름칸/코스트칸 좌표)을 추가. 히든 카드(미친 상어의 눈빛/안시의 호기심/해파리 펌프 등)는 카드마다 개별 원화가 들어간 전용 프레임을 쓰고, 슬롯 위치가 기본 카드와 달라도 카드별로 따로 지정 가능. 새 히든 카드를 추가할 땐 AssetKeys/PreloadScene에 이미지 등록 + 이 맵에 항목 하나만 추가하면 된다.
- 손패 카드의 선택 테두리를 평소엔 완전히 투명하게, 선택됐을 때만 노란 테두리가 나타나도록 수정(기존엔 항상 흰 테두리가 겹쳐 보이던 문제).

## 15. 손패 조작 개편: 카드 뽑기 무제한화 + 재셔플 추가

- **"카드 뽑기"**: 기존엔 스테이지당 3회 제한이 있었는데, 이제 손패 빈 슬롯이 있으면 횟수 제한 없이 뽑을 수 있음(카드 뽑기 시 `pickup.mp3` 효과음 재생).
- **"재셔플"** 버튼 신설: 아직 사용하지 않은 손패를 전부 되돌려 섞은 뒤 다시 뽑는다(이미 사용한 카드는 대상에서 제외). 기존에 "카드 뽑기"가 쓰던 스테이지당 3회 제한 자원을 이쪽으로 이전. **[Deck.ts](src/cards/Deck.ts)**의 `reshuffleHand()`, **[RunManager.ts](src/systems/RunManager.ts)**의 `remainingReshuffles`로 구현.
- **[Button.ts](src/ui/Button.ts)**: `button.png` 프레임 위에 라벨 텍스트를 겹쳐 그리는 범용 버튼 컴포넌트 신설. 전투 화면의 재셔플/카드 뽑기/턴 종료 버튼을 전부 이 컴포넌트로 교체(기존엔 테두리 없는 순수 텍스트 버튼).

## 16. 보상 화면(RewardScene) 구현

기존엔 TODO만 있던 스텁을 실제로 구현.

- 스테이지 승리 시 지급된 히든 카드가 있으면, 화면 상단에 "카드를 얻었습니다!" + 카드를 크게(1.8배) 표시 + 설명/효과를 보여주고 일정 시간 후 자동으로 `Map`으로 전환. 지급된 카드가 없으면(보상 없는 적이거나 이미 보유 중) 화면 없이 바로 `Map`으로 이동.
- **[BattleManager.ts](src/systems/BattleManager.ts)**가 `getLastGrantedCard()`로 이번 전투에서 지급된 카드를 노출하고, **[BattleScene.ts](src/scenes/BattleScene.ts)**가 승리 시 이를 `Reward` 씬에 데이터로 전달.

## 17. 엔딩 스태프롤(VictoryScene) 구현

기존엔 한 줄짜리 스텁이었던 씬을 실제 엔딩으로 구현.

- 배경: `ending_static.png`(정적 베이스) + `ending_layout_1.png`(광원/파티클 8프레임 애니메이션), BGM `ending.mp3` 무한 반복.
- 화면 정중앙 하단에서 시작해 위로 끝없이 흘러가는 스태프롤(제목 → 스테이지 클리어 기록 → 크레딧 섹션 순). 텍스트가 지나가는 자리엔 반투명 카펫을 깔아 가독성 확보.
- 크레딧 **내용**은 **[data/credits.ts](src/data/credits.ts)**로 분리(제목/섹션/이름 배열). 스크롤 로직(`VictoryScene`)과 내용(데이터)을 분리해뒀기 때문에 크레딧만 수정하고 싶으면 이 파일만 고치면 됨.
- 우측 하단 "ESC를 눌러 처음화면으로" 안내 문구(검정색, 알파 1↔0.25 반복 트윈으로 은은하게 반짝임) — 클릭 또는 ESC 키 입력으로 `MainMenu`로 복귀.
- **스테이지별 클리어 타임 기록**: **[RunManager.ts](src/systems/RunManager.ts)**의 `startStageTimer()`/`recordStageClear()`로 전투 시작~승리까지 걸린 시간을 스테이지별로 측정해 스태프롤 첫머리에 표시(`EnemyDatabase.getName()`으로 적 이름 조회).
- **버그**: `ending_layout_1.png`가 10240px 폭(1×8 배치)이라 WebGL 최대 텍스처 크기(8192px)를 넘어 로드 시 화면이 통째로 까맣게 나오던 문제 — 타이틀/게임오버 오버레이와 같은 방식으로 4×2 그리드(5120×1440)로 재배치해서 해결.

## 18. 새 카드 효과: cancelDebuff

- **[Card.ts](src/cards/Card.ts)**에 `{ kind: "cancelDebuff" }` 추가 — 카드를 낸 쪽 자신의 상태이상 중 **남은 턴수가 가장 많은 것 1개**를 제거. `cancelNextEnemyAction`/`resetEnemyDivePower`처럼 항상 자기 자신(source)에게만 적용되는 효과라 target 필드가 없음.
- **[Character.ts](src/entities/Character.ts)**에 `removeStrongestStatusEffect()` 추가.
- **버그**: 처음 구현할 때 `target: EffectTarget` 필드를 요구하도록 만들었는데 `cards.json`엔 그 필드가 없어서, 대상 판별이 항상 상대편으로 빠져 "자신의 디버프 제거" 카드가 실제로는 적의 상태이상을 검사/제거하던 문제가 있었음. target 필드를 아예 없애고 항상 자기 자신을 대상으로 하도록 단순화해서 해결.
- **버그**: 디버프가 없어 카드를 못 낼 때 `BattleManager.getBlockReason()`이 "staminaMax 아니면 depthMax" 둘 중 하나로만 추측하던 탓에 항상 "수심 최대치" 메시지가 잘못 뜨던 문제 — `CardBlockReason`에 `noDebuffToCancel`을 추가하고 전용 메시지를 매핑해서 해결.

## 19. 그 밖의 버그 수정

- **상태이상 UI 미표시 버그**: `BattleScene.onEndTurn()`이 카드 효과는 즉시 적용하면서도 화면 갱신(`refreshGauges()`)은 적 턴이 끝난 뒤에야 호출해서, `cancelNextEnemyAction`처럼 지속시간 1턴짜리 상태이상(기절)은 화면에 뜰 기회도 없이 바로 소모되어 사라지던 문제. 카드를 낸 직후에도 `refreshGauges()`를 호출하도록 수정.
- **수심 0인데 게임오버가 지연되는 버그**: `BattleManager.runEnemyTurn()`이 `checkBattleEnd()`를 플레이어의 turn-start 상태이상(중독 등)이 발동되기 **전**에 호출하고 있어서, 중독이 플레이어 턴 시작 시점에 수심을 0으로 만들어도 그 즉시 게임 오버로 이어지지 않고 다음 카드 사용이나 다음 적 턴까지 미뤄지던 문제. `checkBattleEnd()` 호출 위치를 플레이어의 turn-start 효과 처리 뒤로 이동해서 해결.
- **네온 안시 처치 시 게임 멈춤 버그**: `NeonAnsi.ts`의 `rewardCardId`가 `cards.json`에 등록된 실제 카드 id와 철자가 달라(`"ansi's curious"` vs `"ansis_curious"`) 보상 지급 시 `Unknown card id` 예외가 승패 판정 도중에 발생, 전투 종료 이벤트 자체가 멈춰버리던 문제.
- **spray.png 프레임 재수정**: 이펙트 이미지가 교체되면서 프레임 폭이 제각각이고 위아래 여백도 커짐 — kraken/neon_ansi에 쓰던 `defineIrregularFrames()`에 공통 y오프셋 파라미터를 추가해 대응.

## 20. 아직 안 한 것 / TODO

- 카드 강화(레벨업) 등 `RewardScene`의 다른 보상 종류는 미구현(현재는 히든 카드 지급만 있음).
- `EnemyAI`의 "defense"/"dive"/"special" 결정에 대응하는 실제 행동 로직 없음(현재는 "attack"만 실제로 카드를 사용함) — 이 부분은 이번 세션에서 다시 확인하지 않아 최신 상태 불명.
- 라이선스 화면에는 짧은 저작권 고지만 있고, SIL OFL 전문은 아직 넣지 않음(사용자 확인 대기 중이었음).
- poison/attackDown/stunned 외의 새 상태이상은 아직 없음(레지스트리 구조만 마련된 상태).
- 엔딩 스태프롤 크레딧 내용(`data/credits.ts`)은 뼈대만 채워둔 상태(제작: jhbaek) — 실제 크레딧 내용은 나중에 채워야 함.
