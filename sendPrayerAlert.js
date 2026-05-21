export default async function handler(
req,
res
){

try{

console.log(
"🕌 CRON RUNNING..."
);


// =========================
// MANUAL TEST MODE
// =========================

if(req.query.message){

const response =
await fetch(

"https://api.onesignal.com/notifications",

{

method:"POST",

headers:{

"Content-Type":
"application/json",

Authorization:
`Basic ${process.env.ONESIGNAL_API_KEY}`

},

body:JSON.stringify({

app_id:
process.env.ONESIGNAL_APP_ID,

included_segments:[
"Subscribed Users"
],

headings:{
en:"🕌 MY SOLAT"
},

contents:{
en:req.query.message
}

})

}

);


const data =
await response.json();

return res.status(200).json(data);

}


// =========================
// GET PRAYER TIME
// =========================

const response =
await fetch(

"https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=today&zone=kdh01"

);

const data =
await response.json();

const prayer =
data.prayerTime[0];


// =========================
// CURRENT TIME
// =========================

const now = new Date();

const hour =
String(now.getHours())
.padStart(2,"0");

const minute =
String(now.getMinutes())
.padStart(2,"0");

const currentTime =
`${hour}:${minute}`;

console.log(
"CURRENT:",
currentTime
);


// =========================
// PRAYER LIST
// =========================

const prayers = [

{
name:"Subuh",
time:prayer.fajr.substring(0,5)
},

{
name:"Zohor",
time:prayer.dhuhr.substring(0,5)
},

{
name:"Asar",
time:prayer.asr.substring(0,5)
},

{
name:"Maghrib",
time:prayer.maghrib.substring(0,5)
},

{
name:"Isyak",
time:prayer.isha.substring(0,5)
}

];


// =========================
// LOOP PRAYER
// =========================

for (const p of prayers){

const [h,m] =
p.time.split(":");


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
// 10 MIN REMINDER
// =========================

if(currentTime === reminderTime){

await fetch(

"https://api.onesignal.com/notifications",

{

method:"POST",

headers:{

"Content-Type":
"application/json",

Authorization:
`Basic ${process.env.ONESIGNAL_API_KEY}`

},

body:JSON.stringify({

app_id:
process.env.ONESIGNAL_APP_ID,

included_segments:[
"Subscribed Users"
],
headings:{
en:"🕌 MY SOLAT"
},

contents:{
en:`${p.name} in 10 minutes`
}

})

}

);

console.log(
"🔔 REMINDER SENT"
);

}



// =========================
// AZAN TIME
// =========================

if(currentTime === p.time){

await fetch(

"https://api.onesignal.com/notifications",

{

method:"POST",

headers:{

"Content-Type":
"application/json",

Authorization:
`Basic ${process.env.ONESIGNAL_API_KEY}`

},

body:JSON.stringify({

app_id:
process.env.ONESIGNAL_APP_ID,

included_segments:[
"Subscribed Users"
],

headings:{
en:"🕌 MY SOLAT"
},

contents:{
en:`Waktu ${p.name} telah masuk`
}

})

}

);

console.log(
"🕌 AZAN SENT"
);

}

}


// =========================
// SUCCESS
// =========================

res.status(200).json({

success:true,

time:currentTime

});

}

catch(error){

console.log(error);

res.status(500).json({

error:error.message

});

}

}