let doctorList = loadData("doctors");
const doctorGrid = document.getElementById("doctorGrid");
const deptFilter = document.getElementById("deptFilter");

function fillDepartments() {
  const depts = [...new Set(doctorList.map(d => d.dept))];
  deptFilter.innerHTML = '<option value="">All departments</option>' +
    depts.map(d => "<option>" + esc(d) + "</option>").join("");
}

function renderDoctors() {
  const selected = deptFilter.value;
  const list = selected ? doctorList.filter(d => d.dept === selected) : doctorList;
  doctorGrid.innerHTML = "";

  list.forEach(d => {
    const card = document.createElement("div");
    card.className = "doc-card";
    card.innerHTML =
      '<div class="doc-avatar">👨‍⚕️</div>' +
      "<h3>" + esc(d.name) + "</h3>" +
      '<p class="dept">' + esc(d.dept) + "</p>" +
      "<p>🗓 " + esc(d.days) + "</p>" +
      '<span class="badge ' + (d.available ? "ok" : "off") + '">' +
        (d.available ? "Available" : "Unavailable") + "</span>" +
      '<div class="doc-actions">' +
        '<a class="btn-link ' + (d.available ? "" : "disabled") + '" href="appointments.html?doctor=' + d.id + '">Book appointment</a>' +
        '<button class="small-btn grey" data-id="' + d.id + '">Toggle availability</button>' +
      "</div>";
    doctorGrid.appendChild(card);
  });
}

doctorGrid.addEventListener("click", e => {
  const btn = e.target.closest("button[data-id]");
  if (!btn) return;
  const doc = doctorList.find(d => d.id === Number(btn.dataset.id));
  doc.available = !doc.available;
  saveData("doctors", doctorList);
  renderDoctors();
});

deptFilter.addEventListener("change", renderDoctors);

fillDepartments();
renderDoctors();