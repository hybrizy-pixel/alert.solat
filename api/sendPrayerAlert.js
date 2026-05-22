export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        // 1. Terima mesej dan zon dari request (Kalau tak bagi, default Kedah)
        const message = req.query.message || "Waktu Solat Telah Masuk";
        const zone = req.query.zone || "kdh01"; 

        // 2. Ambil masa Malaysia semasa (Matematik Method)
        const masaSekarang = new Date();
        const masaMalaysia = new Date(masaSekarang.getTime() + (8 * 60 * 60 * 1000));
        const jam = String(masaMalaysia.getUTCHours()).padStart(2, '0');
        const minit = String(masaMalaysia.getUTCMinutes()).padStart(2, '0');
        const waktuMalaysia = `${jam}:${minit}`;

        // 3. KLON DATA DARI E-SOLAT (Server Vercel tolong dapatkan jadual zon semasa user)
        const eSolatReq = await fetch(`https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=today&zone=${zone}`);
        const dataSolat = await eSolatReq.json();
        const prayer = dataSolat.prayerTime[0];

        console.log(`[SERVER LOG] Memproses push zon ${zone} pada waktu MY: ${waktuMalaysia}`);

        // 4. SEND TO ONESIGNAL (Sistem Push Sendiri)
        const response = await fetch("https://onesignal.com/api/v1/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": `Basic ${process.env.ONESIGNAL_API_KEY}`
            },
            body: JSON.stringify({
                app_id: process.env.ONESIGNAL_APP_ID, 
                included_segments: ["Total Subscriptions"], // Hantar ke peranti
                headings: {
                    en: `🕌 MY SOLAT (${zone.toUpperCase()})`
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

        return res.status(200).json({
            success: true,
            waktu_semakan_my: waktuMalaysia, 
            user_zone: zone,
            message: message,
            onesignal_response: data,
            jadual_zon_ini: {
                subuh: prayer.fajr,
                zohor: prayer.dhuhr,
                asar: prayer.asr,
                maghrib: prayer.maghrib,
                isyak: prayer.isha
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
