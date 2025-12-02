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

// grab DOM elements
const seedColorInput = document.getElementById("seed-color-input");
const schemeDropdown = document.getElementById("scheme-dropdown");
const getSchemeBtn = document.getElementById("get-scheme-btn");
const schemeColorsList = document.getElementById("scheme-colors-list");

// add event listener to button
if (getSchemeBtn) {
  getSchemeBtn.addEventListener("click", fetchColorScheme);
}

// init fetch
if (schemeColorsList) {
  initColorScheme();
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
  listItem.className = "color-item";
  listItem.innerHTML = `
      <div class="color-bar" style="background-color: ${color};"></div>
      <p class="color-code">${color}</p>
  `;
  listItem.addEventListener("click", () => copyColorToClipboard(color));
  return listItem;
}

// Copy color to clipboard with toast feedback
function copyColorToClipboard(color) {
  navigator.clipboard
    .writeText(color)
    .then(() => showToast(`Color ${color} copied to clipboard!`))
    .catch((err) => {
      console.error("Failed to copy color: ", err);
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
    alert("Failed to fetch color scheme. Please try again.");
  }
}

// Fetch based on current user selection
function fetchColorScheme() {
  const seedColor = seedColorInput.value.slice(1);
  const schemeMode = schemeDropdown.value;

  fetchScheme({ hex: seedColor, mode: schemeMode })
    .then(renderColors)
    .catch(handleFetchError);
}

// Fetch initial scheme on load
function initColorScheme() {
  const DEFAULT_SEED_COLOR = "6366f1"; // indigo-500
  const DEFAULT_SCHEME = "triad";
  seedColorInput.value = `#${DEFAULT_SEED_COLOR}`;  

  fetchScheme({ hex: DEFAULT_SEED_COLOR, mode: DEFAULT_SCHEME })
    .then(renderColors)
    .catch(handleFetchError);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  toast.ariaHidden = "false";
  setTimeout(() => {
    toast.classList.remove("show");
    toast.ariaHidden = "true";
  }, 2500);
}
