"use strict";

const STORAGE_KEY = "truth-charity-demo-reports-v1";
const REPORT_STATUSES = [
  "Submitted",
  "Under Review",
  "Under Investigation",
  "Resolved",
  "Closed"
];
const STATUS_PROGRESS = {
  Submitted: 10,
  "Under Review": 30,
  "Under Investigation": 60,
  Resolved: 90,
  Closed: 100
};
const REPORT_CATEGORIES = [
  "Corruption",
  "Human Rights Violation",
  "Abuse of Power",
  "Fraud",
  "Discrimination",
  "Environmental Issues",
  "Public Service Misconduct",
  "Other"
];
const elements = {
  menuToggle: document.querySelector("#menu-toggle"),
  navigation: document.querySelector("#primary-navigation"),
  reportForm: document.querySelector("#report-form"),
  reportCategory: document.querySelector("#report-category"),
  reportTitle: document.querySelector("#report-title-input"),
  reportDescription: document.querySelector("#report-description"),
  reportLocation: document.querySelector("#report-location"),
  incidentDate: document.querySelector("#incident-date"),
  reportSubmit: document.querySelector("#report-submit"),
  descriptionCount: document.querySelector("#description-count"),
  formCard: document.querySelector(".form-card"),
  submissionSuccess: document.querySelector("#submission-success"),
  generatedTrackingId: document.querySelector("#generated-tracking-id"),
  copyTrackingId: document.querySelector("#copy-tracking-id"),
  copyFeedback: document.querySelector("#copy-feedback"),
  newReportButton: document.querySelector("#new-report-button"),
  trackingForm: document.querySelector("#tracking-form"),
  trackingIdInput: document.querySelector("#tracking-id-input"),
  trackingError: document.querySelector("#tracking-error"),
  trackingResult: document.querySelector("#tracking-result"),
  sampleIdButtons: document.querySelectorAll("[data-sample-id]"),
  contactForm: document.querySelector("#contact-form"),
  contactSuccess: document.querySelector("#contact-success"),
  contactName: document.querySelector("#contact-name"),
  contactEmail: document.querySelector("#contact-email"),
  contactMessage: document.querySelector("#contact-message"),
  contactNameError: document.querySelector("#contact-name-error"),
  contactEmailError: document.querySelector("#contact-email-error"),
  contactMessageError: document.querySelector("#contact-message-error"),
  adminLoginForm: document.querySelector("#admin-login-form"),
  adminUsername: document.querySelector("#admin-username"),
  adminPassword: document.querySelector("#admin-password"),
  adminLoginError: document.querySelector("#admin-login-error"),
  openAdmin: document.querySelector("#open-admin"),
  closeAdmin: document.querySelector("#close-admin"),
  adminGate: document.querySelector("#admin-gate"),
  adminWorkspace: document.querySelector("#admin-workspace"),
  adminSearch: document.querySelector("#admin-search"),
  categoryFilter: document.querySelector("#category-filter"),
  statusFilter: document.querySelector("#status-filter"),
  adminReportList: document.querySelector("#admin-report-list"),
  adminDetail: document.querySelector("#admin-detail"),
  toastRegion: document.querySelector("#toast-region"),
  footerYear: document.querySelector("#footer-year")
};

let reports = loadReports();
let selectedAdminReportId = null;
let toastTimer;

initialize();

