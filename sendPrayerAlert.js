exports.handler = async function(event) {

try {

const now =
new Date(
new Date().toLocaleString(
"en-US",
{
timeZone:"Asia/Kuala_Lumpur"
}
)
);


const hour =
String(now.getHours())
.padStart(2,"0");

const minute =
String(now.getMinutes())
.padStart(2,"0");


const currentTime =
`${hour}:${minute}`;


// =========================
// MANUAL QUERY
// =========================

const type =
event.queryStringParameters?.type;

const prayerQuery =
event.queryStringParameters?.prayer;


// =========================
// MANUAL TEST
// =========================

if (type) {

return await sendPush(
type,
prayerQuery || "Maghrib"
);

}


// =========================
// AUTO CRON MODE
// =========================

const response =
await fetch(

"https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=today&zone=kdh01"

);


const data =
await response.json();


const prayer =
data.prayerTime[0];


const prayers = [

{
name:"Subuh",
time:prayer.fajr
},

{
name:"Zohor",
time:prayer.dhuhr
},

{
name:"Asar",
time:prayer.asr
},

{
name:"Maghrib",
time:prayer.maghrib
},

{
name:"Isyak",
time:prayer.isha
}

];


// =========================
// CHECK MATCH
// =========================

for (const solat of prayers) {

const waktu =
solat.time.substring(0,5);


// =========================
// AZAN
// =========================

if (currentTime === waktu) {

return await sendPush(
"azan",
solat.name
);

}


// =========================
// 10 MIN BEFORE
// =========================

const [h,m] =
waktu.split(":");


const prayerDate =
new Date();

prayerDate.setHours(h);
prayerDate.setMinutes(m);


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


if (currentTime === reminderTime) {

return await sendPush(
"reminder",
solat.name
);

}

}


return {

statusCode:200,

body:
`Checked ${currentTime}`

};

}

catch(error){

return {

statusCode:500,

body:error.toString()

};

}

};


// =========================
// SEND PUSH
// =========================

async function sendPush(type, prayer) {

let title =
"🕌 Solat Alert";

let message =
"Waktu solat telah masuk";


// =========================
// REMINDER
// =========================

if (type === "reminder") {

title =
"⏰ Peringatan Solat";

message =
`10 minit lagi masuk waktu ${prayer}`;

}


// =========================
// AZAN
// =========================

if (type === "azan") {

title =
"🕌 Waktu Solat";

message =
`Waktu ${prayer} telah masuk`;

}


// =========================
// TEST
// =========================

if (type === "test") {

title =
"🧪 Test Notification";

message =
"OneSignal berjaya dihantar";

}


// =========================
// SEND TO ONESIGNAL
// =========================

const response =
await fetch(

"https://onesignal.com/api/v1/notifications",

{

method:"POST",

headers:{

"Content-Type":"application/json",

"Authorization":
`Basic ${process.env.ONESIGNAL_API_KEY}`

},

body: JSON.stringify({

app_id:
"399a4625-3fc2-47fd-b4a7-5e50c5542f53",

included_segments:["All"],

target_channel:"push",

headings:{
en:title
},

contents:{
en:message
},

ios_sound:"default",

ios_badgeType:"Increase",

ios_badgeCount:1,

chrome_web_icon:
"https://alertsolat.netlify.app/icons/icon-192.png",

small_icon:
"https://alertsolat.netlify.app/icons/icon-192.png"

})

}

);


const data =
await response.json();


return {

statusCode:200,

body:JSON.stringify(data)

};

}