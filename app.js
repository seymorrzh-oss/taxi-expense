const STORAGE_KEY = "bingbing_transport_records_v2";

let records = loadRecords();

/* =========================================================
   基础数据
========================================================= */

function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (error) {
    console.error("读取记录失败：", error);
    return [];
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

/* =========================================================
   北京时间
========================================================= */

function getBeijingNow() {
  const str = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Shanghai"
  });

  return new Date(str);
}

function dateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

function timeString(date) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");

  return `${h}:${m}`;
}

function updateClock() {
  const now = getBeijingNow();

  document.getElementById("currentTime").textContent =
    `${dateString(now)} ${timeString(now)} 北京时间`;
}

updateClock();
setInterval(updateClock, 1000);

/* =========================================================
   页面 Tab
========================================================= */

document.querySelectorAll(".tab").forEach(button => {
  button.addEventListener("click", () => {

    document.querySelectorAll(".tab").forEach(tab => {
      tab.classList.remove("active");
    });

    document.querySelectorAll(".panel").forEach(panel => {
      panel.classList.remove("active");
    });

    button.classList.add("active");

    document
      .getElementById(button.dataset.tab)
      .classList.add("active");
  });
});

/* =========================================================
   默认日期
========================================================= */

function setDefaultDates() {
  const now = getBeijingNow();

  document.getElementById("backDate").value =
    dateString(now);

  document.getElementById("backTime").value =
    timeString(now);

  document.getElementById("photoDate").value =
    dateString(now);

  document.getElementById("photoTime").value =
    timeString(now);

  autoTripByTime(
    document.getElementById("photoTime").value,
    "photoTrip"
  );
}

setDefaultDates();

/* =========================================================
   根据时间判断上班 / 下班
========================================================= */

function autoTripByTime(time, selectId) {
  if (!time) return;

  const hour = Number(time.split(":")[0]);
  const select = document.getElementById(selectId);

  if (!select) return;

  if (hour < 13) {
    select.value = "上午上班";
  } else {
    select.value = "下午下班";
  }
}

document
  .getElementById("photoTime")
  .addEventListener("change", event => {
    autoTripByTime(event.target.value, "photoTrip");
  });

document
  .getElementById("backTime")
  .addEventListener("change", event => {
    autoTripByTime(event.target.value, "backTrip");
  });

/* =========================================================
   创建记录
========================================================= */

function createRecord({
  date,
  time,
  trip,
  platform,
  amount,
  source = "normal"
}) {
  return {
    id:
      Date.now().toString() +
      Math.random().toString(16).slice(2),

    date,
    time,
    trip,
    platform,
    amount: Number(amount),
    source,
    createdAt: new Date().toISOString()
  };
}

/* =========================================================
   快速记录
========================================================= */

function saveNormal() {
  const amount = Number(
    document.getElementById("amount").value
  );

  if (!amount || amount <= 0) {
    alert("请输入正确的金额");
    return;
  }

  const now = getBeijingNow();

  records.push(
    createRecord({
      date: dateString(now),
      time: timeString(now),
      trip: document.getElementById("tripType").value,
      platform: document.getElementById("platform").value,
      amount,
      source: "normal"
    })
  );

  persist();
  render();

  document.getElementById("amount").value = "";

  alert("记录成功 🚕");
}

/* =========================================================
   单条补记
========================================================= */

function saveBackfill(continueMode) {
  const date =
    document.getElementById("backDate").value;

  const time =
    document.getElementById("backTime").value;

  const amount = Number(
    document.getElementById("backAmount").value
  );

  if (!date || !time || !amount || amount <= 0) {
    alert("请把日期、时间和金额填写完整");
    return;
  }

  records.push(
    createRecord({
      date,
      time,
      trip:
        document.getElementById("backTrip").value,

      platform:
        document.getElementById("backPlatform").value,

      amount,
      source: "backfill"
    })
  );

  persist();
  render();

  document.getElementById("backAmount").value = "";

  if (!continueMode) {
    alert("补记成功 📝");
  } else {
    document.getElementById("backAmount").focus();
  }
}

/* =========================================================
   批量补记
========================================================= */

