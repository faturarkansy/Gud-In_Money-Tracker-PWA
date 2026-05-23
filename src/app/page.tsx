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

const BANK_CONV_LIST = [
  { name: "BCA Mobile", icon: "/icons/mbca.png", type: "conventional" },
  { name: "MyBCA", icon: "/icons/mybca.png", type: "conventional" },
  { name: "Livin' by Mandiri", icon: "/icons/livin.png", type: "conventional" },
  { name: "Wondr by BNI", icon: "/icons/wondr.png", type: "conventional" },
  { name: "BRI Mobile", icon: "/icons/brimo.png", type: "conventional" },
  { name: "Bale by BTN", icon: "/icons/btn.png", type: "conventional" },
  { name: "OCTO by CIMB Niaga", icon: "/icons/octo.png", type: "conventional" },
  { name: "D-Bank PRO", icon: "/icons/danamon.png", type: "conventional" },
  { name: "Byond by BSI", icon: "/icons/ocbc.png", type: "conventional" },
  { name: "MobilePanin", icon: "/icons/panin.png", type: "conventional" },
  {
    name: "M-Smile by Bank Mega",
    icon: "/icons/mega.png",
    type: "conventional",
  },
  {
    name: "OCBC Mobile Indonesia",
    icon: "/icons/mocbc.png",
    type: "conventional",
  },
  { name: "Maybank2u UD", icon: "/icons/maybank.png", type: "conventional" },
];

const BANK_DIGI_LIST = [
  { name: "Blu by BCA Digital", icon: "/icons/blu.png", type: "digital" },
  { name: "Bank Jago", icon: "/icons/jago.png", type: "digital" },
  { name: "UOB TMRW Indonesia", icon: "/icons/uob.png", type: "digital" },
  { name: "Jenius", icon: "/icons/jenius.png", type: "digital" },
  { name: "SeaBank", icon: "/icons/seabank.png", type: "digital" },
  { name: "Line Bank", icon: "/icons/linebank.png", type: "digital" },
  { name: "Allo Bank", icon: "/icons/allobank.png", type: "digital" },
  { name: "Neobank by BNC Digital", icon: "/icons/bnc.png", type: "digital" },
  { name: "Permata Me", icon: "/icons/permatame.png", type: "digital" },
  { name: "Digibank by DBS", icon: "/icons/dbs.png", type: "digital" },
  { name: "Raya - Bank Digital", icon: "/icons/raya.png", type: "digital" },
  { name: "Krom - Bank Digital", icon: "/icons/krom.png", type: "digital" },
  { name: "Superbank", icon: "/icons/superbank.png", type: "digital" },
  { name: "Bank Saqu", icon: "/icons/saqu.png", type: "digital" },
];

const EWALLET_LIST = [
  { name: "GoPay", icon: "/icons/goplay.png", type: "e-wallet" },
  { name: "OVO", icon: "/icons/ovo.png", type: "e-wallet" },
  { name: "ShopeePay", icon: "/icons/shopeepay.png", type: "e-wallet" },
  { name: "Dana", icon: "/icons/dana.png", type: "e-wallet" },
  { name: "LinkAja", icon: "/icons/linkaja.png", type: "e-wallet" },
  { name: "Doku", icon: "/icons/doku.png", type: "e-wallet" },
];

