import { get_stored_value, store_value } from "../module/storage.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    form.querySelector("button").disabled = true;

    const formData = new FormData(form);
    const data = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    data["first-section"] = data["first-section"].split(",").map(s => s.trim());
    data["second-section"] = data["second-section"]?.split(",").map(s => s.trim()) || [];
    data["platform"] = form.querySelector("button").id;

    const array = await get_stored_value("autoBooking") || [];
    store_value(data["concert-id"], data);
    array.push(data);
    store_value("autoBooking", array);
    window.history.back();
  });
});