function addBatchRow() {
  const now = getBeijingNow();

  const row = document.createElement("div");
  row.className = "batch-row";

  row.innerHTML = `
    <div class="batch-grid">

      <input
        class="batch-date"
        type="date"
        value="${dateString(now)}"
      >

      <input
        class="batch-time"
        type="time"
        value="08:30"
      >

      <select class="batch-trip">
        <option value="上午上班">
          🌅 上午上班
        </option>

        <option value="下午下班">
          🌇 下午下班
        </option>

        <option value="其他">
          📍 其他
        </option>
      </select>

      <select class="batch-platform">
        <option value="滴滴">滴滴</option>
        <option value="花小猪">花小猪</option>
        <option value="高德">高德</option>
        <option value="百度">百度</option>
        <option value="公交车">公交车</option>
        <option value="其他">其他</option>
      </select>

    </div>

    <input
      class="batch-amount"
      type="number"
      step="0.01"
      inputmode="decimal"
      placeholder="金额 ¥"
    >

    <button
      class="remove-row"
      onclick="this.parentElement.remove()"
    >
      删除这一行
    </button>
  `;

  const timeInput =
    row.querySelector(".batch-time");

  const tripSelect =
    row.querySelector(".batch-trip");

  timeInput.addEventListener("change", () => {
    const hour =
      Number(timeInput.value.split(":")[0]);

    if (hour < 13) {
      tripSelect.value = "上午上班";
    } else {
      tripSelect.value = "下午下班";
    }
  });

  document
    .getElementById("batchRows")
    .appendChild(row);
}

addBatchRow();

function saveBatch() {
  const rows =
    document.querySelectorAll(".batch-row");

  let added = 0;

  rows.forEach(row => {
    const date =
      row.querySelector(".batch-date").value;

    const time =
      row.querySelector(".batch-time").value;

    const amount = Number(
      row.querySelector(".batch-amount").value
    );

    if (!date || !time || !amount || amount <= 0) {
      return;
    }

    records.push(
      createRecord({
        date,
        time,

        trip:
          row.querySelector(".batch-trip").value,

        platform:
          row.querySelector(".batch-platform").value,

        amount,
        source: "batch"
      })
    );

    added++;
  });

  if (!added) {
    alert("还没有可以保存的记录");
    return;
  }

  persist();
  render();

  document.getElementById("batchRows").innerHTML = "";

  addBatchRow();

  alert(`成功补记 ${added} 条记录 📋`);
}

/* =========================================================
   📷 截图补记
========================================================= */

let photoFiles = [];
let currentPhotoIndex = 0;

/*
   每张截图的临时填写状态。

   这样你切换上一张 / 下一张时，
   已经填写的内容不会马上消失。
*/
let photoDrafts = [];

/* =========================================================
   选择截图
========================================================= */

document
  .getElementById("photoInput")
  .addEventListener("change", event => {

    photoFiles = Array.from(event.target.files);

    if (!photoFiles.length) {
      return;
    }

    currentPhotoIndex = 0;

    photoDrafts = photoFiles.map(() => ({
      date: "",
      time: "",
      trip: "",
      platform: "",
      amount: ""
    }));

    document
      .getElementById("photoWorkspace")
      .classList.remove("hidden");

    showCurrentPhoto();
  });

/* =========================================================
   显示当前截图
========================================================= */

function showCurrentPhoto() {
  if (!photoFiles.length) {
    return;
  }

  const file =
    photoFiles[currentPhotoIndex];

  const preview =
    document.getElementById("photoPreview");

  /*
     清理上一张生成的临时 URL
  */
  if (
    preview.dataset.objectUrl
  ) {
    URL.revokeObjectURL(
      preview.dataset.objectUrl
    );
  }

  const objectUrl =
    URL.createObjectURL(file);

  preview.src = objectUrl;
  preview.dataset.objectUrl = objectUrl;

  /*
     更新计数器
  */
  document.getElementById("photoCounter").textContent =
    `第 ${currentPhotoIndex + 1} / ${photoFiles.length} 张`;

  /*
     清理 OCR 信息
  */
  document.getElementById(
    "photoOCRProgress"
  ).textContent = "";

  document.getElementById(
    "photoOCRRawText"
  ).textContent = "";

  document
    .getElementById("photoOCRDetails")
    .classList.add("hidden");

  document.getElementById(
    "photoSaveHint"
  ).textContent = "";

  /*
     如果之前填过这张图，
     恢复草稿。

     否则使用默认值。
  */
  const draft =
    photoDrafts[currentPhotoIndex];

  const now = getBeijingNow();

  document.getElementById("photoDate").value =
    draft.date || dateString(now);

  document.getElementById("photoTime").value =
    draft.time || timeString(now);

  document.getElementById("photoPlatform").value =
    draft.platform || getPreviousPlatform();

  document.getElementById("photoAmount").value =
    draft.amount || "";

  if (draft.trip) {
    document.getElementById("photoTrip").value =
      draft.trip;
  } else {
    autoTripByTime(
      document.getElementById("photoTime").value,
      "photoTrip"
    );
  }
}

