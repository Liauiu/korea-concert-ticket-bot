import { get_stored_value } from "../../module/storage.js";

(async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const concertId = urlParams.get("concertId");

  const config = await get_stored_value(concertId);
  if (!config) {
    alert("❌ 配置未找到！");
    return;
  }

  const firstPriority = config["first-section"] || [];
  const secondPriority = config["second-section"] || [];
  const slackUrl = config["slack-url"];
  const targetSections = [...firstPriority, ...secondPriority];

  const waitForSeatsToLoad = () =>
    new Promise((resolve) => {
      const check = () => {
        if (document.querySelectorAll(".seat_area > div").length > 0) resolve();
        else setTimeout(check, 500);
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
      break;
    }
  }

  if (slackUrl) {
    const text = locked
      ? `🎯 ${matchedPriority} 的【${matchedSection}】区有票已锁定！`
      : `😢 目前无票（${concertId}）`;
    fetch(slackUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  }
})();

