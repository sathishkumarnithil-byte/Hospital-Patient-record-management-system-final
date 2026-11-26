// ---------- Login check (runs on every page that loads this file) ----------
if (sessionStorage.getItem("loggedIn") !== "true") {
  window.location.href = "login.html";
}

// ---------- Storage helpers ----------
function loadData(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch (e) { return fallback; }
}
function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Prevents text typed by users from being treated as HTML
function esc(text) {
  const d = document.createElement("div");
  d.textContent = text;
  return d.innerHTML;
}

// ---------- Sample doctors (created once, used by several pages) ----------
if (!localStorage.getItem("doctors")) {
  saveData("doctors", [
    { id: 1, name: "Dr. Anita Rao",        dept: "Cardiology",       days: "Mon, Wed, Fri", available: true  },
    { id: 2, name: "Dr. Rahul Mehta",      dept: "Neurology",        days: "Tue, Thu",      available: true  },
    { id: 3, name: "Dr. Priya Nair",       dept: "Pediatrics",       days: "Mon - Sat",     available: true  },
    { id: 4, name: "Dr. Karthik Subramanian", dept: "Orthopedics",   days: "Wed, Fri",      available: false },
    { id: 5, name: "Dr. Johnny Singh",        dept: "General Medicine", days: "Mon - Fri",     available: true  }
  ]);
}

// ---------- Top navigation bar ----------
function renderNav() {
  const pages = [
    ["dashboard.html", "Dashboard"],
    ["index.html", "Patients"],
    ["appointments.html", "Appointments"],
    ["beds.html", "Beds"],
    ["doctors.html", "Doctors"],
    ["billing.html", "Billing"]
  ];
  const current = location.pathname.split("/").pop() || "index.html";
  const user = sessionStorage.getItem("currentUser") || "";

  const nav = document.createElement("nav");
  nav.className = "topnav";
  nav.innerHTML =
    '<span class="brand">🏥 PRMS</span>' +
    '<div class="links">' +
    pages.map(p =>
      '<a href="' + p[0] + '"' + (p[0] === current ? ' class="active"' : '') + '>' + p[1] + '</a>'
    ).join("") +
    '</div>' +
    '<div class="userbox"><span>👤 ' + esc(user) + '</span>' +
    '<button id="navLogout">Logout</button></div>';
  document.body.prepend(nav);

  document.getElementById("navLogout").addEventListener("click", () => {
    sessionStorage.removeItem("loggedIn");
    sessionStorage.removeItem("currentUser");
    window.location.href = "login.html";
  });
}
renderNav();
// ---------- Sample beds (created once) ----------
if (!localStorage.getItem("beds")) {
  const bedList = [];
  [["General Ward", "G", 8], ["ICU", "I", 4], ["Pediatric Ward", "P", 6]].forEach(([ward, code, count]) => {
    for (let i = 1; i <= count; i++) {
      bedList.push({ id: code + "-" + i, ward: ward, patientId: null });
    }
  });
  saveData("beds", bedList);
}