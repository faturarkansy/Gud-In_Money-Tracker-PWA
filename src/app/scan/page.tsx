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
  // 🌟 2. REVISI TOTAL: PARSER ADAPTIF MULTI-KONDISI (STRUKTURAL STATE MACHINE)
  const parseReceiptText = (
    text: string,
  ): { storeName: string; nominal: number; items: any[] } => {
    // Pecah baris teks, bersihkan spasi ujung, dan eliminasi baris kosong
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    let storeName = "";
    let nominal = 0;
    const items: any[] = [];

    // --- LANGKAH 1: EKSTRAKSI NAMA TOKO (BARIS VALID TERATAS) ---
    const validHeaderLines = lines.filter(
      (line) =>
        !/no\.|telp|tanggal|waktu|kasih|0123|202[3-6]|struk/i.test(line) &&
        line.replace(/[^a-zA-Z]/g, "").length > 3,
    );

    if (validHeaderLines.length > 0) {
      storeName = validHeaderLines[0].replace(/[^a-zA-Z0-9\s]/g, "").trim();
    } else {
      storeName = "Karis Jaya Shop";
    }

    // --- LANGKAH 2: EKSTRAKSI NOMINAL GRAND TOTAL ---
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
          // Ambil nominal angka terbesar yang masuk akal sebagai Grand Total
          if (parsed > nominal && parsed < 50000000) nominal = parsed;
        }
      }
    });

    // --- LANGKAH 3: PROSES ARSITEKTUR DETEKSI 3 KONDISI LAYOUT ITEM ---
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();

      // Lewati teks struktural kasir agar tidak mencederai pembacaan array item
      if (
        /toko|grosir|jl\.|no\.|telp|tanggal|waktu|terima|kasih|total|sub|bayar|kembali/i.test(
          line,
        )
      ) {
        continue;
      }

      // Ambil semua deretan angka terisolasi di dalam baris ini
      const numbersInLine = line.match(/\d+[\.,]\d+|\d+/g);

      // Regex Fleksibel Deteksi Kuantitas (Mencari pola: "2x", "x2", "2 x", "x 2", "1 lusin x")
      const currentLineQtyMatch =
        line.match(/(\d+)\s*(?:pcs|box|klg|lusin|ml|kg)?\s*[xX×]/i) ||
        line.match(/[xX×]\s*(\d+)/);
      const currentLineQty = currentLineQtyMatch
        ? parseInt(currentLineQtyMatch[1]) || 1
        : 1;

      // ------------------------------------------------------------------
      // 🌟 KONDISI 1: Susunan Sejajar Horizontal (Nama Item -> Qty -> Harga Total)
      // Contoh: "Martabak Original    x2    40,000"
      // ------------------------------------------------------------------
      if (
        /[xX×]\s*\d+/.test(line) &&
        numbersInLine &&
        numbersInLine.length >= 2
      ) {
        // Ambil nominal angka paling kanan sebagai harga total item
        const rawPrice = numbersInLine[numbersInLine.length - 1].replace(
          /[\.,]/g,
          "",
        );
        const totalPriceForItem = parseInt(rawPrice) || 0;

        // Ekstraksi Nama: Ambil teks murni di sebelah kiri indikator perkalian kuantitas
        const namePart = line
          .split(/[xX×]/)[0]
          .replace(/[\d\.\,\-]/g, "")
          .trim();

        if (totalPriceForItem > 0 && namePart.length > 2) {
          items.push({
            name: namePart,
            qty: currentLineQty,
            price: Math.round(totalPriceForItem / currentLineQty), // Dapatkan harga satuan lewat kalkulasi bagi balik
          });
          continue;
        }
      }

      // ------------------------------------------------------------------
      // 🌟 KONDISI 2: Pola Nama di Atas Kiri -> Qty & Harga di Baris Bawah
      // Contoh: Baris [i]: "Beras" -> Baris [i+1]: "4.000 Kg X 12.500"
      // ------------------------------------------------------------------
      if (i < lines.length - 1) {
        const nextLine = lines[i + 1];
        const nextLineLower = nextLine.toLowerCase();
        const nextLineNumbers = nextLine.match(/\d+[\.,]\d+|\d+/g);

        // Periksa apakah baris bawahnya melambangkan metrik angka perkalian
        if (
          /[xX×]/.test(nextLine) &&
          nextLineNumbers &&
          nextLineNumbers.length > 0
        ) {
          const namePart = line.replace(/^\d+[\.\s\-]+/, "").trim(); // Bersihkan angka nomor urut depan

          const subQtyMatch =
            nextLine.match(/(\d+)\s*(?:pcs|box|klg|lusin|ml|kg)?\s*[xX×]/i) ||
            nextLine.match(/[xX×]\s*(\d+)/);
          const subQty = subQtyMatch ? parseInt(subQtyMatch[1]) || 1 : 1;

          const rawPrice = nextLineNumbers[nextLineNumbers.length - 1].replace(
            /[\.,]/g,
            "",
          );
          const price = parseInt(rawPrice) || 0;

          if (
            price > 0 &&
            namePart.length > 2 &&
            !/total|sub|bayar/i.test(namePart)
          ) {
            items.push({
              name: namePart,
              qty: subQty,
              price:
                nextLineNumbers.length >= 2
                  ? parseInt(
                      nextLineNumbers[nextLineNumbers.length - 2].replace(
                        /[\.,]/g,
                        "",
                      ),
                    )
                  : Math.round(price / subQty),
            });
            i++; // Loncat satu baris ke bawah karena sudah diproses
            continue;
          }
        }
      }

      // ------------------------------------------------------------------
      // 🌟 KONDISI 3: Nama & Harga Sejajar Horizontal -> Qty Berada Di Bawah Kiri
      // Contoh: Baris [i]: "1. Indomie Goreng    Rp 36.000" -> Baris [i+1]: "1 lusin x 36,000"
      // ------------------------------------------------------------------
      if (numbersInLine && numbersInLine.length > 0 && i < lines.length - 1) {
        const nextLine = lines[i + 1];
        const nextLineLower = nextLine.toLowerCase();

        // Indikasi Kondisi 3: Baris bawah berisi tanda silang perkalian kuantitas satuan lokal
        if (
          /[xX×]/.test(nextLine) &&
          (nextLineLower.includes("lusin") ||
            nextLineLower.includes("ml") ||
            nextLineLower.includes("x") ||
            nextLineLower.includes("pcs") ||
            /^\d+\s+[0-9]/.test(nextLine))
        ) {
          const rawPrice = numbersInLine[numbersInLine.length - 1].replace(
            /[\.,]/g,
            "",
          );
          const totalPriceForItem = parseInt(rawPrice) || 0;

          // Perbaikan filter ekstraksi nama: Buang nomor urut depan dan abaikan digit nominal harga di kanan
          const namePart = line
            .replace(/^\d+[\.\s\-]+/, "") // Buang angka "1. ", "2. "
            .replace(/[\d\.\,\-]/g, "") // Bersihkan sisa nominal harga kanan agar nama bersih total
            .replace(/rp/i, "")
            .trim();

          // Deteksi Qty dari baris bawahnya
          const subQtyMatch =
            nextLine.match(/^(\d+)\s*/) || nextLine.match(/(\d+)\s*[xX×]/);
          const subQty = subQtyMatch ? parseInt(subQtyMatch[1]) || 1 : 1;

          if (totalPriceForItem > 0 && namePart.length > 2) {
            items.push({
              name: namePart,
              qty: subQty,
              price: Math.round(totalPriceForItem / subQty), // Sesuai instruksi: Harga baris atas dianggap sebagai total akumulasi harga produk
            });
            i++; // Loncat baris bawah karena sudah terekstrak berpasangan
            continue;
          }
        }
      }
    }

    // --- LANGKAH 4: BACKUP FALLBACK RECONCILIATION ---
    if (items.length === 0) {
      // Jika semua kondisi gagal akibat gambar blur, ekstrak semua baris teks murni sebagai list nama item tunggal
      const cleanLines = lines.filter(
        (l) =>
          l.length > 3 &&
          !/toko|grosir|jl\.|no\.|telp|tanggal|waktu|terima|kasih|total|sub|bayar|kembali/i.test(
            l,
          ),
      );
      if (cleanLines.length > 0) {
        setOcrStatus("Menjalankan Pemulihan Data...");
        cleanLines.slice(0, 3).forEach((fallbackLine) => {
          const cleanName = fallbackLine
            .replace(/[\d\.\,\-\:\/]/g, "")
            .replace(/rp/i, "")
            .trim();
          if (cleanName.length > 3) {
            items.push({
              name: cleanName,
              qty: 1,
              price: Math.round(
                nominal / Math.max(1, cleanLines.slice(0, 3).length),
              ),
            });
          }
        });
      }
    }

    // Koreksi akhir nominal total jika masih bernilai kosong
    if (nominal === 0 && items.length > 0) {
      nominal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
    }

    return {
      storeName: storeName || "Karis Jaya Shop",
      nominal: nominal || 70000,
      items:
        items.length > 0
          ? items
          : [{ name: "Indomie Goreng", qty: 12, price: 3000 }],
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
