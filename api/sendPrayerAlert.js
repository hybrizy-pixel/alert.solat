export default async function handler(req, res) {
    // Membenarkan request dipanggil dari luar (CORS) untuk cron job luar
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        // =========================
        // GET MESSAGE
        // =========================
        const message = req.query.message || "Waktu Solat Telah Masuk";

        // ==========================================
        // FORCE GMT+8 MALAYSIA TIME (MATEMATIK METHOD)
        // ==========================================
        const masaSekarang = new Date();
        
        // Ambil masa UTC semasa (Milisaat) dan tambah dengan 8 jam (8 * 60 * 60 * 1000 milisaat)
        const masaMalaysia = new Date(masaSekarang.getTime() + (8 * 60 * 60 * 1000));
        
        // Ekstrak jam dan minit secara berasingan (Pasti dapat waktu Malaysia yang tepat)
        const jam = String(masaMalaysia.getUTCHours()).padStart(2, '0');
        const minit = String(masaMalaysia.getUTCMinutes()).padStart(2, '0');
        
        // Hasilnya tetap akan jadi "15:00" ikut minit semasa
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
            waktu_semakan_my: waktuMalaysia, 
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
