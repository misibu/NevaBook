"use strict";

/** Neva-Book public static DEMO. Prices are illustrative, never use for orders. */
const demoPrices = Object.freeze({
  base: 1900,
  includedSpreads: 10,
  extraSpread: 90,
  fabricCover: 450
});
const rub = (amount) => new Intl.NumberFormat("ru-RU", {
  style: "currency", currency: "RUB", maximumFractionDigits: 0
}).format(amount);

// GitHub Pages-safe fragment navigation under /NevaBook/.
const validRoutes = new Set(["/", "/books", "/calculator", "/create"]);
function renderRoute() {
  const raw = decodeURIComponent(location.hash.slice(1) || "/");
  const route = validRoutes.has(raw) ? raw : "/";
  document.querySelectorAll(".page").forEach(page => {
    page.classList.toggle("active", page.dataset.page === route);
  });
  document.querySelectorAll("[data-route]").forEach(link => {
    const isActive = link.dataset.route === route;
    link.classList.toggle("active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  const names = {"/":"Главная","/books":"Фотокниги","/calculator":"Калькулятор","/create":"Конструктор"};
  document.title = names[route] + " | Neva-Book (демо)";
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", renderRoute);
renderRoute();

// Calculator calculations are centralized and have no network calls.
let selectedCover = "photo";
const spreadRange = document.getElementById("spreadRange");
const qtyRange = document.getElementById("qtyRange");
function updatePrice() {
  const spreads = Math.max(10, Math.min(40, Number(spreadRange.value)));
  const qty = Math.max(1, Math.min(25, Number(qtyRange.value)));
  const discount = qty >= 10 ? 10 : qty >= 3 ? 5 : 0;
  const extra = (spreads - demoPrices.includedSpreads) * demoPrices.extraSpread;
  const coverCharge = selectedCover === "fabric" ? demoPrices.fabricCover : 0;
  const unit = Math.round((demoPrices.base + extra + coverCharge) * (100-discount) / 100);
  const total = unit * qty;
  const change = {
    spreadValue: String(spreads),
    qtyValue: String(qty),
    sumCover: selectedCover === "photo" ? "Фотообложка" : "Тканевая",
    sumSpreads: String(spreads),
    sumExtra: rub(extra),
    sumCoverExtra: rub(coverCharge),
    sumQty: String(qty),
    sumDiscount: discount + "%",
    sumUnit: rub(unit),
    sumTotal: rub(total)
  };
  for (const [id, value] of Object.entries(change)) document.getElementById(id).textContent = value;
}
for (const input of [spreadRange, qtyRange]) input.addEventListener("input", updatePrice);
document.querySelectorAll("[data-cover]").forEach(btn => btn.addEventListener("click", () => {
  selectedCover = btn.dataset.cover;
  document.querySelectorAll("[data-cover]").forEach(other => {
    const active = other.dataset.cover === selectedCover;
    other.classList.toggle("selected", active);
    other.setAttribute("aria-pressed", String(active));
  });
  updatePrice();
}));
updatePrice();

// Local demo editor. Photos never leave this browser session.
const photoInput = document.getElementById("photoUpload");
const photoGrid = document.getElementById("photoGrid");
const slots = Array.from(document.querySelectorAll(".spreadSlot"));
const loaded = [];

function place(index, slotIndex) {
  const photo = loaded[index];
  const slot = slots[slotIndex];
  if (!photo || !slot) return;
  slot.replaceChildren();
  const img = document.createElement("img");
  img.src = photo.url;
  img.alt = photo.name;
  slot.appendChild(img);
  slot.dataset.photo = String(index);
}

function addToNext(index) {
  const firstEmpty = slots.findIndex(slot => !slot.hasAttribute("data-photo"));
  place(index, firstEmpty < 0 ? 0 : firstEmpty);
}

function renderPhotos() {
  photoGrid.replaceChildren();
  if (!loaded.length) {
    const empty = document.createElement("p");
    empty.className = "emptyGrid";
    empty.textContent = "Здесь появятся ваши фотографии.";
    photoGrid.appendChild(empty);
    return;
  }
  loaded.forEach((photo, index) => {
    const tile = document.createElement("button");
    tile.className = "photoThumb";
    tile.type = "button";
    tile.draggable = true;
    tile.title = "Добавить фото на разворот: " + photo.name;
    tile.addEventListener("click", () => addToNext(index));
    tile.addEventListener("dragstart", event => {
      if (event.dataTransfer) event.dataTransfer.setData("text/plain", String(index));
    });
    const image = document.createElement("img");
    image.src = photo.url;
    image.alt = "";
    const label = document.createElement("span");
    label.textContent = photo.name;
    tile.append(image, label);
    photoGrid.append(tile);
  });
}
photoInput.addEventListener("change", event => {
  const files = Array.from(event.target.files || []).filter(file => file.type.startsWith("image/"));
  for (const file of files) loaded.push({ name: file.name, url: URL.createObjectURL(file) });
  photoInput.value = "";
  renderPhotos();
});
slots.forEach((slot, slotIndex) => {
  slot.addEventListener("dragover", event => { event.preventDefault(); slot.classList.add("dragover"); });
  slot.addEventListener("dragleave", () => slot.classList.remove("dragover"));
  slot.addEventListener("drop", event => {
    event.preventDefault();
    slot.classList.remove("dragover");
    const index = Number(event.dataTransfer?.getData("text/plain") ?? -1);
    if (Number.isInteger(index) && index >= 0) place(index, slotIndex);
  });
  slot.addEventListener("click", () => {
    if (loaded.length) place(loaded.length - 1, slotIndex);
  });
});
document.getElementById("clearLayout").addEventListener("click", () => {
  for (const slot of slots) {
    slot.replaceChildren();
    slot.removeAttribute("data-photo");
    const label = document.createElement("span");
    label.textContent = "Добавьте фото";
    slot.append(label);
  }
});
window.addEventListener("beforeunload", () => {
  loaded.forEach(photo => URL.revokeObjectURL(photo.url));
});
