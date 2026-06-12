const DATA = window.COURSE_DATA;
const views = document.querySelectorAll(".view");
const navs = document.querySelectorAll(".nav");
const title = document.getElementById("view-title");
const titles = {
  dashboard:"דף הבית", course:"הקורס המלא", lesson:"שיעור נבחר", models:"זירת LLM",
  lab:"מעבדת סוכנים", glossary:"מילון מונחים", project:"פרויקט מסכם", github:"עדכון האתר"
};

function show(view){
  views.forEach(v=>v.classList.toggle("active",v.id===view));
  navs.forEach(n=>n.classList.toggle("active",n.dataset.view===view));
  title.textContent=titles[view]||"";
  scrollTo({top:0,behavior:"smooth"});
}
navs.forEach(n=>n.addEventListener("click",()=>show(n.dataset.view)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>show(b.dataset.go)));

function lessonDoneKey(id){return "agentAcademyV2_"+id}
function renderModules(){
  const box=document.getElementById("modules-list");
  box.innerHTML="";
  DATA.modules.forEach(m=>{
    const module=document.createElement("article");
    module.className="module";
    module.innerHTML=`<div class="module-head"><div><span class="eyebrow">${m.goal}</span><h3>${m.title}</h3><p>${m.subtitle}</p></div><b>${m.lessons.length} שיעורים</b></div><div class="lesson-list"></div>`;
    const list=module.querySelector(".lesson-list");
    m.lessons.forEach(l=>{
      const c=document.createElement("div");
      c.className="lesson-card";
      const checked=localStorage.getItem(lessonDoneKey(l.id))==="true"?"checked":"";
      c.innerHTML=`<h4>${l.title}</h4><small>${l.duration} · ${l.level}</small><label><input type="checkbox" ${checked} data-done="${l.id}"> הושלם</label>`;
      c.addEventListener("click",(e)=>{ if(e.target.tagName!=="INPUT") openLesson(l.id); });
      list.appendChild(c);
    });
    box.appendChild(module);
  });
  document.querySelectorAll("[data-done]").forEach(ch=>{
    ch.addEventListener("change",e=>{
      localStorage.setItem(lessonDoneKey(e.target.dataset.done),e.target.checked);
      updateProgress();
    });
  });
}
function findLesson(id){
  for(const m of DATA.modules){ const l=m.lessons.find(x=>x.id===id); if(l) return {lesson:l,module:m}; }
}
function openLesson(id){
  const found=findLesson(id); if(!found) return;
  const l=found.lesson, m=found.module;
  const detail=document.getElementById("lesson-detail");
  detail.className="lesson-detail";
  detail.innerHTML=`
    <span class="eyebrow">${m.title}</span>
    <h2 class="lesson-title">${l.title}</h2>
    <div class="meta"><span class="pill">${l.duration}</span><span class="pill">${l.level}</span><span class="pill">${l.deliverable}</span></div>
    <section class="lesson-section"><h3>מטרות השיעור</h3><ul>${l.objectives.map(x=>`<li>${x}</li>`).join("")}</ul></section>
    <section class="lesson-section"><h3>הסבר</h3><p>${l.explanation}</p></section>
    <section class="lesson-section"><h3>דוגמה מהעבודה שלך</h3><p>${l.work_example}</p></section>
    <section class="lesson-section"><h3>מונחים חשובים</h3><p>${(l.terms&&l.terms.length?l.terms:["Agent","Tool","Output","Guardrail"]).map(t=>`<span class="pill">${t}</span>`).join(" ")}</p></section>
    <section class="lesson-section"><h3>תרגיל</h3><p>${l.exercise}</p></section>
    <section class="lesson-section"><h3>תוצר</h3><p>${l.deliverable}</p></section>
    <section class="lesson-section"><h3>בדיקת איכות</h3><ul class="checklist">${l.quality_check.map(x=>`<li>✓ ${x}</li>`).join("")}</ul></section>
    <div class="actions"><button class="primary" id="mark-current">סמן שיעור כהושלם</button><button class="secondary" data-go="course">חזרה לקורס</button></div>
  `;
  document.getElementById("mark-current").addEventListener("click",()=>{
    localStorage.setItem(lessonDoneKey(id),"true");
    renderModules(); updateProgress();
  });
  detail.querySelector("[data-go]").addEventListener("click",()=>show("course"));
  show("lesson");
}
function updateProgress(){
  const all=DATA.modules.flatMap(m=>m.lessons);
  const done=all.filter(l=>localStorage.getItem(lessonDoneKey(l.id))==="true").length;
  const pct=Math.round(done/(all.length||1)*100);
  document.getElementById("progress-num").textContent=pct+"%";
  document.getElementById("progress-bar").style.width=pct+"%";
}
function renderGlossary(){
  const list=document.getElementById("glossary-list");
  list.innerHTML=DATA.glossary.map(([term,def])=>`<article class="term" data-term="${term} ${def}"><h3>${term}</h3><p>${def}</p></article>`).join("");
}
document.getElementById("glossary-search").addEventListener("input",e=>{
  const q=e.target.value.toLowerCase();
  document.querySelectorAll(".term").forEach(t=>t.style.display=t.dataset.term.toLowerCase().includes(q)?"block":"none");
});

const form=document.getElementById("agent-form");
function makeSpec(){
  const d=Object.fromEntries(new FormData(form).entries());
  const spec={
    agentName:d.name||"לא הוגדר",
    goal:d.goal||"לא הוגדר",
    inputs:d.inputs||"לא הוגדר",
    outputs:d.outputs||"לא הוגדר",
    allowedTools:d.tools||"לא הוגדר",
    forbiddenActions:d.forbidden||"לא הוגדר",
    humanApprovalRequiredWhen:d.approval||"לא הוגדר",
    evaluation:d.evals||"לא הוגדר",
    autonomyLevel:"שלב ראשון: קריאה, ניתוח והצעה בלבד. אין פעולה בעולם ללא אישור."
  };
  document.getElementById("spec-output").textContent=JSON.stringify(spec,null,2);
}
document.getElementById("make-spec").addEventListener("click",makeSpec);
document.getElementById("example-spec").addEventListener("click",()=>{
  form.name.value="סוכן קליטת משימות ואירועים";
  form.goal.value="לקבל טקסט חופשי ממנשה ולהפוך אותו למשימות, החלטות, מעקבים ושאלות פתוחות.";
  form.inputs.value="טקסט חופשי בעברית, מייל מועתק, תמלול ישיבה, רעיון קצר.";
  form.outputs.value="project, decisions, tasks, owner, dueDate, followUp, openQuestions, requiresApproval.";
  form.tools.value="שלב 1: ללא כלים. שלב 2: addTaskToSheet. שלב 3: createDraftEmail.";
  form.forbidden.value="לא לשלוח מייל, לא למחוק מידע, לא לקבוע פגישה, לא להמציא תאריך או אחראי.";
  form.approval.value="חסר אחראי, חסר תאריך, כמה פרויקטים אפשריים, פעולה מול אדם אחר, מידע רגיש.";
  form.evals.value="זיהוי נכון של משימות, אפס המצאת תאריכים, JSON תקין, אפס פעולות בלי אישור.";
  makeSpec();
});
document.getElementById("copy-spec").addEventListener("click",async()=>{
  await navigator.clipboard.writeText(document.getElementById("spec-output").textContent);
  alert("המפרט הועתק");
});
renderModules(); renderGlossary(); updateProgress();
