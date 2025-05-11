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
  const sectionNames = firstPriority.map(s => s.trim());
  const slackWebhook = config["slack-webhook"] || ""; // 可选项，从 config 读取

  const waitForSeatsToLoad = () =>
    new Promise((resolve) => {
      const check = () => {
        const loaded = document.querySelectorAll(".seat_area > div").length > 0;
        if (loaded) {
          resolve();
        } else {
          setTimeout(check, 300);
        }
      };
      check();
    });

  await waitForSeatsToLoad();

  const rowPriority = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P"];

  let bestSeat = null;
  let matchedSection = null;
  let matchedRow = null;

  for (const section of sectionNames) {
    const sectionBlock = document.querySelector(`.seat_area > div[data-section-name='${section}']`);
    if (!sectionBlock) continue;

    const seats = Array.from(sectionBlock.querySelectorAll(".available"));
    if (seats.length === 0) continue;

    // 在当前区块中找“排数最前”的座位
    const seatWithRow = seats.map(seat => {
      const rowLabel = seat.closest("td")?.getAttribute("data-row")?.toUpperCase();
      return { seat, row: rowLabel || "Z" };
    });

    seatWithRow.sort((a, b) => {
      return rowPriority.indexOf(a.row) - rowPriority.indexOf(b.row);
    });

    const topSeat = seatWithRow[0];
    bestSeat = topSeat.seat;
    matchedRow = topSeat.row;
    matchedSection = section;
    break; // 找到就不再继续其他区
  }

  if (bestSeat) {
    bestSeat.click();

    // 尝试点击右下角的 "Seat Selection Completed"
    const completeButton = document.querySelector("#nextStepButton > a, .btn_right > a");
    if (completeButton) {
      setTimeout(() => completeButton.click(), 500);
    }

    // Slack 通知（可选）
    if (slackWebhook) {
      const message = {
        text: `🎫 成功锁票！\n📍区域：${matchedSection} 区\n🪑排数：${matchedRow} 排\n🚀 快去付款！`,
      };
      fetch(slackWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });
    }

  } else {
    console.log("😢 当前所有目标区域暂无可用座位");
  }
})();
