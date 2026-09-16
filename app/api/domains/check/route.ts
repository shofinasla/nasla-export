import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const { domain } = await req.json().catch(()=>({}));
  if (!domain || typeof domain !== "string") return NextResponse.json({error:"Domain is required."},{status:400});
  return NextResponse.json({ok:false, integrated:false, message:"Connect a registrar API here. No availability result is fabricated."});
}