/* =========================================================
   获取上一张的平台

   连续补记时比较方便：
   比如一批都是花小猪，就不用每次重新选。
========================================================= */

function getPreviousPlatform() {
  if (currentPhotoIndex > 0) {
    const previous =
      photoDrafts[currentPhotoIndex - 1];

    if (previous && previous.platform) {
      return previous.platform;
    }
  }

  return "滴滴";
}

/* =========================================================
   保存当前截图的表单草稿
========================================================= */

function saveCurrentPhotoDraft() {
  if (!photoFiles.length) {
    return;
  }

  photoDrafts[currentPhotoIndex] = {
    date:
      document.getElementById("photoDate").value,

    time:
      document.getElementById("photoTime").value,

    trip:
      document.getElementById("photoTrip").value,

    platform:
      document.getElementById("photoPlatform").value,

    amount:
      document.getElementById("photoAmount").value
  };
}

/* =========================================================
   上一张
========================================================= */

function previousPhoto() {
  if (!photoFiles.length) {
    return;
  }

  saveCurrentPhotoDraft();

  if (currentPhotoIndex <= 0) {
    alert("已经是第一张了");
    return;
  }

  currentPhotoIndex--;

  showCurrentPhoto();
}

/* =========================================================
   下一张
========================================================= */

function nextPhoto(saveDraft = true) {
  if (!photoFiles.length) {
    return;
  }

  if (saveDraft) {
    saveCurrentPhotoDraft();
  }

  if (
    currentPhotoIndex >=
    photoFiles.length - 1
  ) {
    alert("已经是最后一张了");
    return;
  }

  currentPhotoIndex++;

  showCurrentPhoto();
}

/* =========================================================
   清空图片
========================================================= */

function clearPhotos() {
  if (
    photoFiles.length &&
    !confirm("确定重新选择截图吗？当前未保存的填写内容会消失。")
  ) {
    return;
  }

  const preview =
    document.getElementById("photoPreview");

  if (preview.dataset.objectUrl) {
    URL.revokeObjectURL(
      preview.dataset.objectUrl
    );
  }

  photoFiles = [];
  photoDrafts = [];
  currentPhotoIndex = 0;

  document.getElementById("photoInput").value = "";

  document
    .getElementById("photoWorkspace")
    .classList.add("hidden");
}

/* =========================================================
   OCR 辅助识别

   注意：
   OCR 只是辅助。
   识别失败完全不影响手动补记。
========================================================= */

async function tryPhotoOCR() {
  if (!photoFiles.length) {
    alert("请先选择截图");
    return;
  }

  if (
    typeof Tesseract === "undefined"
  ) {
    alert(
      "OCR 组件没有成功加载。你仍然可以直接看截图手动填写。"
    );
    return;
  }

  const file =
    photoFiles[currentPhotoIndex];

  const button =
    document.getElementById("photoOCRButton");

  const progress =
    document.getElementById("photoOCRProgress");

  button.disabled = true;
  button.textContent = "正在读取...";

  progress.textContent =
    "正在准备识别，请稍候...";

  try {
    const result =
      await Tesseract.recognize(
        file,
        "chi_sim+eng",
        {
          logger: message => {
            if (
              message.status ===
              "recognizing text"
            ) {
              const percent =
                Math.round(
                  message.progress * 100
                );

              progress.textContent =
                `正在读取 ${percent}%`;
            }
          }
        }
      );

    const text =
      result.data.text || "";

    document.getElementById(
      "photoOCRRawText"
    ).textContent = text;

    document
      .getElementById("photoOCRDetails")
      .classList.remove("hidden");

    parsePhotoOCR(text);

    progress.textContent =
      "读取完成。请检查下面的信息 ✓";

  } catch (error) {
    console.error(
      "OCR识别失败：",
      error
    );

    progress.textContent =
      "自动读取失败，可以直接手动填写。";

  } finally {
    button.disabled = false;

    button.textContent =
      "✨ 再次尝试自动读取";
  }
}

/* =========================================================
   OCR 文本解析

   只是尽可能预填。
   不自动保存。
========================================================= */