function initialize() {
  elements.footerYear.textContent = String(new Date().getFullYear());
  populateCategoryFilter();
  renderAdminReports();
  renderTrackingPrompt();

  elements.menuToggle.addEventListener("click", toggleNavigation);
  elements.navigation.addEventListener("click", handleNavigationClick);
  elements.reportForm.addEventListener("submit", handleReportSubmit);
  elements.reportDescription.addEventListener("input", updateDescriptionCount);
  elements.copyTrackingId.addEventListener("click", copyGeneratedTrackingId);
  elements.newReportButton.addEventListener("click", resetReportForm);
  elements.trackingForm.addEventListener("submit", handleTrackingSubmit);
  elements.trackingIdInput.addEventListener("input", clearTrackingError);
  elements.sampleIdButtons.forEach((button) => {
    button.addEventListener("click", handleSampleIdClick);
  });
  elements.contactForm.addEventListener("submit", handleContactSubmit);
  elements.contactForm.addEventListener("input", clearContactFieldError);
  elements.adminLoginForm.addEventListener("submit", openAdminWorkspace);
  elements.adminLoginForm.addEventListener("input", clearAdminLoginError);
  elements.closeAdmin.addEventListener("click", closeAdminWorkspace);
  elements.adminSearch.addEventListener("input", renderAdminReports);
  elements.categoryFilter.addEventListener("change", renderAdminReports);
  elements.statusFilter.addEventListener("change", renderAdminReports);
  elements.adminReportList.addEventListener("click", handleAdminReportClick);
  elements.adminDetail.addEventListener("submit", handleAdminStatusSubmit);
}

function createSampleReports() {
  const today = new Date();
  const dateOffset = (daysAgo) => {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
  };

  return [
    {
      id: "TC-2026-1042",
      category: "Public Service Misconduct",
      title: "Repeated delays in a public service office",
      description: "Several community members report being asked to return multiple times without clear information about the process. This sample report contains no personal names or contact information.",
      location: "Central district",
      incidentDate: "",
      status: "Under Investigation",
      createdAt: dateOffset(9),
      timeline: [
        { status: "Submitted", date: dateOffset(9), note: "Demo report received and assigned a tracking ID." },
        { status: "Under Review", date: dateOffset(7), note: "A reviewer checked the report category and available information." },
        { status: "Under Investigation", date: dateOffset(4), note: "The demo report moved to the investigation stage." }
      ]
    },
    {
      id: "TC-2026-1057",
      category: "Environmental Issues",
      title: "Community concern about waste disposal",
      description: "Residents have raised a concern about waste being left near a shared green space. The report is illustrative and does not name individuals.",
      location: "East community",
      incidentDate: dateOffset(13).slice(0, 10),
      status: "Under Review",
      createdAt: dateOffset(6),
      timeline: [
        { status: "Submitted", date: dateOffset(6), note: "Demo report received and assigned a tracking ID." },
        { status: "Under Review", date: dateOffset(3), note: "The report is being reviewed in this sample workflow." }
      ]
    },
    {
      id: "TC-2026-1081",
      category: "Human Rights Violation",
      title: "Request for clearer access to support services",
      description: "A community group has requested clearer information about how people can access local support. This sample is a general service-access concern.",
      location: "North region",
      incidentDate: "",
      status: "Resolved",
      createdAt: dateOffset(28),
      timeline: [
        { status: "Submitted", date: dateOffset(28), note: "Demo report received and assigned a tracking ID." },
        { status: "Under Review", date: dateOffset(25), note: "A reviewer checked the report category and available information." },
        { status: "Under Investigation", date: dateOffset(20), note: "The demo report moved to the investigation stage." },
        { status: "Resolved", date: dateOffset(8), note: "The sample issue was marked resolved with a general process update." }
      ]
    },
    {
      id: "TC-2026-1090",
      category: "Corruption",
      title: "Request for clearer procurement information",
      description: "Community members have asked for more accessible information about a local procurement process. This sample does not allege a finding of wrongdoing.",
      location: "West district",
      incidentDate: "",
      status: "Submitted",
      createdAt: dateOffset(1),
      timeline: [
        { status: "Submitted", date: dateOffset(1), note: "Demo report received and assigned a tracking ID." }
      ]
    }
  ];
}

function loadReports() {
  const samples = createSampleReports();
  let serialized;

  try {
    serialized = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    showToast("Browser storage is unavailable. Changes may not persist.");
    return samples;
  }

  if (!serialized) {
    return samples;
  }

  try {
    const stored = JSON.parse(serialized);
    if (Array.isArray(stored) && stored.every(isValidReport)) {
      return stored;
    }
  } catch {
    // Invalid local demo data is replaced with the sample records below.
  }

  showToast("Saved demo reports could not be read. Sample reports are shown.");
  return samples;
}

