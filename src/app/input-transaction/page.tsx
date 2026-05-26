"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ROUTES } from "@/utils/routes";
import {
  X,
  Scan,
  Upload,
  ChevronDown,
  Calendar as CalendarIcon,
  Check,
} from "lucide-react";

const ALL_BANK_ICONS = [
  { name: "BCA Mobile", icon: "/icons/mbca.png" },
  { name: "MyBCA", icon: "/icons/mybca.png" },
  { name: "Livin' by Mandiri", icon: "/icons/livin.png" },
  { name: "Wondr by BNI", icon: "/icons/wondr.png" },
  { name: "BRI Mobile", icon: "/icons/brimo.png" },
  { name: "Bale by BTN", icon: "/icons/btn.png" },
  { name: "OCTO by CIMB Niaga", icon: "/icons/octo.png" },
  { name: "D-Bank PRO", icon: "/icons/danamon.png" },
  { name: "Byond by BSI", icon: "/icons/ocbc.png" },
  { name: "MobilePanin", icon: "/icons/panin.png" },
  { name: "M-Smile by Bank Mega", icon: "/icons/mega.png" },
  { name: "OCBC Mobile Indonesia", icon: "/icons/mocbc.png" },
  { name: "Maybank2u UD", icon: "/icons/maybank.png" },
  { name: "Blu by BCA Digital", icon: "/icons/blu.png" },
  { name: "Bank Jago", icon: "/icons/jago.png" },
  { name: "UOB TMRW Indonesia", icon: "/icons/uob.png" },
  { name: "Jenius", icon: "/icons/jenius.png" },
  { name: "SeaBank", icon: "/icons/seabank.png" },
  { name: "Line Bank", icon: "/icons/linebank.png" },
  { name: "Allo Bank", icon: "/icons/allobank.png" },
  { name: "Neobank by BNC Digital", icon: "/icons/bnc.png" },
  { name: "Permata Me", icon: "/icons/permatame.png" },
  { name: "Digibank by DBS", icon: "/icons/dbs.png" },
  { name: "Raya - Bank Digital", icon: "/icons/raya.png" },
  { name: "Krom - Bank Digital", icon: "/icons/krom.png" },
  { name: "Superbank", icon: "/icons/superbank.png" },
  { name: "Bank Saqu", icon: "/icons/saqu.png" },
  { name: "GoPay", icon: "/icons/goplay.png" },
  { name: "OVO", icon: "/icons/ovo.png" },
  { name: "ShopeePay", icon: "/icons/shopeepay.png" },
  { name: "Dana", icon: "/icons/dana.png" },
  { name: "LinkAja", icon: "/icons/linkaja.png" },
  { name: "Doku", icon: "/icons/doku.png" },
];

