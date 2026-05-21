export default async function handler(req, res) {
    // Membenarkan request dipanggil dari luar (CORS) untuk cron job luar
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        // =========================
        // GET MESSAGE
        // =========================
        const message = req.query.message || "Waktu Solat Telah Masuk";

        // ==========================================
        // FORCE GMT+8 MALAYSIA TIME (ULTIMATE FIX)
        // ==========================================
        // Cara paling kebal: Paksa convert ke string string Asia/Kuala_Lumpur, kemudian split ambil Jam & Minit
        const stringWaktuMY = new Date().toLocaleTimeString("en-US", {
            timeZone: "Asia/Kuala_Lumpur",
            hour12: false,
            hour: "2-digit",
            minute: "2-digit"
        });
        
        // Bersihkan sebarang whitespace atau simbol pelik (Contoh hasil: "21:25")
        const waktuMalaysia = stringWaktuMY.trim();

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
            waktu_semakan_my: waktuMalaysia, // Ini wajib akan keluar jam malam Malaysia yang betul!
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