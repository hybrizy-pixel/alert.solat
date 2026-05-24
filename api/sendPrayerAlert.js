export default async function handler(req, res) {
    // 1. Set CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        // 2. Dapatkan string waktu Malaysia secara selamat (Format 24 jam bersih: "HH:MM")
        const options = { timeZone: 'Asia/Kuala_Lumpur', hour: '2-digit', minute: '2-digit', hour12: false };
        const waktuMalaysiaStr = new Date().toLocaleTimeString('en-GB', options); 
        
        const [jamSemasa, minitSemasa] = waktuMalaysiaStr.split(':').map(Number);
        const jumlahMinitSemasa = (jamSemasa * 60) + minitSemasa;

        console.log(`[CRON TRIGGER] Memproses semakan pada waktu MY: ${waktuMalaysiaStr} (Total Minit: ${jumlahMinitSemasa})`);

        // 3. Senarai Zon Utama yang Aktif
        const senaraiZon = ["kdh01", "wly01", "sgr02", "png01", "jhr02", "mlk01", "ngr01", "prk02", "ktn01", "trg01", "phg01", "pls01"];
        let laporanPenghantaran = [];

        // 4. Loop setiap zon untuk check jadual JAKIM
        for (const zone of senaraiZon) {
            try {
                const eSolatReq = await fetch(`https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=today&zone=${zone}`);
                const dataSolat = await eSolatReq.json();
                
                if (!dataSolat.prayerTime || dataSolat.prayerTime.length === 0) continue;
                
                const prayer = dataSolat.prayerTime[0];

                const waktuSolatZon = {
                    "Subuh": prayer.fajr.substring(0, 5),
                    "Zohor": prayer.dhuhr.substring(0, 5),
                    "Asar": prayer.asr.substring(0, 5),
                    "Maghrib": prayer.maghrib.substring(0, 5),
                    "Isyak": prayer.isha.substring(0, 5)
                };

                let mesejPush = null;
                let jenisAlert = null;

                for (const [namaSolat, masaSolat] of Object.entries(waktuSolatZon)) {
                    const [jamSolat, minitSolat] = masaSolat.split(':').map(Number);
                    const jumlahMinitSolat = (jamSolat * 60) + minitSolat;

                    // SEMAKAN A: Ngam-ngam masuk waktu solat sebenar
                    if (jumlahMinitSemasa === jumlahMinitSolat) {
                        mesejPush = `🕌 Telah Masuk Waktu Solat ${namaSolat} bagi Kawasan Anda. Mari tunaikan solat.`;
                        jenisAlert = namaSolat;
                        break;
                    }

                    // SEMAKAN B: Ngam-ngam 10 minit sebelum masuk waktu solat
                    if (jumlahMinitSolat - jumlahMinitSemasa === 10) {
                        mesejPush = `🕌 10 minit Lagi Akan masuk waktu ${namaSolat} bagi kawasan zon ${zone.toUpperCase()}.`;
                        jenisAlert = `${namaSolat}-10Min`;
                        break;
                    }
                }

                // 5. JIKA KANTOI MASUK LOGIK A ATAU B -> TEMBAK ONESIGNAL
                if (mesejPush) {
                    console.log(`[PADANAN DIJUMPAI] Zon ${zone} hantar push: ${jenisAlert}`);

                    const osResponse = await fetch("https://onesignal.com/api/v1/notifications", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json; charset=utf-8",
                            "Authorization": `Basic ${process.env.ONESIGNAL_API_KEY}`
                        },
                        body: JSON.stringify({
                            app_id: process.env.ONESIGNAL_APP_ID, 
                            filters: [
                                { "field": "tag", "key": "user_zone", "relation": "=", "value": zone }
                            ],
                            headings: {
                                en: `🇲🇾 MY SOLAT (${zone.toUpperCase()})`
                            },
                            contents: {
                                en: mesejPush
                            },
                            ios_sound: "default",
                            android_sound: "notification",
                            chrome_web_icon: "https://solatmys.vercel.app/icon-192.png",
                            large_icon: "https://solatmys.vercel.app/icon-512.png"
                        })
                    });

                    const osData = await osResponse.json();
                    laporanPenghantaran.push({ zone: zone, alert: jenisAlert, onesignal: osData });
                }

            } catch (zonError) {
                console.error(`Ralat memproses zon ${zone}:`, zonError.message);
            }
        }

        // 6. Respon balik ke cron-job.org
        return res.status(200).json({
            success: true,
            waktu_semakan_my: waktuMalaysiaStr, 
            ZonDitembak: laporanPenghantaran
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
