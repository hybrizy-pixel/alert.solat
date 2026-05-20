// =========================
// GLOBAL VARIABLES
// =========================

let prayerTimes = {};

let nextPrayer = null;

let notificationEnabled = false;

let lastNotification = "";

let currentAudio = null;

let currentZone = "kdh01";


// =========================
// ZONE MAP
// =========================

const zoneMap = {


// =========================
// KEDAH
// =========================

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


// =========================
// PENANG
// =========================

"george town":"png01",
"penang":"png01",
"bukit mertajam":"png01",
"butterworth":"png01",


// =========================
// SELANGOR
// =========================

"bangi":"sgr01",
"kajang":"sgr01",
"shah alam":"sgr01",
"petaling jaya":"sgr01",
"gombak":"sgr01",
"sepang":"sgr01",

"klang":"sgr03",
"kuala langat":"sgr03",


// =========================
// KL
// =========================

"kuala lumpur":"wly01",
"putrajaya":"wly01",


// =========================
// JOHOR
// =========================

"johor bahru":"jhr02",
"kulai":"jhr02",

"batu pahat":"jhr04",
"muar":"jhr04",


// =========================
// PERAK
// =========================

"ipoh":"prk02",
"taiping":"prk01"

};


// =========================
// UPDATE CLOCK
// =========================

function updateClock() {

const now = new Date();


// =========================
// MALAYSIA TIME
// =========================

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


// =========================
// MEKAH TIME
// =========================

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


// =========================
// DATE
// =========================

const date = now.toLocaleDateString(
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
).innerHTML = date;

}


// =========================
// HIJRI DATE
// =========================

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
// GET LOCATION + AUTO ZONE
// =========================

async function getLocation() {

if (!navigator.geolocation) return;

document.getElementById(
"location"
).innerHTML =

"📍 Detecting Location...";


navigator.geolocation.getCurrentPosition(

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


// =========================
// CITY
// =========================

const city =

data.address.city ||
data.address.town ||
data.address.village ||
data.address.county ||
"Malaysia";


// =========================
// STATE
// =========================

const state =
data.address.state || "";


// =========================
// DISPLAY
// =========================

document.getElementById(
"location"
).innerHTML =

`📍 ${city}, ${state}`;



// =========================
// AUTO ZONE
// =========================

const cityLower =
city.toLowerCase();

if(zoneMap[cityLower]){

currentZone =
zoneMap[cityLower];

}

console.log(
"ZONE:",
currentZone
);


// =========================
// LOAD PRAYER
// =========================

loadPrayerTimes();

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
maximumAge:60000
}

);

}


// =========================
// LOAD PRAYER TIME
// =========================

async function loadPrayerTimes() {

try {

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


// =========================
// UPDATE UI
// =========================

document.getElementById(
"imsak"
).innerHTML =
prayerTimes.imsak;

document.getElementById(
"fajr"
).innerHTML =
prayerTimes.fajr;

document.getElementById(
"syuruk"
).innerHTML =
prayerTimes.syuruk;

document.getElementById(
"dhuhr"
).innerHTML =
prayerTimes.dhuhr;

document.getElementById(
"asr"
).innerHTML =
prayerTimes.asr;

document.getElementById(
"maghrib"
).innerHTML =
prayerTimes.maghrib;

document.getElementById(
"isha"
).innerHTML =
prayerTimes.isha;


// =========================
// UPDATE NEXT PRAYER
// =========================

updateNextPrayer();

}

catch(error){

console.log(error);

}

}


// =========================
// UPDATE NEXT PRAYER
// =========================

function updateNextPrayer() {

if (!prayerTimes.fajr) return;

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


// =========================
// FIND NEXT PRAYER
// =========================

for (const prayer of prayers) {

const [hour,minute] =
prayer.time.split(":").map(Number);

const prayerMinutes =
hour * 60 + minute;


if (prayerMinutes > currentMinutes) {

nextPrayer = prayer;

break;

}

}


// =========================
// NEXT DAY
// =========================

if (!nextPrayer) {

nextPrayer = {

name:"Subuh",

time:prayerTimes.fajr

};

}


// =========================
// UPDATE UI
// =========================

document.getElementById(
"next-prayer"
).innerHTML =
nextPrayer.name;


// =========================
// HIGHLIGHT
// =========================

highlightPrayer();

}


// =========================
// COUNTDOWN
// =========================

function startCountdown() {

setInterval(()=>{

if (!nextPrayer) return;

const now = new Date();

const [hour,minute] =
nextPrayer.time.split(":").map(Number);

const target = new Date();

target.setHours(hour);
target.setMinutes(minute);
target.setSeconds(0);


// =========================
// NEXT DAY
// =========================

if (target <= now) {

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


// =========================
// UPDATE UI
// =========================

document.getElementById(
"hours"
).innerHTML =
String(hours).padStart(2,"0");

document.getElementById(
"minutes"
).innerHTML =
String(minutes).padStart(2,"0");

document.getElementById(
"seconds"
).innerHTML =
String(seconds).padStart(2,"0");


// =========================
// REFRESH NEXT PRAYER
// =========================

updateNextPrayer();

},1000);

}


// =========================
// HIGHLIGHT PRAYER
// =========================

function highlightPrayer() {

document
.querySelectorAll(".prayer-row")
.forEach(row=>{

row.classList.remove(
"active-prayer"
);

});

if (!nextPrayer) return;

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

if (element) {

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

currentAudio.play();

}


// =========================
// MUTE AZAN
// =========================

function muteAzan(){

if(currentAudio){

currentAudio.pause();

currentAudio.currentTime = 0;

}

}


// =========================
// ENABLE NOTIFICATION
// =========================

async function enableNotification(){

try{

await Notification.requestPermission();

notificationEnabled = true;

alert(
"🔔 Notification Enabled"
);

}

catch(error){

console.log(error);

}

}


// =========================
// TEST NOTIFICATION
// =========================

async function testNotification(){

try{

playAzan("Maghrib");

new Notification(

"🕌 MY SOLAT",

{

body:
"TEST AZAN ALERT",

icon:
"icon-192.png"

}

);

}

catch(error){

console.log(error);

}

}


// =========================
// ISLAMIC EVENT COUNTDOWN
// =========================

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
parseInt(hijri.month.number);

const currentDay =
parseInt(hijri.day);


// =========================
// RAMADAN
// =========================

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


// =========================
// AIDILFITRI
// =========================

let rayaDays =
ramadhanDays + 30;


// =========================
// AIDILADHA
// =========================

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


// =========================
// UPDATE UI
// =========================

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