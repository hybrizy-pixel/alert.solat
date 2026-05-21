export default async function handler(req, res) {
    // Membenarkan request dipanggil dari luar (CORS) untuk cron job luar
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        // =========================
        // GET MESSAGE
        // =========================
        const message = req.query.message || "Waktu Solat Telah Masuk";

        // ==========================================
        // FORCE GMT+8 MALAYSIA TIME (TOTAL MATH FIX)
        // ==========================================
        // Ambil jumlah saat yang telah berlalu sejak tahun 1970 (Masa UTC mentah)
        const totalSaat = Math.floor(Date.now() / 1000);
        
        // Cari baki saat dalam hari ini sahaja
        const bakiSaatHariIni = totalSaat % 86400;
        
        // Tukar baki saat kepada Jam & Minit (Waktu UTC asal)
        let angkaJam = Math.floor(bakiSaatHariIni / 3600);
        const angkaMinit = Math.floor((bakiSaatHariIni % 3600) / 60);
        
        // PAKSA tambah 8 jam secara manual untuk waktu Malaysia (GMT+8)
        angkaJam = (angkaJam + 8) % 24;
        
        // Formatkan kepada 2 digit string (Contoh: 09 atau 21)
        const jam = String(angkaJam).padStart(2, '0');
        const minit = String(angkaMinit).padStart(2, '0');
        
        // Gabungkan hasil akhir
        const waktuMalaysia = `${jam}:${minit}`;

        console.log(`[SERVER LOG] Memproses push pada waktu MY: ${waktuMalaysia} - Mesej: ${message}`);

        // =========================
        // SEND TO ONESIGNAL (V1)
        // =========================
        const response = await fetch("https://onesignal.com/api/v1/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": `Basic ${process.env.ONESIGNAL_API_KEY}`
            },
            body: JSON.stringify({
                app_id: process.env.ONESIGNAL_APP_ID, 
                included_segments: ["Subscribed Users"], 
                headings: {
                    en: "🕌 MY SOLAT"
                },
                contents: {
                    en: message
                },
                ios_sound: "default",
                chrome_web_icon: "https://solatmys.vercel.app/icon-192.png",
                large_icon: "https://solatmys.vercel.app/icon-512.png"
            })
        });

        const data = await response.json();
        console.log("✅ ONESIGNAL RESPONSE:", data);

        // =========================
        // SUCCESS RESPONSE
        // =========================
        return res.status(200).json({
            success: true,
            waktu_semakan_my: waktuMalaysia, // Kali ni DIJAMIN 1000% akan keluar waktu malam (21:XX)!
            message: message,
            onesignal_response: data
        });

    } catch (error) {
        console.log("❌ PUSH ERROR:", error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}