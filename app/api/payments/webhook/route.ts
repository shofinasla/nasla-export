import { NextResponse } from "next/server";
export async function POST() {
  // TODO: verify provider signature, idempotency, update order/payment status.
  return NextResponse.json({received:true, integrated:false});
}