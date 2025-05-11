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
  const targetSections = [...firstPriority, ...secondPriority];

  const SLACK_WEBHOOK_URL = config["slack-webhook-url"] || "";

  const waitForSeatsToLoad = () =>
    new Promise((resolve) => {
      const check = () => {
        const loaded = document.querySelectorAll(".seat_area > div").length > 0;
        if (loaded) {
          resolve();
        } else {
          setTimeout(check, 500);
        }
      };
      check();
    });

  await waitForSeatsToLoad();

  let locked = false;
  let matchedSection = null;
  let matchedPriority = null;

  for (const section of targetSections) {
    const selector = `.seat_area > div[data-section-name='${section}'] .available`;
    const seat = document.querySelector(selector);
    if (seat) {
      seat.click();
      locked = true;
      matchedSection = section;
      matchedPriority = firstPriority.includes(section) ? "第一优先" : "第二优先";

      // ✅ 自动点击 “Seat Selection Completed” 按钮
      const confirmButton = document.querySelector(".btn_onestop .button");
      if (confirmButton) {
        confirmButton.click();
      }

      break;
    }
  }

  if (locked && SLACK_WEBHOOK_URL) {
    const message = {
      text: `🎫 [${matchedPriority}] 你关注的【${matchedSection}区】现在有票！我已自动锁票 ✅`,
    };
    fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
  } else {
    console.log("😢 没有找到座位");

    // 🔔 如果没票，但希望发一次通知（可选）
    const notifyOnNoTicket = false;
    if (notifyOnNoTicket && SLACK_WEBHOOK_URL) {
      const message = {
        text: `🕵️‍♀️ 本轮查询没有找到票：${targetSections.join(", ")}`,
      };
      fetch(SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });
    }
  }
})();
