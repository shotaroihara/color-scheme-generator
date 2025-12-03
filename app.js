// 要件定義
// apiから取得したカラースキームを表示し、ユーザーが選択した色をクリップボードにコピーできる機能を実装する

// 仕様
// 1. ユーザーがカラースキームを選択できるドロップダウンメニューを作成する
// 2. "Get color scheme"ボタンをクリックすると、選択したスキームに基づいてAPIからカラースキームを取得する
// 3. 取得したカラースキームを画面に表示する（色バーとカラーコード）
// 4. 各カラーコードまたは色バーをクリックすると、その色がクリップボードにコピーされる
// 5. エラーハンドリングを実装し、API呼び出しが失敗した場合にユーザーに通知する
// 6.ダーク・ライトモードをブラウザの設定から自動的に適用する

// 設計
// 1. HTMLでドロップダウンメニュー、ボタン、表示エリアを作成する
// 2. JavaScriptで以下の機能を実装する
//    - ドロップダウンの開閉と選択処理
//    - "Get color scheme"ボタンのクリックイベントでAPIを呼び出す
//    - APIから取得したカラースキームをDOMに反映する
//    - クリックイベントでカラーコードをクリップボードにコピーする
//   -  カラーコードをコピーしたときにトーストで通知する
// ローカルストレージにinputの値とドロップダウンの値をヘッダーのbtnで保存する
// 最初の読み込み時にローカルストレージに保存された値があればそれを使用し、なければデフォルト値を使用する

// grab DOM elements
const seedColorInput = document.getElementById("seed-color-input");
const schemeDropdown = document.getElementById("scheme-dropdown");
const schemeColorsList = document.getElementById("scheme-colors-list");
const form = document.getElementById("color-scheme-form");

const CONFIG = {
  DEFAULT_SEED_COLOR: "6366f1",
  DEFAULT_SCHEME: "triad",
  STORAGE_KEYS: {
    SEED_COLOR: "seedColor",
    SCHEME: "colorScheme",
  },
};

const state = {
  isCopying: false,
};

function saveSettingsToLocalStorage(seedColor, scheme) {
  localStorage.setItem(CONFIG.STORAGE_KEYS.SEED_COLOR, seedColor);
  localStorage.setItem(CONFIG.STORAGE_KEYS.SCHEME, scheme);
}

function getSettingsFromLocalStorage() {
  const seedColor =
    localStorage.getItem(CONFIG.STORAGE_KEYS.SEED_COLOR) ||
    CONFIG.DEFAULT_SEED_COLOR;
  const scheme =
    localStorage.getItem(CONFIG.STORAGE_KEYS.SCHEME) || CONFIG.DEFAULT_SCHEME;
  return { seedColor, scheme };
}

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    fetchColorScheme();
  });
}

// init fetch
if (schemeColorsList) {
  initApp();
}

/**
 * Fetch color scheme from API
 * @param {Object} options
 * @param {string} options.hex - hex code without '#'
 * @param {string} options.mode - scheme mode
 * @param {number} [options.count=5] - number of colors
 * @returns {Promise<string[]>} array of hex values
 */
function fetchScheme({ hex, mode, count = 5 }) {
  const url = `https://www.thecolorapi.com/scheme?mode=${mode}&count=${count}&hex=${hex}`;

  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => data.colors.map((color) => color.hex.value));
}

// Render colors into the list
function renderColors(colors) {
  if (!schemeColorsList) {
    console.error("schemeColorsList element not found");
    return;
  }

  schemeColorsList.innerHTML = "";
  colors.forEach((color) => {
    schemeColorsList.appendChild(createColorListItem(color));
  });
}

// Create a color list item element
function createColorListItem(color) {
  const listItem = document.createElement("li");
  listItem.className = "color-scheme__item";
  listItem.tabIndex = 0;
  listItem.setAttribute("role", "button");
  listItem.setAttribute("aria-label", `Copy color ${color}`);
  listItem.innerHTML = `
      <div class="color-scheme__swatch" style="background-color: ${color};"></div>
      <code class="color-scheme__code">${color}</code>
  `;
  listItem.addEventListener("click", () => {
    copyColorToClipboard(color);
    listItem.blur();
  });
  listItem.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      copyColorToClipboard(color);
      listItem.blur();
    }
  });
  return listItem;
}

// Copy color to clipboard with toast feedback
function copyColorToClipboard(color) {
  if (state.isCopying) return;

  state.isCopying = true;
  navigator.clipboard
    .writeText(color)
    .then(() => showToast(`${color} copied!`, color))
    .catch((err) => {
      console.error("Failed to copy color: ", err);
      state.isCopying = false;
    });
}

// Shared error handler for fetch failures
function handleFetchError(error) {
  if (
    error.name === "TypeError" ||
    (error.message && error.message.includes("Failed to fetch"))
  ) {
    console.warn("Request interrupted (likely due to page reload)");
    return;
  }
  console.error("Error fetching color data:", error);
  if (error.message && !error.message.includes("Failed to fetch")) {
    showToast("Failed to fetch color scheme. Please try again.", null);
  }
}

// Fetch based on current user selection
function fetchColorScheme() {
  const seedColor = seedColorInput.value.slice(1);
  const schemeMode = schemeDropdown.value;
  saveSettingsToLocalStorage(seedColor, schemeMode);
  fetchScheme({ hex: seedColor, mode: schemeMode })
    .then(renderColors)
    .catch(handleFetchError);
}

// Fetch initial scheme on load
function initApp() {
  const { seedColor, scheme } = getSettingsFromLocalStorage();
  const exist = Array.from(schemeDropdown.options).some(
    (o) => o.value === scheme
  );
  schemeDropdown.value = exist ? scheme : CONFIG.DEFAULT_SCHEME;
  seedColorInput.value = `#${seedColor}`;
  fetchScheme({ hex: seedColor, mode: scheme })
    .then(renderColors)
    .catch(handleFetchError);
}

function showToast(message, colorHex) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  // reset content
  while (toast.firstChild) toast.removeChild(toast.firstChild);

  // add small color swatch if provided
  if (colorHex) {
    const swatch = document.createElement("span");
    swatch.className = "swatch";
    swatch.style.backgroundColor = colorHex;
    toast.appendChild(swatch);
  }

  // text node so aria-live announces reliably
  toast.appendChild(document.createTextNode(message));

  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
    state.isCopying = false;
  }, 2500);
}
