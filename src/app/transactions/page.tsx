"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/utils/routes";
import {
  ChevronDown,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
} from "lucide-react";
import FloatingNavbar from "@/components/FloatingNavbar";

export default function TransactionsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push(ROUTES.LOGIN);
      } else {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error) setTransactions(data || []);
        setLoading(false);
      }
    };
    checkUserAndFetchData();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <p className="text-gray-400 font-medium text-xs tracking-wide">
          Memuat Analisis Transaksi...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FCFCFA] flex flex-col pt-6 pb-32">
      {/* TITLE APP BAR */}
      <div className="w-full text-center px-6 mb-6">
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">
          Transaction
        </h1>
      </div>

      {/* STATISTIC OVERVIEW HEADER */}
      <div className="px-6 flex justify-between items-center mb-1">
        <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">
          Statistic Overview
        </h2>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FEDC34] rounded-full text-xs font-bold text-gray-900 shadow-sm active:scale-95 transition-transform">
          <span>Month</span>
          <ChevronDown size={14} className="stroke-[2.5]" />
        </button>
      </div>

      <div className="px-6 mb-6 flex justify-between items-baseline">
        <h2 className="text-[26px] font-black text-gray-900 tracking-tight">
          Rp 1.000.000
        </h2>
        <span className="text-xs font-bold text-gray-900">All Month</span>
      </div>

      {/* 🌟 CUSTOM STATISTIC BAR CHART (Tailwind-Powered, Match Mockup) */}
      <div className="px-6 w-full h-44 flex items-end justify-between gap-2.5 mb-8 relative border-b border-gray-100/50 pb-2">
        {/* Garis Bantu Grid Horisontal Belakang */}
        <div className="absolute inset-x-6 bottom-10 h-[1px] border-b border-dashed border-gray-200/60 w-[calc(100%-48px)]" />
        <div className="absolute inset-x-6 bottom-20 h-[1px] border-b border-dashed border-gray-200/60 w-[calc(100%-48px)]" />
        <div className="absolute inset-x-6 bottom-28 h-[1px] border-b border-dashed border-gray-200/60 w-[calc(100%-48px)]" />
        <div className="absolute inset-x-6 bottom-36 h-[1px] border-b border-dashed border-gray-200/60 w-[calc(100%-48px)]" />

        {/* Batang 1 */}
        <div className="flex-1 flex gap-1 items-end h-full justify-center z-10">
          <div className="w-2.5 bg-[#FEDC34] rounded-full h-[78%]" />
          <div className="w-2.5 bg-[#5B521E] rounded-full h-[78%]" />
        </div>
        {/* Batang 2 */}
        <div className="flex-1 flex gap-1 items-end h-full justify-center z-10">
          <div className="w-2.5 bg-[#FEDC34] rounded-full h-[54%]" />
          <div className="w-2.5 bg-[#5B521E] rounded-full h-[95%]" />
        </div>
        {/* Batang 3 */}
        <div className="flex-1 flex gap-1 items-end h-full justify-center z-10">
          <div className="w-2.5 bg-[#FEDC34] rounded-full h-[70%]" />
          <div className="w-2.5 bg-[#5B521E] rounded-full h-[36%]" />
        </div>
        {/* Batang 4 */}
        <div className="flex-1 flex gap-1 items-end h-full justify-center z-10">
          <div className="w-2.5 bg-[#FEDC34] rounded-full h-[48%]" />
          <div className="w-2.5 bg-[#5B521E] rounded-full h-[78%]" />
        </div>
        {/* Batang 5 */}
        <div className="flex-1 flex gap-1 items-end h-full justify-center z-10">
          <div className="w-2.5 bg-[#FEDC34] rounded-full h-[34%]" />
          <div className="w-2.5 bg-[#5B521E] rounded-full h-[50%]" />
        </div>
      </div>

      {/* 🌟 CARD METRICS RESUME (Dua Kartu Bersebelahan Pas Sesuai Gambar) */}
      <div className="px-6 grid grid-cols-2 gap-4 mb-8">
        {/* Kartu Kuning (Income/Saving) */}
        <div className="bg-[#FEDC34] rounded-[24px] p-4 flex flex-col gap-4 relative overflow-hidden shadow-md shadow-yellow-500/5">
          <div className="absolute right-[-10%] bottom-[-10%] opacity-15 text-white">
            <ArrowDownLeft size={100} className="stroke-[1]" />
          </div>
          <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-yellow-600 shadow-sm">
            <ArrowDownLeft size={16} className="stroke-[2.5]" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-800/60 uppercase tracking-wider">
              Saving
            </p>
            <h3 className="text-sm font-black text-gray-900 mt-0.5">
              Rp 27.000.000
            </h3>
          </div>
        </div>

        {/* Kartu Olive Green (Expense) */}
        <div className="bg-[#5B521E] rounded-[24px] p-4 flex flex-col gap-4 relative overflow-hidden shadow-md shadow-amber-950/10">
          <div className="absolute right-[-10%] bottom-[-10%] opacity-15 text-white">
            <ArrowUpRight size={100} className="stroke-[1]" />
          </div>
          <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-[#5B521E] shadow-sm">
            <ArrowUpRight size={16} className="stroke-[2.5]" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
              Saving
            </p>
            <h3 className="text-sm font-black text-white mt-0.5">
              Rp 34.000.000
            </h3>
          </div>
        </div>
      </div>

      {/* 🌟 DETAIL TRANSACTION CONTAINER PANEL (Bottom Sheet Style Layout) */}
      <div className="w-full bg-white border-t border-gray-100 rounded-t-[36px] px-6 pt-5 flex-1 shadow-[0_-12px_40px_rgba(0,0,0,0.02)]">
        {/* Notch Indikator Dekoratif */}
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-5" />

        <h3 className="text-[16px] font-black text-gray-900 mb-4 tracking-tight">
          Detail Transaction
        </h3>

        {/* DAFTAR LIST LOG TRANSAKSI DINAMIS */}
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <p className="text-gray-400 text-center text-xs py-8">
              Belum ada riwayat transaksi bulan ini.
            </p>
          ) : (
            transactions.map((t) => (
              <div
                key={t.id}
                className="w-full bg-[#FBFBFA] rounded-2xl p-4 border border-gray-100/60 flex justify-between items-center transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${t.type === "income" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
                  >
                    {t.type === "income" ? (
                      <ArrowDownLeft size={16} className="stroke-[2.5]" />
                    ) : (
                      <ArrowUpRight size={16} className="stroke-[2.5]" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 leading-snug">
                      {t.category}
                    </h4>
                    <p className="text-[11px] text-gray-400 font-medium">
                      {t.note || "Tanpa catatan"}
                    </p>
                  </div>
                </div>
                <div className="text-right flex flex-col gap-0.5">
                  <span
                    className={`text-sm font-black ${t.type === "income" ? "text-green-500" : "text-red-500"}`}
                  >
                    {t.type === "income" ? "+" : "-"} Rp{" "}
                    {parseFloat(t.amount).toLocaleString("id-ID")}
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold flex items-center gap-0.5 justify-end">
                    <Calendar size={9} />
                    {new Date(t.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <FloatingNavbar />
    </div>
  );
}
