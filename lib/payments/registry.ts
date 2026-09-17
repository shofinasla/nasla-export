import {
  PaymentProvider,
  PaymentProviderName,
  PaymentMethodCategory,
} from "./types";
import { XenditPaymentProvider } from "./providers/xendit";
import { MidtransPaymentProvider } from "./providers/midtrans";
import { StripePaymentProvider } from "./providers/stripe";
import { ManualTransferPaymentProvider } from "./providers/manual_transfer";

const providers: Record<PaymentProviderName, PaymentProvider> = {
  xendit: new XenditPaymentProvider(),
  midtrans: new MidtransPaymentProvider(),
  stripe: new StripePaymentProvider(),
  manual_transfer: new ManualTransferPaymentProvider(),
};

export function getPaymentProvider(name?: string | null): PaymentProvider {
  if (name && name in providers) {
    return providers[name as PaymentProviderName];
  }
  return getDefaultProvider();
}

export function getDefaultProvider(): PaymentProvider {
  const envProvider = (process.env.PAYMENT_PROVIDER || "xendit").toLowerCase() as PaymentProviderName;
  if (envProvider in providers) {
    return providers[envProvider];
  }
  return providers.xendit;
}

export function getProviderForMethod(
  method: PaymentMethodCategory,
  requestedProvider?: string
): PaymentProvider {
  if (requestedProvider && requestedProvider in providers) {
    return providers[requestedProvider as PaymentProviderName];
  }

  if (method === "bank_transfer") {
    return providers.manual_transfer;
  }

  if (method === "card") {
    // If Stripe is configured and requested for global card payments, use Stripe; otherwise use default
    if (providers.stripe.isConfigured()) {
      return providers.stripe;
    }
  }

  return getDefaultProvider();
}

export function getAllProvidersSummary(): {
  name: PaymentProviderName;
  displayName: string;
  isConfigured: boolean;
}[] {
  return (Object.keys(providers) as PaymentProviderName[]).map((key) => ({
    name: key,
    displayName: providers[key].displayName,
    isConfigured: providers[key].isConfigured(),
  }));
}
