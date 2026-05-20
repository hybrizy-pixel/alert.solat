// =========================
// GLOBAL VARIABLES
// =========================

let prayerTimes = {};

let nextPrayer = null;

let notificationEnabled = false;

let lastNotification = "";

let currentAudio = null;


// =========================
// UPDATE CLOCK
// =========================

function updateClock() {

const now = new Date();

const time = now.toLocaleTimeString(
"en-GB",
{
hour12:false
}
);

document.getElementById(
"current-time"
).innerHTML = time;


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
// GET LOCATION
// =========================

function getLocation() {

if (!navigator.geolocation) return;

navigator.geolocation.getCurrentPosition(

(position)=>{

document.getElementById(
"location"
).innerHTML =

"📍 Kubang Pasu / Jitra";

loadPrayerTimes();

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

"https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=today&zone=kdh01"

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
// HIGHLIGHT ACTIVE PRAYER
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
// ENABLE NOTIFICATION
// =========================

async function enableNotification() {

const isAndroid =
/Android/i.test(
navigator.userAgent
);

try {

if (isAndroid) {

console.log(
"ANDROID DETECTED"
);

}

await OneSignal.Notifications
.requestPermission();


const optedIn =

OneSignal
.User
.pushSubscription
.optedIn;


// =========================
// SUCCESS
// =========================

if (optedIn) {

notificationEnabled = true;

localStorage.setItem(
"notificationEnabled",
"true"
);

document
.querySelector(".notify-btn")
.classList.add(
"notify-active"
);

document
.querySelector(".notify-btn")
.innerHTML =

"✅ Notification Enabled";

}


// =========================
// FAILED
// =========================

else {

alert(
"❌ Notification belum dibenarkan."
);

}

}

catch(error){

console.log(error);

alert(
"❌ Subscription Error"
);

}

}


// =========================
// PLAY BEEP
// =========================

function playBeep(){

const audio =
new Audio(
"beep.mp3"
);

audio.volume = 1.0;

audio.play();

}


// =========================
// PLAY AZAN
// =========================

function playAzan(prayerName){

let audioFile =
"azan.mp3";


// =========================
// SUBUH SPECIAL
// =========================

if (prayerName === "Subuh") {

audioFile =
"azan-subuh.mp3";

}


// =========================
// STOP OLD AUDIO
// =========================

if (currentAudio) {

currentAudio.pause();

currentAudio.currentTime = 0;

}


// =========================
// PLAY NEW AUDIO
// =========================

currentAudio =
new Audio(audioFile);

currentAudio.volume = 1.0;

currentAudio.play();

}


// =========================
// MUTE AZAN
// =========================

function muteAzan(){

if (currentAudio){

currentAudio.pause();

currentAudio.currentTime = 0;

}

}


// =========================
// TEST NOTIFICATION
// =========================

async function testNotification() {

try {

playAzan("Maghrib");


// =========================
// SHOW POPUP
// =========================

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
// CHECK PRAYER NOTIFICATION
// =========================

function checkPrayerNotification() {

setInterval(async()=>{

if (!notificationEnabled) return;

if (!prayerTimes.fajr) return;

const now = new Date();

const hour =
String(now.getHours())
.padStart(2,"0");

const minute =
String(now.getMinutes())
.padStart(2,"0");


const currentTime =
`${hour}:${minute}`;


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


// =========================
// LOOP PRAYER
// =========================

for (const prayer of prayers) {

const [h,m] =
prayer.time.split(":");


const prayerDate =
new Date();

prayerDate.setHours(h);
prayerDate.setMinutes(m);


// =========================
// REMINDER TIME
// =========================

const reminderDate =
new Date(
prayerDate.getTime() -
10 * 60000
);


const reminderHour =
String(
reminderDate.getHours()
).padStart(2,"0");


const reminderMinute =
String(
reminderDate.getMinutes()
).padStart(2,"0");


const reminderTime =
`${reminderHour}:${reminderMinute}`;


// =========================
// 10 MIN BEFORE
// =========================

if (

currentTime === reminderTime &&
lastNotification !==
`${prayer.name}-reminder`

) {

lastNotification =
`${prayer.name}-reminder`;


// =========================
// PLAY BEEP
// =========================

playBeep();


// =========================
// SHOW POPUP
// =========================

new Notification(

"🕌 MY SOLAT",

{

body:
`${prayer.name} in 10 minutes`,

icon:
"icon-192.png"

}

);

}


// =========================
// AZAN TIME
// =========================

if (

currentTime === prayer.time &&
lastNotification !==
`${prayer.name}-azan`

) {

lastNotification =
`${prayer.name}-azan`;


// =========================
// PLAY AZAN
// =========================

playAzan(prayer.name);


// =========================
// SHOW POPUP
// =========================

new Notification(

"🕌 MY SOLAT",

{

body:
`Waktu ${prayer.name} telah masuk`,

icon:
"icon-192.png"

}

);

}

}

},60000);

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


const currentDay =
parseInt(hijri.day);


// =========================
// RAMADAN
// =========================

let ramadhanDays = 236;


// =========================
// AIDILFITRI
// =========================

let rayaDays =
ramadhanDays + 30;


// =========================
// AIDILADHA
// =========================

let hajiDays = 10 - currentDay;

if (hajiDays < 0) {

hajiDays = 0;

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

startCountdown();

checkPrayerNotification();

updateIslamicCountdown();// =========================
// GLOBAL VARIABLES
// =========================

let prayerTimes = {};

let nextPrayer = null;

let notificationEnabled = false;

let lastNotification = "";

let currentAudio = null;


// =========================
// UPDATE CLOCK
// =========================

function updateClock() {

const now = new Date();

const time = now.toLocaleTimeString(
"en-GB",
{
hour12:false
}
);

document.getElementById(
"current-time"
).innerHTML = time;


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
// GET LOCATION
// =========================

function getLocation() {

if (!navigator.geolocation) return;

navigator.geolocation.getCurrentPosition(

(position)=>{

document.getElementById(
"location"
).innerHTML =

"📍 Kubang Pasu / Jitra";

loadPrayerTimes();

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

"https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=today&zone=kdh01"

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
// HIGHLIGHT ACTIVE PRAYER
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
// ENABLE NOTIFICATION
// =========================

async function enableNotification() {

const isAndroid =
/Android/i.test(
navigator.userAgent
);

try {

if (isAndroid) {

console.log(
"ANDROID DETECTED"
);

}

await OneSignal.Notifications
.requestPermission();


const optedIn =

OneSignal
.User
.pushSubscription
.optedIn;


// =========================
// SUCCESS
// =========================

if (optedIn) {

notificationEnabled = true;

localStorage.setItem(
"notificationEnabled",
"true"
);

document
.querySelector(".notify-btn")
.classList.add(
"notify-active"
);

document
.querySelector(".notify-btn")
.innerHTML =

"✅ Notification Enabled";

}


// =========================
// FAILED
// =========================

else {

alert(
"❌ Notification belum dibenarkan."
);

}

}

catch(error){

console.log(error);

alert(
"❌ Subscription Error"
);

}

}


// =========================
// PLAY BEEP
// =========================

function playBeep(){

const audio =
new Audio(
"beep.mp3"
);

audio.volume = 1.0;

audio.play();

}


// =========================
// PLAY AZAN
// =========================

function playAzan(prayerName){

let audioFile =
"azan.mp3";


// =========================
// SUBUH SPECIAL
// =========================

if (prayerName === "Subuh") {

audioFile =
"azan-subuh.mp3";

}


// =========================
// STOP OLD AUDIO
// =========================

if (currentAudio) {

currentAudio.pause();

currentAudio.currentTime = 0;

}


// =========================
// PLAY NEW AUDIO
// =========================

currentAudio =
new Audio(audioFile);

currentAudio.volume = 1.0;

currentAudio.play();

}


// =========================
// MUTE AZAN
// =========================

function muteAzan(){

if (currentAudio){

currentAudio.pause();

currentAudio.currentTime = 0;

}

}


// =========================
// TEST NOTIFICATION
// =========================

async function testNotification() {

try {

playAzan("Maghrib");


// =========================
// SHOW POPUP
// =========================

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
// CHECK PRAYER NOTIFICATION
// =========================

function checkPrayerNotification() {

setInterval(async()=>{

if (!notificationEnabled) return;

if (!prayerTimes.fajr) return;

const now = new Date();

const hour =
String(now.getHours())
.padStart(2,"0");

const minute =
String(now.getMinutes())
.padStart(2,"0");


const currentTime =
`${hour}:${minute}`;


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


// =========================
// LOOP PRAYER
// =========================

for (const prayer of prayers) {

const [h,m] =
prayer.time.split(":");


const prayerDate =
new Date();

prayerDate.setHours(h);
prayerDate.setMinutes(m);


// =========================
// REMINDER TIME
// =========================

const reminderDate =
new Date(
prayerDate.getTime() -
10 * 60000
);


const reminderHour =
String(
reminderDate.getHours()
).padStart(2,"0");


const reminderMinute =
String(
reminderDate.getMinutes()
).padStart(2,"0");


const reminderTime =
`${reminderHour}:${reminderMinute}`;


// =========================
// 10 MIN BEFORE
// =========================

if (

currentTime === reminderTime &&
lastNotification !==
`${prayer.name}-reminder`

) {

lastNotification =
`${prayer.name}-reminder`;


// =========================
// PLAY BEEP
// =========================

playBeep();


// =========================
// SHOW POPUP
// =========================

new Notification(

"🕌 MY SOLAT",

{

body:
`${prayer.name} in 10 minutes`,

icon:
"icon-192.png"

}

);

}


// =========================
// AZAN TIME
// =========================

if (

currentTime === prayer.time &&
lastNotification !==
`${prayer.name}-azan`

) {

lastNotification =
`${prayer.name}-azan`;


// =========================
// PLAY AZAN
// =========================

playAzan(prayer.name);


// =========================
// SHOW POPUP
// =========================

new Notification(

"🕌 MY SOLAT",

{

body:
`Waktu ${prayer.name} telah masuk`,

icon:
"icon-192.png"

}

);

}

}

},60000);

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


const currentDay =
parseInt(hijri.day);


// =========================
// RAMADAN
// =========================

let ramadhanDays = 236;


// =========================
// AIDILFITRI
// =========================

let rayaDays =
ramadhanDays + 30;


// =========================
// AIDILADHA
// =========================

let hajiDays = 10 - currentDay;

if (hajiDays < 0) {

hajiDays = 0;

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

startCountdown();

checkPrayerNotification();

updateIslamicCountdown();