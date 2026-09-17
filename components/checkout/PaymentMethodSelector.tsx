"use client";

import React, { useState } from "react";
import {
  QrCode,
  Building2,
  Wallet,
  CreditCard,
  Send,
  Globe2,
  Check,
  ShieldAlert,
} from "lucide-react";
import { AVAILABLE_PAYMENT_METHODS, PaymentMethodOption } from "@/lib/payments/types";

interface PaymentMethodSelectorProps {
  defaultMethod?: string;
}

export function PaymentMethodSelector({
  defaultMethod = "qris",
}: PaymentMethodSelectorProps) {
  const [region, setRegion] = useState<"indonesia" | "international">("indonesia");
  const [selectedMethod, setSelectedMethod] = useState<string>(defaultMethod);
  const [selectedChannel, setSelectedChannel] = useState<string>("");

  const filteredMethods = AVAILABLE_PAYMENT_METHODS.filter((m) => {
    if (region === "indonesia") {
      return m.region === "indonesia" || m.region === "all";
    }
    return m.category === "card";
  });

  const activeMethodObj = AVAILABLE_PAYMENT_METHODS.find(
    (m) => m.category === selectedMethod
  );

  const getMethodIcon = (cat: string) => {
    switch (cat) {
      case "qris":
        return <QrCode className="h-5 w-5 text-indigo-600" />;
      case "virtual_account":
        return <Building2 className="h-5 w-5 text-indigo-600" />;
      case "ewallet":
        return <Wallet className="h-5 w-5 text-indigo-600" />;
      case "bank_transfer":
        return <Send className="h-5 w-5 text-indigo-600" />;
      case "card":
        return <CreditCard className="h-5 w-5 text-indigo-600" />;
      default:
        return <CreditCard className="h-5 w-5 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-4">
      <input type="hidden" name="payment_method" value={selectedMethod} />
      <input type="hidden" name="payment_channel" value={selectedChannel} />

      {/* Region Tabs */}
      <div className="flex rounded-2xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => {
            setRegion("indonesia");
            if (selectedMethod === "card") {
              setSelectedMethod("qris");
              setSelectedChannel("");
            }
          }}
          className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
            region === "indonesia"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          🇮🇩 Indonesia (IDR)
        </button>
        <button
          type="button"
          onClick={() => {
            setRegion("international");
            setSelectedMethod("card");
            setSelectedChannel("visa");
          }}
          className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
            region === "international"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          🌐 International (USD / Multi-Currency)
        </button>
      </div>

      {/* International Settlement Notice */}
      {region === "international" && (
        <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-3.5 text-xs text-sky-900">
          <div className="flex items-start gap-2">
            <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
            <div>
              <p className="font-bold">Pembayaran Internasional / Global Buyer</p>
              <p className="mt-0.5 text-[11px] text-sky-700 leading-relaxed">
                Menerima kartu kredit & debit internasional (Visa, Mastercard, JCB, Amex). Transaksi diproses dan diselesaikan dalam mata uang dasar IDR resmi dengan konversi otomatis dari bank penerbit kartu Anda.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Category List */}
      <div className="space-y-2.5">
        {filteredMethods.map((method) => {
          const isSelected = selectedMethod === method.category;

          return (
            <div
              key={method.id}
              onClick={() => {
                setSelectedMethod(method.category);
                if (method.channels.length > 0) {
                  setSelectedChannel(method.channels[0].code);
                } else {
                  setSelectedChannel("");
                }
              }}
              className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                isSelected
                  ? "border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/10"
                  : "border-slate-200/90 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl ${
                      isSelected ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {getMethodIcon(method.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-slate-900">{method.name}</h4>
                      {method.badge && (
                        <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                          {method.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500 leading-relaxed">
                      {method.description}
                    </p>
                  </div>
                </div>

                <div
                  className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                </div>
              </div>

              {/* Sub-channel options when selected */}
              {isSelected && method.channels.length > 0 && (
                <div className="mt-3.5 border-t border-slate-200/60 pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Pilih Saluran / Channel:
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {method.channels.map((ch) => {
                      const isChActive =
                        selectedChannel === ch.code ||
                        (!selectedChannel && method.channels[0].code === ch.code);
                      return (
                        <button
                          key={ch.code}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedChannel(ch.code);
                          }}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                            isChActive
                              ? "bg-indigo-600 text-white shadow-2xs"
                              : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {ch.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
