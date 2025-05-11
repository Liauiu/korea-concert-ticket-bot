// ✅ 完整版 seat.js：基于 .available class 判断是否有票
// ✅ 包含优先区 + Slack 通知 + 自定义排数 + 自定义优先级逻辑

import { get_stored_value } from "../module/storage.js";

(async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const concertId = urlParams.get("concertId");
  const config = await get_stored_value(concertId);

  if (!config) {
    alert("❌ 没有找到演唱会配置，请重新设置！");
    return;
  }

  const firstPriority = config["first-section"] || [];
  const secondPriority = config["second-section"] || [];
  const targetRows = config["rows"] || []; // ✅ 新增排数优先
  const SLACK_WEBHOOK_URL = config["webhook"] || "";
  const targetSections = [...firstPriority, ...secondPriority];

  const waitForSeatsToLoad = () =>
    new Promise((resolve) => {
      const check = () => {
        const loaded = document.querySelectorAll(".seat_area > div").length > 0;
        if (loaded) resolve();
        else setTimeout(check, 500);
      };
      check();
    });

  await waitForSeatsToLoad();

  let locked = false;
  let matchedSection = null;
  let matchedRow = null;
  let matchedPriority = null;

  for (const section of targetSections) {
    const seatElements = document.querySelectorAll(
      `.seat_area > div[data-section-name='${section}'] .available`
    );
    for (const seat of seatElements) {
      const label = seat.getAttribute("aria-label") || seat.textContent || "";
      const matched = targetRows.find((row) => label.includes(row));
      if (matched) {
        seat.click();
        matchedSection = section;
        matchedRow = matched;
        matchedPriority = firstPriority.includes(section) ? "第一优先" : "第二优先";
        locked = true;
        break;
      }
    }
    if (locked) break;
  }

  if (locked && SLACK_WEBHOOK_URL) {
    const message = {
      text: `🎫 [${matchedPriority}] ${matchedSection}区 ${matchedRow}排有票！已自动锁票，请尽快支付💳`
    };
    fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message)
    });
  } else {
    console.log("😢 没有找到符合要求的座位");
  }
})();
