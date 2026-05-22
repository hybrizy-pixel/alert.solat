export default async function handler(req, res) {
    // Membenarkan Cross-Origin Resource Sharing (CORS) supaya app boleh ketuk API ni
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        // 1. Terima mesej dan zon dari request (Kalau client tak hantar, pakai default Kedah)
        const message = req.query.message || "Waktu Solat Telah Masuk";
        const zone = req.query.zone || "kdh01"; 

        // 2. Ambil masa Malaysia semasa (Matematik Method untuk Serverless)
        const masaSekarang = new Date();
        const masaMalaysia = new Date(masaSekarang.getTime() + (8 * 60 * 60 * 1000));
        const jam = String(masaMalaysia.getUTCHours()).padStart(2, '0');
        const minit = String(masaMalaysia.getUTCMinutes()).padStart(2, '0');
        const waktuMalaysia = `${jam}:${minit}`;

        // 3. KLON DATA DARI E-SOLAT JAKIM (Server tolong tarik data live zon semasa user)
        const eSolatReq = await fetch(`https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=today&zone=${zone}`);
        const dataSolat = await eSolatReq.json();
        const prayer = dataSolat.prayerTime[0];

        console.log(`[SERVER LOG] Memproses push zon ${zone} pada waktu MY: ${waktuMalaysia}`);

        // 4. TEMBAK ONESIGNAL (Guna pukat tunda untuk paksa lepas ke iPhone & Android)
        const response = await fetch("https://onesignal.com/api/v1/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": `Basic ${process.env.ONESIGNAL_API_KEY}`
            },
            body: JSON.stringify({
                app_id: process.env.ONESIGNAL_APP_ID, 
                // Menyapu semua nama jenis segmen aktif dalam OneSignal untuk elak Android cicir
                included_segments: ["All", "Total Subscriptions", "Subscribed Users"], 
                headings: {
                    en: `🇲🇾 MY SOLAT (${zone.toUpperCase()})`
                },
                contents: {
                    en: message
                },
                ios_sound: "default",
                // Hantar isyarat sound high priority untuk Android
                android_sound: "notification",
                android_channel_id: "fcm_fallback_notification_channel",
                chrome_web_icon: "https://solatmys.vercel.app/icon-192.png",
                large_icon: "https://solatmys.vercel.app/icon-512.png"
            })
        });

        const data = await response.json();

        // Pulangkan respon kejayaan ke apps telefon kau
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
