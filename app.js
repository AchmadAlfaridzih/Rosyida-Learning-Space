const API_URL = "https://sahabat-rosyida-learning-ai.alfaridzy87.workers.dev";
const $ = (id) => document.getElementById(id);
const views = ["home","research","method","review","emotional","assistant","progress"];
let language = "id";
let selectedFeeling = "Lelah";
let chatHistory = [];

function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2600)}
function go(view){views.forEach(v=>$("view-"+v).classList.toggle("active",v===view));document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===view));$("crumb").textContent=({home:"Beranda",research:"Research Navigator",method:"Methodology Center",review:"Writing Reviewer",emotional:"Emotional Space",assistant:"Sahabat Rosyida",progress:"Progress Planner"})[view];$("sidebar").classList.remove("open");window.scrollTo({top:0,behavior:"smooth"})}
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.view)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.go)));
$("mobileMenu").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
$("langToggle").addEventListener("click",()=>{language=language==="id"?"en":"id";toast(language==="en"?"English mode is planned for the next iteration.":"Mode Bahasa Indonesia aktif. Versi bilingual akan disempurnakan pada iterasi berikutnya.")});
$("signInBtn").addEventListener("click",()=>$("modalBackdrop").classList.add("show"));
$("profileBtn").addEventListener("click",()=>$("modalBackdrop").classList.add("show"));
$("modalClose").addEventListener("click",()=>$("modalBackdrop").classList.remove("show"));
$("modalBackdrop").addEventListener("click",e=>{if(e.target===$("modalBackdrop"))$("modalBackdrop").classList.remove("show")});
$("saveProfile").addEventListener("click",()=>{const name=$("profileName").value.trim();if(!name){toast("Masukkan nama panggilan terlebih dahulu.");return}localStorage.setItem("rls_profile",JSON.stringify({name,level:$("profileLevel").value}));$("profileBtn").querySelector("b").textContent=name;$("profileBtn").querySelector("small").textContent=$("profileLevel").value+" · lokal";$("modalBackdrop").classList.remove("show");toast("Profil lokal berhasil disimpan.")});
const profile=JSON.parse(localStorage.getItem("rls_profile")||"null");if(profile){$("profileBtn").querySelector("b").textContent=profile.name;$("profileBtn").querySelector("small").textContent=profile.level+" · lokal";$("profileName").value=profile.name;$("profileLevel").value=profile.level}

function showResult(id,text){const el=$(id);el.classList.remove("empty-state");el.classList.add("result-content");el.textContent=text}
function fallbackMessage(){return "AI belum terhubung. Untuk mengaktifkannya, deploy backend Cloudflare Worker sesuai README, lalu isi API_URL di app.js dengan URL Worker. Jangan pernah menaruh API key di file frontend."}
async function askAI(message, mode="general", targetId=null){
  if(!API_URL){if(targetId)showResult(targetId,fallbackMessage());else addMessage("bot",fallbackMessage());return null}
  try{
    const response=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message,mode,history:chatHistory.slice(-10)})});
    if(!response.ok)throw new Error("HTTP "+response.status);
    const data=await response.json();const answer=data.reply||"AI belum memberikan jawaban.";
    if(targetId)showResult(targetId,answer);return answer;
  }catch(err){const msg="Koneksi AI belum berhasil. Periksa URL backend, konfigurasi API, atau kuota layanan AI. ("+err.message+")";if(targetId)showResult(targetId,msg);else addMessage("bot",msg);return null}
}
$("researchAsk").addEventListener("click",()=>{const interest=$("rInterest").value.trim();if(!interest){toast("Ceritakan minat atau fenomena penelitianmu.");return}const prompt=`Bertindak sebagai konsultan riset akademik. Jenjang: ${$("rLevel").value}. Bidang: ${$("rField").value}. Minat/fenomena: ${interest}. Kendala: ${$("rStage").value}. Bantu petakan isu, pertanyaan klarifikasi, alternatif fokus, kemungkinan gap yang perlu diverifikasi, dan langkah berikutnya. Jangan mengarang referensi atau mengklaim novelty tanpa telaah literatur.`;askAI(prompt,"research","researchResult")});
$("methodAsk").addEventListener("click",()=>{const q=$("mQuestion").value.trim();if(!q){toast("Tuliskan tujuan atau pertanyaan penelitian.");return}const prompt=`Bertindak sebagai konsultan metodologi. Jenjang: ${$("mLevel").value}. Pendekatan yang dipertimbangkan: ${$("mApproach").value}. Tujuan/pertanyaan penelitian: ${q}. Evaluasi kesesuaian pendekatan, berikan alternatif desain, unit analisis, sumber data, teknik pengumpulan dan analisis data, serta keterbatasan. Jelaskan bahwa keputusan akhir harus disesuaikan dengan disiplin ilmu dan arahan pembimbing.`;askAI(prompt,"methodology","methodResult")});
$("reviewAsk").addEventListener("click",()=>{const t=$("wText").value.trim();if(t.length<80){toast("Masukkan teks minimal 80 karakter agar dapat ditinjau.");return}const prompt=`Bertindak sebagai reviewer akademik yang konstruktif. Jenjang/karya: ${$("wLevel").value}. Bagian: ${$("wPart").value}. Tinjau teks berikut: \n\n${t}\n\nBerikan: (1) ringkasan penilaian, (2) kekuatan, (3) kelemahan substantif, (4) komentar spesifik dengan kutipan frasa yang relevan, (5) prioritas revisi, (6) contoh perbaikan satu bagian. Jangan memberi skor numerik seolah-olah tervalidasi. Jangan mengarang sumber.`;askAI(prompt,"review","reviewResult")});
document.querySelectorAll(".chip").forEach(c=>c.addEventListener("click",()=>{document.querySelectorAll(".chip").forEach(x=>x.classList.remove("selected"));c.classList.add("selected");selectedFeeling=c.textContent}));
$("emotionAsk").addEventListener("click",()=>{const t=$("eText").value.trim();if(!t){toast("Tuliskan sedikit tentang perasaan atau situasimu.");return}const prompt=`Kamu adalah pendamping refleksi yang hangat, tidak menghakimi, dan bukan psikolog atau alat diagnosis. Mahasiswa sedang merasa: ${selectedFeeling}. Cerita: ${t}. Tanggapi dengan empati, bantu validasi emosi tanpa mengasumsikan diagnosis, ajukan maksimal dua pertanyaan reflektif, lalu tawarkan satu atau dua langkah kecil yang realistis. Jangan memaksa optimisme. Jika ada indikasi bahaya langsung atau menyakiti diri, prioritaskan keselamatan dan arahkan mencari bantuan manusia/profesional atau layanan darurat setempat.`;askAI(prompt,"emotional","emotionResult")});

