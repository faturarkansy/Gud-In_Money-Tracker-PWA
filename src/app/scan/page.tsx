"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Webcam from "react-webcam";
import { X, Scan as ScanIcon, MonitorOff, Loader2 } from "lucide-react";
import { createWorker } from "tesseract.js";

export default function ScanPage() {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);

  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean>(true);

  // 🌟 State Kendali Proses Analisis OCR
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrStatus, setOcrStatus] = useState("");

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

  // 🌟 2. Mesin Ekstraksi Teks Semantik Hasil Pemindaian Struk Belanja
  const parseReceiptText = (
    text: string,
  ): { storeName: string; nominal: number; items: any[] } => {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    let storeName = "Unknown Store";
    let nominal = 0;
    const items: any[] = [];

    // Asumsi: Baris pertama yang valid biasanya adalah nama toko/vendor perbelanjaan
    if (lines.length > 0) {
      storeName = lines[0].replace(/[^a-zA-Z0-9\s]/g, "");
    }

    // Pola Regex untuk menangkap item: Contoh "Indomie Goreng 6.000" atau "Es Teh 1x4000"
    const itemRegex = /(.*?)\s+(\d+[\.,]\d+|\d+)\s*$/;
    const qtyRegex = /(\d+)\s*[xX×]\s*(\d+[\.,]\d+|\d+)/;

    lines.forEach((line) => {
      const lowerLine = line.toLowerCase();

      // Deteksi Total Pembayaran / Grand Total Struk
      if (
        lowerLine.includes("total") ||
        lowerLine.includes("grand") ||
        lowerLine.includes("jumlah")
      ) {
        const match = line.match(/(\d+[\.,]\d+|\d+)/);
        if (match) {
          const num = parseInt(match[0].replace(/[\.,]/g, ""));
          if (num > nominal) nominal = num;
        }
        return;
      }

      // Deteksi Baris Item Belanjaan
      const itemMatch = line.match(itemRegex);
      if (itemMatch) {
        const namePart = itemMatch[1].trim();
        const pricePart = itemMatch[2].replace(/[\.,]/g, "");
        const price = parseInt(pricePart) || 0;

        // Jangan masukkan baris total/pajak ke dalam list item belanjaan
        if (/total|grand|subtotal|pajak|tax|cash|kembali/i.test(namePart))
          return;

        // Cek apakah ada informasi kuantitas pengali di baris tersebut
        const qtyMatch = line.match(qtyRegex);
        if (qtyMatch) {
          const qty = parseInt(qtyMatch[1]) || 1;
          const singlePrice =
            parseInt(qtyMatch[2].replace(/[\.,]/g, "")) || price;
          items.push({
            name: namePart.replace(qtyRegex, "").trim(),
            qty,
            price: singlePrice,
          });
        } else {
          items.push({ name: namePart, qty: 1, price });
        }
      }
    });

    // Fallback hitung total dari akumulasi item jika nominal total utama gagal terbaca regex
    if (nominal === 0 && items.length > 0) {
      nominal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
    }

    return {
      storeName: storeName || "Merchant Gud In",
      nominal: nominal || 10000, // Fallback nilai default minimalis jika struk buram
      items:
        items.length > 0
          ? items
          : [{ name: "Item Terpindai", qty: 1, price: 10000 }],
    };
  };

  // 🌟 3. Eksekutor Kamera & Worker Tesseract OCR
  const handleCaptureAndOCR = async () => {
    if (!webcamRef.current || isProcessing) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setIsProcessing(true);
    setOcrStatus("Menginisialisasi Mesin...");

    try {
      // Buat instance worker Tesseract dengan dukungan bahasa Indonesia & Inggris
      const worker = await createWorker(["ind", "eng"]);

      setOcrStatus("Memindai Gambar Struk...");
      const {
        data: { text },
      } = await worker.recognize(imageSrc);

      setOcrStatus("Mengekstraksi Data...");
      await worker.terminate();

      // Olah teks mentah ke objek terstruktur
      const parsedResult = parseReceiptText(text);

      // Gabungkan base64 gambar tangkapan kamera ke objek respon akhir
      const finalOcrResult = {
        ...parsedResult,
        capturedImage: imageSrc,
      };

      // Simpan di sessionStorage untuk diteruskan ke halaman input-transaction/page.tsx
      sessionStorage.setItem(
        "gudin_ocr_result",
        JSON.stringify(finalOcrResult),
      );

      setIsProcessing(false);
      router.push("/Input_Transaction");
    } catch (error) {
      console.error("OCR Eror:", error);
      alert(
        "Proses OCR gagal, silakan coba lagi dengan pencahayaan yang lebih terang.",
      );
      setIsProcessing(false);
    }
  };

  if (isMobile === null) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white text-xs">
        Memeriksa Kompatibilitas Perangkat...
      </div>
    );
  }

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
          <button
            onClick={() => router.push("/Input_Transaction")}
            className="w-full mt-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl text-xs tracking-wider transition-colors"
          >
            KEMBALI
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-0 sm:p-4">
      <div className="relative w-full max-w-md h-screen sm:h-[840px] sm:rounded-[40px] sm:shadow-2xl bg-black overflow-hidden flex flex-col justify-between">
        <button
          onClick={() => router.push("/Input_Transaction")}
          disabled={isProcessing}
          className="absolute top-6 right-6 z-50 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all active:scale-90 disabled:opacity-30"
        >
          <X size={20} className="stroke-[2.5]" />
        </button>

        <div className="relative flex-1 flex items-center justify-center bg-black">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="absolute inset-0 w-full h-full object-cover"
            videoConstraints={{ facingMode: "environment" }}
            onUserMediaError={() => setHasCameraPermission(false)}
          />

          <div className="absolute inset-0 border-[45px] border-black/60 pointer-events-none flex items-center justify-center">
            <div className="w-full h-[65%] border-2 border-[#FCD844] rounded-[24px] relative shadow-[0_0_0_9999px_rgba(0,0,0,0.2)]">
              <div
                className={`absolute inset-x-0 h-[2px] bg-emerald-400 top-1/2 -translate-y-1/2 shadow-[0_0_10px_#34d399] ${isProcessing ? "animate-bounce" : "opacity-80"}`}
              />
            </div>
          </div>

          {/* 🌟 LOADING SCREEN OVERLAY SAAT PROSES SCANNING BERJALAN */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/75 z-40 flex flex-col items-center justify-center text-center p-6 text-white gap-3.5 select-none backdrop-blur-sm animate-fade-in">
              <Loader2
                size={36}
                className="text-[#FCD844] animate-spin stroke-[2.5]"
              />
              <div className="space-y-1">
                <span className="font-black text-sm tracking-wide text-white uppercase block">
                  Gud In Intelligence OCR
                </span>
                <span className="text-xs text-gray-400 font-medium tracking-tight block">
                  {ocrStatus}
                </span>
              </div>
            </div>
          )}

          {!hasCameraPermission && (
            <div className="absolute inset-0 bg-black/90 z-40 flex flex-col items-center justify-center p-6 text-center text-white gap-2">
              <span className="font-bold text-sm">Akses Kamera Ditolak</span>
              <span className="text-xs text-gray-400">
                Izinkan browser mengakses modul perangkat keras kamera kamu.
              </span>
            </div>
          )}
        </div>

        <div className="w-full p-6 bg-black flex flex-col items-center justify-center">
          <p className="text-white/60 text-[11px] font-medium tracking-wide mb-4 text-center">
            Posisikan struk belanja di dalam kotak area pemindaian laser
          </p>
          <button
            onClick={handleCaptureAndOCR}
            disabled={isProcessing || !hasCameraPermission}
            className="w-full bg-[#FCD844] hover:bg-[#ebd030] text-gray-900 font-black py-4 rounded-2xl text-sm tracking-wider shadow-lg shadow-yellow-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <ScanIcon size={16} className="stroke-[3]" />
            <span>Scan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
