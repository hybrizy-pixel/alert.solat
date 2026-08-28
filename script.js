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

// Guna zon terakhir yang berjaya dikesan.
// Kalau first install sahaja fallback ke Jitra.
let currentZone =
    localStorage.getItem("currentPrayerZone") || "kdh01";

let lastCity = "";
let lastLocationKey = "";


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


// =====================================================
// ZONE MAP
// e-SOLAT JAKIM + GPS ALIASES
// =====================================================
const zoneMap = {

    // =================================================
    // JOHOR
    // =================================================

    // JHR01
    "pulau aur":"jhr01",
    "pulau pemanggil":"jhr01",

    // JHR02
    "johor bahru":"jhr02",
    "kota tinggi":"jhr02",
    "mersing":"jhr02",
    "kulai":"jhr02",

    // JHR03
    "kluang":"jhr03",
    "pontian":"jhr03",

    // JHR04
    "batu pahat":"jhr04",
    "muar":"jhr04",
    "segamat":"jhr04",
    "gemas":"jhr04",
    "tangkak":"jhr04",


    // =================================================
    // KEDAH
    // =================================================

    // KDH01
    "kota setar":"kdh01",
    "alor setar":"kdh01",
    "kubang pasu":"kdh01",
    "jitra":"kdh01",
    "pokok sena":"kdh01",

    // KDH02
    "kuala muda":"kdh02",
    "sungai petani":"kdh02",
    "yan":"kdh02",
    "pendang":"kdh02",

    // KDH03
    "padang terap":"kdh03",
    "sik":"kdh03",

    // KDH04
    "baling":"kdh04",

    // KDH05
    "bandar baharu":"kdh05",
    "kulim":"kdh05",

    // KDH06
    "langkawi":"kdh06",

    // KDH07
    "puncak gunung jerai":"kdh07",
    "gunung jerai":"kdh07",


    // =================================================
    // KELANTAN
    // =================================================

    // KTN01
    "bachok":"ktn01",
    "kota bharu":"ktn01",
    "machang":"ktn01",
    "pasir mas":"ktn01",
    "pasir puteh":"ktn01",
    "tanah merah":"ktn01",
    "tumpat":"ktn01",
    "kuala krai":"ktn01",
    "mukim chiku":"ktn01",
    "chiku":"ktn01",

    // KTN02
    "gua musang":"ktn02",
    "jeli":"ktn02",
    "jajahan kecil lojing":"ktn02",
    "lojing":"ktn02",


    // =================================================
    // MELAKA
    // =================================================

    // MLK01
    "melaka":"mlk01",
    "malacca":"mlk01",
    "alor gajah":"mlk01",
    "jasin":"mlk01",


    // =================================================
    // NEGERI SEMBILAN
    // =================================================

    // NGS01
    "tampin":"ngs01",
    "jempol":"ngs01",
    "bahau":"ngs01",

    // NGS02
    "jelebu":"ngs02",
    "kuala pilah":"ngs02",
    "rembau":"ngs02",

    // NGS03
    "port dickson":"ngs03",
    "seremban":"ngs03",
    "nilai":"ngs03",


    // =================================================
    // PAHANG
    // =================================================

    // PHG01
    "pulau tioman":"phg01",
    "tioman":"phg01",

    // PHG02
    "kuantan":"phg02",
    "pekan":"phg02",
    "muadzam shah":"phg02",

    // PHG03
    "jerantut":"phg03",
    "temerloh":"phg03",
    "maran":"phg03",
    "bera":"phg03",
    "chenor":"phg03",
    "jengka":"phg03",

    // PHG04
    "bentong":"phg04",
    "lipis":"phg04",
    "kuala lipis":"phg04",
    "raub":"phg04",

    // PHG05
    "genting sempah":"phg05",
    "janda baik":"phg05",
    "bukit tinggi":"phg05",

    // PHG06
    "cameron highlands":"phg06",
    "cameron":"phg06",
    "genting highlands":"phg06",
    "bukit fraser":"phg06",
    "fraser's hill":"phg06",
    "fraser hill":"phg06",

    // PHG07
    "rompin":"phg07",
    "mukim rompin":"phg07",
    "endau":"phg07",
    "mukim endau":"phg07",
    "pontian pahang":"phg07",


    // =================================================
    // PERLIS
    // =================================================

    // PLS01
    "kangar":"pls01",
    "padang besar":"pls01",
    "arau":"pls01",
    "perlis":"pls01",


    // =================================================
    // PULAU PINANG
    // =================================================

    // PNG01
    "penang":"png01",
    "pulau pinang":"png01",
    "george town":"png01",
    "butterworth":"png01",
    "bukit mertajam":"png01",
    "seberang perai":"png01",
    "balik pulau":"png01",
    "bayan lepas":"png01",
    "bayan baru":"png01",
    "kepala batas":"png01",
    "nibong tebal":"png01",


    // =================================================
    // PERAK
    // =================================================

    // PRK01
    // Tapah, Slim River, Tanjung Malim
    "tapah":"prk01",
    "sungkai":"prk01",
    "slim river":"prk01",
    "tanjung malim":"prk01",
    "batang padang":"prk01",
    "muallim":"prk01",

    // PRK02
    // Kuala Kangsar, Sungai Siput,
    // Ipoh, Batu Gajah, Kampar
    "kuala kangsar":"prk02",
    "sungai siput":"prk02",
    "sg siput":"prk02",
    "ipoh":"prk02",
    "batu gajah":"prk02",
    "kampar":"prk02",
    "kinta":"prk02",

    // PRK03
    // Lenggong, Pengkalan Hulu, Grik
    "lenggong":"prk03",
    "pengkalan hulu":"prk03",
    "grik":"prk03",
    "gerik":"prk03",
    "hulu perak":"prk03",

    // PRK04
    // Temengor, Belum
    "temengor":"prk04",
    "belum":"prk04",
    "royal belum":"prk04",

    // PRK05
    // Kg Gajah, Teluk Intan, Bagan Datuk,
    // Seri Iskandar, Beruas, Parit,
    // Lumut, Sitiawan, Pulau Pangkor
    "kampung gajah":"prk05",
    "kg gajah":"prk05",
    "teluk intan":"prk05",
    "bagan datuk":"prk05",
    "seri iskandar":"prk05",
    "beruas":"prk05",
    "parit":"prk05",
    "lumut":"prk05",
    "sitiawan":"prk05",
    "pulau pangkor":"prk05",
    "pangkor":"prk05",
    "perak tengah":"prk05",
    "manjung":"prk05",
    "hilir perak":"prk05",

    // PRK06
    // Selama, Taiping,
    // Bagan Serai, Parit Buntar
    "selama":"prk06",
    "taiping":"prk06",
    "bagan serai":"prk06",
    "parit buntar":"prk06",
    "kerian":"prk06",
    "larut matang selama":"prk06",
    "larut":"prk06",

    // PRK07
    "bukit larut":"prk07",


    // =================================================
    // SABAH
    // =================================================

    // SBH01
    "sandakan":"sbh01",
    "bukit garam":"sbh01",
    "semawang":"sbh01",
    "temanggong":"sbh01",
    "tambisan":"sbh01",
    "sukau":"sbh01",

    // SBH02
    "beluran":"sbh02",
    "telupid":"sbh02",
    "pinangah":"sbh02",
    "terusan":"sbh02",
    "kuamut":"sbh02",

    // SBH03
    "lahad datu":"sbh03",
    "silabukan":"sbh03",
    "kunak":"sbh03",
    "sahabat":"sbh03",
    "semporna":"sbh03",
    "tungku":"sbh03",

    // SBH04
    "tawau":"sbh04",
    "balong":"sbh04",
    "merotai":"sbh04",
    "kalabakan":"sbh04",

    // SBH05
    "kudat":"sbh05",
    "kota marudu":"sbh05",
    "pitas":"sbh05",
    "pulau banggi":"sbh05",

    // SBH06
    "gunung kinabalu":"sbh06",
    "mount kinabalu":"sbh06",

    // SBH07
    "kota kinabalu":"sbh07",
    "ranau":"sbh07",
    "kota belud":"sbh07",
    "tuaran":"sbh07",
    "penampang":"sbh07",
    "papar":"sbh07",
    "putatan":"sbh07",

    // SBH08
    "pensiangan":"sbh08",
    "keningau":"sbh08",
    "tambunan":"sbh08",
    "nabawan":"sbh08",

    // SBH09
    "beaufort":"sbh09",
    "kuala penyu":"sbh09",
    "sipitang":"sbh09",
    "tenom":"sbh09",
    "long pasia":"sbh09",
    "membakut":"sbh09",
    "weston":"sbh09",


    // =================================================
    // SELANGOR
    // =================================================

    // SGR01
    "gombak":"sgr01",
    "petaling":"sgr01",
    "petaling jaya":"sgr01",
    "sepang":"sgr01",
    "hulu langat":"sgr01",
    "hulu selangor":"sgr01",
    "shah alam":"sgr01",
    "subang jaya":"sgr01",
    "kajang":"sgr01",
    "bangi":"sgr01",
    "ampang":"sgr01",
    "cyberjaya":"sgr01",

    // SGR02
    "kuala selangor":"sgr02",
    "sabak bernam":"sgr02",

    // SGR03
    "klang":"sgr03",
    "kuala langat":"sgr03",


    // =================================================
    // SARAWAK
    // =================================================

    // SWK01
    "limbang":"swk01",
    "lawas":"swk01",
    "sundar":"swk01",
    "trusan":"swk01",

    // SWK02
    "miri":"swk02",
    "niah":"swk02",
    "bekenu":"swk02",
    "sibuti":"swk02",
    "marudi":"swk02",

    // SWK03
    "pandan":"swk03",
    "belaga":"swk03",
    "suai":"swk03",
    "tatau":"swk03",
    "sebauh":"swk03",
    "bintulu":"swk03",

    // SWK04
    "sibu":"swk04",
    "mukah":"swk04",
    "dalat":"swk04",
    "song":"swk04",
    "igan":"swk04",
    "oya":"swk04",
    "balingian":"swk04",
    "kanowit":"swk04",
    "kapit":"swk04",

    // SWK05
    "sarikei":"swk05",
    "matu":"swk05",
    "julau":"swk05",
    "rajang":"swk05",
    "daro":"swk05",
    "bintangor":"swk05",
    "belawai":"swk05",

    // SWK06
    "lubok antu":"swk06",
    "sri aman":"swk06",
    "roban":"swk06",
    "debak":"swk06",
    "kabong":"swk06",
    "lingga":"swk06",
    "engkelili":"swk06",
    "betong":"swk06",
    "spaoh":"swk06",
    "pusa":"swk06",
    "saratok":"swk06",

    // SWK07
    "serian":"swk07",
    "simunjan":"swk07",
    "samarahan":"swk07",
    "sebuyau":"swk07",
    "meludam":"swk07",

    // SWK08
    "kuching":"swk08",
    "bau":"swk08",
    "lundu":"swk08",
    "sematan":"swk08",

    // SWK09
    "kampung patarikan":"swk09",
    "patarikan":"swk09",


    // =================================================
    // TERENGGANU
    // =================================================

    // TRG01
    "kuala terengganu":"trg01",
    "marang":"trg01",
    "kuala nerus":"trg01",

    // TRG02
    "besut":"trg02",
    "setiu":"trg02",

    // TRG03
    "hulu terengganu":"trg03",

    // TRG04
    "dungun":"trg04",
    "kemaman":"trg04",


    // =================================================
    // WILAYAH PERSEKUTUAN
    // =================================================

    // WLY01
    "kuala lumpur":"wly01",
    "putrajaya":"wly01",

    // WLY02
    "labuan":"wly02"

};


