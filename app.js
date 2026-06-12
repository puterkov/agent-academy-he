const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll(".nav-link");
const pageTitle = document.getElementById("page-title");

const pageNames = {
  home: "דף הבית",
  roadmap: "מסלול הלמידה",
  models: "זירת ה־LLM",
  lab: "מעבדת הסוכנים",
  glossary: "מילון מונחים",
  exercises: "תרגילים",
  project: "הפרויקט שלי"
};

function showPage(id) {
  pages.forEach(page => page.classList.toggle("active", page.id === id));
  navLinks.forEach(link => link.classList.toggle("active", link.dataset.page === id));
  pageTitle.textContent = pageNames[id] || "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

navLinks.forEach(link => {
  link.addEventListener("click", () => showPage(link.dataset.page));
});

document.querySelectorAll("[data-jump]").forEach(btn => {
  btn.addEventListener("click", () => showPage(btn.dataset.jump));
});

const checks = document.querySelectorAll(".progress-check");
const progressPercent = document.getElementById("progress-percent");
const progressBar = document.getElementById("progress-bar");

function loadProgress() {
  checks.forEach(check => {
    check.checked = localStorage.getItem("agentAcademy_" + check.dataset.key) === "true";
  });
  updateProgress();
}

function updateProgress() {
  const total = checks.length || 1;
  const done = Array.from(checks).filter(c => c.checked).length;
  const percent = Math.round(done / total * 100);
  progressPercent.textContent = percent + "%";
  progressBar.style.width = percent + "%";
}

checks.forEach(check => {
  check.addEventListener("change", () => {
    localStorage.setItem("agentAcademy_" + check.dataset.key, check.checked);
    updateProgress();
  });
});

loadProgress();

const glossarySearch = document.getElementById("glossary-search");
if (glossarySearch) {
  glossarySearch.addEventListener("input", () => {
    const q = glossarySearch.value.trim().toLowerCase();
    document.querySelectorAll(".glossary-card").forEach(card => {
      const text = (card.dataset.term + " " + card.textContent).toLowerCase();
      card.style.display = text.includes(q) ? "block" : "none";
    });
  });
}

const form = document.getElementById("agent-form");
const specOutput = document.getElementById("spec-output");

function getFormData() {
  const data = new FormData(form);
  return Object.fromEntries(data.entries());
}

function generateSpec() {
  const d = getFormData();
  const spec = {
    agentName: d.agentName || "שם הסוכן לא הוגדר",
    role: d.role || "לא הוגדר",
    input: d.input || "לא הוגדר",
    output: d.output || "לא הוגדר",
    allowedTools: d.tools || "לא הוגדר",
    forbiddenActions: d.forbidden || "לא הוגדר",
    mustAskHumanWhen: d.approval || "לא הוגדר",
    evaluationCriteria: d.eval || "לא הוגדר",
    autonomyLevel: "שלב ראשון: קריאה, ניתוח והצעה בלבד. ללא פעולות בעולם בלי אישור."
  };
  specOutput.textContent = JSON.stringify(spec, null, 2);
}

document.getElementById("generate-spec")?.addEventListener("click", generateSpec);

document.getElementById("fill-example")?.addEventListener("click", () => {
  form.agentName.value = "סוכן קליטת משימות ואירועים";
  form.role.value = "לקבל טקסט חופשי ממנשה ולהפוך אותו למשימות, החלטות, מעקבים ושאלות פתוחות.";
  form.input.value = "טקסט חופשי בעברית, מייל מועתק, תמלול ישיבה או רעיון קצר.";
  form.output.value = "project, decisions, tasks, owners, dueDates, followUps, openQuestions, requiresApproval";
  form.tools.value = "בשלב ראשון אין כלים. בשלב שני: addTaskToSheet. בשלב שלישי: createDraftEmail.";
  form.forbidden.value = "לא לשלוח מיילים, לא למחוק מידע, לא לקבוע פגישות, לא להמציא תאריכים, לא לשנות נתונים רשמיים.";
  form.approval.value = "כאשר חסר אחראי, חסר תאריך, יש כמה פרויקטים אפשריים, או נדרשת פעולה מול אדם אחר.";
  form.eval.value = "זיהוי נכון של משימות, אפס המצאת תאריכים, פלט מובנה תקין, ואפס פעולות בלי אישור.";
  generateSpec();
});

document.getElementById("copy-spec")?.addEventListener("click", async () => {
  await navigator.clipboard.writeText(specOutput.textContent);
  alert("האפיון הועתק");
});

const templates = {
  exercise1:
`קלט:
[הדבק כאן טקסט מבולגן מהעבודה]

הפלט הרצוי:
- פרויקט:
- החלטות:
- משימות:
  1. משימה:
     אחראי:
     תאריך:
     סטטוס:
- שאלות פתוחות:
- דברים שדורשים אישור מנשה:
- דברים שאסור לסוכן לעשות לבד:`,

  exercise2:
`Agent Spec:
שם הסוכן:
תפקיד:
קלט:
פלט:
כלים:
זיכרון:
פעולות אסורות:
נקודות עצירה:
בדיקת איכות:
רמת אוטונומיה:
סיכון מרכזי:`,

  exercise3:
`רשימת פעולות אסורות:
1. לא לשלוח מייל בלי אישור מפורש.
2. לא למחוק מיילים או קבצים.
3. לא לשנות ציונים או נתוני סטודנטים.
4. לא לקבוע פגישות עם אנשים בלי אישור.
5. לא להעביר מידע רגיש לגורם חיצוני.
6. לא להמציא תאריכים, אחראים או החלטות.
7. לא לבצע פעולה כספית או מכרזית.`,

  exercise4:
`ניסוי השוואת LLMs:
משימה:
קלט זהה:
פלט רצוי:

מודלים שנבדקו:
- OpenAI:
- Claude:
- Gemini:
- מודל פתוח/מקומי:

מדדים:
דיוק:
הבנת עברית:
פלט JSON:
לא המציא:
מהירות:
עלות:
חיבור לכלים:
תחזוקה:

מסקנה:
לאיזו משימה הייתי בוחר כל מודל?`
};

const templateOutput = document.getElementById("template-output");
document.querySelectorAll("[data-template]").forEach(btn => {
  btn.addEventListener("click", () => {
    templateOutput.textContent = templates[btn.dataset.template] || "";
  });
});

document.getElementById("copy-template")?.addEventListener("click", async () => {
  await navigator.clipboard.writeText(templateOutput.textContent);
  alert("התבנית הועתקה");
});