function parsePhotoOCR(text) {
  const now = getBeijingNow();

  /*
     去掉 OCR 产生的大量空格，
     提高中文关键词匹配成功率。
  */
  const cleanText =
    text.replace(/\s+/g, "");

  /* -------------------------
     平台
  ------------------------- */

  let platform = "";

  if (
    /花小猪/.test(cleanText) ||
    /花.{0,2}小.{0,2}猪/.test(cleanText)
  ) {
    platform = "花小猪";
  }

  else if (
    /滴滴/.test(cleanText) ||
    /DiDi/i.test(cleanText)
  ) {
    platform = "滴滴";
  }

  else if (
    /高德/.test(cleanText) ||
    /Amap/i.test(cleanText)
  ) {
    platform = "高德";
  }

  else if (
    /百度/.test(cleanText)
  ) {
    platform = "百度";
  }

  else if (
    /公交|巴士/.test(cleanText)
  ) {
    platform = "公交车";
  }

  if (platform) {
    document.getElementById(
      "photoPlatform"
    ).value = platform;
  }

  /* -------------------------
     日期
  ------------------------- */

  let match = text.match(
    /(\d{4})[\s\-\/\.年]+(\d{1,2})[\s\-\/\.月]+(\d{1,2})/
  );

  if (match) {
    const year =
      match[1];

    const month =
      String(match[2]).padStart(2, "0");

    const day =
      String(match[3]).padStart(2, "0");

    document.getElementById(
      "photoDate"
    ).value =
      `${year}-${month}-${day}`;
  }

  /* -------------------------
     时间

     优先找 HH:MM:SS，
     找不到再找 HH:MM。
  ------------------------- */

  match = text.match(
    /(?:[01]?\d|2[0-3]):[0-5]\d(?::[0-5]\d)?/
  );

  if (match) {
    const time =
      match[0].substring(0, 5);

    document.getElementById(
      "photoTime"
    ).value = time;

    autoTripByTime(
      time,
      "photoTrip"
    );
  }

  /* -------------------------
     金额

     优先尝试找实际付款相关关键词。
     但仍然不保证准确，所以必须人工确认。
  ------------------------- */

  const amountPatterns = [
    /(?:实付|实际支付|支付金额|付款金额|扣款金额|交易金额)[^\d]{0,15}[¥￥\-]?\s*(\d+(?:\.\d{1,2})?)/i,

    /[-－−]?\s*[¥￥]\s*(\d+\.\d{1,2})/,

    /[¥￥]\s*(\d+\.\d{1,2})/
  ];

  for (
    const pattern of amountPatterns
  ) {
    const amountMatch =
      text.match(pattern);

    if (amountMatch) {
      document.getElementById(
        "photoAmount"
      ).value =
        amountMatch[1];

      break;
    }
  }

  /*
     保存当前自动填入的内容为草稿
  */
  saveCurrentPhotoDraft();
}

/* =========================================================
   保存截图对应的记录
========================================================= */

function savePhotoRecord() {
  if (!photoFiles.length) {
    alert("请先选择截图");
    return;
  }

  const date =
    document.getElementById(
      "photoDate"
    ).value;

  const time =
    document.getElementById(
      "photoTime"
    ).value;

  const trip =
    document.getElementById(
      "photoTrip"
    ).value;

  const platform =
    document.getElementById(
      "photoPlatform"
    ).value;

  const amount = Number(
    document.getElementById(
      "photoAmount"
    ).value
  );

  if (!date) {
    alert("请选择日期");
    return;
  }

  if (!time) {
    alert("请选择时间");
    return;
  }

  if (!amount || amount <= 0) {
    alert("请输入实际支付金额");
    return;
  }

  /*
     防止同一张图片误点两次保存。

     判断同日期 + 时间 + 金额 + 平台。
  */
  const duplicate =
    records.some(record =>
      record.date === date &&
      record.time === time &&
      Number(record.amount) === amount &&
      record.platform === platform
    );

  if (duplicate) {
    const continueSave =
      confirm(
        "发现一条日期、时间、平台和金额完全相同的记录。\n\n仍然要保存吗？"
      );

    if (!continueSave) {
      return;
    }
  }

  records.push(
    createRecord({
      date,
      time,
      trip,
      platform,
      amount,
      source: "photo"
    })
  );

  persist();
  render();

  /*
     保存当前草稿。
     这样上一张的交通平台可以继续沿用。
  */
  saveCurrentPhotoDraft();

  const hint =
    document.getElementById(
      "photoSaveHint"
    );

  /*
     如果还有下一张：
     自动进入下一张。
  */
  if (
    currentPhotoIndex <
    photoFiles.length - 1
  ) {
    const savedNumber =
      currentPhotoIndex + 1;

    currentPhotoIndex++;

    showCurrentPhoto();

    hint.textContent =
      `✓ 第 ${savedNumber} 张已保存，已进入下一张`;

    /*
       金额一定清空，
       防止把上一张金额误存到下一张。
    */
    document.getElementById(
      "photoAmount"
    ).value = "";

    /*
       下一张默认沿用上一张平台。
    */
    document.getElementById(
      "photoPlatform"
    ).value = platform;

    /*
       日期也沿用上一张，
       批量处理同一天截图更方便。
    */
    document.getElementById(
      "photoDate"
    ).value = date;

  } else {
    hint.textContent =
      "🎉 这已经是最后一张，保存完成！";

    alert(
      "最后一张截图已经保存完成 🎉"
    );
  }
}

