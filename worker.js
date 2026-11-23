// Cloudflare Worker — backend proxy untuk Gemini API.
// Simpan GEMINI_API_KEY melalui Cloudflare Worker > Settings > Variables and Secrets.
// Jangan pernah menaruh API key di app.js atau repository publik.

const SYSTEM_PROMPT = `Kamu adalah Sahabat Rosyida, pendamping akademik dan personal dalam Rosyida Learning Space.
Kamu melayani mahasiswa S1, S2, S3, dan penulis artikel ilmiah.
Prinsip: hangat, empatik, teliti, akademis, tidak menghakimi, dan mendorong kemandirian berpikir.
Bantu penentuan topik/judul, research gap, novelty, rumusan masalah, metodologi, instrumen, analisis, dan penulisan ilmiah.
Saat meninjau tulisan, bedakan kritik substansi, struktur argumentasi, metodologi, dan bahasa. Berikan alasan serta langkah revisi yang konkret.
Jangan mengarang referensi, DOI, data, kutipan, atau mengklaim novelty tanpa telaah literatur. Jika tidak yakin, katakan perlu diverifikasi.
Dalam dukungan emosional, berikan refleksi dan dukungan non-klinis; jangan mendiagnosis atau mengaku sebagai psikolog. Jika pengguna mengungkapkan risiko menyakiti diri atau bahaya langsung, utamakan keselamatan dan anjurkan menghubungi orang tepercaya, tenaga profesional, atau layanan darurat setempat.
Jangan menulis seluruh karya ilmiah untuk diserahkan seolah-olah karya pengguna. Bantu pengguna memahami dan mengembangkan tulisannya sendiri.
Gunakan bahasa yang sama dengan pengguna, kecuali diminta lain.`;

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: cors });
    if (!env.GEMINI_API_KEY) return new Response(JSON.stringify({ error: "GEMINI_API_KEY belum dikonfigurasi." }), { status: 500, headers: cors });

    try {
      const body = await request.json();
      const message = String(body.message || "").slice(0, 14000);
      const mode = String(body.mode || "general").slice(0, 40);
      const history = Array.isArray(body.history) ? body.history.slice(-10) : [];
      if (!message.trim()) return new Response(JSON.stringify({ error: "Pesan kosong." }), { status: 400, headers: cors });

      const modeInstruction = {
        research: "Fokus pada pemetaan topik dan pengembangan masalah penelitian. Bedakan ide awal dari gap yang telah dibuktikan.",
        methodology: "Fokus pada kesesuaian pertanyaan penelitian, pendekatan, desain, data, sampling, instrumen, dan analisis.",
        review: "Lakukan telaah kritis dan konstruktif. Beri contoh perbaikan tanpa mengarang referensi.",
        emotional: "Fokus pada empati, refleksi, dan satu langkah kecil yang realistis. Bukan diagnosis atau terapi.",
        general: "Tanggapi sebagai pendamping akademik dan personal yang menyeluruh."
      }[mode] || "Tanggapi sebagai pendamping akademik dan personal.";

      const contents = [];
      for (const item of history) {
        if (!item || !["user", "assistant"].includes(item.role) || !item.content) continue;
        contents.push({ role: item.role === "assistant" ? "model" : "user", parts: [{ text: String(item.content).slice(0, 5000) }] });
      }
      contents.push({ role: "user", parts: [{ text: `${modeInstruction}\n\n${message}` }] });

      const model = env.GEMINI_MODEL || "gemini-2.5-flash-lite";
      const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { temperature: 0.55, maxOutputTokens: 1800 }
        })
      });
      const data = await upstream.json();
      if (!upstream.ok) return new Response(JSON.stringify({ error: data.error?.message || "AI provider request failed." }), { status: upstream.status, headers: cors });
      const reply = data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "Maaf, saya belum dapat menyusun jawaban.";
      return new Response(JSON.stringify({ reply }), { headers: cors });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Terjadi kesalahan pada backend.", detail: error.message }), { status: 500, headers: cors });
    }
  }
};
