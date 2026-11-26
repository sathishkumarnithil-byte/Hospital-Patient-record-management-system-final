const pid = Number(new URLSearchParams(location.search).get("id"));
const allPatients = loadData("patients");
const patient = allPatients.find(p => p.id === pid);
const profileCard = document.getElementById("profileCard");

if (!patient) {
  profileCard.innerHTML = "<h2>Patient not found</h2>" +
    "<p>Go back to the <a href='index.html'>Patients</a> page and click a name.</p>";
  document.getElementById("bedInfo").innerHTML = "";
  document.getElementById("apptInfo").innerHTML = "";
} else {
  // ----- Details -----
  profileCard.innerHTML =
    "<h2>" + esc(patient.name) + "</h2>" +
    '<table class="info-table">' +
      "<tr><th>Patient ID</th><td>" + esc(patient.id) + "</td></tr>" +
      "<tr><th>Age</th><td>" + esc(patient.age) + "</td></tr>" +
      "<tr><th>Gender</th><td>" + esc(patient.gender) + "</td></tr>" +
      "<tr><th>Diagnosis</th><td>" + esc(patient.disease) + "</td></tr>" +
    "</table>" +
    '<a class="btn-link inline-btn" href="billing.html?patient=' + patient.id + '">Billing / Invoice</a>' +
    '<a class="btn-link inline-btn" href="appointments.html">Book appointment</a>';

  // ----- Bed -----
  const bed = loadData("beds").find(b => b.patientId === pid);
  document.getElementById("bedInfo").innerHTML = bed
    ? "Admitted to <b>" + esc(bed.ward) + "</b>, bed <b>" + esc(bed.id) + "</b>."
    : "Not currently admitted. Assign a bed from the Beds page.";

  // ----- Appointments -----
  const doctors = loadData("doctors");
  const appts = loadData("appointments")
    .filter(a => a.patientId === pid)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  if (appts.length === 0) {
    document.getElementById("apptInfo").textContent = "No appointments booked.";
  } else {
    document.getElementById("apptInfo").innerHTML = "<ul>" + appts.map(a => {
      const d = doctors.find(x => x.id === a.doctorId);
      return "<li>" + esc(a.date) + " at " + esc(a.time) + " with " +
             esc(d ? d.name : "Unknown doctor") + "</li>";
    }).join("") + "</ul>";
  }
}

// ----- Doctor's notes (only if the patient exists) -----
const notesList = document.getElementById("notesList");

function renderNotes() {
  const mine = loadData("notes").filter(n => n.patientId === pid).reverse();
  notesList.innerHTML = mine.length
    ? mine.map(n => '<div class="note"><small>' + esc(n.time) + "</small><p>" + esc(n.text) + "</p></div>").join("")
    : "<p>No notes yet.</p>";
}

document.getElementById("addNoteBtn").addEventListener("click", () => {
  const noteEl = document.getElementById("noteText");
  const text = noteEl.value.trim();
  if (!text || !patient) return;
  const notes = loadData("notes");
  notes.push({ patientId: pid, text: text, time: new Date().toLocaleString() });
  saveData("notes", notes);
  noteEl.value = "";
  renderNotes();
});

renderNotes();