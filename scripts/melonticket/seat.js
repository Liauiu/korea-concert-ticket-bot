import { get_stored_value } from "../module/storage.js";

(async function () {
  // 获取当前演唱会 ID
  const urlParams = new URLSearchParams(window.location.search);
  const concertId = urlParams.get("concertId");

  // 读取配置
  const config = await get_stored_value(concertId);
  if (!config) {
    alert("❌ 没有找到演唱会配置，请重新设置！");
    return;
  }

  const firstPriority = config["first-section"] || [];
  const secondPriority = config["second-section"] || [];
  const targetSections = [...firstPriority, ...secondPriority];

  // 等待座位加载完毕
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

  // 尝试锁票
  let locked = false;
  for (const section of targetSections) {
    const selector = `.seat_area > div[data-section-name='${section}'] .available`;
    const seat = document.querySelector(selector);
    if (seat) {
      seat.click();
      locked = true;
      alert(`🎫 找到座位！区域：${section}，已尝试锁定`);
      break;
    }
  }

  if (!locked) {
    console.log("😢 没找到可用座位");
  }
})();
