// =========================
// ONESIGNAL INIT
// =========================
window.OneSignalDeferred = window.OneSignalDeferred || [];
OneSignalDeferred.push(async function(OneSignal) {
    await OneSignal.init({
        appId: "399a4625-3fc2-47fd-b4a7-5e50c5542f53",
        // safari_web_id sudah dibuang sepenuhnya
        notifyButton: {
            enable: false
        }
    });
    console.log("✅ OneSignal Ready");
});
// =========================
// GLOBAL VARIABLES
// =========================
let prayerTimes = {};
let nextPrayer = null;
let notificationEnabled = false;
let lastNotification = "";
let currentAudio = null;
let currentZone = "kdh01"; // Default Kedah (Jitra/Alor Setar)
let lastCity = "";

// =========================
// AUDIO UNLOCK
// =========================
let audioUnlocked = false;

document.addEventListener("click", () => {

    if (!audioUnlocked) {

        const unlockAudio = new Audio();

        unlockAudio.play().catch(() => {});

        // PRELOAD AUDIO
        const preload1 = new Audio("azan.mp3");
        preload1.load();

        const preload2 = new Audio("azan-subuh.mp3");
        preload2.load();

        audioUnlocked = true;

        console.log("🔓 Audio unlocked");

    }

});
// =========================
// ZONE MAP (SELURUH MALAYSIA)
// =========================
const zoneMap = {
    // PERLIS
    "perlis": "pls01", "arau": "pls01", "kangar": "pls01", "padang besar": "pls01",

    // KEDAH
    "kubang pasu": "kdh01", "jitra": "kdh01", "alor setar": "kdh01", "pokok sena": "kdh01",
    "kuala muda": "kdh02", "sungai petani": "kdh02", "pendang": "kdh02", "yan": "kdh02",
    "padang terap": "kdh03", "sik": "kdh03",
    "baling": "kdh04",
    "kulim": "kdh05", "bandar baharu": "kdh05",
    "langkawi": "kdh06",

    // PULAU PINANG
    "pulau pinang": "png01", "penang": "png01", "george town": "png01", "seberang perai": "png01",

    // PERAK
    "grik": "prk01", "ulu perak": "prk01",
    "ipoh": "prk02", "batu gajah": "prk02", "kampar": "prk02", "kuala kangsar": "prk02",
    "manjung": "prk03", "lumut": "prk03", "sitiawan": "prk03",
    "larut": "prk04", "matang": "prk04", "selama": "prk04", "taiping": "prk04",
    "bagan datuk": "prk05", "teluk intan": "prk05", "hilir perak": "prk05",
    "muallim": "prk06", "tanjung malim": "prk06",
    "selama": "prk07",

    // SELANGOR & WILAYAH
    "kuala lumpur": "wly01", "putrajaya": "wly01",
    "hulu selangor": "sgr01",
    "gombak": "sgr02", "petaling": "sgr02", "shah alam": "sgr02", "subang jaya": "sgr02", "klang": "sgr02",
    "kuala selangor": "sgr03",
    "hulu langat": "sgr04", "kajang": "sgr04", "bangi": "sgr04", "ampang": "sgr04",
    "sabak bernam": "sgr05",
    "kuala langat": "sgr06",
    "sepang": "sgr07", "cyberjaya": "sgr07",

    // NEGERI SEMBILAN
    "seremban": "ngr01", "port didson": "ngr01",
    "jempol": "ngr02", "kuala pilah": "ngr02",

    // MELAKA
    "melaka": "mlk01", "alor gajah": "mlk01", "jasin": "mlk01",

    // JOHOR
    "pulau aur": "jhr01", "pulau pemanggil": "jhr01",
    "johor bahru": "jhr02", "kulai": "jhr02", "pontian": "jhr02",
    "kluang": "jhr03", "batu pahat": "jhr03",
    "muar": "jhr04", "ledang": "jhr04", "tangkak": "jhr04", "sega mat": "jhr04",
    "mersing": "jhr05",
    "kota tinggi": "jhr06",

    // PAHANG
    "kuantan": "phg01", "pekan": "phg01",
    "rompin": "phg02",
    "bentong": "phg03", "raub": "phg03", "lipis": "phg03",
    "jerantut": "phg04", "temerloh": "phg05", "maran": "phg05",
    "cameron highlands": "phg06",

    // TERENGGANU
    "kuala terennganu": "trg01", "marang": "trg01",
    "besut": "trg02", "setiu": "trg02",
    "hulu terengganu": "trg03",
    "kemaman": "trg04", "dungun": "trg04",

    // KELANTAN
    "kota bharu": "ktn01", "bachok": "ktn01", "pasir puteh": "ktn01",
    "jeli": "ktn02", "kuala krai": "ktn02", "gua musang": "ktn02",

    // SABAH & SARAWAK
    "sabah": "sbh01", "kota kinabalu": "sbh01",
    "sarawak": "swk01", "kuching": "swk01"
};

