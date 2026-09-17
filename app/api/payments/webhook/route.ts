import { NextRequest, NextResponse } from "next/server";
import { processWebhook } from "@/lib/payments/service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    let providerName = searchParams.get("provider");

    // Auto-detect provider from headers if not explicitly in searchParams
    if (!providerName) {
      if (req.headers.has("x-callback-token")) {
        providerName = "xendit";
      } else if (req.headers.has("stripe-signature")) {
        providerName = "stripe";
      }
    }

    const rawBody = await req.text();

    if (!rawBody) {
      return NextResponse.json(
        { success: false, error: "Empty request payload." },
        { status: 400 }
      );
    }

    const result = await processWebhook(providerName, req, rawBody);

    return NextResponse.json(
      {
        received: true,
        success: result.success,
        message: result.message,
      },
      { status: result.statusCode }
    );
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      {
        received: false,
        error: error.message || "Internal server error processing payment webhook.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "NASLA EXPORT Multi-Provider Payment Webhook Endpoint",
    supported_providers: ["xendit", "midtrans", "stripe", "manual_transfer"],
  });
}