function isValidReport(report) {
  return isRecord(report)
    && typeof report.id === "string"
    && typeof report.category === "string"
    && typeof report.title === "string"
    && typeof report.description === "string"
    && REPORT_STATUSES.includes(report.status)
    && typeof report.createdAt === "string"
    && Number.isFinite(Date.parse(report.createdAt))
    && Array.isArray(report.timeline)
    && report.timeline.every((entry) => isRecord(entry)
      && typeof entry.status === "string"
      && typeof entry.date === "string"
      && typeof entry.note === "string");
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function saveReports() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    return true;
  } catch {
    showToast("The change is visible for this session, but could not be saved in browser storage.");
    return false;
  }
}

function toggleNavigation() {
  const isOpen = elements.menuToggle.getAttribute("aria-expanded") === "true";
  elements.menuToggle.setAttribute("aria-expanded", String(!isOpen));
  elements.menuToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
  elements.navigation.classList.toggle("is-open", !isOpen);
}

function handleNavigationClick(event) {
  if (event.target.closest("a") && elements.menuToggle.getAttribute("aria-expanded") === "true") {
    closeNavigation();
  }
}

function closeNavigation() {
  elements.menuToggle.setAttribute("aria-expanded", "false");
  elements.menuToggle.setAttribute("aria-label", "Open navigation menu");
  elements.navigation.classList.remove("is-open");
}

function handleReportSubmit(event) {
  event.preventDefault();
  if (elements.reportSubmit.disabled) {
    return;
  }

  const values = {
    category: elements.reportCategory.value,
    title: elements.reportTitle.value.trim(),
    description: elements.reportDescription.value.trim(),
    location: elements.reportLocation.value.trim(),
    incidentDate: elements.incidentDate.value
  };

  const isValid = validateReport(values);
  if (!isValid) {
    elements.reportForm.querySelector(".field-invalid")?.focus();
    return;
  }

  elements.reportSubmit.disabled = true;
  const report = {
    id: generateTrackingId(),
    ...values,
    status: "Submitted",
    createdAt: new Date().toISOString(),
    timeline: [{
      status: "Submitted",
      date: new Date().toISOString(),
      note: "Demo report received and assigned a tracking ID."
    }]
  };

  reports.unshift(report);
  const saved = saveReports();
  selectedAdminReportId = report.id;
  renderAdminReports();
  elements.formCard.querySelector("#report-form").hidden = true;
  elements.submissionSuccess.hidden = false;
  document.querySelector("#success-title").textContent = saved
    ? "Your report is saved in this browser."
    : "Your report is available for this session.";
  elements.generatedTrackingId.textContent = report.id;
  elements.copyFeedback.textContent = "";
  elements.reportSubmit.disabled = false;
  elements.submissionSuccess.scrollIntoView({ behavior: "smooth", block: "center" });
}

function validateReport(values) {
  const fields = [
    { input: elements.reportCategory, error: document.querySelector("#category-error"), value: values.category, label: "Choose a report category." },
    { input: elements.reportTitle, error: document.querySelector("#title-error"), value: values.title, label: "Add a short report title." },
    { input: elements.reportDescription, error: document.querySelector("#description-error"), value: values.description, label: "Describe what happened." }
  ];
  let valid = true;

  for (const field of fields) {
    const missing = field.value.length === 0;
    field.input.classList.toggle("field-invalid", missing);
    field.input.setAttribute("aria-invalid", String(missing));
    field.error.textContent = missing ? field.label : "";
    valid = valid && !missing;
  }

  return valid;
}

function generateTrackingId() {
  const year = new Date().getFullYear();
  let trackingId;

  do {
    const token = window.crypto?.getRandomValues
      ? Array.from(window.crypto.getRandomValues(new Uint8Array(4)), (value) => value.toString(16).padStart(2, "0")).join("").toUpperCase()
      : Math.random().toString(36).slice(2, 10).toUpperCase();
    trackingId = `TC-${year}-${token}`;
  } while (reports.some((report) => report.id === trackingId));

  return trackingId;
}

