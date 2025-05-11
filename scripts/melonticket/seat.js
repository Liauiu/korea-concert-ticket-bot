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
  const preferredRows = config["preferred-rows"] || [];
  const SLACK_WEBHOOK_URL = "你的_slack_webhook_url"; // 替换为 GitHub Secret 或占位符

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

  const sections = [...firstPriority, ...secondPriority];

  for (const section of sections) {
    const block = document.querySelector(`.seat_area > div[data-section-name='${section}']`);
    if (!block) continue;

    const availableSeats = block.querySelectorAll(".available");

    for (const seat of availableSeats) {
      const rowInfo = seat.getAttribute("data-seat-row")?.toUpperCase() || "";
      if (preferredRows.length === 0 || preferredRows.includes(rowInfo)) {
        seat.click();
        matchedSection = section;
        matchedRow = rowInfo || "N/A";
        locked = true;
        break;
      }
    }
    if (locked) break;
  }

  if (locked) {
    document.querySelector("#nextBtn")?.click(); // 自动跳转下一步
    if (SLACK_WEBHOOK_URL && SLACK_WEBHOOK_URL.startsWith("https")) {
      fetch(SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `🎉 检测到有票！\n区域：${matchedSection}，排数：${matchedRow}。\n⚡ 正在自动锁票并跳转付款！`,
        }),
      });
    }
  } else {
    console.log("😢 没有找到符合条件的票");
  }
})();