export default function InputTransaction() {
  const router = useRouter();
  const supabase = createClient();

  // Form State
  const [transactionType, setTransactionType] = useState<"expense" | "income">(
    "expense",
  );
  const [date, setDate] = useState("2026-05-26");
  const [category, setCategory] = useState("Meals and Drinks");
  const [notes, setNotes] = useState("");
  const [nominal, setNominal] = useState(10000);
  const [activeAccountIcon, setActiveAccountIcon] =
    useState("/icons/livin.png");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🌟 State Baru untuk Pengendalian Pop-up Dialog ala Android
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  useEffect(() => {
    const fetchActiveAccount = async () => {
      const activeId = localStorage.getItem("active_account_id");
      if (!activeId) return;

      const { data } = await supabase
        .from("finance_accounts")
        .select("account_name")
        .eq("id", activeId)
        .single();

      if (data) {
        const matched = ALL_BANK_ICONS.find(
          (b) => b.name.toLowerCase() === data.account_name.toLowerCase(),
        );
        if (matched) setActiveAccountIcon(matched.icon);
      }
    };

    fetchActiveAccount();
  }, [supabase]);

  const handleSaveTransaction = async () => {
    setIsSubmitting(true);
    setIsSubmitting(false);
    router.push("/");
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-0 sm:p-4">
      {/* PEMBUNGKUS UTAMA MOCKUP HANDPHONE */}
      <div className="relative w-full max-w-md h-screen sm:h-[840px] sm:rounded-[40px] sm:shadow-2xl bg-gradient-to-br from-[#F3D22B] from-0% to-[#F8E68C] to-[87%] overflow-hidden flex flex-col select-none">
        {/* ================= 1. BARIS ATAS: KONTEN KUNING FIXED ================= */}
        <div className="p-6 pb-4 flex flex-col gap-5 w-full bg-transparent z-20 relative">
          <h1 className="text-xl font-black text-gray-900 text-center tracking-tight mt-2">
            Input Transaction
          </h1>

          <div className="w-full flex items-center justify-between gap-4">
            {/* 🌟 CUSTOM DROPDOWN 1: JENIS TRANSAKSI (STYLE ANDROID) */}
            <div className="relative flex-1">
              <div
                onClick={() => setIsTypeDialogOpen(true)}
                className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200/50 rounded-xl text-sm font-bold text-gray-900 shadow-sm cursor-pointer flex items-center justify-between transition-all active:bg-gray-50"
              >
                <span>
                  {transactionType === "expense" ? "Pengeluaran" : "Pemasukan"}
                </span>
                <ChevronDown size={16} className="text-gray-700 stroke-[2.5]" />
              </div>
            </div>

            {/* Input Tanggal */}
            <div className="relative flex-1">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-11 pr-3 py-3 bg-white border border-gray-200/50 rounded-2xl text-sm font-bold text-gray-900 shadow-sm focus:outline-none"
              />
              <CalendarIcon
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 pointer-events-none stroke-[2.3]"
              />
            </div>
          </div>
        </div>

        {/* ================= 2. ZONA TENGAH: KONTEN GAMBAR & LIST ITEM ================= */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-1 z-10 no-scrollbar">
          <div className="w-full bg-white/50 backdrop-blur-md rounded-3xl p-5 border border-white/40 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center p-1 shadow-sm">
                  <img
                    src="/icons/goplay.png"
                    alt="Receipt"
                    className="w-full h-full object-contain opacity-40"
                  />
                </div>
                <span className="text-sm font-bold text-gray-900 tracking-tight">
                  img203238.png
                </span>
              </div>
              <button className="w-7 h-7 hover:bg-black/5 rounded-full flex items-center justify-center text-gray-800 transition-colors">
                <X size={18} className="stroke-[2.5]" />
              </button>
            </div>

            <div className="flex flex-col gap-3.5 mt-2 text-sm font-bold text-gray-900">
              <div className="w-full flex justify-between items-start">
                <div className="flex gap-2.5">
                  <span className="text-gray-900 mt-1">•</span>
                  <div className="flex flex-col">
                    <span>Indomie Goreng</span>
                    <span className="text-xs text-gray-500 font-medium mt-0.5">
                      Rp 6.000 × 1
                    </span>
                  </div>
                </div>
                <span className="tabular-nums">Rp 6.000</span>
              </div>

              <div className="w-full flex justify-between items-start">
                <div className="flex gap-2.5">
                  <span className="text-gray-900 mt-1">•</span>
                  <div className="flex flex-col">
                    <span>Es Teh Anget</span>
                    <span className="text-xs text-gray-500 font-medium mt-0.5">
                      Rp 4.000 × 1
                    </span>
                  </div>
                </div>
                <span className="tabular-nums">Rp 4.000</span>
              </div>

              <div className="w-full h-[1px] bg-black/5 my-1" />
              <div className="w-full flex justify-between items-start opacity-60">
                <div className="flex gap-2.5">
                  <span className="text-gray-900 mt-1">•</span>
                  <div className="flex flex-col">
                    <span>Kerupuk Putih</span>
                    <span className="text-xs text-gray-500 font-medium mt-0.5">
                      Rp 2.000 × 2
                    </span>
                  </div>
                </div>
                <span className="tabular-nums">Rp 4.000</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 3. BARIS BAWAH: PANEL INPUT PUTIH FIXED ================= */}
        <div className="bg-white rounded-t-[40px] px-6 pt-7 pb-8 flex flex-col gap-5 shadow-[0_-10px_30px_rgba(0,0,0,0.06)] w-full z-20 relative">
          <div className="grid grid-cols-2 gap-4 w-full">
            <button className="flex items-center justify-center gap-2 bg-[#FCD844] hover:bg-[#ebd030] text-gray-900 font-extrabold py-3.5 rounded-2xl text-sm shadow-md shadow-yellow-500/10 active:scale-95 transition-all">
              <Scan size={16} className="stroke-[2.5]" />
              <span>Scan</span>
            </button>
            <button className="flex items-center justify-center gap-2 bg-[#FCD844] hover:bg-[#ebd030] text-gray-900 font-extrabold py-3.5 rounded-2xl text-sm shadow-md shadow-yellow-500/10 active:scale-95 transition-all">
              <Upload size={16} className="stroke-[2.5]" />
              <span>Upload</span>
            </button>
          </div>

          <div className="w-full flex justify-between items-center px-1 py-1">
            <div className="h-9 max-w-[120px] flex items-center">
              <img
                src={activeAccountIcon}
                alt="Active Bank"
                className="h-full object-contain object-left"
              />
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-400 font-bold tracking-wide">
                Nominal
              </span>
              <span className="text-2xl font-black text-gray-900 tracking-tight tabular-nums mt-0.5">
                Rp {nominal.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* 🌟 CUSTOM DROPDOWN 2: KATEGORI TRANSAKSI (STYLE ANDROID) */}
          <div className="relative w-full">
            <div
              onClick={() => setIsCategoryDialogOpen(true)}
              className="w-full px-5 py-4 bg-[#F5F5F3] hover:bg-gray-100 rounded-2xl text-sm font-bold text-gray-900 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
            >
              <span>{category}</span>
              <ChevronDown size={18} className="text-gray-500 stroke-[2.3]" />
            </div>
          </div>

          <div className="w-full">
            <input
              type="text"
              placeholder="Add Notes...."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-5 py-3.5 bg-[#F5F5F3] border border-transparent rounded-2xl text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#FCD844] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 w-full pt-1">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full bg-[#FF5A5A] hover:bg-[#e04f4f] text-white font-extrabold py-3 rounded-2xl text-sm tracking-wide active:scale-95 transition-all shadow-md shadow-red-500/10"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveTransaction}
              disabled={isSubmitting}
              className="w-full bg-[#2AD154] hover:bg-[#22b347] text-white font-extrabold py-3 rounded-2xl text-sm tracking-wide active:scale-95 transition-all shadow-md shadow-green-500/10 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {/* ====================================================================
            🌟 INTERFAS POP-UP DIALOG DIBAWAH INI ADALAH PENGGANTI DROPDOWN ASLI
           ==================================================================== */}

        {/* DIALOG 1: PILIHAN JENIS TRANSAKSI */}
        {isTypeDialogOpen && (
          <div className="absolute inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
            <div
              className="absolute inset-0"
              onClick={() => setIsTypeDialogOpen(false)}
            />
            <div className="bg-white w-full max-w-[280px] rounded-3xl p-3 shadow-2xl z-10 animate-scale-up">
              <div className="px-4 py-3 text-xs font-bold text-gray-400 tracking-wider uppercase">
                Pilih Tipe
              </div>
              <div className="flex flex-col w-full">
                {[
                  { id: "expense", label: "🔴 Pengeluaran" },
                  { id: "income", label: "🟢 Pemasukan" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setTransactionType(item.id as any);
                      setIsTypeDialogOpen(false);
                    }}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-sm font-bold text-gray-900 rounded-xl hover:bg-gray-50 transition-colors text-left"
                  >
                    <span>{item.label}</span>
                    {transactionType === item.id && (
                      <Check size={16} className="text-gray-900 stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DIALOG 2: PILIHAN KATEGORI FINANSIAL */}
        {isCategoryDialogOpen && (
          <div className="absolute inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
            <div
              className="absolute inset-0"
              onClick={() => setIsCategoryDialogOpen(false)}
            />
            <div className="bg-white w-full max-w-[300px] rounded-[28px] p-3 shadow-2xl z-10 animate-scale-up">
              <div className="px-4 py-2.5 text-xs font-bold text-gray-400 tracking-wider uppercase">
                Pilih Kategori
              </div>
              <div className="flex flex-col w-full max-h-[260px] overflow-y-auto no-scrollbar">
                {[
                  "Meals and Drinks",
                  "Shopping",
                  "Transportation",
                  "Bills & Utilities",
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setIsCategoryDialogOpen(false);
                    }}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-sm font-semibold text-gray-900 rounded-xl hover:bg-gray-50 transition-colors text-left"
                  >
                    <span>{cat}</span>
                    {category === cat && (
                      <Check size={16} className="text-gray-900 stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