async function copyGeneratedTrackingId() {
  const trackingId = elements.generatedTrackingId.textContent;
  try {
    await copyText(trackingId);
    elements.copyFeedback.textContent = "Tracking ID copied.";
  } catch {
    elements.copyFeedback.textContent = "Copy was unavailable. Select and copy the ID above.";
  }
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const temporaryInput = document.createElement("textarea");
  temporaryInput.value = value;
  temporaryInput.setAttribute("readonly", "");
  temporaryInput.style.position = "fixed";
  temporaryInput.style.opacity = "0";
  document.body.append(temporaryInput);
  temporaryInput.select();
  const copied = document.execCommand("copy");
  temporaryInput.remove();

  if (!copied) {
    throw new Error("Copy command failed.");
  }
}

function resetReportForm() {
  elements.reportForm.reset();
  elements.reportForm.hidden = false;
  elements.submissionSuccess.hidden = true;
  elements.copyFeedback.textContent = "";
  updateDescriptionCount();
  clearReportFieldErrors();
  elements.reportCategory.focus();
}

function clearReportFieldErrors() {
  for (const errorId of ["category-error", "title-error", "description-error"]) {
    document.querySelector(`#${errorId}`).textContent = "";
  }
  elements.reportForm.querySelectorAll(".field-invalid").forEach((input) => {
    input.classList.remove("field-invalid");
    input.removeAttribute("aria-invalid");
  });
}

function updateDescriptionCount() {
  elements.descriptionCount.textContent = `${elements.reportDescription.value.length} / 3000`;
}

function handleTrackingSubmit(event) {
  event.preventDefault();
  const trackingId = elements.trackingIdInput.value.trim().toUpperCase();
  elements.trackingError.textContent = "";
  elements.trackingIdInput.classList.remove("field-invalid");
  elements.trackingIdInput.removeAttribute("aria-invalid");

  if (!trackingId) {
    setTrackingError("Enter a tracking ID to continue.");
    return;
  }

  const report = reports.find((item) => item.id.toUpperCase() === trackingId);
  if (!report) {
    setTrackingError("We couldn’t find that demo ID. Check it and try again.");
    elements.trackingResult.replaceChildren(createTrackingMessage(
      "No matching report was found. This prototype can only search reports saved in this browser."
    ));
    return;
  }

  renderTrackingResult(report);
}

function clearTrackingError() {
  elements.trackingError.textContent = "";
  elements.trackingIdInput.classList.remove("field-invalid");
  elements.trackingIdInput.removeAttribute("aria-invalid");
}

function setTrackingError(message) {
  elements.trackingError.textContent = message;
  elements.trackingIdInput.classList.add("field-invalid");
  elements.trackingIdInput.setAttribute("aria-invalid", "true");
  elements.trackingIdInput.focus();
}

function renderTrackingPrompt() {
  elements.trackingResult.replaceChildren(createTrackingMessage(
    "Enter a sample tracking ID to see the report’s status and public-safe updates."
  ));
}

function createTrackingMessage(message) {
  const paragraph = document.createElement("p");
  paragraph.className = "tracking-empty";
  paragraph.textContent = message;
  return paragraph;
}