// =====================================================
// NORMALIZE LOCATION TEXT
// =====================================================
function normalizeLocation(value) {

    return String(value || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");

}


// =====================================================
// FIND PRAYER ZONE
// =====================================================
function findPrayerZone(address) {

    /*
        Nominatim kadang-kadang tak beri nama
        tempat dalam "city".

        Jadi kita semak:
        city
        town
        village
        hamlet
        municipality
        suburb
        neighbourhood
        district
        county
        state_district
    */

    const candidates = [

        address.city,
        address.town,
        address.village,
        address.hamlet,
        address.municipality,
        address.suburb,
        address.neighbourhood,
        address.city_district,
        address.district,
        address.state_district,
        address.county

    ];


    console.log(
        "🔎 LOCATION CANDIDATES:",
        candidates
    );


    // =================================================
    // 1. EXACT MATCH
    // =====================================================

    for (const candidate of candidates) {

        const value =
            normalizeLocation(candidate);

        if (!value) {
            continue;
        }


        if (zoneMap[value]) {

            console.log(
                `🎯 EXACT MATCH: ${value} → ${zoneMap[value]}`
            );

            return zoneMap[value];

        }

    }


    // =================================================
    // 2. PARTIAL MATCH
    // =====================================================

    /*
        Susun key panjang dahulu supaya:

        "parit buntar"
        tidak tersalah match
        dengan "parit".
    */

    const keys =
        Object.keys(zoneMap)
            .sort(
                (a, b) =>
                    b.length - a.length
            );


    for (const candidate of candidates) {

        const value =
            normalizeLocation(candidate);


        if (!value) {
            continue;
        }


        for (const key of keys) {

            if (
                value.includes(key)
            ) {

                console.log(
                    `🎯 PARTIAL MATCH: ${value} → ${key} → ${zoneMap[key]}`
                );

                return zoneMap[key];

            }

        }

    }


    // =================================================
    // 3. STATE FALLBACK
    // =====================================================

    /*
        Fallback negeri hanya digunakan
        untuk negeri yang mempunyai satu
        zon sahaja.

        Negeri multi-zon seperti:
        Perak
        Kedah
        Selangor
        Negeri Sembilan
        Sabah
        Sarawak
        dll

        TIDAK dipaksa kepada satu zon.
    */

    const state =
        normalizeLocation(
            address.state
        );


    console.log(
        "🏴 STATE:",
        state
    );


    if (
        state === "perlis"
    ) {

        return "pls01";

    }


    if (
        state === "pulau pinang" ||
        state === "penang"
    ) {

        return "png01";

    }


    if (
        state === "melaka" ||
        state === "malacca"
    ) {

        return "mlk01";

    }


    if (
        state.includes(
            "kuala lumpur"
        )
    ) {

        return "wly01";

    }


    if (
        state.includes(
            "putrajaya"
        )
    ) {

        return "wly01";

    }


    if (
        state.includes(
            "labuan"
        )
    ) {

        return "wly02";

    }


    return null;

}


// =====================================================
// UPDATE CLOCK
// =====================================================
function updateClock() {

    const now = new Date();


    const malaysiaTime =
        now.toLocaleTimeString(
            "en-GB",
            {
                timeZone:
                    "Asia/Kuala_Lumpur",

                hour12:
                    false
            }
        );


    document
        .getElementById(
            "current-time"
        )
        .innerHTML =
        malaysiaTime;


    const mekahTime =
        now.toLocaleTimeString(
            "en-GB",
            {
                timeZone:
                    "Asia/Riyadh",

                hour12:
                    false
            }
        );


    document
        .getElementById(
            "mekah-time"
        )
        .innerHTML =
        mekahTime;


    const date =
        now.toLocaleDateString(
            "ms-MY",
            {
                weekday:
                    "long",

                year:
                    "numeric",

                month:
                    "long",

                day:
                    "numeric"
            }
        );


    document
        .getElementById(
            "date"
        )
        .innerHTML =
        date;

}


// =====================================================
// LOAD HIJRI DATE
// =====================================================
async function loadHijriDate() {

    try {

        const response =
            await fetch(
                "https://api.aladhan.com/v1/gToH"
            );


        const data =
            await response.json();


        const hijri =
            data.data.hijri;


        document
            .getElementById(
                "hijri-date"
            )
            .innerHTML =
            `${hijri.day} ${hijri.month.en} ${hijri.year}H`;


    } catch (error) {

        console.log(
            "Hijri Date Error:",
            error
        );

    }

}


// =====================================================
// REVERSE GPS
// =====================================================
async function reverseLocation(
    lat,
    lon
) {

    const response =
        await fetch(

            `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lon}`

        );


    if (!response.ok) {

        throw new Error(
            `Location API Error ${response.status}`
        );

    }


    return await response.json();

}


// =====================================================
// DISPLAY LOCATION
// =====================================================
function displayLocation(
    address,
    lat,
    lon
) {

 const HQ_LAT = 5.397037222307945;
    const HQ_LON = 100.39857514232843;
    const HQ_RADIUS = 80;

        const R = 6371000;

    const dLat =
        (HQ_LAT - lat) * Math.PI / 180;

    const dLon =
        (HQ_LON - lon) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat * Math.PI / 180) *
        Math.cos(HQ_LAT * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    const distance =
        R * 2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    const locationElement =
        document.getElementById(
            "location"
        );


    if (!locationElement) {
        return;
    }

if (
    distance <= HQ_RADIUS
) {

    locationElement.innerHTML =
        "📍 PRIME HQ • Seberang Jaya";

    return;
}

    let place =

        address.city ||

        address.town ||

        address.village ||

        address.hamlet ||

        address.municipality ||

        address.suburb ||

        address.neighbourhood ||

        address.city_district ||

        address.district ||

        address.county ||

        address.state_district ||

        address.state ||

        "Malaysia";

        const fullLocation =
    normalizeLocation([
        address.city,
        address.town,
        address.village,
        address.hamlet,
        address.municipality,
        address.suburb,
        address.neighbourhood,
        address.city_district,
        address.district,
        address.county,
        address.state_district
    ]
    .filter(Boolean)
    .join(" "));

    if (
    fullLocation.includes(
        "seberang jaya"
    )
) {

    place =
        "Seberang Jaya";
}

    const state =
        address.state || "";


    if (
        state &&
        normalizeLocation(place) !==
        normalizeLocation(state)
    ) {

        locationElement.innerHTML =
            `📍 ${place}, ${state}`;

    } else {

        locationElement.innerHTML =
            `📍 ${place}`;

    }

}


// =====================================================
// GET LOCATION
// =====================================================
function getLocation() {

    return new Promise(
        (resolve) => {


            if (
                !navigator.geolocation
            ) {

                console.log(
                    "GPS tidak disokong."
                );

                resolve(false);

                return;

            }


            const locationElement =
                document.getElementById(
                    "location"
                );


            if (locationElement) {

                locationElement.innerHTML =
                    "📍 Detecting Location...";

            }


            navigator
                .geolocation
                .getCurrentPosition(

                    async (
                        position
                    ) => {


                        const lat =
                            position
                                .coords
                                .latitude;


                        const lon =
                            position
                                .coords
                                .longitude;


                        console.log(
                            "📍 GPS:",
                            lat,
                            lon
                        );


                        try {


                            const data =
                                await reverseLocation(
                                    lat,
                                    lon
                                );


                            const address =
                                data.address || {};


                            console.log(
                                "📍 FULL ADDRESS:",
                                address
                            );


                            // Papar bandar / daerah
                        displayLocation(
                               address,
                               lat,
                               lon
                            );


                            // Cari zon JAKIM
                            const detectedZone =
                                findPrayerZone(
                                    address
                                );


                            console.log(
                                "🎯 DETECTED ZONE:",
                                detectedZone
                            );


                            console.log(
                                "🕌 CURRENT ZONE:",
                                currentZone
                            );


                            if (
                                detectedZone
                            ) {


                                currentZone =
                                    detectedZone;


                                localStorage
                                    .setItem(
                                        "currentPrayerZone",
                                        currentZone
                                    );


                                console.log(
                                    `✅ ACTIVE ZONE: ${currentZone}`
                                );


                                resolve(
                                    true
                                );


                            } else {


                                console.warn(
                                    "⚠️ Lokasi berjaya dikesan tetapi zon JAKIM tak dapat dikenal pasti."
                                );


                                /*
                                    Jangan reset ke Jitra.

                                    Kalau GPS/locality tak match,
                                    kekalkan zon terakhir yang
                                    pernah berjaya dikesan.
                                */

                                resolve(
                                    false
                                );

                            }


                        } catch (
                            error
                        ) {


                            console.log(
                                "Ralat deteksi lokasi:",
                                error
                            );


                            resolve(
                                false
                            );

                        }

                    },


                    (
                        error
                    ) => {


                        console.log(
                            "GPS Error:",
                            error
                        );


                        /*
                            GPS gagal:
                            jangan ubah currentZone.
                        */

                        resolve(
                            false
                        );

                    },


                    {

                        enableHighAccuracy:
                            true,

                        timeout:
                            12000,

                        maximumAge:
                            60000

                    }

                );

        }

    );

}


// =====================================================
// WATCH LOCATION CHANGES
// =====================================================
function watchLocationChanges() {

    if (
        !navigator.geolocation
    ) {

        return;

    }


    navigator
        .geolocation
        .watchPosition(

            async (
                position
            ) => {


                const lat =
                    position
                        .coords
                        .latitude;


                const lon =
                    position
                        .coords
                        .longitude;


                /*
                    Kurangkan call reverse API
                    kalau GPS cuma bergerak
                    beberapa meter.
                */

                const locationKey =
                    `${lat.toFixed(3)},${lon.toFixed(3)}`;


                if (
                    locationKey ===
                    lastLocationKey
                ) {

                    return;

                }


                lastLocationKey =
                    locationKey;


                try {


                    const data =
                        await reverseLocation(
                            lat,
                            lon
                        );


                    const address =
                        data.address || {};


                    displayLocation(
                       address,
                       lat,
                       lon
                         );


                    const detectedZone =
                        findPrayerZone(
                            address
                        );


                    console.log(
                        "🚗 WATCH ZONE:",
                        detectedZone
                    );


                    if (
                        detectedZone &&
                        detectedZone !==
                        currentZone
                    ) {


                        const oldZone =
                            currentZone;


                        currentZone =
                            detectedZone;


                        localStorage
                            .setItem(
                                "currentPrayerZone",
                                currentZone
                            );


                        console.log(
                            `🚗 ZONE BERUBAH: ${oldZone} → ${currentZone}`
                        );


                        // PENTING:
                        // Bila zone berubah,
                        // terus load waktu solat baru.
                        await loadPrayerTimes();


                    }


                } catch (
                    error
                ) {


                    console.log(
                        "Location Watch Error:",
                        error
                    );

                }

            },


            (
                error
            ) => {


                console.log(
                    "GPS Watch Error:",
                    error
                );

            },


            {

                enableHighAccuracy:
                    false,

                timeout:
                    10000,

                maximumAge:
                    300000

            }

        );

}


// =====================================================
// LOAD PRAYER TIME + AUTO TAG
// =====================================================
async function loadPrayerTimes() {

    try {

        console.log(
            `🕌 Loading prayer time: ${currentZone}`
        );


        const response =
            await fetch(

                `https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=today&zone=${currentZone}`

            );


        const data =
            await response.json();


        if (
            !data.prayerTime ||
            !data.prayerTime[0]
        ) {

            throw new Error(
                "Tiada data waktu solat diterima."
            );

        }


        const prayer =
            data.prayerTime[0];


        prayerTimes = {

            imsak:
                prayer.imsak.substring(
                    0,
                    5
                ),

            fajr:
                prayer.fajr.substring(
                    0,
                    5
                ),

            syuruk:
                prayer.syuruk.substring(
                    0,
                    5
                ),

            dhuhr:
                prayer.dhuhr.substring(
                    0,
                    5
                ),

            asr:
                prayer.asr.substring(
                    0,
                    5
                ),

            maghrib:
                prayer.maghrib.substring(
                    0,
                    5
                ),

            isha:
                prayer.isha.substring(
                    0,
                    5
                )

        };


        // =========================
        // UPDATE INTERFACE ASAL
        // =========================

        document
            .getElementById(
                "imsak"
            )
            .innerHTML =
            prayerTimes.imsak;


        document
            .getElementById(
                "fajr"
            )
            .innerHTML =
            prayerTimes.fajr;


        document
            .getElementById(
                "syuruk"
            )
            .innerHTML =
            prayerTimes.syuruk;


        document
            .getElementById(
                "dhuhr"
            )
            .innerHTML =
            prayerTimes.dhuhr;


        document
            .getElementById(
                "asr"
            )
            .innerHTML =
            prayerTimes.asr;


        document
            .getElementById(
                "maghrib"
            )
            .innerHTML =
            prayerTimes.maghrib;


        document
            .getElementById(
                "isha"
            )
            .innerHTML =
            prayerTimes.isha;


        console.log(
            `✅ Prayer time loaded: ${currentZone}`,
            prayerTimes
        );


        updateNextPrayer();


        // =========================
        // AUTO TAG ONESIGNAL
        // =========================

        if (
            window.OneSignalDeferred
        ) {


            OneSignalDeferred
                .push(

                    function(
                        OneSignal
                    ) {


                        OneSignal
                            .User
                            .addTag(
                                "user_zone",
                                currentZone
                            );


                        console.log(
                            `[ONESIGNAL] Tag zon berjaya didaftarkan: ${currentZone}`
                        );

                    }

                );

        }


    } catch (
        error
    ) {


        console.log(
            "Prayer API Error:",
            error
        );

    }

}


// =====================================================
// UPDATE NEXT PRAYER
// =====================================================
function updateNextPrayer() {

    if (
        !prayerTimes.fajr
    ) {

        return;

    }


    const now =
        new Date();


    const localTime =
        new Date(

            now.toLocaleString(
                "en-US",
                {
                    timeZone:
                        "Asia/Kuala_Lumpur"
                }
            )

        );


    const currentMinutes =

        localTime.getHours() *
        60 +

        localTime.getMinutes();


    const prayers = [

        {
            name:
                "Subuh",

            time:
                prayerTimes.fajr
        },

        {
            name:
                "Zohor",

            time:
                prayerTimes.dhuhr
        },

        {
            name:
                "Asar",

            time:
                prayerTimes.asr
        },

        {
            name:
                "Maghrib",

            time:
                prayerTimes.maghrib
        },

        {
            name:
                "Isyak",

            time:
                prayerTimes.isha
        }

    ];


    nextPrayer =
        null;


    for (
        const prayer
        of prayers
    ) {


        const [
            hour,
            minute
        ] =
            prayer.time
                .split(":")
                .map(Number);


        const prayerMinutes =

            hour *
            60 +

            minute;


        if (
            prayerMinutes >
            currentMinutes
        ) {


            nextPrayer =
                prayer;


            break;

        }

    }


    if (
        !nextPrayer
    ) {


        nextPrayer = {

            name:
                "Subuh",

            time:
                prayerTimes.fajr

        };

    }


    document
        .getElementById(
            "next-prayer"
        )
        .innerHTML =
        nextPrayer.name;


    highlightPrayer();

}


// =====================================================
// COUNTDOWN SOLAT
// =====================================================
function startCountdown() {

    setInterval(
        () => {


            if (
                !nextPrayer
            ) {

                return;

            }


            const now =
                new Date();


            const localTime =
                new Date(

                    now.toLocaleString(
                        "en-US",
                        {
                            timeZone:
                                "Asia/Kuala_Lumpur"
                        }
                    )

                );


            const [
                hour,
                minute
            ] =
                nextPrayer
                    .time
                    .split(":")
                    .map(Number);


            const target =
                new Date(
                    localTime
                );


            target.setHours(
                hour
            );


            target.setMinutes(
                minute
            );


            target.setSeconds(
                0
            );


            if (
                target <=
                localTime
            ) {


                target.setDate(
                    target.getDate() +
                    1
                );

            }


            const diff =
                target -
                localTime;


            const hours =
                Math.floor(

                    diff /
                    1000 /
                    60 /
                    60

                );


            const minutes =
                Math.floor(

                    (
                        diff /
                        1000 /
                        60
                    ) %
                    60

                );


            const seconds =
                Math.floor(

                    (
                        diff /
                        1000
                    ) %
                    60

                );


            document
                .getElementById(
                    "hours"
                )
                .innerHTML =

                String(hours)
                    .padStart(
                        2,
                        "0"
                    );


            document
                .getElementById(
                    "minutes"
                )
                .innerHTML =

                String(minutes)
                    .padStart(
                        2,
                        "0"
                    );


            document
                .getElementById(
                    "seconds"
                )
                .innerHTML =

                String(seconds)
                    .padStart(
                        2,
                        "0"
                    );


            updateNextPrayer();


        },

        1000
    );

}


// =====================================================
// HIGHLIGHT PRAYER
// =====================================================
function highlightPrayer() {

    document
        .querySelectorAll(
            ".prayer-row"
        )
        .forEach(

            row => {

                row
                    .classList
                    .remove(
                        "active-prayer"
                    );

            }

        );


    if (
        !nextPrayer
    ) {

        return;

    }


    const prayerMap = {

        Subuh:
            "fajr",

        Zohor:
            "dhuhr",

        Asar:
            "asr",

        Maghrib:
            "maghrib",

        Isyak:
            "isha"

    };


    const id =
        prayerMap[
            nextPrayer.name
        ];


    const element =
        document
            .getElementById(
                id
            );


    if (
        element
    ) {


        element
            .parentElement
            .classList
            .add(
                "active-prayer"
            );

    }

}


// =====================================================
// PLAY AZAN
// =====================================================
function playAzan(
    prayerName
) {

    // Semak mute
    const isMuted =
        localStorage
            .getItem(
                "azanMuted"
            ) ===
        "true";


    if (
        isMuted
    ) {

        console.log(
            "🔇 Azan muted"
        );

        return;

    }


    let audioFile =
        "azan.mp3";


    if (
        prayerName ===
        "Subuh"
    ) {

        audioFile =
            "azan-subuh.mp3";

    }


    if (
        currentAudio
    ) {


        currentAudio.pause();

        currentAudio.currentTime =
            0;

    }


    currentAudio =
        new Audio(
            audioFile
        );


    currentAudio.volume =
        1.0;


    currentAudio
        .play()
        .catch(

            (e) => {

                console.log(
                    "Audio disekat automatik oleh browser:",
                    e
                );

            }

        );

}


// =====================================================
// ENABLE NOTIFICATION
// IPHONE / SAFARI
// =====================================================
async function enableNotification() {

    console.log(
        "🚀 Mula proses subscribe..."
    );


    window
        .OneSignalDeferred
        .push(

            async function(
                OneSignal
            ) {


                try {


                    const permission =
                        await OneSignal
                            .Notifications
                            .requestPermission(
                                {
                                    force:
                                        true
                                }
                            );


                    console.log(
                        "Permission status:",
                        permission
                    );


                    if (
                        permission
                    ) {


                        await new Promise(

                            resolve =>
                                setTimeout(
                                    resolve,
                                    1000
                                )

                        );


                        const subscriptionId =

                            OneSignal
                                .User
                                .PushSubscription
                                .id;


                        console.log(
                            "✅ Subscription ID:",
                            subscriptionId
                        );


                        OneSignal
                            .User
                            .addTag(
                                "user_zone",
                                currentZone
                            );


                        notificationEnabled =
                            true;


                        alert(
                            "✅ Notifikasi telah diaktifkan!"
                        );


                    } else {


                        alert(
                            "❌ Kebenaran ditolak. Sila check Settings > Safari > Notifications."
                        );

                    }


                } catch (
                    error
                ) {


                    console.error(
                        "❌ Error:",
                        error
                    );


                    alert(
                        "Ralat: " +
                        error.message
                    );

                }

            }

        );

}


// =====================================================
// TOGGLE MUTE
// =====================================================
function toggleMute() {

    const muteBtn =
        document
            .getElementById(
                "mute-btn"
            );


    let isMuted =
        localStorage
            .getItem(
                "azanMuted"
            ) ===
        "true";


    isMuted =
        !isMuted;


    localStorage
        .setItem(
            "azanMuted",
            isMuted
        );


    if (
        isMuted
    ) {


        if (
            muteBtn
        ) {

            muteBtn.innerHTML =
                "🔇 Muted";

        }


        if (
            currentAudio
        ) {

            currentAudio.pause();

            currentAudio.currentTime =
                0;

        }


    } else {


        if (
            muteBtn
        ) {

            muteBtn.innerHTML =
                "🔊 Sound ON";

        }

    }

}


// =====================================================
// TEST NOTIFICATION
// =====================================================
async function testNotification() {

    try {


        playAzan(
            "Maghrib"
        );


        await fetch(

            `/api/sendPrayerAlert?zone=${currentZone}&message=TEST PUSH`

        );


        alert(
            "✅ Push Sent"
        );


    } catch (
        error
    ) {


        console.log(
            error
        );

    }

}


// =====================================================
// CHECK PRAYER ALERTS
// =====================================================
function checkPrayerAlerts() {

    if (
        !prayerTimes.fajr
    ) {

        return;

    }


    const now =
        new Date();


    const localTime =
        new Date(

            now.toLocaleString(
                "en-US",
                {
                    timeZone:
                        "Asia/Kuala_Lumpur"
                }
            )

        );


    const currentTime =

        `${String(
            localTime
                .getHours()
        )
            .padStart(
                2,
                "0"
            )}:${String(
                localTime
                    .getMinutes()
            )
                .padStart(
                    2,
                    "0"
                )}`;


    const prayers = [

        {
            name:
                "Subuh",

            time:
                prayerTimes.fajr
        },

        {
            name:
                "Zohor",

            time:
                prayerTimes.dhuhr
        },

        {
            name:
                "Asar",

            time:
                prayerTimes.asr
        },

        {
            name:
                "Maghrib",

            time:
                prayerTimes.maghrib
        },

        {
            name:
                "Isyak",

            time:
                prayerTimes.isha
        }

    ];


    prayers
        .forEach(

            prayer => {


                const [
                    hour,
                    minute
                ] =
                    prayer
                        .time
                        .split(":")
                        .map(Number);


                // =========================
                // 10 MINIT SEBELUM
                // =========================

                const before =
                    new Date(
                        localTime
                    );


                before.setHours(
                    hour
                );


                before.setMinutes(
                    minute -
                    10
                );


                const beforeTime =

                    `${String(
                        before
                            .getHours()
                    )
                        .padStart(
                            2,
                            "0"
                        )}:${String(
                            before
                                .getMinutes()
                        )
                            .padStart(
                                2,
                                "0"
                            )}`;


                if (
                    currentTime ===
                    beforeTime &&

                    lastNotification !==
                    `${prayer.name}-before`
                ) {


                    lastNotification =
                        `${prayer.name}-before`;


                    alert(
                        `🕌 ${prayer.name} Lagi 10 Minit`
                    );

                }


                // =========================
                // WAKTU SOLAT
                // =========================

                if (
                    currentTime ===
                    prayer.time &&

                    lastNotification !==
                    prayer.name
                ) {


                    lastNotification =
                        prayer.name;


                    playAzan(
                        prayer.name
                    );


                    alert(
                        `🕌 Waktu Solat ${prayer.name} Telah Masuk`
                    );

                }

            }

        );

}


// =====================================================
// ISLAMIC EVENT COUNTDOWN
// TAK BERGANTUNG KEPADA GPS
// =====================================================
async function updateIslamicCountdown() {

    try {


        const response =
            await fetch(
                "https://api.aladhan.com/v1/gToH"
            );


        const data =
            await response.json();


        const hijri =
            data.data.hijri;


        const currentMonth =
            parseInt(
                hijri
                    .month
                    .number
            );


        const currentDay =
            parseInt(
                hijri.day
            );


        let ramadhanDays =
            0;


        if (
            currentMonth <
            9
        ) {


            ramadhanDays =

                (
                    9 -
                    currentMonth
                ) *
                30 -

                currentDay;


        } else if (
            currentMonth ===
            9
        ) {


            ramadhanDays =
                0;


        } else {


            ramadhanDays =

                (
                    12 -
                    currentMonth +
                    9
                ) *
                30 -

                currentDay;

        }


        const rayaDays =
            ramadhanDays +
            30;


        let hajiDays =
            0;


        if (
            currentMonth <
            12
        ) {


            hajiDays =

                (
                    12 -
                    currentMonth
                ) *
                30 -

                currentDay +
                10;


        } else {


            hajiDays =

                10 -
                currentDay;


            if (
                hajiDays <
                0
            ) {


                hajiDays =
                    0;

            }

        }


        document
            .getElementById(
                "ramadhan-countdown"
            )
            .innerHTML =

            `🌙 Ramadan • ${ramadhanDays} Hari Lagi`;


        document
            .getElementById(
                "aidilfitri-countdown"
            )
            .innerHTML =

            `🎉 Aidilfitri • ${rayaDays} Hari Lagi`;


        document
            .getElementById(
                "aidiladha-countdown"
            )
            .innerHTML =

            `🐄 Aidiladha • ${hajiDays} Hari Lagi`;


    } catch (
        error
    ) {


        console.log(
            "Islamic Countdown Error:",
            error
        );

    }

}


// =====================================================
// INIT
// =====================================================
console.log(
    "✅ SCRIPT LOADED"
);


// JAM TERUS JALAN
updateClock();

setInterval(
    updateClock,
    1000
);


// HIJRI DATE TERUS JALAN
loadHijriDate();


// =====================================================
// PENTING:
// COUNTDOWN RAMADAN / RAYA
// TERUS JALAN TANPA TUNGGU GPS
// =====================================================
updateIslamicCountdown();


// =====================================================
// INIT APP
// =====================================================
async function initApp() {


    /*
        FLOW:

        Clock / Hijri / Islamic Countdown
        terus jalan.

        GPS
        ↓
        Detect bandar / daerah
        ↓
        Match zon JAKIM
        ↓
        Load waktu solat
        ↓
        Countdown solat
    */


    // =================================================
    // 1. GPS DAHULU UNTUK WAKTU SOLAT
    // =================================================

    const detected =
        await getLocation();


    console.log(
        "📍 GPS SUCCESS:",
        detected
    );


    console.log(
        "🕌 ACTIVE ZONE:",
        currentZone
    );


    // =================================================
    // 2. LOAD WAKTU SOLAT
    // =================================================

    await loadPrayerTimes();


    // =================================================
    // 3. COUNTDOWN SOLAT
    // =================================================

    startCountdown();


    // =================================================
    // 4. ALERT CHECK
    // =================================================

    checkPrayerAlerts();


    setInterval(
        checkPrayerAlerts,
        20000
    );


    // =================================================
    // 5. WATCH GPS BILA TRAVEL
    // =================================================

    watchLocationChanges();


    // =================================================
    // 6. BILA APP DIBUKA BALIK
    // =================================================

    document
        .addEventListener(

            "visibilitychange",

            async () => {


                if (
                    !document.hidden
                ) {


                    console.log(
                        "📱 App aktif semula"
                    );


                    const oldZone =
                        currentZone;


                    // Check GPS semula
                    await getLocation();


                    // Kalau zon berubah,
                    // reload waktu solat.
                    if (
                        currentZone !==
                        oldZone
                    ) {


                        console.log(
                            `🚗 ZON BERUBAH: ${oldZone} → ${currentZone}`
                        );


                        await loadPrayerTimes();

                    }


                    checkPrayerAlerts();

                }

            }

        );


    console.log(
        `✅ MY SOLAT READY — ZONE ${currentZone.toUpperCase()}`
    );

}


// =====================================================
// START APP
// =====================================================

initApp();
