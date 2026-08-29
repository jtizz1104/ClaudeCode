const pipelineSelect = document.getElementById("pipeline-select");
const dateSelect = document.getElementById("date-select");
const cardsEl = document.getElementById("cards");
const emptyStateEl = document.getElementById("empty-state");
const headlineCardEl = document.getElementById("headline-card");
const headlineTextEl = document.getElementById("headline-text");
const headlineSubEl = document.getElementById("headline-sub");

const STATUS_LABELS = {
  pending: "Pendiente",
  approved: "Aprobado",
  posted: "Publicado",
};

async function loadPipelines() {
  const res = await fetch("/api/pipelines");
  const data = await res.json();
  return data;
}

function populateDates(dates) {
  dateSelect.innerHTML = "";
  if (dates.length === 0) {
    const opt = document.createElement("option");
    opt.textContent = "Sin datos";
    opt.disabled = true;
    dateSelect.appendChild(opt);
    return false;
  }
  for (const d of dates) {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    dateSelect.appendChild(opt);
  }
  return true;
}

function renderCards(items) {
  cardsEl.innerHTML = "";
  items.forEach((item, i) => {
    const card = document.createElement("article");
    card.className = "card";
    card.style.animationDelay = `${i * 60}ms`;

    const videoBlock = item.video_url
      ? `<video src="${item.video_url}" controls preload="metadata"></video>`
      : `<div class="no-video">Todavía no se renderizó el video.<br>Corré scripts/build_shorts.py</div>`;

    const hashtags = (item.hashtags || [])
      .map((h) => `<span class="hashtag">${h}</span>`)
      .join("");

    card.innerHTML = `
      <div class="card-header">
        <h2 class="card-title">${item.title}</h2>
        <span class="status-badge ${item.status}" data-role="badge">${STATUS_LABELS[item.status]}</span>
      </div>
      <p class="card-context">${item.context}</p>
      <div class="card-body">
        <div>${videoBlock}</div>
        <div>
          <p class="narration">${item.narration}</p>
          <div class="hashtags">${hashtags}</div>
          <div class="actions" data-role="actions">
            <button data-status="pending">Pendiente</button>
            <button data-status="approved">Aprobar</button>
            <button data-status="posted">Ya publicado</button>
          </div>
        </div>
      </div>
    `;

    updateActiveButton(card, item.status);

    card.querySelectorAll("[data-role='actions'] button").forEach((btn) => {
      btn.addEventListener("click", () => setStatus(item.index, btn.dataset.status, card));
    });

    cardsEl.appendChild(card);
  });
}

function updateActiveButton(card, status) {
  card.querySelectorAll("[data-role='actions'] button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.status === status);
  });
}

async function setStatus(index, status, card) {
  const pipeline = pipelineSelect.value;
  const date = dateSelect.value;
  const res = await fetch(`/api/content/${pipeline}/${date}/${index}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) return;
  const badge = card.querySelector("[data-role='badge']");
  badge.textContent = STATUS_LABELS[status];
  badge.className = `status-badge ${status}`;
  updateActiveButton(card, status);
}

async function loadContent() {
  const pipeline = pipelineSelect.value;
  const date = dateSelect.value;
  if (!date) {
    emptyStateEl.hidden = false;
    headlineCardEl.hidden = true;
    cardsEl.innerHTML = "";
    return;
  }

  const res = await fetch(`/api/content/${pipeline}/${date}`);
  if (!res.ok) {
    emptyStateEl.hidden = false;
    headlineCardEl.hidden = true;
    cardsEl.innerHTML = "";
    return;
  }
  const data = await res.json();
  emptyStateEl.hidden = true;
  headlineCardEl.hidden = false;
  headlineTextEl.textContent = data.headline;
  headlineSubEl.textContent = `${data.items.length} shorts generados para ${data.date}`;
  renderCards(data.items);
}

async function onPipelineChange() {
  const pipelines = await loadPipelines();
  const dates = pipelines[pipelineSelect.value] || [];
  const hasDates = populateDates(dates);
  if (hasDates) await loadContent();
  else {
    emptyStateEl.hidden = false;
    headlineCardEl.hidden = true;
    cardsEl.innerHTML = "";
  }
}

pipelineSelect.addEventListener("change", onPipelineChange);
dateSelect.addEventListener("change", loadContent);

onPipelineChange();
