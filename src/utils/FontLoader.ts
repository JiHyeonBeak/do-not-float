import { FONT_NAME } from "../config/Constants";

const FONT_URL = "assets/fonts/neodgm.ttf";

// Phaser Text는 캔버스 2D로 그려지기 때문에, 실제로 텍스트를 만들기 전에
// 브라우저의 CSS Font Loading API로 폰트를 먼저 로드해 둬야 폰트가 적용된 채로 그려진다.
export async function loadGameFont(): Promise<void> {
  const font = new FontFace(FONT_NAME, `url(${FONT_URL})`);
  await font.load();
  document.fonts.add(font);
}
