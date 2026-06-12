const DATA = window.COURSE_DATA;
const views = document.querySelectorAll(".view");
const navs = document.querySelectorAll(".nav");
const viewTitle = document.getElementById("viewTitle");
const titles = {
  home:"דף הבית", curriculum:"הקורס המלא", lesson:"שיעור", workbook:"חוברת עבודה",
  lab:"מעבדת סוכן", glossary:"מילון", capstone:"פרויקט מסכם", sources:"מקורות ועדכון"
};

function show(view){
  views.forEach(v=>v.classList.toggle("active", v.id===view));
  navs.forEach(n=>n.classList.toggle("active", n.dataset.view===view));
  viewTitle.textContent = titles[view] || "";
  window.scrollTo({top:0, behavior:"smooth"});
}
navs.forEach(n=>n.addEventListener("click",()=>show(n.dataset.view)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>show(b.dataset.go)));

function doneKey(id){return "agentAcademyFull_"+id}
function allLessons(){return DATA.modules.flatMap(m=>m.lessons)}
function updateProgress(){
  const lessons = allLessons();
  const done = lessons.filter(l=>localStorage.getItem(doneKey(l.id))==="true").length;
  const pct = Math.round(done/(lessons.length || 1)*100);
  document.getElementById("progressText").textContent = pct + "%";
  document.getElementById("progressBar").style.width = pct + "%";
}
function renderModules(){
  const box = document.getElementById("modules");
  box.innerHTML = "";
  DATA.modules.forEach(m=>{
    const el = document.createElement("article");
    el.className = "module";
    el.innerHTML = `
      <div class="moduleHead">
        <div>
          <span class="eyebrow">${m.promise}</span>
          <h3>${m.title}</h3>
          <p>${m.lessons.length} שיעורים · תוצר מודול: ${m.project}</p>
        </div>
        <span class="projectPill">${m.project}</span>
      </div>
      <div class="lessonGrid"></div>
    `;
    const grid = el.querySelector(".lessonGrid");
    m.lessons.forEach(l=>{
      const c = document.createElement("div");
      c.className = "lessonCard";
      const checked = localStorage.getItem(doneKey(l.id))==="true" ? "checked" : "";
      c.innerHTML = `
        <h4>${l.title}</h4>
        <small>${l.duration} · ${l.difficulty}</small>
        <p>${l.summary}</p>
        <label><input type="checkbox" data-done="${l.id}" ${checked}> הושלם</label>
      `;
      c.addEventListener("click", e => {
        if(e.target.tagName !== "INPUT") openLesson(l.id);
      });
      grid.appendChild(c);
    });
    box.appendChild(el);
  });
  document.querySelectorAll("[data-done]").forEach(ch=>{
    ch.addEventListener("change", e=>{
      localStorage.setItem(doneKey(e.target.dataset.done), e.target.checked);
      updateProgress();
    });
  });
}
function findLesson(id){
  for(const m of DATA.modules){
    const l = m.lessons.find(x=>x.id===id);
    if(l) return {module:m, lesson:l};
  }
}
function renderRubric(rows){
  return `<table><thead><tr><th>קריטריון</th><th>מצוין</th><th>דורש שיפור</th></tr></thead><tbody>
    ${rows.map(r=>`<tr><td>${r.criterion}</td><td>${r.excellent}</td><td>${r.needsWork}</td></tr>`).join("")}
  </tbody></table>`;
}
function openLesson(id){
  const found = findLesson(id);
  if(!found) return;
  const {module:m, lesson:l} = found;
  const box = document.getElementById("lessonBox");
  box.innerHTML = `
    <span class="eyebrow">${m.title}</span>
    <h2 class="lessonTitle">${l.title}</h2>
    <div class="meta">
      <span class="pill">${l.duration}</span>
      <span class="pill">${l.difficulty}</span>
      <span class="pill">תוצר: ${m.project}</span>
    </div>

    <section class="lessonSection"><h3>פתיחה</h3><p>${l.opening}</p></section>

    <section class="lessonSection"><h3>מטרות למידה</h3><ul>${l.learningGoals.map(x=>`<li>${x}</li>`).join("")}</ul></section>

    <section class="lessonSection"><h3>הסבר עומק</h3>${l.deepDive.map(p=>`<p>${p}</p>`).join("")}</section>

    <section class="lessonSection"><h3>דוגמה מודרכת מהעבודה שלך</h3><p>${l.workedExample}</p></section>

    <section class="lessonSection"><h3>טעויות נפוצות</h3><ul>${l.commonMistakes.map(x=>`<li>${x}</li>`).join("")}</ul></section>

    <section class="lessonSection"><h3>תרגול מודרך</h3><ol>${l.guidedPractice.map(x=>`<li>${x}</li>`).join("")}</ol></section>

    <section class="lessonSection"><h3>תרגיל</h3><p>${l.exercise}</p></section>

    <section class="lessonSection"><h3>משימת תיק פרויקט</h3><p>${l.assignment}</p></section>

    <section class="lessonSection"><h3>תבנית פרומפט</h3><pre class="rtlpre">${l.promptTemplate}</pre><button class="secondary copyBtn" data-copy="prompt">העתק פרומפט</button></section>

    <section class="lessonSection"><h3>דוגמת JSON</h3><pre>${l.jsonExample}</pre><button class="secondary copyBtn" data-copy="json">העתק JSON</button></section>

    <section class="lessonSection rubric"><h3>רובריקת בדיקה</h3>${renderRubric(l.rubric)}</section>

    <section class="lessonSection"><h3>הצעד הבא</h3><p>${l.nextStep}</p></section>

    <div class="actions">
      <button class="primary" id="markDone">סמן שיעור כהושלם</button>
      <button class="secondary" data-go="curriculum">חזרה לקורס</button>
    </div>
  `;
  document.getElementById("markDone").addEventListener("click",()=>{
    localStorage.setItem(doneKey(id), "true");
    renderModules(); updateProgress();
    alert("השיעור סומן כהושלם");
  });
  box.querySelector("[data-go]").addEventListener("click",()=>show("curriculum"));
  box.querySelector('[data-copy="prompt"]').addEventListener("click",()=>copyText(l.promptTemplate));
  box.querySelector('[data-copy="json"]').addEventListener("click",()=>copyText(l.jsonExample));
  show("lesson");
}
async function copyText(txt){
  await navigator.clipboard.writeText(txt);
  alert("הועתק");
}
function renderTemplates(){
  const box = document.getElementById("templates");
  box.innerHTML = DATA.templates.map((t,i)=>`
    <article class="card">
      <h3>${t.title}</h3>
      <pre class="rtlpre" id="template${i}">${t.body}</pre>
      <button class="secondary copyBtn" data-template="${i}">העתק תבנית</button>
    </article>
  `).join("");
  document.querySelectorAll("[data-template]").forEach(btn=>{
    btn.addEventListener("click",()=>copyText(DATA.templates[Number(btn.dataset.template)].body));
  });
}
function renderGlossary(){
  const list = document.getElementById("glossaryList");
  list.innerHTML = DATA.glossary.map(([term,def])=>`
    <article class="term" data-term="${term} ${def}">
      <h3>${term}</h3>
      <p>${def}</p>
    </article>
  `).join("");
}
document.getElementById("glossarySearch").addEventListener("input",e=>{
  const q = e.target.value.toLowerCase();
  document.querySelectorAll(".term").forEach(t=>{
    t.style.display = t.dataset.term.toLowerCase().includes(q) ? "block" : "none";
  });
});
function renderSources(){
  document.getElementById("sourcesList").innerHTML = DATA.sources.map(s=>`
    <li><strong>${s.title}</strong><br><span class="sourceLink">${s.url}</span></li>
  `).join("");
}
function buildSpec(){
  const d = Object.fromEntries(new FormData(document.getElementById("specForm")).entries());
  const spec = {
    agentName: d.name || "לא הוגדר",
    goal: d.goal || "לא הוגדר",
    inputs: d.inputs || "לא הוגדר",
    outputs: d.outputs || "לא הוגדר",
    tools: d.tools || "שלב ראשון: ללא כלים",
    forbiddenActions: d.forbidden || "לא הוגדר",
    humanApproval: d.approval || "לא הוגדר",
    evals: d.evals || "לא הוגדר",
    autonomyLevel: "מתחילים מ־Read Only. פעולה בעולם רק אחרי בדיקות ואישור."
  };
  document.getElementById("specOutput").textContent = JSON.stringify(spec, null, 2);
}
document.getElementById("buildSpec").addEventListener("click", buildSpec);
document.getElementById("fillExample").addEventListener("click", ()=>{
  const f = document.getElementById("specForm");
  f.name.value = "סוכן קליטת משימות ואירועים";
  f.goal.value = "לקבל טקסט חופשי, מייל או תמלול ולהחזיר משימות, החלטות, אחראים, תאריכים, שאלות פתוחות ודרישת אישור.";
  f.inputs.value = "טקסט חופשי בעברית; מייל מועתק; תמלול ישיבה; רעיון קצר; סיכום שיחה.";
  f.outputs.value = "project, decisions, tasks, owner, dueDate, followUp, openQuestions, riskLevel, requiresHumanApproval.";
  f.tools.value = "שלב 1: ללא כלים. שלב 2: addTaskToSheet. שלב 3: createDraftEmail. שלב 4: suggestCalendarEvent.";
  f.forbidden.value = "לא לשלוח מייל; לא למחוק; לא לקבוע פגישה; לא להמציא תאריך; לא לשנות נתונים רשמיים; לא לחשוף מידע רגיש.";
  f.approval.value = "חסר אחראי; חסר תאריך; כמה פרויקטים אפשריים; פעולה מול אדם אחר; מידע רגיש; פעולה אדומה.";
  f.evals.value = "JSON תקין; זיהוי לפחות 90% מהמשימות; אפס המצאת תאריכים; סימון חוסרים; פעולה רק באישור.";
  buildSpec();
});
document.getElementById("copySpec").addEventListener("click",()=>copyText(document.getElementById("specOutput").textContent));

renderModules();
renderTemplates();
renderGlossary();
renderSources();
updateProgress();
