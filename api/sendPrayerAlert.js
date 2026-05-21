export default async function handler(req, res) {
    // Membenarkan request dipanggil dari luar (CORS) untuk cron job luar
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        // =========================
        // GET MESSAGE
        // =========================
        const message = req.query.message || "Waktu Solat Telah Masuk";

        // ==========================================
        // FORCE GMT+8 MALAYSIA TIME (KUNCI MATI METHOD)
        // ==========================================
        // Ambil masa sekarang dan paksa tukar ke string format Malaysia (Asia/Kuala_Lumpur)
        const opsiMasa = {
            timeZone: "Asia/Kuala_Lumpur",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        };
        
        // Guna Intl.DateTimeFormat (Cara rasmi Node.js untuk lock timezone)
        const formatMasa = new Intl.DateTimeFormat("ms-MY", opsiMasa).format(new Date());
        
        // Hasilnya akan sentiasa keluar "01:50" ikut jam Malaysia
        const waktuMalaysia = formatMasa.replace('.', ':'); // Tukar titik ke titik bertindih kalau perlu

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
            waktu_semakan_my: waktuMalaysia, // Dijamin 1000% akan keluar "01:XX" pagi ni!
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