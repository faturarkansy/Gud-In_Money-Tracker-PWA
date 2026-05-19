"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Webcam from "react-webcam";
import Link from "next/link"; // Ditambahkan untuk navigasi kustom
import { ROUTES } from "@/utils/routes"; // Mengimpor rute terpusat
import { User } from "lucide-react"; // Menggunakan ikon profil

export default function Home() {
  const supabase = createClient();
  const router = useRouter();

  // State untuk Data
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // State untuk UI Scanner
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanType, setScanType] = useState<"income" | "expense">("expense");
  const [inputType, setInputType] = useState<"camera" | "text">("camera");
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push(ROUTES.LOGIN);
      } else {
        setUser(user);
        await fetchTransactions();
      }
    };

    async function fetchTransactions() {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching data:", error);
      } else {
        setTransactions(data || []);
      }
      setLoading(false);
    }

    checkUserAndFetchData();
  }, [router, supabase]);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      console.log("Gambar ditangkap, siap dikirim ke OCR");
    }
  }, [webcamRef]);

  const totalBalance = transactions.reduce((acc, item) => {
    const amount = parseFloat(item.amount);
    return item.type === "income" ? acc + amount : acc - amount;
  }, 0);

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-blue-600 font-semibold">Memeriksa Autentikasi...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 w-full">
      <main className="max-w-screen-md mx-auto min-h-screen shadow-2xl bg-white pb-20 relative">
        {/* HEADER DASHBOARD */}
        <div className="bg-blue-600 rounded-b-3xl p-6 text-white shadow-lg mb-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-80">Total Saldo Anda</p>
              <h1 className="text-3xl font-bold mt-1">
                Rp {totalBalance.toLocaleString("id-ID")}
              </h1>
            </div>

            {/* Navigasi Kanan Atas */}
            <div className="flex items-center gap-3">
              {/* TOMBOL UNTUK MEMBUKA HALAMAN PROFILE */}
              <Link
                href={ROUTES.PROFILE}
                className="p-2 bg-blue-500 hover:bg-blue-700 rounded-lg transition-colors shadow-inner flex items-center justify-center"
                aria-label="Buka Profil"
              >
                <User size={16} />
              </Link>

              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push(ROUTES.LOGIN);
                }}
                className="text-xs bg-red-500 hover:bg-red-700 px-3 py-2 rounded-lg transition-colors shadow-inner font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* DAFTAR TRANSAKSI */}
        <div className="px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h2 className="font-semibold text-gray-700 mb-4">
              Transaksi Terakhir
            </h2>

            {loading ? (
              <p className="text-gray-400 text-center py-4">Memuat data...</p>
            ) : transactions.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                Belum ada transaksi.
              </p>
            ) : (
              <div className="space-y-4">
                {transactions.map((t) => (
                  <div
                    key={t.id}
                    className="flex justify-between items-center border-b pb-2 last:border-none"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{t.category}</p>
                      <p className="text-xs text-gray-500">{t.note}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${t.type === "income" ? "text-green-500" : "text-red-500"}`}
                      >
                        {t.type === "income" ? "+" : "-"} Rp{" "}
                        {parseFloat(t.amount).toLocaleString("id-ID")}
                      </p>
                      <button className="text-[10px] text-blue-500 font-semibold uppercase tracking-wider hover:underline">
                        Detail
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* TOMBOL FAB SCANNER */}
        <button
          onClick={() => setIsScannerOpen(true)}
          className="absolute bottom-6 right-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl active:scale-90 transition-transform z-40"
        >
          +
        </button>

        {/* UI SCANNER OVERLAY */}
        {isScannerOpen && (
          <div className="fixed inset-0 md:absolute z-50 bg-black flex flex-col max-w-screen-md mx-auto h-full">
            <div className="relative flex-1 flex items-center justify-center bg-black">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="absolute inset-0 w-full h-full object-cover"
                videoConstraints={{ facingMode: "environment" }}
              />
              <div className="absolute inset-0 border-[40px] border-black/70 pointer-events-none">
                <div className="w-full h-full border-2 border-white/50 rounded-lg"></div>
              </div>
              <button
                onClick={() => setIsScannerOpen(false)}
                className="absolute top-6 right-6 text-white text-xl bg-black/50 w-10 h-10 rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="bg-white p-6 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
              <div className="flex flex-col gap-4">
                <select
                  value={scanType}
                  onChange={(e) => setScanType(e.target.value as any)}
                  className="w-full p-3 border rounded-xl bg-gray-50 font-semibold text-black focus:outline-blue-500"
                >
                  <option value="expense">🔴 Pengeluaran</option>
                  <option value="income">🟢 Pemasukan</option>
                </select>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex bg-gray-100 p-1 rounded-xl flex-1">
                    <button
                      onClick={() => setInputType("camera")}
                      className={`flex-1 py-2 rounded-lg text-sm transition-all ${inputType === "camera" ? "bg-white shadow text-blue-600 font-bold" : "text-gray-500"}`}
                    >
                      Kamera
                    </button>
                    <button
                      onClick={() => setInputType("text")}
                      className={`flex-1 py-2 rounded-lg text-sm transition-all ${inputType === "text" ? "bg-white shadow text-blue-600 font-bold" : "text-gray-500"}`}
                    >
                      Teks
                    </button>
                  </div>
                  <button
                    onClick={capture}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
                  >
                    SCAN
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
