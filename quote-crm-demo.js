const STORAGE_KEY = "ckp_quote_crm_leads_v1";

const form = document.getElementById("quoteForm");
const servicesError = document.getElementById("servicesError");
const serviceCheckboxes = [...document.querySelectorAll('input[name="services"]')];

const totalCount = document.getElementById("totalCount");
const newCount = document.getElementById("newCount");
const contactedCount = document.getElementById("contactedCount");
const qualifiedCount = document.getElementById("qualifiedCount");
const wonCount = document.getElementById("wonCount");

const leadsTableBody = document.getElementById("leadsTableBody");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const seedDemoBtn = document.getElementById("seedDemoBtn");
const exportBtn = document.getElementById("exportBtn");
const resetBtn = document.getElementById("resetBtn");

const detailEmpty = document.getElementById("detailEmpty");
const detailContent = document.getElementById("detailContent");
const detailName = document.getElementById("detailName");
const detailCompany = document.getElementById("detailCompany");
const detailStatus = document.getElementById("detailStatus");
const leadMeta = document.getElementById("leadMeta");
const leadBody = document.getElementById("leadBody");
const noteList = document.getElementById("noteList");
const noteInput = document.getElementById("noteInput");
const addNoteBtn = document.getElementById("addNoteBtn");
const toggleStarBtn = document.getElementById("toggleStarBtn");

const tabButtons = [...document.querySelectorAll(".tab-btn")];
const tabPanels = [...document.querySelectorAll(".tab-panel")];
const toast = document.getElementById("toast");

let leads = loadLeads();
let selectedLeadId = leads.length ? leads[0].id : null;
let toastTimer = null;

bindEvents();
renderAll();

function bindEvents() {
  form.addEventListener("submit", handleFormSubmit);
  form.addEventListener("reset", () => {
    servicesError.textContent = "";
  });

  serviceCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      servicesError.textContent = "";
    });
  });

  searchInput.addEventListener("input", renderTable);
  statusFilter.addEventListener("change", renderTable);

  seedDemoBtn.addEventListener("click", seedDemoData);
  exportBtn.addEventListener("click", exportCSV);
  resetBtn.addEventListener("click", resetLeads);

  detailStatus.addEventListener("change", updateLeadStatus);
  addNoteBtn.addEventListener("click", addNoteToLead);
  toggleStarBtn.addEventListener("click", togglePriority);

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });
}

function handleFormSubmit(event) {
  event.preventDefault();

  const services = getSelectedServices();

  if (services.length === 0) {
    servicesError.textContent = "Please choose at least one service.";
    return;
  }

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = new FormData(form);
  const lead = {
    id: createId(),
    createdAt: new Date().toISOString(),
    fullName: data.get("fullName").trim(),
    company: data.get("company").trim(),
    email: data.get("email").trim(),
    phone: data.get("phone").trim(),
    budget: data.get("budget"),
    timeline: data.get("timeline"),
    preferredContact: data.get("preferredContact"),
    services,
    details: data.get("details").trim(),
    status: "New",
    source: "Website quote form",
    starred: false,
    score: calculateLeadScore({
      budget: data.get("budget"),
      timeline: data.get("timeline"),
      services,
      company: data.get("company").trim(),
      phone: data.get("phone").trim(),
      details: data.get("details").trim()
    }),
    notes: [
      {
        text: "Lead created from website quote request form.",
        createdAt: new Date().toISOString()
      }
    ]
  };

  leads.unshift(lead);
  selectedLeadId = lead.id;
  saveLeads();
  renderAll();
  form.reset();
  servicesError.textContent = "";
  switchTab("crmView");
  showToast("Lead saved to CRM dashboard.");
}

function getSelectedServices() {
  return serviceCheckboxes
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
}

function calculateLeadScore(data) {
  const budgetMap = {
    "Under $2,000": 5,
    "$2,000 - $5,000": 15,
    "$5,000 - $10,000": 25,
    "$10,000 - $20,000": 35,
    "$20,000+": 45
  };

  const timelineMap = {
    "ASAP": 20,
    "1 month": 15,
    "2-3 months": 10,
    "Flexible": 5
  };

  let score = 20;
  score += budgetMap[data.budget] || 0;
  score += timelineMap[data.timeline] || 0;
  score += Math.min(data.services.length * 6, 18);
  score += data.company ? 5 : 0;
  score += data.phone ? 5 : 0;
  score += data.details.length > 80 ? 10 : data.details.length > 30 ? 5 : 0;

  return Math.min(score, 100);
}

function renderAll() {
  renderStats();
  renderTable();
  renderDetail();
}

function renderStats() {
  totalCount.textContent = leads.length;
  newCount.textContent = leads.filter((lead) => lead.status === "New").length;
  contactedCount.textContent = leads.filter((lead) => lead.status === "Contacted").length;
  qualifiedCount.textContent = leads.filter((lead) => lead.status === "Qualified").length;
  wonCount.textContent = leads.filter((lead) => lead.status === "Won").length;
}

