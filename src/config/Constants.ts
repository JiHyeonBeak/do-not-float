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

// 캐릭터(플레이어/적 공통) 하나가 동시에 가질 수 있는 상태이상 최대 개수.
export const MAX_STATUS_EFFECTS = 3;

// 게임 전체에서 쓰는 픽셀 폰트. public/assets/fonts/neodgm.ttf로 로드된다.
export const FONT_NAME = "NeoDunggeunmo";
export const FONT_FAMILY = `"${FONT_NAME}", monospace`;

// attack/special 카드 사용 시 (플레이어/적 공통) 공격 모션을 보여주는 시간(ms).
export const ATTACK_ANIMATION_MS = 2000;

// 게임 시작 시 플레이어가 받는 최대 스태미나. 다음 스테이지로 이동하기 전까지는 회복되지 않는다
// (카드 효과, 그리고 아래 턴 기반 자동 회복만 예외).
export const PLAYER_MAX_STAMINA = 20;

// 밸런스 패치: 장기전에서 스태미너가 완전히 고갈되는 것을 완화하기 위해, 플레이어 턴이
// STAMINA_REGEN_INTERVAL_TURNS번째 돌아올 때마다(2, 4, 6...번째 턴) 자동으로 소량 회복시킨다.
export const STAMINA_REGEN_INTERVAL_TURNS = 2;
export const STAMINA_REGEN_AMOUNT = 1;

// 카드 코스트 = ceil(이펙트 amount 합계 / 이 값). 값이 클수록 코스트가 낮아진다.
export const CARD_COST_AMOUNT_DIVISOR = 50;

// 한 스테이지당 "재셔플" 버튼을 사용할 수 있는 횟수. 다음 스테이지로 이동하면 초기화된다.
// ("카드 뽑기"는 빈 슬롯이 있는 한 횟수 제한 없이 사용 가능하다.)
export const MAX_RESHUFFLES_PER_STAGE = 3;

// 스테이지(지역) 진행 순서. RunManager.currentRegion을 인덱스로 사용한다.
// 마지막 원소가 보스전이며, 인덱스가 배열 길이를 넘어가면 런 클리어(Victory)로 처리한다.
export const STAGE_ENEMY_ORDER = [
  "fusion_shark",
  "unfathomable_jellyfish",
  "neon_ansi",
  "kraken",
] as const;
