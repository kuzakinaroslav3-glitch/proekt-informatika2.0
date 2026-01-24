const gpu1Select = document.getElementById("gpu1");
const gpu2Select = document.getElementById("gpu2");
const compareBtn = document.getElementById("compareBtn");

const gpu1Name = document.getElementById("gpu1Name");
const gpu2Name = document.getElementById("gpu2Name");
const resultBody = document.getElementById("resultBody");
const resultSection = document.getElementById("result");

let graphicsCards = [];

// Утилиты для “нормализации” полей под наш формат
function displayName(gpu) {
  // основной формат: name
  if (gpu.name) return gpu.name;
  // запасной формат (если вдруг в JSON старые поля)
  const vendor = gpu.vendor ?? "";
  const model = gpu.model ?? "";
  const brand = gpu.brand ? ` (${gpu.brand})` : "";
  return `${vendor} ${model}${brand}`.trim();
}

function getVRAM(gpu) {
  return gpu.vram_gb ?? gpu.vramGb ?? gpu.vram ?? null;
}
function getBus(gpu) {
  return gpu.bus_bit ?? gpu.busBit ?? gpu.bus ?? null;
}
function getPower(gpu) {
  // наш формат: tgp_w, старый: tdp_w
  return gpu.tgp_w ?? gpu.tdp_w ?? gpu.tgp ?? gpu.tdp ?? null;
}
function getUpscaler(gpu) {
  // наш формат: upscaler, старый: upscaling
  return gpu.upscaler ?? gpu.upscaling ?? null;
}
function getRT(gpu) {
  return gpu.rt ?? gpu.ray_tracing ?? null;
}

// Загружаем JSON (поддерживаем и массив, и объект с полем cards)
fetch("gpu_real_full.json")
  .then(res => res.json())
  .then(data => {
    graphicsCards = Array.isArray(data) ? data : (data.cards ?? []);
    initSelectors();
  })
  .catch(err => console.error("Ошибка загрузки GPU:", err));

// Заполняем списки
function initSelectors() {
  // очищаем на всякий случай
  gpu1Select.querySelectorAll("option:not([value=''])").forEach(o => o.remove());
  gpu2Select.querySelectorAll("option:not([value=''])").forEach(o => o.remove());

  graphicsCards.forEach((gpu, index) => {
    const opt1 = document.createElement("option");
    opt1.value = String(index);
    opt1.textContent = displayName(gpu);

    const opt2 = opt1.cloneNode(true);

    gpu1Select.appendChild(opt1);
    gpu2Select.appendChild(opt2);
  });
}

// Сравнение
compareBtn.addEventListener("click", () => {
  const i1 = parseInt(gpu1Select.value, 10);
  const i2 = parseInt(gpu2Select.value, 10);
  const gpu1 = Number.isInteger(i1) ? graphicsCards[i1] : null;
  const gpu2 = Number.isInteger(i2) ? graphicsCards[i2] : null;

  if (!gpu1 || !gpu2) return;

  gpu1Name.textContent = displayName(gpu1);
  gpu2Name.textContent = displayName(gpu2);

  const vram1 = getVRAM(gpu1);
  const vram2 = getVRAM(gpu2);
  const bus1 = getBus(gpu1);
  const bus2 = getBus(gpu2);
  const pwr1 = getPower(gpu1);
  const pwr2 = getPower(gpu2);
  const up1 = getUpscaler(gpu1);
  const up2 = getUpscaler(gpu2);
  const rt1 = getRT(gpu1);
  const rt2 = getRT(gpu2);

  resultBody.innerHTML = `
    <tr><td>VRAM</td><td>${vram1 ?? "?"} GB</td><td>${vram2 ?? "?"} GB</td></tr>
    <tr><td>Шина</td><td>${bus1 ?? "?"} bit</td><td>${bus2 ?? "?"} bit</td></tr>
    <tr><td>Потребление</td><td>${pwr1 ?? "?"} W</td><td>${pwr2 ?? "?"} W</td></tr>
    <tr><td>Год</td><td>${gpu1.year ?? "?"}</td><td>${gpu2.year ?? "?"}</td></tr>
    <tr><td>Поколение</td><td>${gpu1.generation ?? "?"}</td><td>${gpu2.generation ?? "?"}</td></tr>
    <tr><td>Архитектура</td><td>${gpu1.architecture ?? "?"}</td><td>${gpu2.architecture ?? "?"}</td></tr>
    <tr><td>RT</td><td>${rt1 === null ? "?" : (rt1 ? "✅ есть" : "❌ нет")}</td><td>${rt2 === null ? "?" : (rt2 ? "✅ есть" : "❌ нет")}</td></tr>
    <tr><td>Апскейлер</td><td>${up1 ?? "?"}</td><td>${up2 ?? "?"}</td></tr>
    <tr><td>PCIe</td><td>${gpu1.pcie ?? "?"}</td><td>${gpu2.pcie ?? "?"}</td></tr>
    <tr><td>Сегмент</td><td>${gpu1.segment ?? "?"}</td><td>${gpu2.segment ?? "?"}</td></tr>
  `;

  resultSection.style.display = "block";
});
