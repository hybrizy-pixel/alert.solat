export default async function handler(
req,
res
){

try{

// =========================
// GET MESSAGE
// =========================

const message =
req.query.message ||
"🕌 Waktu Solat";

console.log(
"🕌 SENDING PUSH:",
message
);


// =========================
// FRESH SUBSCRIPTION ID
// =========================

const subscriptionId =
"46f855b5-b9b4-427d-8553-b56d57d2bd4e";


// =========================
// SEND TO ONESIGNAL
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
`Key ${process.env.ONESIGNAL_API_KEY}`

},

body:JSON.stringify({

app_id:
"399a4625-3fc2-47fd-b4a7-5e50c5542f53",

include_subscription_ids:[
subscriptionId
],

headings:{
en:"🕌 MY SOLAT"
},

contents:{
en:message
},

ios_sound:
"default",

chrome_web_icon:
"https://solatmys.vercel.app/icon-192.png",

large_icon:
"https://solatmys.vercel.app/icon-512.png"

})

}
);


// =========================
// RESPONSE
// =========================

const data =
await response.json();

console.log(
"✅ ONESIGNAL RESPONSE:",
data
);


// =========================
// SUCCESS RESPONSE
// =========================

return res.status(200).json({

success:true,

message:message,

subscriptionId:subscriptionId,

onesignal:data

});

}

catch(error){

console.log(
"❌ PUSH ERROR:",
error
);


// =========================
// ERROR RESPONSE
// =========================

return res.status(500).json({

success:false,

error:error.message

});

}

}