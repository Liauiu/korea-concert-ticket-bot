import { get_stored_value, store_value } from "../module/storage.js";

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    form.getElementsByTagName("button")[0].disabled = true;

    let data = {};
    const formData = new FormData(form);
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    data["section"] = data["section"].split(",");
    data["first-section"] = data["first-section"].split(",");
    data["second-section"] = data["second-section"].split(",");
    data["platform"] = form.getElementsByTagName("button")[0].id;

    let array = (await get_stored_value("autoBooking")) || [];
    store_value(data["concert-id"], data);
    array.push(data);
    store_value("autoBooking", array);

    window.history.back();
  });
});