function renderTable() {
  const filteredLeads = getFilteredLeads();

  if (!filteredLeads.length) {
    leadsTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-row">No leads match your current filters.</td>
      </tr>
    `;
    return;
  }

  leadsTableBody.innerHTML = filteredLeads
    .map((lead) => {
      const activeClass = lead.id === selectedLeadId ? "active-row" : "";
      const companyLine = lead.company ? escapeHtml(lead.company) : "No company provided";
      const services = escapeHtml(lead.services.join(", "));

      return `
        <tr class="${activeClass}" data-id="${lead.id}">
          <td>${formatDate(lead.createdAt)}</td>
          <td>
            <span class="lead-name">${lead.starred ? "★ " : ""}${escapeHtml(lead.fullName)}</span>
            <span class="small-text">${companyLine}</span>
          </td>
          <td>${services}</td>
          <td>${escapeHtml(lead.budget)}</td>
          <td><span class="status-pill ${getStatusClass(lead.status)}">${escapeHtml(lead.status)}</span></td>
          <td><span class="score-pill">${lead.score}</span></td>
        </tr>
      `;
    })
    .join("");

  [...leadsTableBody.querySelectorAll("tr[data-id]")].forEach((row) => {
    row.addEventListener("click", () => {
      selectedLeadId = row.dataset.id;
      renderTable();
      renderDetail();
    });
  });
}

function renderDetail() {
  const lead = leads.find((item) => item.id === selectedLeadId);

  if (!lead) {
    detailEmpty.classList.remove("hidden");
    detailContent.classList.add("hidden");
    return;
  }

  detailEmpty.classList.add("hidden");
  detailContent.classList.remove("hidden");

  detailName.textContent = lead.fullName;
  detailCompany.textContent = lead.company || "Independent / company not provided";
  detailStatus.value = lead.status;
  toggleStarBtn.textContent = lead.starred ? "Remove Priority" : "Mark Priority";

  leadMeta.innerHTML = `
    <div class="detail-grid">
      <div class="meta-card">
        <span>Date created</span>
        <strong>${formatDateTime(lead.createdAt)}</strong>
      </div>
      <div class="meta-card">
        <span>Lead score</span>
        <strong>${lead.score}/100</strong>
      </div>
      <div class="meta-card">
        <span>Budget</span>
        <strong>${escapeHtml(lead.budget)}</strong>
      </div>
      <div class="meta-card">
        <span>Timeline</span>
        <strong>${escapeHtml(lead.timeline)}</strong>
      </div>
      <div class="meta-card">
        <span>Preferred contact</span>
        <strong>${escapeHtml(lead.preferredContact)}</strong>
      </div>
      <div class="meta-card">
        <span>Source</span>
        <strong>${escapeHtml(lead.source)}</strong>
      </div>
    </div>
  `;

  leadBody.innerHTML = `
    <div class="detail-grid">
      <div class="meta-card">
        <span>Email</span>
        <strong><a class="inline-link" href="mailto:${escapeAttribute(lead.email)}">${escapeHtml(lead.email)}</a></strong>
      </div>
      <div class="meta-card">
        <span>Phone</span>
        <strong><a class="inline-link" href="tel:${escapeAttribute(lead.phone)}">${escapeHtml(lead.phone)}</a></strong>
      </div>
      <div class="meta-card" style="grid-column: 1 / -1;">
        <span>Services requested</span>
        <strong>${escapeHtml(lead.services.join(", "))}</strong>
      </div>
      <div class="meta-card" style="grid-column: 1 / -1;">
        <span>Project details</span>
        <strong>${escapeHtml(lead.details)}</strong>
      </div>
    </div>
  `;

  renderNotes(lead.notes);
}

function renderNotes(notes) {
  if (!notes.length) {
    noteList.innerHTML = `<li class="note-item">No notes yet.</li>`;
    return;
  }

  noteList.innerHTML = notes
    .slice()
    .reverse()
    .map((note) => {
      return `
        <li class="note-item">
          <strong>${formatDateTime(note.createdAt)}</strong>
          <span>${escapeHtml(note.text)}</span>
        </li>
      `;
    })
    .join("");
}

function addNoteToLead() {
  const lead = leads.find((item) => item.id === selectedLeadId);
  const text = noteInput.value.trim();

  if (!lead || !text) {
    return;
  }

  lead.notes.push({
    text,
    createdAt: new Date().toISOString()
  });

  noteInput.value = "";
  saveLeads();
  renderDetail();
  showToast("Note added.");
}

function updateLeadStatus() {
  const lead = leads.find((item) => item.id === selectedLeadId);
  if (!lead) return;

  lead.status = detailStatus.value;
  saveLeads();
  renderStats();
  renderTable();
  showToast("Lead status updated.");
}

function togglePriority() {
  const lead = leads.find((item) => item.id === selectedLeadId);
  if (!lead) return;

  lead.starred = !lead.starred;
  saveLeads();
  renderTable();
  renderDetail();
  showToast(lead.starred ? "Lead marked as priority." : "Priority removed.");
}

function getFilteredLeads() {
  const query = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;

  return leads
    .slice()
    .sort((a, b) => {
      if (a.starred !== b.starred) return a.starred ? -1 : 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    })
    .filter((lead) => {
      const matchesStatus = status === "All" || lead.status === status;
      const haystack = [
        lead.fullName,
        lead.company,
        lead.email,
        lead.phone,
        lead.budget,
        lead.timeline,
        lead.status,
        ...lead.services
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery = !query || haystack.includes(query);
      return matchesStatus && matchesQuery;
    });
}

function exportCSV() {
  if (!leads.length) {
    showToast("There are no leads to export.");
    return;
  }

  const headers = [
    "Date Created",
    "Full Name",
    "Company",
    "Email",
    "Phone",
    "Services",
    "Budget",
    "Timeline",
    "Preferred Contact",
    "Status",
    "Score",
    "Priority",
    "Source",
    "Details",
    "Notes"
  ];

  const rows = leads.map((lead) => {
    const notes = lead.notes
      .map((note) => `${formatDateTime(note.createdAt)} - ${note.text}`)
      .join(" | ");

    return [
      formatDateTime(lead.createdAt),
      lead.fullName,
      lead.company,
      lead.email,
      lead.phone,
      lead.services.join("; "),
      lead.budget,
      lead.timeline,
      lead.preferredContact,
      lead.status,
      String(lead.score),
      lead.starred ? "Yes" : "No",
      lead.source,
      lead.details.replace(/\s+/g, " ").trim(),
      notes
    ];
  });

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCSV).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "quote-crm-leads.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast("CSV exported.");
}

function seedDemoData() {
  const demoLeads = [
    {
      id: createId(),
      createdAt: shiftDate(-1),
      fullName: "Alicia Warren",
      company: "North Peak Wellness",
      email: "alicia@northpeakwellness.ca",
      phone: "780-555-0199",
      budget: "$5,000 - $10,000",
      timeline: "1 month",
      preferredContact: "Email",
      services: ["Web Design", "SEO", "CMS Setup"],
      details: "Need a modern website redesign with editable service pages, blog support, and improved local SEO for Edmonton search traffic.",
      status: "Qualified",
      source: "Website quote form",
      starred: true,
      score: 78,
      notes: [
        {
          text: "Strong fit. Wants editable pages and better local visibility.",
          createdAt: shiftDate(-1)
        }
      ]
    },
    {
      id: createId(),
      createdAt: shiftDate(-3),
      fullName: "Devon Clarke",
      company: "Clarke Industrial Supply",
      email: "devon@clarkeindustrial.com",
      phone: "780-555-0122",
      budget: "$10,000 - $20,000",
      timeline: "2-3 months",
      preferredContact: "Phone",
      services: ["E-Commerce", "CRM Integration", "Maintenance"],
      details: "Looking for a quote on a product catalog with account requests, quote workflows, and internal lead tracking.",
      status: "Proposal Sent",
      source: "Website quote form",
      starred: true,
      score: 88,
      notes: [
        {
          text: "Proposal requested after discovery call.",
          createdAt: shiftDate(-2)
        }
      ]
    },
    {
      id: createId(),
      createdAt: shiftDate(-5),
      fullName: "Megan Huang",
      company: "Riverstone Legal Group",
      email: "megan@riverstonelegal.ca",
      phone: "780-555-0144",
      budget: "$2,000 - $5,000",
      timeline: "Flexible",
      preferredContact: "Either",
      services: ["Landing Pages", "SEO"],
      details: "Needs lead-focused landing pages for ad campaigns and a cleaner quote request process.",
      status: "Contacted",
      source: "Website quote form",
      starred: false,
      score: 61,
      notes: [
        {
          text: "Initial follow-up sent. Waiting on campaign details.",
          createdAt: shiftDate(-4)
        }
      ]
    }
  ];

  leads = [...demoLeads, ...leads];
  selectedLeadId = leads[0].id;
  saveLeads();
  renderAll();
  switchTab("crmView");
  showToast("Demo data added.");
}

function resetLeads() {
  const confirmed = window.confirm("Delete all saved demo leads?");
  if (!confirmed) return;

  leads = [];
  selectedLeadId = null;
  saveLeads();
  renderAll();
  showToast("All leads removed.");
}

function switchTab(tabId) {
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabId);
  });

  tabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === tabId);
  });
}

function loadLeads() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLeads() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

function createId() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `lead-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function shiftDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() + daysAgo);
  return date.toISOString();
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(dateString));
}

function formatDateTime(dateString) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(dateString));
}

function getStatusClass(status) {
  return `status-${status.toLowerCase().replace(/\s+/g, "-")}`;
}

function escapeCSV(value) {
  const safe = String(value ?? "").replace(/"/g, '""');
  return `"${safe}"`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return String(value ?? "").replace(/"/g, "&quot;");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}
