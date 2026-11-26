let patients = JSON.parse(localStorage.getItem("patients")) || [];

const form = document.getElementById("patientForm");
const tableBody = document.getElementById("tableBody");
const searchBox = document.getElementById("search");

function save() {
  localStorage.setItem("patients", JSON.stringify(patients));
}

function render(list = patients) {
  tableBody.innerHTML = "";
  if (list.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6">No records found.</td></tr>';
    return;
  }
  list.forEach(p => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.id}</td>
      <td><a href="profile.html?id=${p.id}">${p.name}</a></td>
      <td>${p.age}</td>
      <td>${p.gender}</td>
      <td>${p.disease}</td>
      <td><button class="delete-btn" onclick="deletePatient(${p.id})">Delete</button></td>`;
    tableBody.appendChild(row);
  });
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const id = Number(document.getElementById("pid").value);
  if (patients.some(p => p.id === id)) {
    alert("ID already exists!");
    return;
  }
  patients.push({
    id,
    name: document.getElementById("name").value,
    age: document.getElementById("age").value,
    gender: document.getElementById("gender").value,
    disease: document.getElementById("disease").value
  });
  save();
  render();
  form.reset();
});

function deletePatient(id) {
  patients = patients.filter(p => p.id !== id);
  save();
  render();
}

searchBox.addEventListener("input", () => {
  const q = searchBox.value.toLowerCase();
  render(patients.filter(p =>
    String(p.id).includes(q) || p.name.toLowerCase().includes(q)
  ));
});

render();

// ---------- Google Sheets sync ----------
const SHEETS_URL = "https://script.google.com/macros/s/AKfycbysiieST-ouvRORVxmRifm-ejYpMVVGfkd3kya5WAqnc7-fvEsBEODIlxClDcTMs6GD_A/exec";
const statusEl = document.getElementById("sheetStatus");

function setStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.style.color = isError ? "#d33" : "#0a7a3d";
}

function urlMissing() {
  if (SHEETS_URL.includes("PASTE_YOUR")) {
    setStatus("Add your Google Apps Script Web App URL in script.js first.", true);
    return true;
  }
  return false;
}

async function saveToSheets() {
  if (urlMissing()) return;
  if (patients.length === 0 &&
      !confirm("There are no records on the page. This will clear the Google Sheet. Continue?")) return;

  setStatus("Saving to Google Sheets...");
  try {
    const res = await fetch(SHEETS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ patients })
    });
    const result = await res.json();
    if (result.status !== "ok") throw new Error(result.message || "Unknown error");
    setStatus("✅ Saved " + result.count + " record(s) to Google Sheets.");
  } catch (err) {
    setStatus("❌ Save failed: " + err.message, true);
  }
}

async function loadFromSheets() {
  if (urlMissing()) return;
  if (!confirm("This will replace the records on this page with the data from Google Sheets. Continue?")) return;

  setStatus("Retrieving from Google Sheets...");
  try {
    const res = await fetch(SHEETS_URL);
    const result = await res.json();
    if (result.status !== "ok") throw new Error(result.message || "Unknown error");
    patients = result.patients;
    save();
    render();
    setStatus("✅ Retrieved " + patients.length + " record(s) from Google Sheets.");
  } catch (err) {
    setStatus("❌ Retrieve failed: " + err.message, true);
  }
}

document.getElementById("saveSheetBtn").addEventListener("click", saveToSheets);
document.getElementById("loadSheetBtn").addEventListener("click", loadFromSheets);