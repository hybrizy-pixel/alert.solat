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
// DIRECT SUBSCRIPTION ID
// =========================

const subscriptionId =
"cb4bf2dc-18d7-4e2d-9d56-9b12d1724bea";


// =========================
// SEND TO ONESIGNAL
// =========================

const response =
await fetch(
"https://onesignal.com/api/v1/notifications",
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

ios_sound:"default",

chrome_web_icon:
"https://solatmys.vercel.app/icon-192.png",

large_icon:
"https://solatmys.vercel.app/icon-512.png"

})

}
);


const data =
await response.json();

console.log(
"✅ ONESIGNAL RESPONSE:",
data
);


// =========================
// SUCCESS
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