import {NextRequest, NextResponse} from "next/server";

export const runtime = "nodejs";

const max = {name:120,phone:40,email:254,service_interest:120,message:2000,page:200,referrer:2000,utm_source:250,utm_medium:250,utm_campaign:250,website:250};
type Key = keyof typeof max;

function value(input:Record<string,unknown>,key:Key){
  const item = input[key];
  return typeof item === "string" ? item.trim().slice(0,max[key]) : "";
}

export async function POST(request:NextRequest){
  const webhook = process.env.GHL_BLUSH_LEAD_WEBHOOK_URL;
  if(!webhook) return NextResponse.json({error:"Online consultation requests are not configured yet. Please call or text the studio."},{status:503});
  try {
    const input = await request.json() as Record<string,unknown>;
    if(value(input,"website")) return NextResponse.json({success:true});
    const name = value(input,"name");
    const phone = value(input,"phone");
    const email = value(input,"email");
    const service_interest = value(input,"service_interest");
    if(!name || !phone || !email || !service_interest) return NextResponse.json({error:"Please complete your name, phone number, email, and service interest."},{status:400});
    const response = await fetch(webhook,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,phone,email,service_interest,message:value(input,"message"),source:"Blush website",page:value(input,"page"),referrer:value(input,"referrer"),utm_source:value(input,"utm_source"),utm_medium:value(input,"utm_medium"),utm_campaign:value(input,"utm_campaign"),submitted_at:new Date().toISOString()})});
    if(!response.ok) throw new Error("Lead destination rejected the request.");
    return NextResponse.json({success:true});
  } catch(error) {
    console.error("Blush website lead routing failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({error:"We could not send your request. Please call or text the studio."},{status:502});
  }
}
