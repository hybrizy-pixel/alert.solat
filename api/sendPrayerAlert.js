export default async function handler(req, res) {
    // 1. Set CORS Headers (Sama macam kod asal kau)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        // 2. Dapatkan Masa Malaysia Sekarang (Ngam-ngam ikut zon waktu MY)
        const masaSekarang = new Date();
        const masaMalaysia = new Date(masaSekarang.getTime() + (8 * 60 * 60 * 1000));
        const jam = String(masaMalaysia.getUTCHours()).padStart(2, '0');
        const minit = String(masaMalaysia.getUTCMinutes()).padStart(2, '0');
        const waktuMalaysia = `${jam}:${minit}`;

        console.log(`[CRON TRIGGER] Memulakan semakan waktu solat pintaran pada jam: ${waktuMalaysia}`);

        // 3. Senarai Zon Utama yang Aktif (Boleh tambah lagi ikut keperluan kau nanti)
        const senaraiZon = ["kdh01", "wly01", "sgr02", "png01", "jhr02", "mlk01", "ngr01", "prk02", "ktn01", "trg01", "phg01", "pls01"];
        let laporanPenghantaran = [];

        // 4. Loop setiap zon untuk check waktu solat masing-masing
        for (const zone of senaraiZon) {
            try {
                // Tarik jadual e-solat untuk zon semasa
                const eSolatReq = await fetch(`https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=today&zone=${zone}`);
                const dataSolat = await eSolatReq.json();
                
                if (!dataSolat.prayerTime || dataSolat.prayerTime.length === 0) continue;
                
                const prayer = dataSolat.prayerTime[0];

                // Bersihkan string masa dari e-solat (Contoh: "13:22:00" -> "13:22")
                const waktuSolatZon = {
                    "Subuh": prayer.fajr.substring(0, 5),
                    "Zohor": prayer.dhuhr.substring(0, 5),
                    "Asar": prayer.asr.substring(0, 5),
                    "Maghrib": prayer.maghrib.substring(0, 5),
                    "Isyak": prayer.isha.substring(0, 5)
                };

                // Cari jika ada mana-mana waktu solat di zon ini yang NGAM dengan minit sekarang
                let solatTerkini = null;
                for (const [namaSolat, masaSolat] of Object.entries(waktuSolatZon)) {
                    if (waktuMalaysia === masaSolat) {
                        solatTerkini = namaSolat;
                        break;
                    }
                }

                // JIKA WAKTU SOLAT MASUK DI ZON INI -> TEMBAK ONESIGNAL TARGETED!
                if (solatTerkini) {
                    const mesejPush = `🕌 Waktu Solat ${solatTerkini} telah masuk bagi kawasan zon ${zone.toUpperCase()} dan sekitarnya.`;
                    
                    console.log(`[PADANAN DIJUMPAI] Zon ${zone} masuk waktu ${solatTerkini}! Menembak OneSignal...`);

                    const osResponse = await fetch("https://onesignal.com/api/v1/notifications", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json; charset=utf-8",
                            "Authorization": `Basic ${process.env.ONESIGNAL_API_KEY}`
                        },
                        body: JSON.stringify({
                            app_id: process.env.ONESIGNAL_APP_ID, 
                            // PINTAR: Kita hantar HANYA kepada user yang device dorang ada tag "user_zone" == zone semasa!
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
                    laporanPenghantaran.push({ zone: zone, solat: solatTerkini, onesignal: osData });
                }

            } catch (zonError) {
                console.error(`Ralat memproses zon ${zone}:`, zonError.message);
            }
        }

        // 5. Pulangkan respon kejayaan kepada cron-job.org
        return res.status(200).json({
            success: true,
            waktu_semakan_my: waktuMalaysia, 
            JumlahZonDisemak: senaraiZon.length,
            ZonDitembak: laporanPenghantaran
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
