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

/** Tooltip for the (i) next to “Verse of the day” (500-verse pool + session; use the round refresh control below to pick again). */
const VOTD_POOL = {
  en:
    "A large pool of well-known verses. One is chosen at random for this visit and stays the same if you simply reload, until you use the round refresh control below the verse (circular arrows).",
  ru: "Большой набор известных стихов. Для визита выбирается один случайный; перезагрузка страницы оставит тот же, пока не нажмёте кнопку обновления (круг, стрелки) под стихом.",
  "zh-CN": "本页从大量名段中随机选一节；同一次访问中仅刷新仍显示同一节。点经文下方的圆形刷新换一节。",
  "zh-TW": "本頁從大量名段中隨機選一節；同一次造訪中僅重新整理仍顯示同一節。點經文下方圓形重新整理鈕可換。",
  pt: "Muitos versos conhecidos. Um é escolhido ao acaso para esta visita; recarregar mantém o mesmo até tocar o botão circular de atualizar abaixo do verso (setas).",
  ro: "O mare colecție de versete cunoscute. La fiecare vizită se alege unul; reîmprospătarea fără buton păstrează același, până apei butonul rotund de reîmprospătare de sub text.",
  cs: "Velký soubor známých veršů. Na každou návštěvu se vybere jeden náhodně; samotné obnovení stránky ponechá stejný verš, dokud nestisknete kulaté tlačítko s šipkami dole u verše.",
  de: "Eine große Sammlung bekannter Verse. Pro Besuch ein Zufallstreffer; er bleibt beim bloßen Neuladen, bis Sie die runde „Aktualisieren“-Taste (Pfeile) unter dem Vers betätigen.",
  es: "Un gran repertorio de versos conocidos. Cada visita, uno al azar; al recargar se mantiene el mismo hasta que pulse el control circular de actualizar (flechas) bajo el verso.",
  fr: "Un grand lot de versets célèbres. Chaque visite en tire un au hasard; recharger seul le conserve, jusqu’au bouton circulaire d’actualisation (flèches) sous le verset.",
  it: "Un ampio insieme di versetti noti. A ogni visita se ne sorteggia uno; l’aggiornamento semplice mantiene lo stesso fino al tasto tondo sotto il testo (frecce a ricaricare).",
  ja: "有名な一節のプールから選びます。同じ回では再読み込みだけでは同じ一節のまま。下の円形の再読み込み風のボタンで入れ替え。",
  ko: "잘 아는 절 풀에서 임의로 한 절이 골라집니다. 방문 중 새로고침만으론 그대로고, 절 아래 둥근 새로고침(화살표) 버튼을 눌러 바꿀 수 있어요.",
  nl: "Een grote verzameling bekende verzen. Eén per bezoek, willekeurig; herladen alleen houdt dezelfde, tot u de ronde vernieuwknop (pijlen) onder de verzen gebruikt.",
  pl: "Wielka pula znanych wersetów. Losowo jedna na wizytę; samo odświeżenie trzyma ten sam, aż użyjesz okrągłego przycisku odświeżania (strzałki) pod tekstem.",
  uk: "Велика добірка відомих віршів. На візит випадково одне; лише оновлення сторінки залишить той самий, поки натиснете круглу кнопку оновлення (стрілки) під віршем.",
  el: "Μεγάλο σύνολο γνωστών στίχων. Έναν ανά επίσκεψη, τυχαίο· η ανανέωση αφήνει τον ίδιο, μέχρι το στρογγλό κουμπί ανανέωσης (βέλη) κάτω από τον στίχο.",
  hu: "Sok ismert verssor. Látogatásonként egy véletlen; a sima frissítésig ugyanaz marad, amíg nem a vers alatti kör alakú frissítésgombot (nyilak) nyomod.",
  sv: "Ett stort antal välkända vers, ett per besök; enbart omladdning låter samma kvar tills du använder den runda uppdateringsknappen (pilar) under versen.",
};

/**
 * @param {{ id?: string, language?: string } | null | undefined} meta
 * @returns {string}
 */
export function getVotdPoolHintText(meta) {
  const g = inferGoogleLangForPrimaryBible(meta);
  if (VOTD_POOL[g]) return VOTD_POOL[g];
  if (g.startsWith("zh")) {
    if (g === "zh-TW" || g.includes("TW") || g.includes("Hant")) return VOTD_POOL["zh-TW"];
    return VOTD_POOL["zh-CN"];
  }
  return VOTD_POOL.en;
}
