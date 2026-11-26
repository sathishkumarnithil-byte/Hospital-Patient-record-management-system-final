const patients = loadData("patients");
const appointments = loadData("appointments");
const beds = loadData("beds");
const doctors = loadData("doctors");

// ----- Stat cards -----
document.getElementById("statPatients").textContent = patients.length;

const avgAge = patients.length
  ? Math.round(patients.reduce((sum, p) => sum + Number(p.age), 0) / patients.length)
  : 0;
document.getElementById("statAge").textContent = avgAge;

const male = patients.filter(p => p.gender === "Male").length;
const female = patients.filter(p => p.gender === "Female").length;
document.getElementById("statGender").textContent = male + " / " + female;

document.getElementById("statAppts").textContent = appointments.length;

const occupied = beds.filter(b => b.patientId !== null && b.patientId !== undefined).length;
document.getElementById("statBeds").textContent = occupied + " / " + beds.length;

document.getElementById("statDocs").textContent = doctors.length;

// ----- Top diagnoses bar chart -----
const counts = {};
patients.forEach(p => {
  const d = String(p.disease).trim().toLowerCase();
  if (d) counts[d] = (counts[d] || 0) + 1;
});
const topDiseases = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
const chart = document.getElementById("diseaseChart");

if (topDiseases.length === 0) {
  chart.innerHTML = "<p>No data yet. Add patients on the Patients page.</p>";
} else {
  const max = topDiseases[0][1];
  topDiseases.forEach(([name, count]) => {
    const label = name.charAt(0).toUpperCase() + name.slice(1);
    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML =
      '<span class="bar-label">' + esc(label) + '</span>' +
      '<div class="bar-track"><div class="bar-fill" style="width:' + (count / max * 100) + '%"></div></div>' +
      '<span class="bar-count">' + count + '</span>';
    chart.appendChild(row);
  });
}

// ----- Recent patients (last 5 added) -----
const recentBody = document.getElementById("recentBody");
const recent = patients.slice(-5).reverse();
if (recent.length === 0) {
  recentBody.innerHTML = '<tr><td colspan="4">No patients yet.</td></tr>';
} else {
  recent.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML =
      "<td>" + esc(p.id) + "</td><td>" + esc(p.name) + "</td><td>" +
      esc(p.age) + "</td><td>" + esc(p.disease) + "</td>";
    recentBody.appendChild(tr);
  });
}