"use client";

import React, { useState } from "react";
import {
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  Send,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatIDR } from "@/lib/orders";
import { PAYMENT_STATUS_CONFIG, PaymentRecord, PaymentStatus } from "@/lib/payments/types";
import { PaymentMethodSelector } from "@/components/checkout/PaymentMethodSelector";
import { retryOrderPaymentAction } from "@/app/checkout/actions";

interface OrderPaymentSectionProps {
  orderNumber: string;
  orderTotal: number;
  orderStatus: string;
  payments: PaymentRecord[];
}

export function OrderPaymentSection({
  orderNumber,
  orderTotal,
  orderStatus,
  payments,
}: OrderPaymentSectionProps) {
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Latest payment attempt
  const latestPayment = payments.length > 0 ? payments[0] : null;
  const isPaid = latestPayment?.status === "paid" || orderStatus === "paid" || orderStatus === "processing" || orderStatus === "completed";
  const isPending = latestPayment?.status === "pending" || (!latestPayment && (orderStatus === "pending" || orderStatus === "awaiting_payment"));
  const isFailedOrExpired = latestPayment?.status === "failed" || latestPayment?.status === "expired" || latestPayment?.status === "cancelled";

  const paymentStatusKey = (latestPayment?.status || (isPaid ? "paid" : "pending")) as PaymentStatus;
  const statusInfo = PAYMENT_STATUS_CONFIG[paymentStatusKey] || PAYMENT_STATUS_CONFIG.pending;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const getMethodIcon = (method?: string) => {
    switch (method) {
      case "qris":
        return <QrCode className="h-4 w-4" />;
      case "virtual_account":
        return <Building2 className="h-4 w-4" />;
      case "ewallet":
        return <Wallet className="h-4 w-4" />;
      case "bank_transfer":
        return <Send className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-7">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
              isPaid
                ? "bg-emerald-50 text-emerald-600"
                : isFailedOrExpired
                ? "bg-rose-50 text-rose-600"
                : "bg-amber-50 text-amber-600"
            }`}
          >
            {isPaid ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : isFailedOrExpired ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <Clock className="h-5 w-5" />
            )}
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Modul Pembayaran
            </span>
            <h3 className="text-base font-black text-slate-900">
              Status Pembayaran Tagihan
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
              statusInfo.variant === "success"
                ? "bg-emerald-50 text-emerald-700"
                : statusInfo.variant === "danger"
                ? "bg-rose-50 text-rose-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                statusInfo.variant === "success"
                  ? "bg-emerald-500"
                  : statusInfo.variant === "danger"
                  ? "bg-rose-500"
                  : "bg-amber-500"
              }`}
            />
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Case 1: PAYMENT PAID */}
      {isPaid ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-xs text-emerald-950">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <h4 className="font-bold text-emerald-900">
                  Pembayaran Terkonfirmasi
                </h4>
                <p className="mt-0.5 text-emerald-800 leading-relaxed">
                  Tagihan sebesar <strong>{formatIDR(latestPayment?.amount || orderTotal)}</strong> telah berhasil diverifikasi oleh payment gateway. Pesanan Anda saat ini sedang diproses oleh tim kami.
                </p>
                {latestPayment?.paid_at && (
                  <p className="mt-2 text-[11px] text-emerald-700">
                    Waktu Pembayaran:{" "}
                    {new Date(latestPayment.paid_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {latestPayment && (
            <div className="grid gap-3 sm:grid-cols-3 text-xs">
              <div className="rounded-2xl bg-slate-50 p-3.5">
                <span className="text-slate-400">Gateway Provider</span>
                <p className="mt-1 font-bold capitalize text-slate-800">
                  {latestPayment.provider}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3.5">
                <span className="text-slate-400">Metode</span>
                <p className="mt-1 font-bold capitalize text-slate-800">
                  {latestPayment.payment_method?.replace("_", " ")}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3.5">
                <span className="text-slate-400">Referensi Transaksi</span>
                <p className="mt-1 font-mono font-bold truncate text-slate-800">
                  {latestPayment.provider_reference || latestPayment.provider_payment_id || "-"}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : isFailedOrExpired ? (
        /* Case 2: PAYMENT FAILED OR EXPIRED */
        <div className="mt-5 space-y-4">
          <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4 text-xs text-rose-950">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
              <div>
                <h4 className="font-bold text-rose-900">
                  {latestPayment?.status === "expired"
                    ? "Batas Waktu Pembayaran Kedaluwarsa"
                    : "Pembayaran Sebelumnya Belum Berhasil"}
                </h4>
                <p className="mt-0.5 text-rose-800 leading-relaxed">
                  Sesi pembayaran sebelumnya telah berakhir. Anda dapat membuat sesi pembayaran baru dengan metode yang sama atau memilih saluran pembayaran lain.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowRetryModal(true)}
            className="btn btn-primary inline-flex w-full items-center justify-center gap-2 py-3 text-xs font-bold sm:w-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Buat Pembayaran Baru (Retry)</span>
          </button>
        </div>
      ) : (
        /* Case 3: PAYMENT PENDING / AWAITING PAYMENT */
        <div className="mt-5 space-y-4">
          <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-xs text-amber-950">
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div className="flex-1">
                <h4 className="font-bold text-amber-900">
                  Menunggu Pembayaran Sebesar {formatIDR(orderTotal)}
                </h4>
                <p className="mt-0.5 text-amber-800 leading-relaxed">
                  Silakan selesaikan pembayaran sebelum batas waktu berakhir untuk mengonfirmasi pesanan Anda.
                </p>
                {latestPayment?.expires_at && (
                  <p className="mt-1 text-[11px] font-semibold text-amber-700">
                    Batas Waktu:{" "}
                    {new Date(latestPayment.expires_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* If manual transfer instructions exist */}
          {latestPayment?.payment_method === "bank_transfer" && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Rekening Tujuan Transfer:</span>
                <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                  Bank BCA
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-slate-200">
                <div>
                  <p className="text-[10px] text-slate-400">Nomor Rekening</p>
                  <p className="font-mono text-sm font-black text-slate-900">
                    873-501-9922
                  </p>
                  <p className="text-[11px] text-slate-500">a.n. PT Nasla Ekspor Global</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard("8735019922", "rek")}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                >
                  {copiedText === "rek" ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {latestPayment?.payment_url && (
              <a
                href={latestPayment.payment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary inline-flex items-center gap-2 py-3 px-5 text-xs font-black shadow-sm"
              >
                <span>Lanjutkan Pembayaran Online</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}

            <button
              type="button"
              onClick={() => setShowRetryModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
            >
              <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
              <span>Ganti Metode Pembayaran</span>
            </button>
          </div>
        </div>
      )}

      {/* Payment History / Attempts Dropdown */}
      {payments.length > 0 && (
        <div className="mt-6 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex w-full items-center justify-between text-left text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            <span>Riwayat Upaya Pembayaran ({payments.length})</span>
            {showHistory ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {showHistory && (
            <div className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-100 overflow-hidden text-xs">
              {payments.map((p, idx) => {
                const pStatus = PAYMENT_STATUS_CONFIG[p.status as PaymentStatus] || PAYMENT_STATUS_CONFIG.pending;
                return (
                  <div
                    key={p.id || idx}
                    className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between bg-slate-50/50"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600">
                        {getMethodIcon(p.payment_method)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 capitalize">
                          {p.payment_method?.replace("_", " ")} ({p.provider})
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(p.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 justify-between sm:justify-end">
                      <span className="font-bold text-slate-900">
                        {formatIDR(p.amount)}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                          pStatus.variant === "success"
                            ? "bg-emerald-50 text-emerald-700"
                            : pStatus.variant === "danger"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {pStatus.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Retry / Change Payment Modal */}
      {showRetryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Pilih Saluran Pembayaran Baru
                </h3>
                <p className="text-xs text-slate-500">
                  Pesanan {orderNumber} • Tagihan {formatIDR(orderTotal)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRetryModal(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form action={retryOrderPaymentAction} className="mt-5 space-y-4">
              <input type="hidden" name="order_number" value={orderNumber} />

              <PaymentMethodSelector defaultMethod="qris" />

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRetryModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary py-2.5 px-5 text-xs font-bold"
                >
                  Konfirmasi & Bayar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