// =========================
// UPDATE CLOCK
// =========================
function updateClock() {
    const now = new Date();

    const malaysiaTime = now.toLocaleTimeString("en-GB", {
        timeZone: "Asia/Kuala_Lumpur",
        hour12: false
    });
    document.getElementById("current-time").innerHTML = malaysiaTime;

    const mekahTime = now.toLocaleTimeString("en-GB", {
        timeZone: "Asia/Riyadh",
        hour12: false
    });
    document.getElementById("mekah-time").innerHTML = mekahTime;

    const date = now.toLocaleDateString("ms-MY", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
    document.getElementById("date").innerHTML = date;
}

// =========================
// LOAD HIJRI DATE
// =========================
async function loadHijriDate() {
    try {
        const response = await fetch("https://api.aladhan.com/v1/gToH");
        const data = await response.json();
        const hijri = data.data.hijri;
        document.getElementById("hijri-date").innerHTML = `${hijri.day} ${hijri.month.en} ${hijri.year}H`;
    } catch (error) {
        console.log(error);
    }
}

// =========================
// GET LOCATION (SMART FALLBACK)
// =========================
async function getLocation() {
    if (!navigator.geolocation) return;
    document.getElementById("location").innerHTML = "📍 Detecting Location...";

    navigator.geolocation.watchPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                const data = await response.json();
                
                const city = data.address.city || data.address.town || data.address.village || data.address.county || "";
                const state = data.address.state || "";
                const suburb = data.address.suburb || "";

                document.getElementById("location").innerHTML = `📍 ${city || suburb || 'Malaysia'}, ${state}`;

                const cityLower = city.toLowerCase().trim();
                const stateLower = state.toLowerCase().trim();
                const suburbLower = suburb.toLowerCase().trim();

                if (cityLower === lastCity && cityLower !== "") return;
                lastCity = cityLower;

                let detectedZone = null;

                if (zoneMap[cityLower]) {
                    detectedZone = zoneMap[cityLower];
                } else if (zoneMap[suburbLower]) {
                    detectedZone = zoneMap[suburbLower];
                } else if (zoneMap[stateLower]) {
                    detectedZone = zoneMap[stateLower];
                }

                if (detectedZone && detectedZone !== currentZone) {
                    currentZone = detectedZone;
                    console.log(`[LOKASI BARU] Sistem menukar zon solat ke: ${currentZone}`);
                    loadPrayerTimes();
                }
            } catch (error) {
                console.log("Ralat deteksi lokasi:", error);
            }
        },
        (error) => {
            console.log("GPS Error:", error);
        },
        {
            enableHighAccuracy: false,
            timeout: 8000,
            maximumAge: 600000
        }
    );
}

// =========================
// LOAD PRAYER TIME + AUTO TAG
// =========================
async function loadPrayerTimes() {
    try {
        const response = await fetch(`https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=today&zone=${currentZone}`);
        const data = await response.json();
        const prayer = data.prayerTime[0];

        prayerTimes = {
            imsak: prayer.imsak.substring(0, 5),
            fajr: prayer.fajr.substring(0, 5),
            syuruk: prayer.syuruk.substring(0, 5),
            dhuhr: prayer.dhuhr.substring(0, 5),
            asr: prayer.asr.substring(0, 5),
            maghrib: prayer.maghrib.substring(0, 5),
            isha: prayer.isha.substring(0, 5)
        };

        document.getElementById("imsak").innerHTML = prayerTimes.imsak;
        document.getElementById("fajr").innerHTML = prayerTimes.fajr;
        document.getElementById("syuruk").innerHTML = prayerTimes.syuruk;
        document.getElementById("dhuhr").innerHTML = prayerTimes.dhuhr;
        document.getElementById("asr").innerHTML = prayerTimes.asr;
        document.getElementById("maghrib").innerHTML = prayerTimes.maghrib;
        document.getElementById("isha").innerHTML = prayerTimes.isha;

        updateNextPrayer();

        // MAGIK AUTOMATIK: Ikat zon lokasi telefon ke akaun OneSignal user untuk target push notification luar kawasan
        if (window.OneSignalDeferred) {
            OneSignalDeferred.push(function(OneSignal) {
                OneSignal.User.addTag("user_zone", currentZone);
                console.log(`[ONESIGNAL] Tag zon berjaya didaftarkan: ${currentZone}`);
            });
        }

    } catch (error) {
        console.log(error);
    }
}