export default function Home() {
  const supabase = createClient();
  const router = useRouter();

  // Financial & User State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  // State Sinkronisasi Akun dari Database Supabase
  const [accounts, setAccounts] = useState<any[]>([]);
  const [activeAccount, setActiveAccount] = useState<any | null>(null);

  // 🌟 State Baru untuk Menampung String Waktu Bulan & Tahun Real-time
  const [currentMonthYear, setCurrentMonthYear] = useState("");

  // Pop-Up Windows Control State
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [tempSelectedAccount, setTempSelectedAccount] = useState<any>(null);
  const [inputBalance, setInputBalance] = useState("");
  const [submittingBalance, setSubmittingBalance] = useState(false);

  // State Kustom untuk Pengendalian Swipe Gesture
  const [isFullScreen, setIsFullScreen] = useState(false);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  // Scanner UI State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanType, setScanType] = useState<"income" | "expense">("expense");
  const [inputType, setInputType] = useState<"camera" | "text">("camera");
  const webcamRef = useRef<Webcam>(null);

  // Ambil Data Akun & Transaksi Pengguna
  const fetchUserDataAndAccounts = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push(ROUTES.LOGIN);
      return;
    }

    setUserData({
      name: user.user_metadata?.full_name || "Fatur Arkan Syawalva",
      avatar: user.user_metadata?.avatar_url || null,
    });

    // 1. Ambil Akun Finansial Asli dari Supabase
    const { data: accountData } = await supabase
      .from("finance_accounts")
      .select("*")
      .order("created_at", { ascending: true });

    if (accountData && accountData.length > 0) {
      setAccounts(accountData);

      const savedAccountId = localStorage.getItem("active_account_id");
      const matchedAccount = accountData.find((a) => a.id === savedAccountId);

      setActiveAccount(matchedAccount || accountData[0]);
    } else {
      setAccounts([]);
      setActiveAccount(null);
    }

    // 2. Ambil Log Transaksi
    const { data: transactionData } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    setTransactions(transactionData || []);
    setLoading(false);
  }, [router, supabase]);

  useEffect(() => {
    const handleOpenScanner = () => setIsScannerOpen(true);
    window.addEventListener("open-global-scanner", handleOpenScanner);
    fetchUserDataAndAccounts();

    // 🌟 KANONIKAL SINKRONISASI WAKTU INDONESIA BARAT (WIB -> UTC+7) FORMAT INGGRIS
    const getWIBMonthYear = () => {
      const now = new Date();

      // Ambil string waktu terkonversi ke zona waktu Asia/Jakarta (WIB)
      const wibDateString = now.toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
      });
      const wibDate = new Date(wibDateString);

      // Format ke struktur teks singkatan bulan bahasa Inggris (ex: May 2026)
      const formatter = new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "numeric",
      });

      setCurrentMonthYear(formatter.format(wibDate));
    };

    getWIBMonthYear();

    return () =>
      window.removeEventListener("open-global-scanner", handleOpenScanner);
  }, [fetchUserDataAndAccounts]);

  // LOGIKA SWIPE GESTURE BOTTOM SHEET
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.targetTouches[0].clientY;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.targetTouches[0].clientY;
  };
  const handleTouchEnd = () => {
    const diffY = touchStartY.current - touchEndY.current;
    if (diffY > 50) setIsFullScreen(true);
    else if (diffY < -50) {
      if (isFullScreen) setIsFullScreen(false);
      else closeModal();
    }
  };

  const closeModal = () => {
    setIsAccountModalOpen(false);
    setIsFullScreen(false);
  };

  // AKSI INPUT SALDO KE SUPABASE (SAVE TO DB)
  const handleSaveInitialBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempSelectedAccount || !inputBalance) return;

    setSubmittingBalance(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const parsedBalance = parseFloat(inputBalance.replace(/[^0-9]/g, "")) || 0;

    const { data, error } = await supabase
      .from("finance_accounts")
      .insert([
        {
          user_id: user.id,
          account_name: tempSelectedAccount.name,
          account_type: tempSelectedAccount.type,
          current_balance: parsedBalance,
        },
      ])
      .select()
      .single();

    if (error) {
      alert(`Gagal menyimpan: ${error.message}`);
    } else {
      localStorage.setItem("active_account_id", data.id);
      setInputBalance("");
      setIsBalanceModalOpen(false);
      await fetchUserDataAndAccounts();
    }
    setSubmittingBalance(false);
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) console.log("Gambar siap diproses OCR");
  }, [webcamRef]);

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
      <div className="relative w-full max-w-md min-h-screen sm:min-h-screen sm:rounded-[40px] sm:shadow-2xl bg-[#EFEFEF] overflow-hidden p-6 flex flex-col justify-between">
        <div
          className="absolute right-[-30%] top-[-10%] w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at center, #F6DACA 0%, #EFEFEF 70%)",
          }}
        />

        <div className="z-10 w-full flex flex-col gap-6 pb-24">
          {/* USER HEADER TOP BAR */}
          <div className="w-full flex justify-between items-center bg-transparent">
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
            <button className="w-10 h-10 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center shadow-sm border border-gray-100 transition-all active:scale-95 relative">
              <Bell size={18} className="text-gray-800 stroke-[2.3]" />
              <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>

          {/* FINANCE ACCOUNT CONTAINER CARD */}
          <div
            className="w-full h-[145px] rounded-3xl px-6 py-4 flex flex-col justify-between relative bg-cover bg-center overflow-hidden shadow-[0_0_6px_0_rgba(0,0,0,0.25)] border border-yellow-200/20 select-none"
            style={{ backgroundImage: "url('/background/finance_acc_bg.svg')" }}
          >
            <div>
              <h3 className="text-sm font-bold text-black tracking-tight opacity-80">
                Finance Account
              </h3>
            </div>

            <div className="w-full flex items-center justify-between gap-4 mt-auto mb-1">
              {activeAccount ? (
                <div className="mb-2 h-[70px] flex items-center flex-1 animate-fade-in">
                  <img
                    src={
                      [
                        ...BANK_CONV_LIST,
                        ...BANK_DIGI_LIST,
                        ...EWALLET_LIST,
                      ].find(
                        (item) =>
                          item.name.toLowerCase() ===
                          activeAccount.account_name.toLowerCase(),
                      )?.icon || "/icons/livin.png"
                    }
                    alt={activeAccount.account_name}
                    className="h-full object-contain object-left filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
                  />
                </div>
              ) : (
                <span className="text-sm font-semibold text-gray-700 italic flex-1 animate-pulse">
                  Choose your finance account
                </span>
              )}

              <div className="flex-shrink-0 self-end">
                <button
                  onClick={() => setIsAccountModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white/60 hover:bg-white/90 backdrop-blur-md border border-white/80 rounded-full text-[11px] font-black text-gray-900 shadow-sm active:scale-95 transition-all"
                >
                  <ArrowLeftRight size={11} className="stroke-[2.5]" />
                  <span>
                    {activeAccount ? "Switch Account" : "Choose my account"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* CAROUSEL HORIZONTAL CARDS */}
          <div className="w-full overflow-x-auto flex gap-4 pb-2 snap-x snap-mandatory no-scrollbar">
            {/* CARD 1: CURRENT BALANCE */}
            <div className="min-w-[295px] w-[86%] bg-white rounded-[32px] p-6 border border-gray-100 shadow-[0_12px_24px_rgba(0,0,0,0.02)] snap-center flex flex-col gap-4">
              <div>
                <div className="flex justify-between items-center">
                  <h4 className="text-[12px] font-bold text-gray-900/90">
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

                {/* 🌟 PENYESUAIAN REAL-TIME: Memanggil teks bulan dinamis dari State */}
                <p className="text-[11px] text-gray-400 font-semibold mt-0.5 capitalize">
                  {currentMonthYear || "May 2026"}
                </p>

                <h2 className="text-[25px] font-black text-gray-900 mt-2 tracking-tight">
                  {showBalance
                    ? activeAccount
                      ? `Rp ${parseFloat(activeAccount.current_balance).toLocaleString("id-ID")},00`
                      : "Rp 0,00"
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
          <FloatingNavbar />
        </div>

        {/* BOTTOM SHEET POP-UP LIST ACCOUNTS */}
        {isAccountModalOpen && (
          <div className="absolute inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-end justify-center transition-all duration-300 ease-out">
            <div className="absolute inset-0" onClick={closeModal} />
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`bg-white w-full rounded-t-[40px] p-6 flex flex-col z-90 relative shadow-[0_-10px_30px_rgba(0,0,0,0.15)] transition-all duration-300 ease-in-out select-none ${
                isFullScreen ? "h-full rounded-t-none" : "max-h-[80vh] h-[80vh]"
              }`}
            >
              <div className="w-14 h-1.5 bg-gray-300 rounded-full mx-auto mb-5 cursor-grab active:cursor-grabbing flex-shrink-0" />
              <div className="mb-5 flex-shrink-0">
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight text-center sm:text-left">
                  Kamu sering pakai akun apa?
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 space-y-6 no-scrollbar pb-8">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 ml-1">
                    Bank
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {BANK_CONV_LIST.map((bank) => (
                      <button
                        key={bank.name}
                        onClick={() => {
                          const existing = accounts.find(
                            (a) =>
                              a.account_name.toLowerCase() ===
                              bank.name.toLowerCase(),
                          );
                          if (existing) {
                            localStorage.setItem(
                              "active_account_id",
                              existing.id,
                            );
                            setActiveAccount(existing);
                            closeModal();
                          } else {
                            setTempSelectedAccount(bank);
                            setIsAccountModalOpen(false);
                            setIsBalanceModalOpen(true);
                          }
                        }}
                        className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 hover:border-[#FEDC34] hover:bg-yellow-50/30 rounded-full text-xs font-semibold text-gray-800 transition-all shadow-sm active:scale-95"
                      >
                        <img
                          src={bank.icon}
                          alt={bank.name}
                          className="w-5 h-5 object-contain rounded-sm"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <span>{bank.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 ml-1">
                    Bank Digital
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {BANK_DIGI_LIST.map((bank) => (
                      <button
                        key={bank.name}
                        onClick={() => {
                          const existing = accounts.find(
                            (a) =>
                              a.account_name.toLowerCase() ===
                              bank.name.toLowerCase(),
                          );
                          if (existing) {
                            localStorage.setItem(
                              "active_account_id",
                              existing.id,
                            );
                            setActiveAccount(existing);
                            closeModal();
                          } else {
                            setTempSelectedAccount(bank);
                            setIsAccountModalOpen(false);
                            setIsBalanceModalOpen(true);
                          }
                        }}
                        className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 hover:border-[#FEDC34] hover:bg-yellow-50/30 rounded-full text-xs font-semibold text-gray-800 transition-all shadow-sm active:scale-95"
                      >
                        <img
                          src={bank.icon}
                          alt={bank.name}
                          className="w-5 h-5 object-contain rounded-sm"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <span>{bank.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 ml-1">
                    E-wallet
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {EWALLET_LIST.map((wallet) => (
                      <button
                        key={wallet.name}
                        onClick={() => {
                          const existing = accounts.find(
                            (a) =>
                              a.account_name.toLowerCase() ===
                              wallet.name.toLowerCase(),
                          );
                          if (existing) {
                            localStorage.setItem(
                              "active_account_id",
                              existing.id,
                            );
                            setActiveAccount(existing);
                            closeModal();
                          } else {
                            setTempSelectedAccount(wallet);
                            setIsAccountModalOpen(false);
                            setIsBalanceModalOpen(true);
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:border-[#FEDC34] hover:bg-yellow-50/30 rounded-full text-xs font-semibold text-gray-800 transition-all shadow-sm active:scale-95"
                      >
                        <img
                          src={wallet.icon}
                          alt={wallet.name}
                          className="w-4 h-4 object-contain rounded-sm"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <span>{wallet.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL INPUT INITIAL BALANCE */}
        {isBalanceModalOpen && tempSelectedAccount && (
          <div className="absolute inset-0 z-[95] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl border border-gray-100 flex flex-col gap-5">
              <div className="text-center flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm">
                  <img
                    src={tempSelectedAccount.icon}
                    alt={tempSelectedAccount.name}
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">
                    Input Saldo Awal
                  </h3>
                  <p className="text-xs text-gray-400 font-medium mt-1">
                    Masukkan nominal saldo terkini untuk{" "}
                    {tempSelectedAccount.name}
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSaveInitialBalance}
                className="flex flex-col gap-4"
              >
                <div className="relative flex items-center">
                  <span className="absolute left-5 text-sm font-black text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
                    Rp
                  </span>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="0"
                    value={inputBalance}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      setInputBalance(
                        val ? parseInt(val).toLocaleString("id-ID") : "",
                      );
                    }}
                    className="w-full pl-16 pr-5 py-4 bg-[#F5F5F3] border border-transparent rounded-2xl text-black font-extrabold focus:outline-none focus:bg-white focus:border-[#FEDC34] text-lg text-right tracking-wide"
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsBalanceModalOpen(false);
                      setTempSelectedAccount(null);
                      setInputBalance("");
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-xl text-xs tracking-wider transition-all"
                  >
                    BATAL
                  </button>
                  <button
                    type="submit"
                    disabled={submittingBalance || !inputBalance}
                    className="flex-1 bg-[#FEDC34] hover:bg-[#ebd030] text-black font-bold py-3.5 rounded-xl text-xs tracking-wider transition-all disabled:opacity-40 shadow-md shadow-yellow-400/10"
                  >
                    {submittingBalance ? "SAVING..." : "SIMPAN"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
