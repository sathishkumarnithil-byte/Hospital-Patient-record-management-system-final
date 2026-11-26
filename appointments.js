const apptPatients = loadData("patients");
const apptDoctors = loadData("doctors");
let appointments = loadData("appointments");

const apptForm = document.getElementById("apptForm");
const patientSel = document.getElementById("apptPatient");
const doctorSel = document.getElementById("apptDoctor");
const dateInput = document.getElementById("apptDate");
const timeSel = document.getElementById("apptTime");
const apptMsg = document.getElementById("apptMsg");
const apptBody = document.getElementById("apptBody");

function todayString() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" +
         String(d.getDate()).padStart(2, "0");
}

function showMsg(text, isError) {
  apptMsg.textContent = text;
  apptMsg.style.color = isError ? "#d33" : "#0a7a3d";
}

// ----- Fill the dropdowns -----
function fillForm() {
  if (apptPatients.length === 0) {
    document.getElementById("noPatients").style.display = "block";
  }
  patientSel.innerHTML = '<option value="">Select patient</option>' +
    apptPatients.map(p => '<option value="' + p.id + '">' + esc(p.name) + " (ID " + esc(p.id) + ")</option>").join("");

  const available = apptDoctors.filter(d => d.available);
  doctorSel.innerHTML = '<option value="">Select doctor</option>' +
    available.map(d => '<option value="' + d.id + '">' + esc(d.name) + " - " + esc(d.dept) + "</option>").join("");

  // Pre-select doctor if we came from the Doctors page
  const wanted = new URLSearchParams(location.search).get("doctor");
  if (wanted) doctorSel.value = wanted;

  // Time slots 09:00 - 16:30, every 30 minutes
  let slots = '<option value="">Select time</option>';
  for (let h = 9; h <= 16; h++) {
    ["00", "30"].forEach(m => {
      const t = String(h).padStart(2, "0") + ":" + m;
      slots += '<option value="' + t + '">' + t + "</option>";
    });
  }
  timeSel.innerHTML = slots;

  dateInput.min = todayString();
}

// ----- Show the table -----
function renderAppointments() {
  apptBody.innerHTML = "";
  if (appointments.length === 0) {
    apptBody.innerHTML = '<tr><td colspan="6">No appointments booked yet.</td></tr>';
    return;
  }
  const sorted = [...appointments].sort((a, b) =>
    (a.date + a.time).localeCompare(b.date + b.time));

  sorted.forEach(a => {
    const p = apptPatients.find(x => x.id === a.patientId);
    const d = apptDoctors.find(x => x.id === a.doctorId);
    const tr = document.createElement("tr");
    tr.innerHTML =
      "<td>" + esc(a.date) + "</td>" +
      "<td>" + esc(a.time) + "</td>" +
      "<td>" + esc(p ? p.name : "(record deleted)") + "</td>" +
      "<td>" + esc(d ? d.name : "-") + "</td>" +
      "<td>" + esc(d ? d.dept : "-") + "</td>" +
      '<td><button class="small-btn danger" data-id="' + a.id + '">Cancel</button></td>';
    apptBody.appendChild(tr);
  });
}

// ----- Book -----
apptForm.addEventListener("submit", e => {
  e.preventDefault();
  const patientId = Number(patientSel.value);
  const doctorId = Number(doctorSel.value);
  const date = dateInput.value;
  const time = timeSel.value;

  if (appointments.some(a => a.doctorId === doctorId && a.date === date && a.time === time)) {
    showMsg("❌ That doctor is already booked at this date and time.", true);
    return;
  }
  if (appointments.some(a => a.patientId === patientId && a.date === date && a.time === time)) {
    showMsg("❌ This patient already has an appointment at that time.", true);
    return;
  }

  appointments.push({ id: Date.now(), patientId, doctorId, date, time });
  saveData("appointments", appointments);
  renderAppointments();
  showMsg("✅ Appointment booked successfully.", false);
  apptForm.reset();
});

// ----- Cancel -----
apptBody.addEventListener("click", e => {
  const btn = e.target.closest("button[data-id]");
  if (!btn) return;
  if (!confirm("Cancel this appointment?")) return;
  appointments = appointments.filter(a => a.id !== Number(btn.dataset.id));
  saveData("appointments", appointments);
  renderAppointments();
  showMsg("Appointment cancelled.", false);
});

fillForm();
renderAppointments();