function renderTrackingResult(report) {
  const article = document.createElement("article");
  article.className = "tracked-report-card";

  const header = document.createElement("div");
  header.className = "tracked-report-top";
  const reportCopy = document.createElement("div");
  const id = document.createElement("p");
  id.className = "tracked-report-id";
  id.textContent = report.id;
  const title = document.createElement("h3");
  title.className = "tracked-report-title";
  title.textContent = "Report status";
  const meta = document.createElement("p");
  meta.className = "tracked-report-meta";
  meta.textContent = `${report.category} · Submitted ${formatDate(report.createdAt)}`;
  reportCopy.append(id, title, meta);

  const status = document.createElement("span");
  status.className = `status-pill ${getStatusClass(report.status)}`;
  status.textContent = report.status;
  header.append(reportCopy, status);

  const progressHeader = document.createElement("div");
  progressHeader.className = "progress-heading";
  const progressLabel = document.createElement("span");
  progressLabel.textContent = "Demonstration progress";
  const progressValue = document.createElement("strong");
  progressValue.textContent = `${STATUS_PROGRESS[report.status]}%`;
  progressHeader.append(progressLabel, progressValue);

  const progressTrack = document.createElement("div");
  progressTrack.className = "progress-track";
  progressTrack.setAttribute("role", "progressbar");
  progressTrack.setAttribute("aria-label", `Demonstration report progress: ${STATUS_PROGRESS[report.status]} percent`);
  progressTrack.setAttribute("aria-valuemin", "0");
  progressTrack.setAttribute("aria-valuemax", "100");
  progressTrack.setAttribute("aria-valuenow", String(STATUS_PROGRESS[report.status]));
  const progressBar = document.createElement("span");
  progressBar.style.width = `${STATUS_PROGRESS[report.status]}%`;
  progressTrack.append(progressBar);

  const timeline = document.createElement("ol");
  timeline.className = "timeline";
  const orderedUpdates = [...report.timeline].sort((first, second) => Date.parse(first.date) - Date.parse(second.date));
  for (const update of orderedUpdates) {
    timeline.append(createTimelineItem(update));
  }

  const privacyNote = document.createElement("p");
  privacyNote.className = "tracking-privacy-note";
  privacyNote.textContent = "Only general status information is shown here. This local demo is not a secure reporting or tracking service.";
  article.append(header, progressHeader, progressTrack, timeline, privacyNote);
  elements.trackingResult.replaceChildren(article);
}

function createTimelineItem(update) {
  const item = document.createElement("li");
  item.className = "timeline-item";
  const dot = document.createElement("span");
  dot.className = "timeline-dot";
  dot.setAttribute("aria-hidden", "true");

  const copy = document.createElement("div");
  copy.className = "timeline-copy";
  const status = document.createElement("strong");
  status.textContent = update.status;
  const date = document.createElement("time");
  date.dateTime = update.date;
  date.textContent = formatDate(update.date);
  const note = document.createElement("p");
  note.textContent = update.note;
  copy.append(status, date, note);
  item.append(dot, copy);
  return item;
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(date);
}

function getStatusClass(status) {
  return `status-${status.toLowerCase().replace(/ /g, "-")}`;
}

function handleSampleIdClick(event) {
  const trackingId = event.currentTarget.dataset.sampleId;
  elements.trackingIdInput.value = trackingId;
  elements.trackingForm.requestSubmit();
  document.querySelector("#track").scrollIntoView({ behavior: "smooth", block: "start" });
}

function handleContactSubmit(event) {
  event.preventDefault();
  const fields = [
    { input: elements.contactName, error: elements.contactNameError, message: "Enter your name." },
    { input: elements.contactEmail, error: elements.contactEmailError, message: "Enter a valid email address." },
    { input: elements.contactMessage, error: elements.contactMessageError, message: "Write a short message." }
  ];
  let isValid = true;

  for (const field of fields) {
    const invalid = !field.input.value.trim() || !field.input.validity.valid;
    field.input.classList.toggle("field-invalid", invalid);
    field.input.setAttribute("aria-invalid", String(invalid));
    field.error.textContent = invalid ? field.message : "";
    isValid = isValid && !invalid;
  }

  if (!isValid) {
    elements.contactForm.querySelector(".field-invalid")?.focus();
    return;
  }

  elements.contactSuccess.hidden = false;
  elements.contactSuccess.focus();
  elements.contactForm.reset();
}

function clearContactFieldError(event) {
  const input = event.target;
  if (!input.matches("input, textarea")) {
    return;
  }

  const error = document.querySelector(`#${input.id}-error`);
  if (input.value.trim() && input.validity.valid && error) {
    error.textContent = "";
    input.classList.remove("field-invalid");
    input.removeAttribute("aria-invalid");
  }
}

function populateCategoryFilter() {
  const fragment = document.createDocumentFragment();
  for (const category of REPORT_CATEGORIES) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    fragment.append(option);
  }
  elements.categoryFilter.append(fragment);
}

