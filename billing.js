const billPatients = loadData("patients");
const doctorsList = loadData("doctors");
let bills = loadData("bills");
let invoiceDoctors = loadData("invoiceDoctors", {});

const billPatientSel = document.getElementById("billPatient");
const billDoctorSel = document.getElementById("billDoctor");
const chargeBody = document.getElementById("chargeBody");
const TAX_RATE = 0.05;

// Fill the patient dropdown
billPatientSel.innerHTML = '<option value="">Select patient</option>' +
  billPatients.map(p => '<option value="' + p.id + '">' + esc(p.name) + " (ID " + esc(p.id) + ")</option>").join("");

// Fill the doctor dropdown
billDoctorSel.innerHTML = '<option value="">Select doctor</option>' +
  doctorsList.map(d => '<option value="' + d.id + '">' + esc(d.name) + " - " + esc(d.dept) + "</option>").join("");

// Pre-select patient if we came from the profile page
const preset = new URLSearchParams(location.search).get("patient");
if (preset) billPatientSel.value = preset;

function currentPatient() {
  return billPatients.find(p => p.id === Number(billPatientSel.value));
}

function currentDoctor() {
  return doctorsList.find(d => d.id === Number(billDoctorSel.value));
}

// When a patient is chosen, show the doctor saved for them (if any)
function loadDoctorForPatient() {
  const p = currentPatient();
  billDoctorSel.value = (p && invoiceDoctors[p.id]) ? invoiceDoctors[p.id] : "";
}

function renderBill() {
  const p = currentPatient();
  const d = currentDoctor();
  const list = p ? bills.filter(b => b.patientId === p.id) : [];
  chargeBody.innerHTML = "";

  if (!p) {
    chargeBody.innerHTML = '<tr><td colspan="4">Select a patient to see charges.</td></tr>';
  } else if (list.length === 0) {
    chargeBody.innerHTML = '<tr><td colspan="4">No charges yet.</td></tr>';
  } else {
    list.forEach(b => {
      const tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + esc(b.date) + "</td>" +
        "<td>" + esc(b.description) + "</td>" +
        '<td style="text-align:right">' + Number(b.amount).toFixed(2) + "</td>" +
        '<td class="no-print"><button class="small-btn danger" data-id="' + b.id + '">Remove</button></td>';
      chargeBody.appendChild(tr);
    });
  }

  const subtotal = list.reduce((sum, b) => sum + Number(b.amount), 0);
  const tax = subtotal * TAX_RATE;
  document.getElementById("subtotal").textContent = subtotal.toFixed(2);
  document.getElementById("tax").textContent = tax.toFixed(2);
  document.getElementById("total").textContent = (subtotal + tax).toFixed(2);

  // Invoice header: patient and doctor details
  let html = "";
  if (p) {
    html += "<b>Patient:</b> " + esc(p.name) + "<br>" +
            "Patient ID: " + esc(p.id) + "<br>" +
            "Date: " + new Date().toLocaleDateString() + "<br>";
    if (d) {
      html += "<br><b>Attending Doctor:</b> " + esc(d.name) + "<br>" +
              "Department: " + esc(d.dept) + "<br>" +
              "Consultation days: " + esc(d.days);
    } else {
      html += "<br><i>No attending doctor selected</i>";
    }
  }
  document.getElementById("invDetails").innerHTML = html;
}

// Save the doctor for the chosen patient
billDoctorSel.addEventListener("change", () => {
  const p = currentPatient();
  if (p) {
    invoiceDoctors[p.id] = Number(billDoctorSel.value) || null;
    saveData("invoiceDoctors", invoiceDoctors);
  }
  renderBill();
});

billPatientSel.addEventListener("change", () => {
  loadDoctorForPatient();
  renderBill();
});

document.getElementById("chargeForm").addEventListener("submit", e => {
  e.preventDefault();
  const p = currentPatient();
  const msg = document.getElementById("billMsg");
  if (!p) {
    msg.textContent = "❌ Please select a patient first.";
    msg.style.color = "#d33";
    return;
  }
  bills.push({
    id: Date.now(),
    patientId: p.id,
    description: document.getElementById("chargeDesc").value.trim(),
    amount: Number(document.getElementById("chargeAmt").value),
    date: new Date().toLocaleDateString()
  });
  saveData("bills", bills);
  renderBill();
  msg.textContent = "✅ Charge added.";
  msg.style.color = "#0a7a3d";
  document.getElementById("chargeDesc").value = "";
  document.getElementById("chargeAmt").value = "";
});

chargeBody.addEventListener("click", e => {
  const btn = e.target.closest("button[data-id]");
  if (!btn) return;
  bills = bills.filter(b => b.id !== Number(btn.dataset.id));
  saveData("bills", bills);
  renderBill();
});

document.getElementById("printBtn").addEventListener("click", () => window.print());

loadDoctorForPatient();
renderBill();