// =========================
// UPDATE NEXT PRAYER
// =========================
function updateNextPrayer() {
    if (!prayerTimes.fajr) return;
    const now = new Date();
    
    const localTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" }));
    const currentMinutes = localTime.getHours() * 60 + localTime.getMinutes();

    const prayers = [
        { name: "Subuh", time: prayerTimes.fajr },
        { name: "Zohor", time: prayerTimes.dhuhr },
        { name: "Asar", time: prayerTimes.asr },
        { name: "Maghrib", time: prayerTimes.maghrib },
        { name: "Isyak", time: prayerTimes.isha }
    ];

    nextPrayer = null;
    for (const prayer of prayers) {
        const [hour, minute] = prayer.time.split(":").map(Number);
        const prayerMinutes = hour * 60 + minute;
        if (prayerMinutes > currentMinutes) {
            nextPrayer = prayer;
            break;
        }
    }

    if (!nextPrayer) {
        nextPrayer = { name: "Subuh", time: prayerTimes.fajr };
    }

    document.getElementById("next-prayer").innerHTML = nextPrayer.name;
    highlightPrayer();
}

// =========================
// COUNTDOWN
// =========================
function startCountdown() {
    setInterval(() => {
        if (!nextPrayer) return;
        const now = new Date();
        const localTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" }));

        const [hour, minute] = nextPrayer.time.split(":").map(Number);
        const target = new Date(localTime);
        target.setHours(hour);
        target.setMinutes(minute);
        target.setSeconds(0);

        if (target <= localTime) {
            target.setDate(target.getDate() + 1);
        }

        const diff = target - localTime;
        const hours = Math.floor(diff / 1000 / 60 / 60);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        document.getElementById("hours").innerHTML = String(hours).padStart(2, "0");
        document.getElementById("minutes").innerHTML = String(minutes).padStart(2, "0");
        document.getElementById("seconds").innerHTML = String(seconds).padStart(2, "0");

        updateNextPrayer();
    }, 1000);
}

// =========================
// HIGHLIGHT PRAYER
// =========================
function highlightPrayer() {
    document.querySelectorAll(".prayer-row").forEach(row => {
        row.classList.remove("active-prayer");
    });

    if (!nextPrayer) return;

    const prayerMap = {
        Subuh: "fajr",
        Zohor: "dhuhr",
        Asar: "asr",
        Maghrib: "maghrib",
        Isyak: "isha"
    };

    const id = prayerMap[nextPrayer.name];
    const element = document.getElementById(id);
    if (element) {
        element.parentElement.classList.add("active-prayer");
    }
}

// =========================
// PLAY AZAN
// =========================
function playAzan(prayerName) {
    let audioFile = "azan.mp3";
    if (prayerName === "Subuh") {
        audioFile = "azan-subuh.mp3";
    }

   if (currentAudio) {

    currentAudio.pause();

    currentAudio.currentTime = 0;
    }

    currentAudio = new Audio(audioFile);
    currentAudio.volume = 1.0;
    currentAudio.play().catch((e) => {
        console.log("Audio disekat automatik oleh browser:", e);
    });
}

// =========================
// ENABLE NOTIFICATION (VERSI IPHONE/SAFARI)
// =========================
async function enableNotification() {
    console.log("🚀 Mula proses subscribe...");

    window.OneSignalDeferred.push(async function(OneSignal) {
        try {
            // PENTING: Tambah { force: true } untuk paksa popup muncul di iOS
            const permission = await OneSignal.Notifications.requestPermission({ force: true });
            
            console.log("Permission status:", permission);

            if (permission) {
                // Selepas dapat kebenaran, tunggu sekejap untuk ID dijana
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const subscriptionId = OneSignal.User.PushSubscription.id;
                console.log("✅ Subscription ID:", subscriptionId);
                
                // Hantar tag zon lokasi
                OneSignal.User.addTag("user_zone", currentZone);
                alert("✅ Notifikasi telah diaktifkan!");
            } else {
                alert("❌ Kebenaran ditolak. Sila check Settings > Safari > Notifications.");
            }
        } catch (error) {
            console.error("❌ Error:", error);
            alert("Ralat: " + error.message);
        }
    });
}
// =========================
// TOGGLE MUTE
// =========================
function toggleMute() {

    const muteBtn = document.getElementById("mute-btn");

    let isMuted = localStorage.getItem("azanMuted") === "true";

    isMuted = !isMuted;

    localStorage.setItem("azanMuted", isMuted);

    if (isMuted) {

        muteBtn.innerHTML = "🔇 Muted";

        if (currentAudio) {
            currentAudio.pause();
        }

    } else {

        muteBtn.innerHTML = "🔊 Sound ON";

    }

}
// =========================
// TEST NOTIFICATION
// =========================
async function testNotification() {
    try {
        playAzan("Maghrib");
        await fetch(`/api/sendPrayerAlert?zone=${currentZone}&message=TEST PUSH`);
        alert("✅ Push Sent");
    } catch (error) {
        console.log(error);
    }
}