function openAdminWorkspace(event) {
  event.preventDefault();
  const username = elements.adminUsername.value.trim();
  const password = elements.adminPassword.value;
  const missingUsername = username.length === 0;
  const missingPassword = password.length === 0;

  elements.adminUsername.setAttribute("aria-invalid", String(missingUsername));
  elements.adminPassword.setAttribute("aria-invalid", String(missingPassword));

  if (missingUsername || missingPassword) {
    elements.adminLoginError.textContent = "Enter both the demo username and password.";
    (missingUsername ? elements.adminUsername : elements.adminPassword).focus();
    return;
  }

  if (username !== "reviewer" || password !== "truth-demo") {
    elements.adminUsername.setAttribute("aria-invalid", String(username !== "reviewer"));
    elements.adminPassword.setAttribute("aria-invalid", String(password !== "truth-demo"));
    elements.adminLoginError.textContent = "Those demo credentials don’t match. Use the credentials shown here.";
    return;
  }

  elements.adminLoginError.textContent = "";
  elements.adminLoginForm.reset();
  elements.adminUsername.removeAttribute("aria-invalid");
  elements.adminPassword.removeAttribute("aria-invalid");
  elements.adminGate.hidden = true;
  elements.adminWorkspace.hidden = false;
  renderAdminReports();
  elements.adminWorkspace.scrollIntoView({ behavior: "smooth", block: "nearest" });
  elements.closeAdmin.focus({ preventScroll: true });
}

function clearAdminLoginError() {
  elements.adminLoginError.textContent = "";
  elements.adminUsername.removeAttribute("aria-invalid");
  elements.adminPassword.removeAttribute("aria-invalid");
}

function closeAdminWorkspace() {
  elements.adminWorkspace.hidden = true;
  elements.adminGate.hidden = false;
  elements.adminLoginForm.reset();
  clearAdminLoginError();
  elements.openAdmin.focus();
}

function getFilteredReports() {
  const query = elements.adminSearch.value.trim().toLocaleLowerCase();
  const category = elements.categoryFilter.value;
  const status = elements.statusFilter.value;

  return reports.filter((report) => {
    const matchesText = !query
      || report.id.toLocaleLowerCase().includes(query)
      || report.title.toLocaleLowerCase().includes(query);
    const matchesCategory = !category || report.category === category;
    const matchesStatus = !status || report.status === status;
    return matchesText && matchesCategory && matchesStatus;
  });
}

function renderAdminReports() {
  const filteredReports = getFilteredReports();
  const fragment = document.createDocumentFragment();

  if (filteredReports.length === 0) {
    const empty = document.createElement("p");
    empty.className = "admin-no-results";
    empty.textContent = "No demo reports match those filters.";
    fragment.append(empty);
  }

  for (const report of filteredReports) {
    fragment.append(createAdminReportItem(report));
  }
  elements.adminReportList.replaceChildren(fragment);

  const selectedIsVisible = filteredReports.some((report) => report.id === selectedAdminReportId);
  if (selectedIsVisible) {
    renderAdminDetail(getReportById(selectedAdminReportId));
  } else if (filteredReports.length > 0) {
    selectedAdminReportId = filteredReports[0].id;
    renderAdminDetail(filteredReports[0]);
  } else {
    selectedAdminReportId = null;
    elements.adminDetail.replaceChildren(createAdminEmptyDetail());
  }
}

function createAdminReportItem(report) {
  const button = document.createElement("button");
  button.className = "admin-report-item";
  button.type = "button";
  button.dataset.reportId = report.id;
  button.setAttribute("aria-pressed", String(report.id === selectedAdminReportId));
  const title = document.createElement("strong");
  title.textContent = report.title;
  const meta = document.createElement("span");
  meta.textContent = `${report.id} · ${report.status}`;
  button.append(title, meta);
  return button;
}

function handleAdminReportClick(event) {
  const button = event.target.closest("[data-report-id]");
  if (!button || !elements.adminReportList.contains(button)) {
    return;
  }

  selectedAdminReportId = button.dataset.reportId;
  renderAdminReports();
}

function getReportById(reportId) {
  return reports.find((report) => report.id === reportId);
}

