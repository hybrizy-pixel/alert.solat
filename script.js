// =========================
// ONESIGNAL INIT
// =========================

window.OneSignalDeferred =
window.OneSignalDeferred || [];

OneSignalDeferred.push(
async function(OneSignal){

await OneSignal.init({

appId:
"399a4625-3fc2-47fd-b4a7-5e50c5542f53",

safari_web_id:
"web.onesignal.auto.REPLACE_THIS",

notifyButton:{
enable:false
}

});

console.log(
"✅ OneSignal Ready"
);

});


// =========================
// GLOBAL VARIABLES
// =========================

let prayerTimes = {};

let nextPrayer = null;

let notificationEnabled = false;

let lastNotification = "";

let currentAudio = null;

let currentZone = "kdh01";

let lastCity = "";


// =========================
// ZONE MAP
// =========================

const zoneMap = {

"jitra":"kdh01",
"kubang pasu":"kdh01",
"alor setar":"kdh01",
"pokok sena":"kdh01",

"sungai petani":"kdh02",
"pendang":"kdh02",
"yan":"kdh02",

"sik":"kdh03",
"padang terap":"kdh03",

"baling":"kdh04",

"kulim":"kdh05",
"bandar baharu":"kdh05",

"langkawi":"kdh06",

"george town":"png01",
"penang":"png01",

"bangi":"sgr01",
"kajang":"sgr01",
"shah alam":"sgr01",

"kuala lumpur":"wly01",
"putrajaya":"wly01",

"johor bahru":"jhr02",
"kulai":"jhr02",

"muar":"jhr04",

"seremban":"ngr01",

"ipoh":"prk02"

};


// =========================
// UPDATE CLOCK
// =========================

function updateClock(){

const now = new Date();

const malaysiaTime =
now.toLocaleTimeString(
"en-GB",
{
hour12:false
}
);

document.getElementById(
"current-time"
).innerHTML =
malaysiaTime;


const mekahTime =
now.toLocaleTimeString(
"en-GB",
{
timeZone:"Asia/Riyadh",
hour12:false
}
);

document.getElementById(
"mekah-time"
).innerHTML =
mekahTime;


const date =
now.toLocaleDateString(
"ms-MY",
{
weekday:"long",
year:"numeric",
month:"long",
day:"numeric"
}
);

document.getElementById(
"date"
).innerHTML =
date;

}


// =========================
// LOAD HIJRI DATE
// =========================

async function loadHijriDate(){

try{

const response =
await fetch(
"https://api.aladhan.com/v1/gToH"
);

const data =
await response.json();

const hijri =
data.data.hijri;

document.getElementById(
"hijri-date"
).innerHTML =

`${hijri.day} ${hijri.month.en} ${hijri.year}H`;

}

catch(error){

console.log(error);

}

}


// =========================
// GET LOCATION
// =========================

async function getLocation(){

if(!navigator.geolocation) return;

document.getElementById(
"location"
).innerHTML =
"📍 Detecting Location...";


navigator.geolocation.watchPosition(

async(position)=>{

const lat =
position.coords.latitude;

const lon =
position.coords.longitude;


try{

const response =
await fetch(

`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`

);

const data =
await response.json();

const city =

data.address.city ||
data.address.town ||
data.address.village ||
data.address.county ||
"Malaysia";

const state =
data.address.state || "";


document.getElementById(
"location"
).innerHTML =

`📍 ${city}, ${state}`;


const cityLower =
city.toLowerCase();

if(cityLower === lastCity){

return;

}

lastCity = cityLower;

if(zoneMap[cityLower]){

const newZone =
zoneMap[cityLower];

if(newZone !== currentZone){

currentZone = newZone;

loadPrayerTimes();

}

}

}

catch(error){

console.log(error);

}

},

(error)=>{

console.log(error);

},

{
enableHighAccuracy:false,
timeout:5000,
maximumAge:600000
}

);

}


// =========================
// LOAD PRAYER TIME
// =========================