/* =========================================================
   删除单条
========================================================= */

function deleteRecord(id) {
  if (
    !confirm(
      "确定删除这条记录吗？"
    )
  ) {
    return;
  }

  records =
    records.filter(
      record => record.id !== id
    );

  persist();
  render();
}

/* =========================================================
   清空全部
========================================================= */

function deleteAll() {
  if (!records.length) {
    return;
  }

  if (
    !confirm(
      `确定删除全部 ${records.length} 条记录吗？\n\n此操作无法恢复。`
    )
  ) {
    return;
  }

  records = [];

  persist();
  render();
}

/* =========================================================
   日期解析
========================================================= */

function parseLocalDate(value) {
  const [year, month, day] =
    value.split("-").map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
}

/* =========================================================
   获取周一
========================================================= */

function getMonday(date) {
  const d =
    new Date(date);

  const day =
    d.getDay();

  const difference =
    d.getDate() -
    day +
    (day === 0 ? -6 : 1);

  d.setDate(difference);

  d.setHours(
    0,
    0,
    0,
    0
  );

  return d;
}

/* =========================================================
   本周 / 本月统计
========================================================= */

function calculateStats() {
  const now =
    getBeijingNow();

  const monday =
    getMonday(now);

  const nextMonday =
    new Date(monday);

  nextMonday.setDate(
    nextMonday.getDate() + 7
  );

  let weekTotal = 0;
  let monthTotal = 0;

  records.forEach(record => {
    const date =
      parseLocalDate(record.date);

    /*
       本周
    */
    if (
      date >= monday &&
      date < nextMonday
    ) {
      weekTotal +=
        Number(record.amount);
    }

    /*
       本月
    */
    if (
      date.getFullYear() ===
        now.getFullYear() &&
      date.getMonth() ===
        now.getMonth()
    ) {
      monthTotal +=
        Number(record.amount);
    }
  });

  document.getElementById(
    "weekTotal"
  ).textContent =
    `¥${weekTotal.toFixed(2)}`;

  document.getElementById(
    "monthTotal"
  ).textContent =
    `¥${monthTotal.toFixed(2)}`;
}

/* =========================================================
   来源标签
========================================================= */

function sourceTag(source) {
  if (
    source === "backfill" ||
    source === "batch"
  ) {
    return `
      <span class="tag">
        补
      </span>
    `;
  }

  if (
    source === "photo"
  ) {
    return `
      <span class="tag">
        截图
      </span>
    `;
  }

  /*
     兼容上一版本已经保存的 OCR 数据
  */
  if (
    source === "ocr"
  ) {
    return `
      <span class="tag">
        截图
      </span>
    `;
  }

  return "";
}

/* =========================================================
   历史记录
========================================================= */

function render() {
  const container =
    document.getElementById(
      "records"
    );

  calculateStats();

  if (!records.length) {
    container.innerHTML = `
      <div class="empty">
        还没有交通记录 🚕
      </div>
    `;

    return;
  }

  /*
     按真正的出行日期 + 时间倒序排列，
     而不是按照什么时候补录。
  */
  const sorted =
    [...records].sort(
      (a, b) => {

        const aTime =
          new Date(
            `${a.date}T${a.time}`
          ).getTime();

        const bTime =
          new Date(
            `${b.date}T${b.time}`
          ).getTime();

        return bTime - aTime;
      }
    );

  container.innerHTML =
    sorted.map(record => `

      <div class="record">

        <div class="record-top">

          <div>

            <div class="record-date">

              ${record.date}
              ${record.time}

              ${sourceTag(
                record.source
              )}

            </div>

            <div class="record-info">

              ${record.trip}
              ·
              ${record.platform}

            </div>

          </div>


          <div class="record-money">

            ¥${Number(
              record.amount
            ).toFixed(2)}

          </div>

        </div>


        <button
          class="delete-button"
          onclick="deleteRecord('${record.id}')"
        >
          删除
        </button>

      </div>

    `).join("");
}

/* =========================================================
   第一次渲染
========================================================= */

render();