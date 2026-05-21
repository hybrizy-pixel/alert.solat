export default async function handler(req, res) {
    // Membenarkan request dipanggil dari luar (CORS) untuk cron job luar
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        // =========================
        // GET MESSAGE
        // =========================
        const message = req.query.message || "Waktu Solat Telah Masuk";

        // =========================
        // AUTOMATIC TIMEZONE FIX
        // =========================
        // Settle isu server oversea. Ini akan paksa server baca waktu Malaysia (GMT+8)
        const waktuMalaysia = new Date().toLocaleTimeString("en-GB", {
            timeZone: "Asia/Kuala_Lumpur",
            hour12: false,
            hour: "2-digit",
            minute: "2-digit"
        });

        console.log(`[SERVER LOG] Memproses push pada waktu MY: ${waktuMalaysia} - Mesej: ${message}`);

        // =========================
        // SEND TO ONESIGNAL (V1)
        // =========================
        const response = await fetch("https://onesignal.com/api/v1/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                // Menggunakan Authorization 'Basic' dan mengambil key selamat dari environment variable Vercel
                "Authorization": `Basic ${process.env.ONESIGNAL_API_KEY}`
            },
            body: JSON.stringify({
                app_id: "399a4625-3fc2-47fd-b4a7-5e50c5542f53",
                
                // FIXED: Ditukar ke "Subscribed Users" mengikut spesifikasi segmen OneSignal terkini
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
            waktu_semakan_my: waktuMalaysia,
            message: message,
            onesignal_response: data
        });

    } catch (error) {
        console.log("❌ PUSH ERROR:", error);

        // =========================
        // ERROR RESPONSE
        // =========================
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}