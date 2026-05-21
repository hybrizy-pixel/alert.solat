export default async function handler(
req,
res
){

try{

console.log(
"🕌 CRON RUNNING..."
);


// =========================
// GET MESSAGE
// =========================

const message =
req.query.message ||
"🕌 MY SOLAT";


// =========================
// GET SUBSCRIPTION ID
// =========================

const subscriptionId =
req.query.subscriptionId;

if(!subscriptionId){

return res.status(400).json({

success:false,

error:
"No subscriptionId"

});

}


console.log(
"SUBSCRIPTION:",
subscriptionId
);


// =========================
// SEND PUSH
// =========================

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


// =========================
// TARGET USER DEVICE
// =========================

include_subscription_ids:[
subscriptionId
],


// =========================
// NOTIFICATION CONTENT
// =========================

headings:{
en:"🕌 MY SOLAT"
},

contents:{
en:message
},


// =========================
// PUSH SETTINGS
// =========================

chrome_web_icon:
"https://solatmys.vercel.app/icon-192.png",

chrome_web_badge:
"https://solatmys.vercel.app/icon-192.png",

small_icon:
"https://solatmys.vercel.app/icon-192.png",

large_icon:
"https://solatmys.vercel.app/icon-512.png",

ios_badgeType:
"Increase",

ios_badgeCount:
1,


// =========================
// OPEN APP WHEN CLICK
// =========================

url:
"https://solatmys.vercel.app"

})

}

);


// =========================
// RESPONSE DATA
// =========================

const data =
await response.json();

console.log(
"ONESIGNAL RESPONSE:",
data
);


// =========================
// SUCCESS
// =========================

return res.status(200).json({

success:true,

onesignal:data

});

}

catch(error){

console.log(error);


// =========================
// ERROR
// =========================

return res.status(500).json({

success:false,

error:error.message

});

}

}