async function loadPrayerTimes(){

try{

const response =
await fetch(

`https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=today&zone=${currentZone}`

);

const data =
await response.json();

const prayer =
data.prayerTime[0];


prayerTimes = {

imsak:
prayer.imsak.substring(0,5),

fajr:
prayer.fajr.substring(0,5),

syuruk:
prayer.syuruk.substring(0,5),

dhuhr:
prayer.dhuhr.substring(0,5),

asr:
prayer.asr.substring(0,5),

maghrib:
prayer.maghrib.substring(0,5),

isha:
prayer.isha.substring(0,5)

};


document.getElementById("imsak").innerHTML =
prayerTimes.imsak;

document.getElementById("fajr").innerHTML =
prayerTimes.fajr;

document.getElementById("syuruk").innerHTML =
prayerTimes.syuruk;

document.getElementById("dhuhr").innerHTML =
prayerTimes.dhuhr;

document.getElementById("asr").innerHTML =
prayerTimes.asr;

document.getElementById("maghrib").innerHTML =
prayerTimes.maghrib;

document.getElementById("isha").innerHTML =
prayerTimes.isha;

updateNextPrayer();

}

catch(error){

console.log(error);

}

}


// =========================
// UPDATE NEXT PRAYER
// =========================

function updateNextPrayer(){

if(!prayerTimes.fajr) return;

const now = new Date();

const currentMinutes =

now.getHours() * 60 +
now.getMinutes();

const prayers = [

{
name:"Subuh",
time:prayerTimes.fajr
},

{
name:"Zohor",
time:prayerTimes.dhuhr
},

{
name:"Asar",
time:prayerTimes.asr
},

{
name:"Maghrib",
time:prayerTimes.maghrib
},

{
name:"Isyak",
time:prayerTimes.isha
}

];

nextPrayer = null;

for(const prayer of prayers){

const [hour,minute] =
prayer.time.split(":").map(Number);

const prayerMinutes =
hour * 60 + minute;

if(prayerMinutes > currentMinutes){

nextPrayer = prayer;

break;

}

}

if(!nextPrayer){

nextPrayer = {

name:"Subuh",

time:prayerTimes.fajr

};

}

document.getElementById(
"next-prayer"
).innerHTML =
nextPrayer.name;

highlightPrayer();

}


// =========================
// COUNTDOWN
// =========================

function startCountdown(){

setInterval(()=>{

if(!nextPrayer) return;

const now = new Date();

const [hour,minute] =
nextPrayer.time.split(":").map(Number);

const target = new Date();

target.setHours(hour);
target.setMinutes(minute);
target.setSeconds(0);

if(target <= now){

target.setDate(
target.getDate() + 1
);

}

const diff =
target - now;

const hours =
Math.floor(diff / 1000 / 60 / 60);

const minutes =
Math.floor(
(diff / 1000 / 60) % 60
);

const seconds =
Math.floor(
(diff / 1000) % 60
);

document.getElementById("hours").innerHTML =
String(hours).padStart(2,"0");

document.getElementById("minutes").innerHTML =
String(minutes).padStart(2,"0");

document.getElementById("seconds").innerHTML =
String(seconds).padStart(2,"0");

updateNextPrayer();

},1000);

}


// =========================
// HIGHLIGHT PRAYER
// =========================

function highlightPrayer(){

document
.querySelectorAll(".prayer-row")
.forEach(row=>{

row.classList.remove(
"active-prayer"
);

});

if(!nextPrayer) return;

const prayerMap = {

Subuh:"fajr",
Zohor:"dhuhr",
Asar:"asr",
Maghrib:"maghrib",
Isyak:"isha"

};

const id =
prayerMap[nextPrayer.name];

const element =
document.getElementById(id);

if(element){

element.parentElement.classList.add(
"active-prayer"
);

}

}


// =========================
// PLAY AZAN
// =========================

function playAzan(prayerName){

let audioFile =
"azan.mp3";

if(prayerName === "Subuh"){

audioFile =
"azan-subuh.mp3";

}

if(currentAudio){

currentAudio.pause();

currentAudio.currentTime = 0;

}

currentAudio =
new Audio(audioFile);

currentAudio.volume = 1.0;

currentAudio.play().catch(()=>{});

}


// =========================
// ENABLE NOTIFICATION
// =========================

