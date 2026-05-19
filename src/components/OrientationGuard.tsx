"use client";

import { useEffect, useState } from "react";

export default function OrientationGuard() {
  const [isMobileLandscape, setIsMobileLandscape] = useState(false);

  useEffect(() => {
    const handleOrientationCheck = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Deteksi mobile/tablet + posisi miring (landscape)
      const isMobileDevice = width < 1024;
      const isLandscapePos = width > height;

      setIsMobileLandscape(isMobileDevice && isLandscapePos);
    };

    handleOrientationCheck();
    window.addEventListener("resize", handleOrientationCheck);
    return () => window.removeEventListener("resize", handleOrientationCheck);
  }, []);

  if (!isMobileLandscape) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-blue-600 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="animate-bounce text-4xl mb-4">🔄</div>
      <h2 className="text-xl font-bold mb-2">Gunakan Mode Vertikal</h2>
      <p className="text-sm opacity-80">
        Aplikasi Gud In dioptimalkan untuk tampilan vertikal (portrait). Silakan
        putar perangkat Anda.
      </p>
    </div>
  );
}
