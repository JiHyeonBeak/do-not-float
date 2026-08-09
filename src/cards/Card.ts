import { StatusEffectType } from "../types/CharacterTypes";

// 카드 분류 태그. 실제 동작(effects)과는 무관하고, UI 표시나 보상 화면에서
// "공격 카드 중 하나 선택" 같은 필터링 용도로만 쓰인다.
export type CardType = "attack" | "defense" | "dive" | "special";

// 이펙트가 누구에게 적용되는지. "self"=카드를 낸 쪽, "opponent"=상대편.
// (플레이어가 카드를 낼 때는 self=플레이어, 적이 스킬을 쓸 때는 self=적이 된다)
export type EffectTarget = "self" | "opponent";

// 카드 한 장이 실제로 하는 일을 표현하는 타입.
// "kind" 값으로 종류를 구분하는 유니언(discriminated union)이라서,
// 예를 들어 kind가 "damage"인 객체는 amount/target만 갖고,
// kind가 "statusEffect"인 객체는 status/amount/duration/target을 갖는 식으로
// TypeScript가 kind 값만 보고 나머지 필드 타입을 자동으로 좁혀준다.
//
// 실제로 이 값을 읽어서 캐릭터에 적용하는 코드는 cards/effects/ 폴더에 있다
// (예: kind:"damage" → cards/effects/DamageEffect.ts).
export type CardEffect =
  | { kind: "damage"; amount: number; target: EffectTarget } // 수심 amount만큼 감소(피해)
  | { kind: "shield"; amount: number; target: EffectTarget } // 잠수력 amount만큼 증가(방어)
  | { kind: "depthChange"; amount: number; target: EffectTarget } // 수심 amount만큼 증감(회복/추가 피해 겸용)
  | { kind: "stamina"; amount: number; target: EffectTarget } // 스태미너 amount만큼 증감(회복/추가 피해 겸용)
  | { kind: "healStaminaMaximum" } // 스태미너를 최대치까지 즉시 회복(런에 귀속된 자원이라 대상 지정 불필요)
  | { kind: "resetEnemyDivePower" } // 상대의 잠수력(방어력)을 0으로 초기화
  | {
      kind: "statusEffect"; // 상태이상(독, 공격력 감소 등)을 duration턴 동안 부여
      status: StatusEffectType;
      amount: number;
      duration: number;
      target: EffectTarget;
    }
  | { kind: "cancelNextEnemyAction" } // 상대를 1턴 기절(stunned) 시켜 다음 행동을 무효화
  | { kind: "cancelDebuff" }; // 카드를 낸 쪽 자신의 상태이상 중 남은 턴수가 가장 많은 것 1개 제거

// 카드 한 장의 데이터 정의. data/cards.json에 이 형태로 저장되어 있고,
// CardDatabase가 읽어서 검증한 뒤 게임 전체에서 사용한다.
export interface Card {
  id: string; // 카드 고유 식별자 (덱/손패에서 카드를 찾을 때 사용)
  name: string; // 화면에 표시되는 이름
  type: CardType; // UI 분류용 태그 (위 설명 참고, 효과와는 무관)
  hidden: boolean; // true면 특정 적을 처치해야 얻는 히든 카드
  description: string; // 카드 설명 텍스트
  effects: CardEffect[]; // 이 카드를 냈을 때 순서대로 실행되는 효과 목록 (여러 개 조합 가능)
}
