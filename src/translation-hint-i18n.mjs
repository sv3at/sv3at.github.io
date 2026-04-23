import { inferGoogleLangForPrimaryBible } from "./google-translate.mjs";

/**
 * Short tooltip/aria for the (i) next to the primary Bible / Translation field.
 * Keys follow inferGoogleLangForPrimaryBible (BCP-47 / Google).
 */
const HINT = {
  en:
    "The page language in the top right (Google Translate) follows this primary Bible. You can change the language in that menu.",
  ru: "Язык страницы (кнопка вверху справа, Google) привязан к этому основному переводу. Язык можно сменить в меню Google.",
  "zh-CN":
    "页面语言（右上角，Google 翻译）会随此处所选的主要译本对齐。您仍可在该菜单中更改显示语言。",
  "zh-TW":
    "頁面語言（右上方，Google 翻譯）會隨此處所選的主要譯本對齊。您仍可在該選單中變更顯示語言。",
  pt: "O idioma da página (canto superior direito, Google Tradutor) acompanha esta Bíblia principal. Você pode alterá-lo nesse menu.",
  ro: "Limba paginii (dreapta-sus, Google) urmează această Biblie principală. O puteți schimba din acel meniu.",
  cs: "Jazyk stránky (nahoře vpravo, Google) odpovídá tomuto primárnímu překladu. V tom menu lze stále jazyk změnit.",
  de: "Die Seitensprache (oben rechts, Google) folgt dieser primären Bibel. Im Menü können Sie die Sprache ändern.",
  es: "El idioma de la página (arriba a la derecha, Google) sigue esta Biblia principal. Aún puedes cambiarlo en el menú.",
  fr: "La langue de la page (en haut à droite, Google) suit cette Bible principale. Vous pouvez la modifier via ce menu.",
  it: "La lingua della pagina (in alto a destra, Google) segue questa prima Bibbia. È possibile modificarla dal relativo menu.",
  ja: "画面の言語（右上、Google 翻訳）は、ここで選ぶ主な聖書に合わせて変わります。メニューからも変更できます。",
  ko: "페이지 언어(오른쪽 위 Google)는 여기서 고른 기본 성경에 맞춥니다. Google 메뉴에서도 바꿀 수 있어요.",
  nl: "De paginataal (rechtsboven, Google) volgt deze primaire Bijbel. In dat menu kunt u hem wijzigen.",
  pl: "Język strony (górny prawy róg, Google) jest dobierany do tej głównej biblii. W menu Google można to zmienić.",
  uk: "Мова сторінки (праворуч вгорі, Google) зіставляється з цим основним перекладом. Її можна змінити в меню Google.",
  el: "Η γλώσσα της σελίδας (πάνω δεξιά, Google) ακολουθεί αυτήν την κύρια Βίβλο. Αλλαγή και από το μενού Google.",
  hu: "Az oldal nyelve (jobb felső sarok, Google) ehhez a fő Bibliához igazodik. A menüben továbbra is megváltoztatható.",
  sv: "Sidans språk (uppe till höger, Google) följer denna primära Bibel. Du kan ändra i menyn där.",
};

/**
 * @param {{ id?: string, language?: string } | null | undefined} meta
 * @returns {string}
 */
export function getPrimaryBibleUiHintText(meta) {
  const g = inferGoogleLangForPrimaryBible(meta);
  if (HINT[g]) return HINT[g];
  if (g.startsWith("zh")) {
    if (g === "zh-TW" || g.includes("TW") || g.includes("Hant")) return HINT["zh-TW"];
    return HINT["zh-CN"];
  }
  return HINT.en;
}
