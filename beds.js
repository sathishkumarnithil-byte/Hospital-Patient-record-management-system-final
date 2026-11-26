let bedList = loadData("beds");
const bedPatients = loadData("patients");
const wardsEl = document.getElementById("wards");
const bedModal = document.getElementById("modal");

function patientName(id) {
  const p = bedPatients.find(x => x.id === id);
  return p ? p.name : "(record deleted)";
}

function isOccupied(bed) {
  return bed.patientId !== null && bed.patientId !== undefined;
}

function renderBeds() {
  wardsEl.innerHTML = "";
  const wardNames = [...new Set(bedList.map(b => b.ward))];

  wardNames.forEach(w => {
    const inWard = bedList.filter(b => b.ward === w);
    const used = inWard.filter(isOccupied).length;

    const section = document.createElement("section");
    section.className = "card";
    section.innerHTML = "<h2>" + esc(w) + " <small>" + used + "/" + inWard.length + " occupied</small></h2>" +
                        '<div class="bed-grid"></div>';
    const grid = section.querySelector(".bed-grid");

    inWard.forEach(b => {
      const occ = isOccupied(b);
      const tile = document.createElement("button");
      tile.className = "bed " + (occ ? "occupied" : "free");
      tile.innerHTML = '<span class="bed-id">🛏 ' + esc(b.id) + "</span>" +
                       '<span class="bed-info">' + (occ ? esc(patientName(b.patientId)) : "Free") + "</span>";
      tile.addEventListener("click", () => openBed(b.id));
      grid.appendChild(tile);
    });
    wardsEl.appendChild(section);
  });

  const totalUsed = bedList.filter(isOccupied).length;
  document.getElementById("bedSummary").textContent = totalUsed + " / " + bedList.length + " beds occupied";
}

function closeModal() {
  bedModal.classList.add("hidden");
}

function openBed(id) {
  const bed = bedList.find(b => b.id === id);
  const body = document.getElementById("modalBody");
  document.getElementById("modalTitle").textContent = bed.ward + " - Bed " + bed.id;

  if (isOccupied(bed)) {
    body.innerHTML = "<p>Occupied by <b>" + esc(patientName(bed.patientId)) +
      "</b> (ID " + esc(bed.patientId) + ")</p>" +
      '<button id="dischargeBtn" class="small-btn danger" style="margin-top:10px">Discharge patient</button>';
    document.getElementById("dischargeBtn").onclick = () => {
      bed.patientId = null;
      saveData("beds", bedList);
      closeModal();
      renderBeds();
    };
  } else {
    const admittedIds = bedList.filter(isOccupied).map(b => b.patientId);
    const candidates = bedPatients.filter(p => !admittedIds.includes(p.id));

    if (candidates.length === 0) {
      body.innerHTML = "<p>No patients available to admit. Add a patient first, or all patients are already admitted.</p>";
    } else {
      body.innerHTML = "<label>Select patient</label>" +
        '<select id="admitSelect">' +
        candidates.map(p => '<option value="' + p.id + '">' + esc(p.name) + " (ID " + esc(p.id) + ")</option>").join("") +
        "</select>" +
        '<button id="admitBtn" class="small-btn" style="margin-top:10px">Admit to this bed</button>';
      document.getElementById("admitBtn").onclick = () => {
        bed.patientId = Number(document.getElementById("admitSelect").value);
        saveData("beds", bedList);
        closeModal();
        renderBeds();
      };
    }
  }
  bedModal.classList.remove("hidden");
}

document.getElementById("modalClose").addEventListener("click", closeModal);
bedModal.addEventListener("click", e => { if (e.target === bedModal) closeModal(); });

renderBeds();