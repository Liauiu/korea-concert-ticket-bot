import { get_stored_value, get_all_stored_values, delete_stored_value } from "../module/storage.js";

document.addEventListener("DOMContentLoaded", async function () {
  const container = document.querySelector(".list");

  const concerts = await get_all_stored_values("autoBooking") || [];

  concerts.forEach((concert, index) => {
    const card = document.createElement("div");
    card.className = "concert-card";

    const sections = [
      ...(concert["first-section"] || []),
      ...(concert["second-section"] || []),
    ];

    const sectionString = sections.length > 0 ? sections.join(", ") : "None";

    card.innerHTML = `
      <div class="concert-info">
        <h3>${concert["concert-name"]}</h3>
        <p>Concert ID: ${concert["concert-id"]}</p>
        <p>Date: ${concert["date"]}</p>
        <p>Time: ${concert["time"]}</p>
        <p>Sections: ${sectionString}</p>
      </div>
      <img src="../../assets/logo_melon.png" class="platform-logo" />
      <div class="delete" data-index="${index}">❌</div>
    `;

    container.appendChild(card);
  });

  container.addEventListener("click", function (e) {
    if (e.target.classList.contains("delete")) {
      const index = e.target.dataset.index;
      const targetId = concerts[index]["concert-id"];
      delete_stored_value(targetId);
      concerts.splice(index, 1);
      // 重新保存更新后的数据
      chrome.storage.local.set({ autoBooking: concerts }, () => {
        location.reload();
      });
    }
  });
});