function addMessage(role,text){const box=document.createElement("div");box.className="message "+role;const avatar=document.createElement("div");avatar.className="message-avatar";avatar.textContent=role==="bot"?"R":"M";const bubble=document.createElement("div");bubble.className="bubble";bubble.textContent=text;if(role==="bot"){box.append(avatar,bubble)}else{box.append(bubble)}$("chatMessages").append(box);$("chatMessages").scrollTop=$("chatMessages").scrollHeight}
async function sendChat(){const text=$("chatInput").value.trim();if(!text)return;$("chatInput").value="";addMessage("user",text);chatHistory.push({role:"user",content:text});if(!API_URL){addMessage("bot",fallbackMessage());return}const answer=await askAI(text,"general");if(answer){chatHistory.push({role:"assistant",content:answer});addMessage("bot",answer)}}
$("sendChat").addEventListener("click",sendChat);$("chatInput").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChat()}});
document.querySelectorAll(".suggestion").forEach(b=>b.addEventListener("click",()=>{$("chatInput").value=b.textContent;sendChat()}));
$("clearChat").addEventListener("click",()=>{$("chatMessages").innerHTML="";chatHistory=[];addMessage("bot","Percakapan dibersihkan. Ada hal baru yang ingin kamu diskusikan?")});

let tasks=JSON.parse(localStorage.getItem("rls_tasks")||"[]");
function renderTasks(){const list=$("taskList");$("taskCount").textContent=tasks.length+" target";if(!tasks.length){list.className="task-list empty-state";list.textContent="Belum ada target. Tambahkan satu langkah kecil untuk memulai.";return}list.className="task-list";list.innerHTML="";tasks.forEach((t,i)=>{const row=document.createElement("div");row.className="task-row"+(t.done?" done":"");const cb=document.createElement("input");cb.type="checkbox";cb.checked=t.done;cb.addEventListener("change",()=>{tasks[i].done=cb.checked;saveTasks()});const info=document.createElement("div");info.style.flex="1";const name=document.createElement("div");name.className="task-name";name.textContent=t.name;const meta=document.createElement("div");meta.className="task-meta";meta.textContent=t.stage+(t.date?" · "+t.date:"");info.append(name,meta);const del=document.createElement("button");del.className="delete-task";del.textContent="×";del.addEventListener("click",()=>{tasks.splice(i,1);saveTasks()});row.append(cb,info,del);list.append(row)})}
function saveTasks(){localStorage.setItem("rls_tasks",JSON.stringify(tasks));renderTasks()}
$("addTask").addEventListener("click",()=>{const name=$("taskInput").value.trim();if(!name){toast("Tuliskan target yang ingin dicapai.");return}tasks.push({name,date:$("taskDate").value,stage:$("taskStage").value,done:false});$("taskInput").value="";saveTasks();toast("Target berhasil ditambahkan.")});
renderTasks();
