const gpu1Select = document.getElementById("gpu1");
const gpu2Select = document.getElementById("gpu2");
const compareBtn = document.getElementById("compareBtn");

const gpu1Name = document.getElementById("gpu1Name");
const gpu2Name = document.getElementById("gpu2Name");
const resultBody = document.getElementById("resultBody");
const resultSection = document.getElementById("result");
const gpuCount = document.getElementById("gpuCount");

let graphicsCards = [];

function displayName(gpu) {
  if (gpu.name) return gpu.name;
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
  return gpu.tgp_w ?? gpu.tdp_w ?? gpu.tgp ?? gpu.tdp ?? null;
}

function getUpscaler(gpu) {
  return gpu.upscaler ?? gpu.upscaling ?? null;
}

function getRT(gpu) {
  return gpu.rt ?? gpu.ray_tracing ?? null;
}

function numericStatusPair(v1, v2, higherIsBetter = true) {
  if (typeof v1 !== "number" || typeof v2 !== "number") return ["equal", "equal"];
  if (v1 === v2) return ["equal", "equal"];

  if (higherIsBetter) {
    return v1 > v2 ? ["win", "lose"] : ["lose", "win"];
  }

  return v1 < v2 ? ["win", "lose"] : ["lose", "win"];
}

function formatCell(value, status = "", suffix = "") {
  if (value === null || value === undefined || value === "") return "—";
  if (!status) return `${value}${suffix}`;

  const arrow = status === "win" ? "↑" : status === "lose" ? "↓" : "";
  const arrowHtml = arrow ? `<span class="arrow">${arrow}</span>` : "";
  return `<span class="${status}">${value}${suffix}${arrowHtml}</span>`;
}

function formatBool(value, status = "") {
  if (value === null || value === undefined) return "—";
  const label = value ? "есть" : "нет";
  return status ? `<span class="${status}">${label}</span>` : label;
}

function sortCards(cards) {
  return [...cards].sort((a, b) => {
    const yearDiff = (b.year ?? 0) - (a.year ?? 0);
    if (yearDiff !== 0) return yearDiff;

    const vendorA = a.vendor ?? "";
    const vendorB = b.vendor ?? "";
    const vendorDiff = vendorA.localeCompare(vendorB, "ru");
    if (vendorDiff !== 0) return vendorDiff;

    return displayName(a).localeCompare(displayName(b), "ru");
  });
}

function initSelectors() {
  gpu1Select.querySelectorAll("option:not([value=''])").forEach((o) => o.remove());
  gpu2Select.querySelectorAll("option:not([value=''])").forEach((o) => o.remove());

  graphicsCards.forEach((gpu, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = displayName(gpu);

    gpu1Select.appendChild(option);
    gpu2Select.appendChild(option.cloneNode(true));
  });

  if (gpuCount) {
    gpuCount.textContent = String(graphicsCards.length);
  }
}

fetch("gpu_real_full.json")
  .then((res) => res.json())
  .then((data) => {
    const cards = Array.isArray(data) ? data : (data.cards ?? []);
    graphicsCards = sortCards(cards);
    initSelectors();
  })
  .catch((err) => {
    console.error("Ошибка загрузки GPU:", err);
  });

compareBtn.addEventListener("click", () => {
  const i1 = Number.parseInt(gpu1Select.value, 10);
  const i2 = Number.parseInt(gpu2Select.value, 10);

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

  const [vramS1, vramS2] = numericStatusPair(vram1, vram2, true);
  const [busS1, busS2] = numericStatusPair(bus1, bus2, true);
  const [pwrS1, pwrS2] = numericStatusPair(pwr1, pwr2, false);
  const [yearS1, yearS2] = numericStatusPair(gpu1.year ?? null, gpu2.year ?? null, true);
  const [rtS1, rtS2] = numericStatusPair(
    rt1 === null ? null : Number(Boolean(rt1)),
    rt2 === null ? null : Number(Boolean(rt2)),
    true
  );

  resultBody.innerHTML = `
    <tr><td>VRAM</td><td>${formatCell(vram1, vramS1, " GB")}</td><td>${formatCell(vram2, vramS2, " GB")}</td></tr>
    <tr><td>Шина памяти</td><td>${formatCell(bus1, busS1, " bit")}</td><td>${formatCell(bus2, busS2, " bit")}</td></tr>
    <tr><td>Энергопотребление</td><td>${formatCell(pwr1, pwrS1, " W")}</td><td>${formatCell(pwr2, pwrS2, " W")}</td></tr>
    <tr><td>Год</td><td>${formatCell(gpu1.year ?? null, yearS1)}</td><td>${formatCell(gpu2.year ?? null, yearS2)}</td></tr>
    <tr><td>Поколение</td><td>${formatCell(gpu1.generation ?? null)}</td><td>${formatCell(gpu2.generation ?? null)}</td></tr>
    <tr><td>Архитектура</td><td>${formatCell(gpu1.architecture ?? null)}</td><td>${formatCell(gpu2.architecture ?? null)}</td></tr>
    <tr><td>Ray Tracing</td><td>${formatBool(rt1, rtS1)}</td><td>${formatBool(rt2, rtS2)}</td></tr>
    <tr><td>Апскейлер</td><td>${formatCell(up1 ?? null)}</td><td>${formatCell(up2 ?? null)}</td></tr>
    <tr><td>PCIe</td><td>${formatCell(gpu1.pcie ?? null)}</td><td>${formatCell(gpu2.pcie ?? null)}</td></tr>
    <tr><td>Сегмент</td><td>${formatCell(gpu1.segment ?? null)}</td><td>${formatCell(gpu2.segment ?? null)}</td></tr>
    <tr><td>Производитель</td><td>${formatCell(gpu1.vendor ?? null)}</td><td>${formatCell(gpu2.vendor ?? null)}</td></tr>
  `;

  resultSection.hidden = false;
});
