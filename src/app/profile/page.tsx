"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  ShieldAlert,
  Calendar,
  Fingerprint,
} from "lucide-react"; // Menambahkan ikon Fingerprint
import { ROUTES } from "@/utils/routes";

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push(ROUTES.LOGIN);
      } else {
        setUser(user);
      }
      setLoading(false);
    };

    fetchUserData();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-blue-600 font-semibold">Memuat Data Pengguna...</p>
      </div>
    );
  }

  // Membaca metadata provider (misal: mengambil foto dari Google Auth jika ada)
  const avatarUrl = user?.user_metadata?.avatar_url || null;
  const fullName = user?.user_metadata?.full_name || "Pengguna Gud In";
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-0 sm:p-4">
      {/* Bingkai Utama Mockup Handphone (Sudah menggunakan sm:min-h-screen) */}
      <div className="relative w-full max-w-md min-h-screen sm:min-h-screen sm:rounded-[40px] sm:shadow-2xl bg-[#FCFCF9] overflow-hidden p-6 sm:p-8 flex flex-col justify-between">
        {/* Lingkaran dekoratif latar belakang */}
        <div
          className="absolute right-[-30%] bottom-[5%] w-[450px] h-[450px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 40%, #FEFBEA 0%, #FEFBEA 40%, #FFFFFF 100%)",
          }}
        />

        <div className="z-10 w-full">
          {/* Top Bar Navigasi */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href={ROUTES.HOME}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-800"
              aria-label="Kembali ke Beranda"
            >
              <ArrowLeft size={22} />
            </Link>
            <h1 className="text-xl font-bold text-gray-900 tracking-[-0.03em]">
              Profil Akun
            </h1>
          </div>

          {/* Bagian Kartu Identitas Utama */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-24 h-24 rounded-full bg-[#FEDC34] flex items-center justify-center overflow-hidden border-4 border-white shadow-md mb-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-black uppercase">
                  {fullName.charAt(0)}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-[-0.04em]">
              {fullName}
            </h2>
            <p className="text-sm font-medium text-gray-400 mt-0.5">
              ID: {user?.id.substring(0, 8)}...
            </p>
          </div>

          {/* Detail Informasi Akun */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
              Detail Informasi
            </h3>

            {/* Baris Email */}
            <div className="flex items-center gap-4 px-5 py-4 bg-[#E4E4E4]/40 border border-transparent rounded-2xl">
              <Mail size={20} className="text-gray-500" />
              <div>
                <p className="text-xs text-gray-400 font-medium">
                  Alamat Email
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Baris Metode Autentikasi */}
            <div className="flex items-center gap-4 px-5 py-4 bg-[#E4E4E4]/40 border border-transparent rounded-2xl">
              <ShieldAlert size={20} className="text-gray-500" />
              <div>
                <p className="text-xs text-gray-400 font-medium">
                  Metode Masuk
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5 uppercase">
                  {user?.app_metadata?.provider || "Email/Password"}
                </p>
              </div>
            </div>

            {/* Baris Tanggal Registrasi */}
            <div className="flex items-center gap-4 px-5 py-4 bg-[#E4E4E4]/40 border border-transparent rounded-2xl">
              <Calendar size={20} className="text-gray-500" />
              <div>
                <p className="text-xs text-gray-400 font-medium">
                  Bergabung Sejak
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {joinedDate}
                </p>
              </div>
            </div>

            {/* OPSI TERBARU: Tombol Menu Pengaturan Keamanan Sidik Jari */}
            <Link
              href={ROUTES.FINGERPRINT}
              className="flex items-center justify-between px-5 py-4 bg-[#FEDC34]/10 border border-[#FEDC34]/20 hover:bg-[#FEDC34]/20 rounded-2xl transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <Fingerprint
                  size={20}
                  className="text-[#ebd030] group-hover:scale-110 transition-transform"
                />
                <div>
                  <p className="text-xs text-gray-400 font-medium">
                    Keamanan Biometrik
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">
                    Aktivasi Sidik Jari
                  </p>
                </div>
              </div>
              <span className="text-xs bg-[#FEDC34] text-black font-semibold px-3 py-1 rounded-full shadow-sm">
                Atur
              </span>
            </Link>
          </div>
        </div>

        {/* Tombol Logout Sisi Bawah */}
        <div className="w-full z-10 mt-12 mb-4">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push(ROUTES.LOGIN);
            }}
            className="w-full bg-red-500 text-white font-semibold py-4 rounded-full text-base shadow-md hover:bg-red-600 active:scale-[0.99] transition-all"
          >
            Keluar dari Akun
          </button>
        </div>
      </div>
    </div>
  );
}
