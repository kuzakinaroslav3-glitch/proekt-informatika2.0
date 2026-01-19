const gpu1Select = document.getElementById("gpu1");
const gpu2Select = document.getElementById("gpu2");
const compareBtn = document.getElementById("compareBtn");

const gpu1Name = document.getElementById("gpu1Name");
const gpu2Name = document.getElementById("gpu2Name");
const resultBody = document.getElementById("resultBody");
const resultSection = document.getElementById("result");

let graphicsCards = [];

// Загружаем JSON
fetch("gpu_real_full.json")
    .then(res => res.json())
    .then(data => {
        graphicsCards = data;
        initSelectors();
    })
    .catch(err => console.error("Ошибка загрузки GPU:", err));

// Заполняем списки
function initSelectors() {
    graphicsCards.forEach(gpu => {
        const opt1 = document.createElement("option");
        opt1.value = gpu.id;
        opt1.textContent = `${gpu.vendor} ${gpu.model} (${gpu.brand})`;

        const opt2 = opt1.cloneNode(true);

        gpu1Select.appendChild(opt1);
        gpu2Select.appendChild(opt2);
    });
}

// Сравнение
compareBtn.addEventListener("click", () => {
    const gpu1 = graphicsCards.find(g => g.id == gpu1Select.value);
    const gpu2 = graphicsCards.find(g => g.id == gpu2Select.value);

    if (!gpu1 || !gpu2) return;

    gpu1Name.textContent = `${gpu1.vendor} ${gpu1.model}`;
    gpu2Name.textContent = `${gpu2.vendor} ${gpu2.model}`;

    resultBody.innerHTML = `
        <tr><td>VRAM</td><td>${gpu1.vram_gb} GB</td><td>${gpu2.vram_gb} GB</td></tr>
        <tr><td>Шина</td><td>${gpu1.bus_bit} bit</td><td>${gpu2.bus_bit} bit</td></tr>
        <tr><td>TDP</td><td>${gpu1.tdp_w} W</td><td>${gpu2.tdp_w} W</td></tr>
        <tr><td>Год</td><td>${gpu1.year}</td><td>${gpu2.year}</td></tr>
        <tr><td>Архитектура</td><td>${gpu1.architecture}</td><td>${gpu2.architecture}</td></tr>
        <tr><td>Апскейл</td><td>${gpu1.upscaling}</td><td>${gpu2.upscaling}</td></tr>
    `;

    resultSection.style.display = "block";
});
