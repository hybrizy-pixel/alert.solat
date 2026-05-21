export default async function handler(
req,
res
){

try{

// =========================
// CRON START
// =========================

console.log(
"🕌 CRON RUNNING..."
);


// =========================
// DEBUG TEST
// =========================

console.log(
"✅ CRON WEBSITE HIT API"
);


// =========================
// RETURN TEST
// =========================

return res.status(200).json({

success:true,

message:
"CRON WORKING"

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