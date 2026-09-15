const STORAGE_KEY = "bingbing_transport_records_v2";

let records = loadRecords();

function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

/* -------------------------
   北京时间
------------------------- */

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
  return `${String(date.getHours()).padStart(2,"0")}:${String(
    date.getMinutes()
  ).padStart(2,"0")}`;
}

function updateClock() {
  const now = getBeijingNow();

  document.getElementById("currentTime").textContent =
    `${dateString(now)} ${timeString(now)} 北京时间`;
}

setInterval(updateClock, 1000);
updateClock();

/* -------------------------
   Tab
------------------------- */

document.querySelectorAll(".tab").forEach(button => {
  button.addEventListener("click", () => {

    document.querySelectorAll(".tab").forEach(x =>
      x.classList.remove("active")
    );

    document.querySelectorAll(".panel").forEach(x =>
      x.classList.remove("active")
    );

    button.classList.add("active");

    document
      .getElementById(button.dataset.tab)
      .classList.add("active");
  });
});

/* -------------------------
   默认补记日期
------------------------- */

function setDefaultDates() {
  const now = getBeijingNow();

  document.getElementById("backDate").value = dateString(now);
  document.getElementById("backTime").value = timeString(now);
}

setDefaultDates();

/* -------------------------
   新记录
------------------------- */

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

/* -------------------------
   正常记录
------------------------- */

function saveNormal() {

  const amount = Number(
    document.getElementById("amount").value
  );

  if (!amount || amount <= 0) {
    alert("请输入正确的金额");
    return;
  }

  const now = getBeijingNow();

  const record = createRecord({
    date: dateString(now),
    time: timeString(now),
    trip: document.getElementById("tripType").value,
    platform: document.getElementById("platform").value,
    amount,
    source: "normal"
  });

  records.push(record);

  persist();
  render();

  document.getElementById("amount").value = "";

  alert("记录成功 🚕");
}

/* -------------------------
   单条补记
------------------------- */

function saveBackfill(continueMode) {

  const date = document.getElementById("backDate").value;
  const time = document.getElementById("backTime").value;
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
      trip: document.getElementById("backTrip").value,
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
  }
}

