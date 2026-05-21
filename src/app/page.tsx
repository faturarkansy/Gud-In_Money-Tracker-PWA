"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Webcam from "react-webcam";
import { ROUTES } from "@/utils/routes";
import {
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Bell,
} from "lucide-react";
import FloatingNavbar from "@/components/FloatingNavbar";

export default function Home() {
  const supabase = createClient();
  const router = useRouter();

  // Financial & User State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  // Scanner UI State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanType, setScanType] = useState<"income" | "expense">("expense");
  const [inputType, setInputType] = useState<"camera" | "text">("camera");
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    const handleOpenScanner = () => setIsScannerOpen(true);
    window.addEventListener("open-global-scanner", handleOpenScanner);

    const checkUserAndFetchData = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push(ROUTES.LOGIN);
        return;
      }

      // Ambil username/nama lengkap asli dari tabel profiles Supabase
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, username")
        .eq("id", user.id)
        .maybeSingle();

      if (profileData && !profileError) {
        setUserData({
          name:
            profileData.full_name || profileData.username || "Pengguna Gud In",
          avatar:
            profileData.avatar_url || user.user_metadata?.avatar_url || null,
        });
      } else {
        setUserData({
          name: user.user_metadata?.full_name || "User Gud In",
          avatar: user.user_metadata?.avatar_url || null,
        });
      }

      await fetchTransactions();
    };

    async function fetchTransactions() {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setTransactions(data || []);
      setLoading(false);
    }

    checkUserAndFetchData();
    return () =>
      window.removeEventListener("open-global-scanner", handleOpenScanner);
  }, [router, supabase]);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) console.log("Gambar siap diproses OCR");
  }, [webcamRef]);

  const totalBalance = transactions.reduce((acc, item) => {
    const amount = parseFloat(item.amount);
    return item.type === "income" ? acc + amount : acc - amount;
  }, 1000000);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-blue-600 font-semibold text-sm">
          Memeriksa Autentikasi...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-0 sm:p-4">
      {/* 🌟 PEMBUNGKUS UTAMA MOCKUP HANDPHONE M-BANKING STYLE */}
      <div className="relative w-full max-w-md min-h-screen sm:min-h-screen sm:rounded-[40px] sm:shadow-2xl bg-[#FCFCF9] overflow-hidden p-6 flex flex-col justify-between">
        {/* Konten Halaman Utama */}
        <div className="z-10 w-full flex flex-col gap-6 pb-24">
          {/* USER HEADER TOP BAR */}
          <div className="w-full flex justify-between items-center bg-transparent pt-2">
            <div className="flex items-center gap-3">
              {userData?.avatar ? (
                <img
                  src={userData.avatar}
                  alt="Profile"
                  className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-sm"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gray-950 border-2 border-white flex items-center justify-center shadow-md text-white font-bold text-base uppercase">
                  {userData?.name ? userData.name.charAt(0) : "F"}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-[11px] text-gray-400 font-medium leading-none mb-1">
                  Welcome,
                </span>
                <h2 className="text-[15px] font-bold text-gray-900 tracking-tight leading-tight">
                  {userData?.name}
                </h2>
              </div>
            </div>

            <button
              className="w-10 h-10 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center shadow-sm border border-gray-100 transition-all active:scale-95 relative"
              aria-label="Notification"
            >
              <Bell size={18} className="text-gray-800 stroke-[2.3]" />
              <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>

          {/* SECTION BANK */}
          <div>
            <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">
              Bank Account
            </h3>
            <div className="flex items-center gap-2 mt-1 text-gray-400">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
                mandiri
              </span>
              <ArrowLeftRight
                size={12}
                className="text-gray-300 stroke-[2.5]"
              />
              <span className="text-[11px] font-bold text-gray-500 hover:text-black transition-colors cursor-pointer">
                Switch Account
              </span>
            </div>
          </div>

          {/* CAROUSEL HORIZONTAL CARDS */}
          <div className="w-full overflow-x-auto flex gap-4 pb-2 snap-x snap-mandatory no-scrollbar">
            {/* CARD 1: CURRENT BALANCE */}
            <div className="min-w-[295px] w-[86%] bg-white rounded-[32px] p-6 border border-gray-100 shadow-[0_12px_24px_rgba(0,0,0,0.02)] snap-center flex flex-col gap-4">
              <div>
                <div className="flex justify-between items-center">
                  <h4 className="text-[12px] font-bold text-gray-900">
                    Current Balance
                  </h4>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-black transition-colors"
                  >
                    {showBalance ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>{showBalance ? "Hide" : "Show"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                  May 2026
                </p>
                <h2 className="text-[25px] font-bold text-gray-900 mt-2 tracking-tight">
                  {showBalance
                    ? `Rp ${totalBalance.toLocaleString("id-ID")},00`
                    : "••••••••"}
                </h2>
              </div>

              <div className="w-full h-[1px] bg-gray-100" />

              {/* BUDGET METRICS */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 bg-[#FEDC34] rounded-full" />
                    <span className="text-gray-500 font-medium">Budget</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    Rp 2.300.000,00
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 bg-green-400 rounded-full" />
                    <span className="text-gray-500 font-medium">Saving</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    Rp 1.100.000,00
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 bg-red-400 rounded-full" />
                    <span className="text-gray-500 font-medium">Spending</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    Rp 2.400.000,00
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 2: LAST MONTH BALANCE */}
            <div className="min-w-[295px] w-[86%] bg-white rounded-[32px] p-6 border border-gray-100 shadow-[0_12px_24px_rgba(0,0,0,0.02)] snap-center opacity-50 flex flex-col gap-4">
              <div>
                <h4 className="text-[12px] font-bold text-gray-600">
                  Last Month Balance
                </h4>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                  April 2026
                </p>
                <h2 className="text-[25px] font-bold text-gray-800 mt-2 tracking-tight">
                  Rp 1.000.000,00
                </h2>
              </div>
              <div className="w-full h-[1px] bg-gray-100" />
              <div className="flex flex-col gap-3 text-gray-400">
                <div className="flex items-center justify-between text-[12px]">
                  <span>Budget</span>
                  <span className="font-bold">Rp 2.300.000,00</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span>Saving</span>
                  <span className="font-bold">Rp 1.100.000,00</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span>Spending</span>
                  <span className="font-bold">Rp 2.400.000,00</span>
                </div>
              </div>
            </div>
          </div>

          {/* RECENT TRANSACTIONS */}
          <div className="w-full flex flex-col gap-4 mt-2">
            <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">
              Recent Transactions
            </h3>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-2xl p-4 border border-gray-100/50 flex justify-between items-center shadow-[0_4px_12px_rgba(0,0,0,0.01)]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === "income" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
                    >
                      {t.type === "income" ? (
                        <TrendingUp size={18} />
                      ) : (
                        <TrendingDown size={18} />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">
                        {t.category}
                      </h4>
                      <p className="text-xs text-gray-400 font-medium">
                        {t.note || "No note"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold ${t.type === "income" ? "text-green-500" : "text-red-500"}`}
                  >
                    {t.type === "income" ? "+" : "-"} Rp{" "}
                    {parseFloat(t.amount).toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* FLOATING NAVBAR RE-POSITION */}
          <FloatingNavbar />
        </div>

        {/* OVERLAY SCANNER CAMERA */}
        {isScannerOpen && (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col max-w-md mx-auto h-full">
            <div className="relative flex-1 flex items-center justify-center bg-black">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="absolute inset-0 w-full h-full object-cover"
                videoConstraints={{ facingMode: "environment" }}
              />
              <div className="absolute inset-0 border-[50px] border-black/70 pointer-events-none">
                <div className="w-full h-full border-2 border-white/40 rounded-[24px]"></div>
              </div>
              <button
                onClick={() => setIsScannerOpen(false)}
                className="absolute top-6 right-6 text-white text-sm bg-black/40 backdrop-blur-md w-10 h-10 rounded-full flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>
            <div className="bg-white p-6 rounded-t-[32px] shadow-2xl flex flex-col gap-4">
              <select
                value={scanType}
                onChange={(e) => setScanType(e.target.value as any)}
                className="w-full p-3.5 border rounded-xl bg-gray-50 font-bold text-black focus:outline-none focus:border-yellow-400 text-sm"
              >
                <option value="expense">🔴 Pengeluaran</option>
                <option value="income">🟢 Pemasukan</option>
              </select>
              <div className="flex items-center justify-between gap-4">
                <div className="flex bg-gray-100 p-1 rounded-xl flex-1">
                  <button
                    onClick={() => setInputType("camera")}
                    className={`flex-1 py-2.5 rounded-lg text-xs transition-all ${inputType === "camera" ? "bg-white shadow text-black font-bold" : "text-gray-400"}`}
                  >
                    Kamera
                  </button>
                  <button
                    onClick={() => setInputType("text")}
                    className={`flex-1 py-2.5 rounded-lg text-xs transition-all ${inputType === "text" ? "bg-white shadow text-black font-bold" : "text-gray-400"}`}
                  >
                    Teks
                  </button>
                </div>
                <button
                  onClick={capture}
                  className="bg-black text-white px-8 py-3 rounded-xl font-bold shadow-md active:scale-95 transition-all text-xs tracking-wider"
                >
                  SCAN
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