// =========================
// CHECK PRAYER ALERTS (AUTO LAUNCH ON PUSH CLICK)
// =========================
function checkPrayerAlerts() {
    if (!prayerTimes.fajr) return;
    const now = new Date();
    const localTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" }));
    const currentTime = `${String(localTime.getHours()).padStart(2, "0")}:${String(localTime.getMinutes()).padStart(2, "0")}`;

    const prayers = [
        { name: "Subuh", time: prayerTimes.fajr },
        { name: "Zohor", time: prayerTimes.dhuhr },
        { name: "Asar", time: prayerTimes.asr },
        { name: "Maghrib", time: prayerTimes.maghrib },
        { name: "Isyak", time: prayerTimes.isha }
    ];

    prayers.forEach(prayer => {
        const [hour, minute] = prayer.time.split(":").map(Number);

        // Semakan 10 minit sebelum solat masuk
        const before = new Date(localTime);
        before.setHours(hour);
        before.setMinutes(minute - 10);
        const beforeTime = `${String(before.getHours()).padStart(2, "0")}:${String(before.getMinutes()).padStart(2, "0")}`;

        if (currentTime === beforeTime && lastNotification !== `${prayer.name}-before`) {
            lastNotification = `${prayer.name}-before`;
            alert(`🕌 ${prayer.name} Lagi 10 Minit`);
        }

        // Semakan sewaktu azan masuk ngam-ngam
        if (currentTime === prayer.time && lastNotification !== prayer.name) {
            lastNotification = prayer.name;
            playAzan(prayer.name);
            alert(`🕌 Waktu Solat ${prayer.name} Telah Masuk`);
        }
    });
}

// =========================
// ISLAMIC EVENT COUNTDOWN
// =========================
async function updateIslamicCountdown() {
    try {
        const response = await fetch("https://api.aladhan.com/v1/gToH");
        const data = await response.json();
        const hijri = data.data.hijri;

        const currentMonth = parseInt(hijri.month.number);
        const currentDay = parseInt(hijri.day);
        let ramadhanDays = 0;

        if (currentMonth < 9) {
            ramadhanDays = (9 - currentMonth) * 30 - currentDay;
        } else if (currentMonth === 9) {
            ramadhanDays = 0;
        } else {
            ramadhanDays = (12 - currentMonth + 9) * 30 - currentDay;
        }

        const rayaDays = ramadhanDays + 30;
        let hajiDays = 0;

        if (currentMonth < 12) {
            hajiDays = (12 - currentMonth) * 30 - currentDay + 10;
        } else {
            hajiDays = 10 - currentDay;
            if (hajiDays < 0) hajiDays = 0;
        }

        document.getElementById("ramadhan-countdown").innerHTML = `🌙 Ramadan • ${ramadhanDays} Hari Lagi`;
        document.getElementById("aidilfitri-countdown").innerHTML = `🎉 Aidilfitri • ${rayaDays} Hari Lagi`;
        document.getElementById("aidiladha-countdown").innerHTML = `🐄 Aidiladha • ${hajiDays} Hari Lagi`;
    } catch (error) {
        console.log(error);
    }
}

// =========================
// INIT (SUSUNAN BARU)
// =========================
console.log("✅ SCRIPT LOADED");
updateClock();
setInterval(updateClock, 1000);
loadHijriDate();

async function initApp() {
    // 1. Tarik data waktu solat & hantar tag OneSignal
    await loadPrayerTimes(); 

    // 2. Panggil GPS secara senyap di background untuk auto-update zon solat
    getLocation(); 

    startCountdown();
    updateIslamicCountdown();

    // 3. Semak jika app dibuka ngam-ngam pada waktu solat untuk dicetuskan azan
    checkPrayerAlerts();
    setInterval(checkPrayerAlerts, 20000); // Check berkala setiap 20 saat secara dalaman
    
    document.addEventListener("visibilitychange", () => {

    if (!document.hidden) {

        console.log("📱 App aktif semula");

        checkPrayerAlerts();

    }

});
}

initApp();
