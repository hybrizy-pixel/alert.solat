export default async function handler(req,res){

try {

const response =
await fetch(
"https://api.onesignal.com/notifications",
{
method:"POST",

headers:{
"Content-Type":"application/json",

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
en:"🕌 My Solat"
},

contents:{
en:req.query.message ||
"Waktu Solat Telah Masuk"
}

})

}
);


const data =
await response.json();

res.status(200).json(data);

}

catch(error){

res.status(500).json({
error:error.message
});

}

}