"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/utils/routes";
import Webcam from "react-webcam";
import Link from "next/link";
import { X, Scan as ScanIcon, MonitorOff } from "lucide-react";

export default function ScanPage() {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);

  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean>(true);

  // 1. Deteksi Perangkat Berdasarkan User Agent Sistem Operasi Mobile/Tablet
  useEffect(() => {
    const userAgent =
      typeof window !== "undefined"
        ? navigator.userAgent || navigator.vendor
        : "";
    const mobileRegex =
      /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;

    setIsMobile(mobileRegex.test(userAgent.toLowerCase()));
  }, []);

  // 2. Simulasi Mekanisme Ekstraksi OCR Struk Finansial Gud In
  const handleCaptureAndOCR = () => {
    if (!webcamRef.current) return;

    // Ambil base64 string screenshot dari modul kamera hp
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    // Dummy structured data tiruan hasil pembacaan OCR teks terproses
    const ocrMockResult = {
      storeName: "Indomaret Lampung",
      nominal: 10000,
      items: [
        { name: "Indomie Goreng", qty: 1, price: 6000 },
        { name: "Es Teh Anget", qty: 1, price: 4000 },
      ],
      capturedImage: imageSrc, // Teruskan data base64 gambar untuk preview struk
    };

    // Simpan di sessionStorage agar bisa ditangkap oleh halaman input transaksi
    sessionStorage.setItem("gudin_ocr_result", JSON.stringify(ocrMockResult));

    // Alihkan navigasi kembali
    router.push("/Input_Transaction");
  };

  if (isMobile === null) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white text-xs">
        Memeriksa Kompatibilitas Perangkat...
      </div>
    );
  }

  // 🔴 RESTRIKSI LAPTOP/DESKTOP: Jika bukan mobile/tablet, tampilkan layar proteksi
  if (!isMobile) {
    return (
      <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[32px] p-8 border border-gray-200 shadow-xl flex flex-col items-center justify-center text-center gap-5 select-none animate-fade-in">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 shadow-sm">
            <MonitorOff size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-black text-gray-900">
              Device Restricted
            </h2>
            <p className="text-sm text-gray-500 font-medium leading-relaxed px-2">
              Ooopss this feature just for mobile or tablet users only for
              focusing on compactibility. Please open this page from your phone.
            </p>
          </div>

          <Link
            href={ROUTES.HOME}
            className="w-full mt-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl text-xs tracking-wider transition-colors"
          >
            <span>Kembali</span>
          </Link>
        </div>
      </div>
    );
  }

  // 🟢 TAMPILAN KAMERA MOBILE (MENGIKUTI DESIGN IMAGE_BF53A3)
  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-0 sm:p-4">
      <div className="relative w-full max-w-md h-screen sm:h-[840px] sm:rounded-[40px] sm:shadow-2xl bg-black overflow-hidden flex flex-col justify-between">
        {/* Tombol Silang Pojok Kanan Atas */}
        <button
          onClick={() => router.push("/Input_Transaction")}
          className="absolute top-6 right-6 z-50 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all active:scale-90"
        >
          <X size={20} className="stroke-[2.5]" />
        </button>

        {/* Viewfinder Area Jendela Kamera */}
        <div className="relative flex-1 flex items-center justify-center bg-black">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="absolute inset-0 w-full h-full object-cover"
            videoConstraints={{ facingMode: "environment" }} // Gunakan kamera belakang HP
            onUserMediaError={() => setHasCameraPermission(false)}
          />

          {/* Bingkai Target Pemindai (Scanner Overlay Target) */}
          <div className="absolute inset-0 border-[45px] border-black/60 pointer-events-none flex items-center justify-center">
            <div className="w-full h-[65%] border-2 border-[#FCD844] rounded-[24px] relative shadow-[0_0_0_9999px_rgba(0,0,0,0.2)]">
              {/* Garis Laser Efek Animasi Bergerak Hijau */}
              <div className="absolute inset-x-0 h-[2px] bg-emerald-400 top-1/2 -translate-y-1/2 shadow-[0_0_10px_#34d399] opacity-80" />
            </div>
          </div>

          {!hasCameraPermission && (
            <div className="absolute inset-0 bg-black/90 z-40 flex flex-col items-center justify-center p-6 text-center text-white gap-2">
              <span className="font-bold text-sm">Akses Kamera Ditolak</span>
              <span className="text-xs text-gray-400">
                Izinkan browser mengakses modul perangkat keras kamera kamu.
              </span>
            </div>
          )}
        </div>

        {/* Baris Tombol Aksi Bawah Panel */}
        <div className="w-full p-6 bg-black flex flex-col items-center justify-center">
          <p className="text-white/60 text-[11px] font-medium tracking-wide mb-4 text-center">
            Posisikan struk belanja di dalam kotak area pemindaian laser
          </p>
          <button
            onClick={handleCaptureAndOCR}
            className="w-full bg-[#FCD844] hover:bg-[#ebd030] text-gray-900 font-black py-4 rounded-2xl text-sm tracking-wider shadow-lg shadow-yellow-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <ScanIcon size={16} className="stroke-[3]" />
            <span>Scan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