async function enableNotification(){

try{

await OneSignal.Notifications
.requestPermission();

setTimeout(async()=>{

const subscriptionId =
await OneSignal.User.PushSubscription.getIdAsync();

if(subscriptionId){

notificationEnabled = true;

console.log(
"SUBSCRIPTION ID:",
subscriptionId
);

alert(
`✅ CONNECTED\n\n${subscriptionId}`
);

}

else{

alert(
"❌ Subscription Failed"
);

}

},3000);

}

catch(error){

console.log(error);

alert(
`ERROR: ${error.message}`
);

}

}


// =========================
// TEST NOTIFICATION
// =========================

async function testNotification(){

try{

playAzan("Maghrib");

await fetch(
`/api/sendPrayerAlert?message=TEST PUSH`
);

alert(
"✅ Push Sent"
);

}

catch(error){

console.log(error);

}

}


// =========================
// CHECK PRAYER ALERTS
// =========================

function checkPrayerAlerts(){

if(!prayerTimes.fajr) return;

const now = new Date();

const currentTime =
`${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;

const prayers = [

{name:"Subuh",time:prayerTimes.fajr},
{name:"Zohor",time:prayerTimes.dhuhr},
{name:"Asar",time:prayerTimes.asr},
{name:"Maghrib",time:prayerTimes.maghrib},
{name:"Isyak",time:prayerTimes.isha}

];

prayers.forEach(prayer=>{

const [hour,minute] =
prayer.time.split(":").map(Number);


// =========================
// 10 MIN BEFORE
// =========================

const before = new Date();

before.setHours(hour);
before.setMinutes(minute - 10);

const beforeTime =
`${String(before.getHours()).padStart(2,"0")}:${String(before.getMinutes()).padStart(2,"0")}`;

if(
currentTime === beforeTime &&
lastNotification !== `${prayer.name}-before`
){

lastNotification =
`${prayer.name}-before`;

alert(
`🕌 ${prayer.name} Lagi 10 Minit`
);

fetch(
`/api/sendPrayerAlert?message=${prayer.name} Lagi 10 Minit`
);

}


// =========================
// EXACT PRAYER TIME
// =========================

if(
currentTime === prayer.time &&
lastNotification !== prayer.name
){

lastNotification =
prayer.name;

playAzan(prayer.name);

alert(
`🕌 Waktu ${prayer.name} Telah Masuk`
);

fetch(
`/api/sendPrayerAlert?message=Waktu ${prayer.name} Telah Masuk`
);

}

});

}


// =========================
// ISLAMIC EVENT COUNTDOWN
// =========================

async function updateIslamicCountdown(){

try{

const response =
await fetch(
"https://api.aladhan.com/v1/gToH"
);

const data =
await response.json();

const hijri =
data.data.hijri;

const currentMonth =
parseInt(hijri.month.number);

const currentDay =
parseInt(hijri.day);

let ramadhanDays = 0;

if(currentMonth < 9){

ramadhanDays =
(9 - currentMonth) * 30 - currentDay;

}

else if(currentMonth === 9){

ramadhanDays = 0;

}

else{

ramadhanDays =
(12 - currentMonth + 9) * 30 - currentDay;

}

const rayaDays =
ramadhanDays + 30;

let hajiDays = 0;

if(currentMonth < 12){

hajiDays =
(12 - currentMonth) * 30 - currentDay + 10;

}

else{

hajiDays =
10 - currentDay;

if(hajiDays < 0){

hajiDays = 0;

}

}

document.getElementById(
"ramadhan-countdown"
).innerHTML =

`🌙 Ramadan • ${ramadhanDays} Hari Lagi`;

document.getElementById(
"aidilfitri-countdown"
).innerHTML =

`🎉 Aidilfitri • ${rayaDays} Hari Lagi`;

document.getElementById(
"aidiladha-countdown"
).innerHTML =

`🐄 Aidiladha • ${hajiDays} Hari Lagi`;

}

catch(error){

console.log(error);

}

}


// =========================
// INIT
// =========================

console.log(
"✅ SCRIPT LOADED"
);

updateClock();

setInterval(
updateClock,
1000
);

loadHijriDate();

getLocation();

loadPrayerTimes();

startCountdown();

updateIslamicCountdown();

setInterval(
checkPrayerAlerts,
30000
);