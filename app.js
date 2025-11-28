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
getSchemeBtn.addEventListener("click", fetchColorScheme);

// function to fetch and display color scheme
function fetchColorScheme() {
  const seedColor = seedColorInput.value.slice(1); // Remove '#' from color value
  const schemeMode = schemeDropdown.value;

  fetch(
    `https://www.thecolorapi.com/scheme?&mode=${schemeMode}&count=5&hex=${seedColor}`
  )
    .then((response) => response.json())
    .then((data) => {
      const colors = data.colors.map((color) => color.hex.value);
      schemeColorsList.innerHTML = ""; // Clear previous colors
      colors.forEach((color) => {
        const listItem = document.createElement("li");
        listItem.className = "color-item";
        listItem.innerHTML = `
              <div class="color-bar" style="background-color: ${color};"></div>
              <p class="color-code">${color}</p>
          `;
        listItem.addEventListener("click", () => {
          navigator.clipboard
            .writeText(color)
            .then(() => {
              showToast(`Color ${color} copied to clipboard!`);
            })
            .catch((err) => {
              console.error("Failed to copy color: ", err);
            });
        });
        schemeColorsList.appendChild(listItem);
      });
    })
    .catch((error) => {
      console.error("Error fetching color data:", error);
      alert("Failed to fetch color scheme. Please try again.");
    });
}


// init fetch
const initColor = "000000";
const initScheme = "monochrome";

fetch(
  `https://www.thecolorapi.com/scheme?&mode=${initScheme}&count=5&hex=${initColor}`
)
  .then((response) => response.json())
  .then((data) => {
    const colors = data.colors.map((color) => color.hex.value);
    colors.forEach((color) => {
      const listItem = document.createElement("li");
      listItem.className = "color-item";
      listItem.innerHTML = `
            <div class="color-bar" style="background-color: ${color};"></div>
            <p class="color-code">${color}</p>
        `;
      listItem.addEventListener("click", () => {
        navigator.clipboard
          .writeText(color)
          .then(() => {
            showToast(`Color ${color} copied to clipboard!`);
          })
          .catch((err) => {
            console.error("Failed to copy color: ", err);
          });
      });
        schemeColorsList.appendChild(listItem);
    });
  })
  .catch((error) => {
    console.error("Error fetching color data:", error);
    alert("Failed to fetch color scheme. Please try again.");
  });

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}
