// 엔딩 스태프롤에 표시할 크레딧 내용. 화면에 어떻게 스크롤되는지는 VictoryScene이 담당하고,
// 여기서는 순수하게 "무엇을 보여줄지"만 정의한다(데이터/로직 분리). 섹션을 추가/수정하고
// 싶으면 이 배열만 고치면 되고 VictoryScene 쪽은 손댈 필요 없다.
export interface CreditsSection {
  title: string;
  names: string[];
}

export const CREDITS_TITLE = "DO NOT FLOAT";
export const CREDITS_SUBTITLE = "- 바다의 균형을 되찾았습니다 -";

export const CREDITS_SECTIONS: CreditsSection[] = [
  {
    title: "제작",
    names: ["jhbaek"],
  },
  {
    title: "프로그래밍",
    names: ["ClaudeAI"],
  },
  {
    title: "음악",
    names: ["SunoAI / jhbaek"],
  },
  {
    title: "그래픽",
    names: ["ChatGPT / jhbaek", "ClaudeAI / jhbaek"]
  },
  {
    title: "플레이해주셔서 감사합니다",
    names: [],
  },
];
