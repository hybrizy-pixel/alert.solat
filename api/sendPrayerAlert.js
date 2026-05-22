export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        const message = req.query.message || "Waktu Solat Telah Masuk";
        const zone = req.query.zone || "kdh01"; 

        const masaSekarang = new Date();
        const masaMalaysia = new Date(masaSekarang.getTime() + (8 * 60 * 60 * 1000));
        const jam = String(masaMalaysia.getUTCHours()).padStart(2, '0');
        const minit = String(masaMalaysia.getUTCMinutes()).padStart(2, '0');
        const waktuMalaysia = `${jam}:${minit}`;

        const eSolatReq = await fetch(`https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=today&zone=${zone}`);
        const dataSolat = await eSolatReq.json();
        const prayer = dataSolat.prayerTime[0];

        console.log(`[SERVER LOG] Memproses push zon ${zone} pada waktu MY: ${waktuMalaysia}`);

        // TEMBAK ONESIGNAL (VERSI BERSIH BEBAS ERROR)
        const response = await fetch("https://onesignal.com/api/v1/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": `Basic ${process.env.ONESIGNAL_API_KEY}`
            },
            body: JSON.stringify({
                app_id: process.env.ONESIGNAL_APP_ID, 
                included_segments: ["All", "Total Subscriptions", "Subscribed Users"], 
                headings: {
                    en: `🇲🇾 MY SOLAT (${zone.toUpperCase()})`
                },
                contents: {
                    en: message
                },
                ios_sound: "default",
                android_sound: "notification", // Guna sound default Android tanpa lock channel ID
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
