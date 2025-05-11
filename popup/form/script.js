import { get_stored_value, store_value } from "../module/storage.js";

document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('form');

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    form.querySelector("button").disabled = true;

    let data = {};
    const formData = new FormData(form);
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    data["first-section"] = data["first-section"].split(",").map(s => s.trim());
    data["second-section"] = data["second-section"] ? data["second-section"].split(",").map(s => s.trim()) : [];
    data["preferred-rows"] = data["preferred-rows"] ? data["preferred-rows"].split(",").map(r => r.trim().toUpperCase()) : [];

    data["platform"] = form.querySelector("button").id;

    const array = await get_stored_value("autoBooking") || [];
    store_value(data["concert-id"], data);
    array.push(data);
    store_value("autoBooking", array);

    window.history.back();
  });
});