function createAdminEmptyDetail() {
  const paragraph = document.createElement("p");
  paragraph.className = "admin-detail-empty";
  paragraph.textContent = "Choose a report from the queue to review its demo details.";
  return paragraph;
}

function renderAdminDetail(report) {
  if (!report) {
    elements.adminDetail.replaceChildren(createAdminEmptyDetail());
    return;
  }

  const fragment = document.createDocumentFragment();
  const header = document.createElement("div");
  header.className = "admin-detail-head";
  const headingCopy = document.createElement("div");
  const id = document.createElement("p");
  id.className = "admin-detail-id";
  id.textContent = report.id;
  const title = document.createElement("h4");
  title.textContent = report.title;
  headingCopy.append(id, title);
  const statusBadge = document.createElement("span");
  statusBadge.className = `status-pill ${getStatusClass(report.status)}`;
  statusBadge.textContent = report.status;
  header.append(headingCopy, statusBadge);

  const meta = document.createElement("div");
  meta.className = "admin-detail-meta";
  for (const value of [
    report.category,
    `Submitted ${formatDate(report.createdAt)}`,
    report.location ? `Location: ${report.location}` : "Location not provided",
    report.incidentDate ? `Incident date: ${report.incidentDate}` : "Incident date not provided"
  ]) {
    const tag = document.createElement("span");
    tag.className = "admin-meta-tag";
    tag.textContent = value;
    meta.append(tag);
  }

  const description = document.createElement("p");
  description.className = "admin-report-description";
  description.textContent = report.description;

  const form = document.createElement("form");
  form.className = "admin-status-form";
  form.dataset.reportId = report.id;
  const statusLabel = document.createElement("label");
  statusLabel.textContent = "Set status";
  const statusSelect = document.createElement("select");
  statusSelect.name = "status";
  for (const status of REPORT_STATUSES) {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    option.selected = status === report.status;
    statusSelect.append(option);
  }
  statusLabel.append(statusSelect);

  const updateLabel = document.createElement("label");
  updateLabel.textContent = "Public-safe progress note";
  const updateInput = document.createElement("input");
  updateInput.name = "note";
  updateInput.type = "text";
  updateInput.maxLength = 180;
  updateInput.placeholder = "Do not include sensitive details";
  updateLabel.append(updateInput);

  const submit = document.createElement("button");
  submit.type = "submit";
  submit.textContent = "Save update";
  form.append(statusLabel, updateLabel, submit);

  const timeline = document.createElement("ul");
  timeline.className = "admin-detail-timeline";
  for (const update of [...report.timeline].reverse().slice(0, 4)) {
    const item = document.createElement("li");
    const strong = document.createElement("strong");
    strong.textContent = `${update.status} · ${formatDate(update.date)} — `;
    const note = document.createTextNode(update.note);
    item.append(strong, note);
    timeline.append(item);
  }

  fragment.append(header, meta, description, form, timeline);
  elements.adminDetail.replaceChildren(fragment);
}

function handleAdminStatusSubmit(event) {
  const form = event.target.closest(".admin-status-form");
  if (!form) {
    return;
  }
  event.preventDefault();

  const report = getReportById(form.dataset.reportId);
  const formData = new FormData(form);
  const nextStatus = String(formData.get("status"));
  const note = String(formData.get("note")).trim();
  if (!report || !REPORT_STATUSES.includes(nextStatus)) {
    showToast("That report update could not be applied.");
    return;
  }

  if (nextStatus === report.status && !note) {
    showToast("Choose a different status or add a public-safe progress note.");
    return;
  }

  const updateNote = note || `The demo report status changed to ${nextStatus}.`;
  report.status = nextStatus;
  report.timeline.push({
    status: nextStatus,
    date: new Date().toISOString(),
    note: updateNote
  });
  const saved = saveReports();
  renderAdminReports();
  showToast(saved
    ? "Demo report update saved in this browser."
    : "Demo report update is available for this session but could not be saved.");
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.textContent = message;
  elements.toastRegion.replaceChildren(toast);
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.remove(), 4200);
}
