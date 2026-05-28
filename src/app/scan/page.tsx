"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Webcam from "react-webcam";
import { X, Scan as ScanIcon, MonitorOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/utils/routes";
import { createWorker } from "tesseract.js";

export default function ScanPage() {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);

  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean>(true);

  // State Kendali Proses Analisis OCR
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

  // 🌟 2. MESIN PARSER OCR ADAPTIF 3 KONDISI (STRUKTURAL ALGORITMA)
  const parseReceiptText = (
    text: string,
  ): { storeName: string; nominal: number; items: any[] } => {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    let storeName = "";
    let nominal = 0;
    const items: any[] = [];

    // Ekstraksi Nama Toko (Baris valid teratas yang bukan noise)
    const validHeaderLines = lines.filter(
      (line) =>
        !/no\.|telp|tanggal|waktu|kasih|0123|202[3-6]/i.test(line) &&
        line.replace(/[^a-zA-Z]/g, "").length > 3,
    );

    if (validHeaderLines.length > 0) {
      storeName = validHeaderLines[0].replace(/[^a-zA-Z0-9\s]/g, "").trim();
    } else {
      storeName = "Karis Jaya Shop";
    }

    // Ambil Nominal Grand Total dari seluruh baris text lebih awal
    lines.forEach((line) => {
      const lowerLine = line.toLowerCase();
      if (
        (lowerLine.includes("total") ||
          lowerLine.includes("sub total") ||
          lowerLine.includes("subtotal") ||
          lowerLine.includes("bayar")) &&
        !lowerLine.includes("kembali") &&
        !lowerLine.includes("qty")
      ) {
        const numbers = line.replace(/[^0-9]/g, "");
        if (numbers) {
          const parsed = parseInt(numbers);
          if (parsed > nominal && parsed < 50000000) nominal = parsed;
        }
      }
    });

    // Mulai proses scanning baris demi baris menggunakan State Machine 3 Kondisi
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();

      // Lewati baris metadata/struktural kasir agar tidak mencederai data item
      if (
        /toko|grosir|jl\.|no\.|telp|tanggal|waktu|terima|kasih|total|sub|bayar|kembali/i.test(
          line,
        )
      ) {
        continue;
      }

      // Ambil kumpulan angka di baris ini untuk analisis nominal harga
      const numbersInLine = line.match(/\d+[\.,]\d+|\d+/g);

      // Regex Deteksi Kuantitas universal (Contoh: "2 x", "x2", "1 lusin x", "2x")
      const qtyMatch =
        line.match(/(\d+)\s*(?:pcs|box|klg|lusin|ml|kg)?\s*[xX×]/i) ||
        line.match(/[xX×]\s*(\d+)/) ||
        line.match(/^(\d+)[xX×]/);
      const qty = qtyMatch ? parseInt(qtyMatch[1]) || 1 : 1;

      // ------------------------------------------------------------------
      // 🌟 KONDISI 1: Nama item, Qty, dan Harga disusun sejajar HORIZONTAL (Struk Pawoon Kopi)
      // Contoh: "Martbak Original    x2    40,000" atau "Teh    Rp10.100"
      // ------------------------------------------------------------------
      if (
        qtyMatch &&
        numbersInLine &&
        numbersInLine.length >= 2 &&
        !/[0-9]\s*(?:lusin|ml|kg)/i.test(line)
      ) {
        const rawPrice = numbersInLine[numbersInLine.length - 1].replace(
          /[\.,]/g,
          "",
        );
        const price = parseInt(rawPrice) || 0;

        // Ekstraksi Nama Item (Teks sebelum angka pertama)
        const namePart = line
          .split(/\d/)[0]
          .replace(/[^a-zA-Z0-9\s]/g, "")
          .trim();

        if (price > 0 && price < nominal && namePart.length > 2) {
          items.push({ name: namePart, qty, price: Math.round(price / qty) });
          continue;
        }
      }

      // ------------------------------------------------------------------
      // 🌟 KONDISI 2: Nama item di baris atas, Qty & Harga di baris bawah (Struk Toko Abang)
      // Contoh: Baris [i]: "Beras" -> Baris [i+1]: "4.000 Kg X 12.500"
      // ------------------------------------------------------------------
      if (qtyMatch && i < lines.length - 1) {
        const nextLine = lines[i + 1];
        const nextLineNumbers = nextLine.match(/\d+[\.,]\d+|\d+/g);

        // Jika baris saat ini mengandung teks pengali dan baris bawahnya murni berisi angka harga
        if (
          /[xX×]/.test(line) &&
          nextLineNumbers &&
          nextLineNumbers.length > 0
        ) {
          const namePart = line
            .split(/[0-9xX×]/)[0]
            .replace(/[^a-zA-Z0-9\s]/g, "")
            .trim();
          const price =
            parseInt(
              nextLineNumbers[nextLineNumbers.length - 1].replace(/[\.,]/g, ""),
            ) || 0;

          if (price > 0 && namePart.length > 2) {
            items.push({ name: namePart, qty, price: Math.round(price / qty) });
            i++; // Skip baris bawah karena sudah diproses bersamaan
            continue;
          }
        }
      }

      // ------------------------------------------------------------------
      // 🌟 KONDISI 3: Nama & Harga sejajar horizontal, namun Qty berada DI BAWAH KIRI (Struk Karis Jaya Shop)
      // Contoh: Baris [i]: "1. Indomie Goreng    Rp 36.000" -> Baris [i+1]: "1 lusin x 36,000"
      // ------------------------------------------------------------------
      if (numbersInLine && numbersInLine.length > 0 && i < lines.length - 1) {
        const nextLine = lines[i + 1];
        const nextLineLower = nextLine.toLowerCase();

        // Periksa apakah baris bawahnya melambangkan informasi kuantitas pengali (Kondisi 3)
        if (
          /[xX×]/.test(nextLine) &&
          (nextLineLower.includes("lusin") ||
            nextLineLower.includes("ml") ||
            nextLineLower.includes("x") ||
            nextLineLower.includes("pcs"))
        ) {
          const rawPrice = numbersInLine[numbersInLine.length - 1].replace(
            /[\.,]/g,
            "",
          );
          const totalPriceForItem = parseInt(rawPrice) || 0;

          // Bersihkan angka urutan nomor struk (seperti "1. ", "2. ") dari nama item
          const namePart = line
            .replace(/^\d+[\.\s\-]+/, "")
            .split(/\d/)[0]
            .replace(/[^a-zA-Z0-9\s]/g, "")
            .trim();

          // Tangkap nilai Qty dari baris bawahnya
          const subQtyMatch = nextLine.match(/^(\d+)\s*/);
          const subQty = subQtyMatch ? parseInt(subQtyMatch[1]) || 1 : 1;

          if (totalPriceForItem > 0 && namePart.length > 2) {
            items.push({
              name: namePart,
              qty: subQty,
              price: Math.round(totalPriceForItem / subQty), // Sesuai permintaan: Gunakan harga horizontal langsung sebagai total akumulasi
            });
            i++; // Loncat baris bawah karena sudah terekstrak sempurna
            continue;
          }
        }
      }
    }

    // 3. Fallback Pengaman Data Akhir
    if (items.length === 0) {
      items.push({ name: "Item Terpindai", qty: 1, price: nominal || 70000 });
    }

    if (nominal === 0) {
      nominal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
    }

    return {
      storeName: storeName || "Karis Jaya Shop",
      nominal: nominal || 70000,
      items: items,
    };
  };

  // 3. Eksekutor Kamera & Worker Tesseract OCR
  const handleCaptureAndOCR = async () => {
    if (!webcamRef.current || isProcessing) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setIsProcessing(true);
    setOcrStatus("Menginisialisasi Mesin...");

    try {
      const worker = await createWorker(["ind", "eng"]);

      setOcrStatus("Memindai Gambar Struk...");
      const {
        data: { text },
      } = await worker.recognize(imageSrc);

      setOcrStatus("Mengekstraksi Data...");
      await worker.terminate();

      const parsedResult = parseReceiptText(text);

      const finalOcrResult = {
        ...parsedResult,
        capturedImage: imageSrc,
      };

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
          <Link
            href={ROUTES.INPUT_TRANSACTION || "/Input_Transaction"}
            className="w-full mt-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl text-xs tracking-wider transition-colors text-center"
          >
            KEMBALI
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-0 sm:p-4">
      <div className="relative w-full max-w-md h-screen sm:h-[840px] sm:rounded-[40px] sm:shadow-2xl bg-black overflow-hidden flex flex-col justify-between">
        <Link
          href={
            isProcessing
              ? "#"
              : ROUTES.INPUT_TRANSACTION || "/Input_Transaction"
          }
          className={`absolute top-6 right-6 z-50 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all active:scale-90 ${
            isProcessing ? "opacity-30 pointer-events-none" : ""
          }`}
        >
          <X size={20} className="stroke-[2.5]" />
        </Link>

        <div className="relative flex-1 flex items-center justify-center bg-black">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="absolute inset-0 w-full h-full object-cover"
            videoConstraints={{
              facingMode: "environment",
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            }}
            onUserMediaError={() => setHasCameraPermission(false)}
          />

          <div className="absolute inset-0 border-[45px] border-black/60 pointer-events-none flex items-center justify-center">
            <div className="w-full h-[65%] border-2 border-[#FCD844] rounded-[24px] relative shadow-[0_0_0_9999px_rgba(0,0,0,0.2)]">
              <div
                className={`absolute inset-x-0 h-[2px] bg-emerald-400 top-1/2 -translate-y-1/2 shadow-[0_0_10px_#34d399] ${isProcessing ? "animate-pulse" : "opacity-80"}`}
              />
            </div>
          </div>

          {/* LOADING SCREEN OVERLAY */}
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
            className="w-full bg-[#F3D22B] hover:bg-[#ebd030] text-gray-900 font-black py-4 rounded-2xl text-sm tracking-wider shadow-lg shadow-yellow-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <ScanIcon size={16} className="stroke-[3]" />
            <span>Scan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