/* -------------------------
   批量补记
------------------------- */

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
        <option value="上午上班">🌅 上午上班</option>
        <option value="下午下班">🌇 下午下班</option>
        <option value="其他">📍 其他</option>
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
      placeholder="金额 ¥"
    >

    <button
      class="remove-row"
      onclick="this.parentElement.remove()"
    >
      删除这一行
    </button>
  `;

  document.getElementById("batchRows").appendChild(row);
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

    const amount =
      Number(row.querySelector(".batch-amount").value);

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

/* -------------------------
   图片预览
------------------------- */

document
  .getElementById("imageInput")
  .addEventListener("change", event => {

    const file = event.target.files[0];

    if (!file) return;

    const image =
      document.getElementById("previewImage");

    image.src = URL.createObjectURL(file);
    image.classList.remove("hidden");

    document
      .getElementById("ocrResult")
      .classList.add("hidden");
  });

/* -------------------------
   OCR
------------------------- */

async function recognizeImage() {

  const input =
    document.getElementById("imageInput");

  if (!input.files.length) {
    alert("请先选择一张支付截图");
    return;
  }

  const progress =
    document.getElementById("ocrProgress");

  const button =
    document.getElementById("ocrButton");

  button.disabled = true;
  button.textContent = "正在识别...";

  try {

    const result =
      await Tesseract.recognize(
        input.files[0],
        "chi_sim+eng",
        {
          logger: m => {
            if (m.status === "recognizing text") {
              progress.textContent =
                `正在识别 ${Math.round(m.progress * 100)}%`;
            } else {
              progress.textContent = m.status || "";
            }
          }
        }
      );

    const text = result.data.text || "";

    document.getElementById("ocrRawText").textContent =
      text;

    parseOCR(text);

    document
      .getElementById("ocrResult")
      .classList.remove("hidden");

    progress.textContent =
      "识别完成，请检查结果 ✓";

  } catch (error) {

    console.error(error);

    progress.textContent =
      "识别失败，请重新尝试。";

    alert(
      "OCR 识别失败。请确认网络正常，然后重新上传截图。"
    );

  } finally {

    button.disabled = false;
    button.textContent = "重新识别";
  }
}

/* -------------------------
   OCR文字解析
------------------------- */

function parseOCR(text) {

  const now = getBeijingNow();

  let detectedDate = dateString(now);
  let detectedTime = timeString(now);
  let detectedPlatform = "其他";
  let detectedAmount = "";

  /* 平台 */

  if (/滴滴|DiDi/i.test(text)) {
    detectedPlatform = "滴滴";
  }

  else if (/花小猪/i.test(text)) {
    detectedPlatform = "花小猪";
  }

  else if (/高德|Amap/i.test(text)) {
    detectedPlatform = "高德";
  }

  else if (/百度/i.test(text)) {
    detectedPlatform = "百度";
  }

  else if (/公交|巴士/i.test(text)) {
    detectedPlatform = "公交车";
  }

  /* 日期 */

  const datePatterns = [
    /(\d{4})[\/\-.年](\d{1,2})[\/\-.月](\d{1,2})/,
    /(\d{1,2})[\/\-.月](\d{1,2})/
  ];

  let match = text.match(datePatterns[0]);

  if (match) {

    detectedDate =
      `${match[1]}-${String(match[2]).padStart(2,"0")}-${String(match[3]).padStart(2,"0")}`;

  } else {

    match = text.match(datePatterns[1]);

    if (match) {
      detectedDate =
        `${now.getFullYear()}-${String(match[1]).padStart(2,"0")}-${String(match[2]).padStart(2,"0")}`;
    }
  }

  /* 时间 */

  match = text.match(
    /(?:[01]?\d|2[0-3]):[0-5]\d/
  );

  if (match) {
    detectedTime = match[0];
  }

  /* 金额 */

  const amountPatterns = [

    /(?:支付金额|实付|付款金额|订单金额|合计)[^\d¥￥]{0,10}[¥￥]?\s*(\d+(?:\.\d{1,2})?)/i,

    /[¥￥]\s*(\d+(?:\.\d{1,2})?)/,

    /(\d+\.\d{2})\s*元/
  ];

  for (const pattern of amountPatterns) {

    const amountMatch = text.match(pattern);

    if (amountMatch) {
      detectedAmount = amountMatch[1];
      break;
    }
  }

  document.getElementById("ocrDate").value =
    detectedDate;

  document.getElementById("ocrTime").value =
    detectedTime;

  document.getElementById("ocrPlatform").value =
    detectedPlatform;

  document.getElementById("ocrAmount").value =
    detectedAmount;

  /* 自动判断上班/下班 */

  const hour =
    Number(detectedTime.split(":")[0]);

  if (hour < 13) {
    document.getElementById("ocrTrip").value =
      "上午上班";
  }

  else {
    document.getElementById("ocrTrip").value =
      "下午下班";
  }
}

/* -------------------------
   保存OCR
------------------------- */

function saveOCR() {

  const date =
    document.getElementById("ocrDate").value;

  const time =
    document.getElementById("ocrTime").value;

  const amount =
    Number(document.getElementById("ocrAmount").value);

  if (!date || !time || !amount || amount <= 0) {

    alert("请检查日期、时间和金额");

    return;
  }

  records.push(
    createRecord({
      date,
      time,
      trip:
        document.getElementById("ocrTrip").value,
      platform:
        document.getElementById("ocrPlatform").value,
      amount,
      source: "ocr"
    })
  );

  persist();
  render();

  alert("截图记录保存成功 📷");
}

/* -------------------------
   删除
------------------------- */

function deleteRecord(id) {

  if (!confirm("确定删除这条记录吗？")) {
    return;
  }

  records =
    records.filter(record => record.id !== id);

  persist();
  render();
}

function deleteAll() {

  if (!records.length) return;

  if (
    !confirm(
      `确定删除全部 ${records.length} 条记录吗？此操作无法恢复。`
    )
  ) {
    return;
  }

  records = [];

  persist();
  render();
}

/* -------------------------
   周/月统计
------------------------- */

function parseLocalDate(dateStringValue) {

  const [year, month, day] =
    dateStringValue.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function getMonday(date) {

  const d = new Date(date);

  const day = d.getDay();

  const difference =
    d.getDate() - day + (day === 0 ? -6 : 1);

  d.setDate(difference);
  d.setHours(0,0,0,0);

  return d;
}

function calculateStats() {

  const now = getBeijingNow();

  const monday = getMonday(now);

  const nextMonday = new Date(monday);
  nextMonday.setDate(nextMonday.getDate() + 7);

  let weekTotal = 0;
  let monthTotal = 0;

  records.forEach(record => {

    const date = parseLocalDate(record.date);

    if (
      date >= monday &&
      date < nextMonday
    ) {
      weekTotal += Number(record.amount);
    }

    if (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    ) {
      monthTotal += Number(record.amount);
    }
  });

  document.getElementById("weekTotal").textContent =
    `¥${weekTotal.toFixed(2)}`;

  document.getElementById("monthTotal").textContent =
    `¥${monthTotal.toFixed(2)}`;
}

/* -------------------------
   历史记录
------------------------- */

function sourceTag(source) {

  if (source === "backfill" || source === "batch") {
    return `<span class="tag">补</span>`;
  }

  if (source === "ocr") {
    return `<span class="tag">截图</span>`;
  }

  return "";
}

function render() {

  const container =
    document.getElementById("records");

  calculateStats();

  if (!records.length) {

    container.innerHTML =
      `<div class="empty">还没有交通记录 🚕</div>`;

    return;
  }

  const sorted =
    [...records].sort((a,b) => {

      const aTime =
        new Date(`${a.date}T${a.time}`).getTime();

      const bTime =
        new Date(`${b.date}T${b.time}`).getTime();

      return bTime - aTime;
    });

  container.innerHTML =
    sorted.map(record => `

      <div class="record">

        <div class="record-top">

          <div>
            <div class="record-date">
              ${record.date} ${record.time}
              ${sourceTag(record.source)}
            </div>

            <div class="record-info">
              ${record.trip} · ${record.platform}
            </div>
          </div>

          <div class="record-money">
            ¥${Number(record.amount).toFixed(2)}
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

render();