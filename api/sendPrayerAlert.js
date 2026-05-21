export default async function handler(req, res) {
    // Membenarkan request dipanggil dari luar (CORS) untuk cron job luar
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        // =========================
        // GET MESSAGE
        // =========================
        const message = req.query.message || "Waktu Solat Telah Masuk";

        // ==========================================
        // FORCE GMT+8 MALAYSIA TIME (MANUAL FIX)
        // ==========================================
        // Ambil masa UTC terkini di server Vercel
        const d = new Date();
        const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
        
        // Paksa tambah 8 jam untuk tukar ke Waktu Malaysia (GMT+8)
        const waktuMY = new Date(utc + (3600000 * 8));
        
        // Formatkan kepada HH:MM (Contoh: "21:25")
        const jam = String(waktuMY.getHours()).padStart(2, '0');
        const minit = String(waktuMY.getMinutes()).padStart(2, '0');
        const waktuMalaysia = `${jam}:${minit}`;

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
                // Menggunakan App ID secara dinamik dari Environment Variable Vercel
                app_id: process.env.ONESIGNAL_APP_ID, 
                
                // Menggunakan segmen default yang betul untuk OneSignal
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
            waktu_semakan_my: waktuMalaysia, // Ini akan pulangkan waktu Malaysia yang betul
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