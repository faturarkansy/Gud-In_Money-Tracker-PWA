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
  Camera,
  Loader2,
} from "lucide-react";
import { ROUTES } from "@/utils/routes";
import FloatingNavbar from "@/components/FloatingNavbar";

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  // Auth & Profile states
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields states
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);

  // Track changes to show submit button
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push(ROUTES.LOGIN);
        return;
      }

      setUser(user);

      // Ambil data profile terbaru dari tabel database profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setFullName(
          profile.full_name ||
            user.user_metadata?.full_name ||
            "Pengguna Gud In",
        );
        setAvatarUrl(
          profile.avatar_url || user.user_metadata?.avatar_url || null,
        );
      } else {
        setFullName(user.user_metadata?.full_name || "Pengguna Gud In");
        setAvatarUrl(user.user_metadata?.avatar_url || null);
      }

      setLoading(false);
    };

    fetchUserData();
  }, [router, supabase]);

  // Fungsi untuk meng-handle unggah gambar avatar ke Supabase Storage
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setSaving(true);

      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      // 1. Upload berkas gambar ke bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Dapatkan Public URL resmi dari berkas gambar yang diunggah
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      setHasChanges(true);
    } catch (error: any) {
      alert(`Gagal mengunggah gambar: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Fungsi untuk menyimpan seluruh pembaruan profile ke Supabase
  const handleSaveChanges = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // Perbarui baris data pada tabel database 'profiles'
      const { error: dbError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          full_name: fullName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      if (dbError) throw dbError;

      // Perbarui juga data internal user_metadata auth Supabase agar sinkron secara cloud
      await supabase.auth.updateUser({
        data: { full_name: fullName, avatar_url: avatarUrl },
      });

      alert("Profil Akun Berhasil Diperbarui!");
      setHasChanges(false);
      setIsEditingName(false);
    } catch (error: any) {
      alert(`Gagal memperbarui profil: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFCF9]">
        <p className="text-gray-900 font-semibold text-sm">
          Memuat Data Pengguna...
        </p>
      </div>
    );
  }

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-0 sm:p-4">
      <div className="relative w-full max-w-md min-h-screen sm:min-h-screen sm:rounded-[40px] sm:shadow-2xl bg-[#FCFCF9] overflow-hidden p-6 sm:p-8 flex flex-col justify-between">
        <div
          className="absolute right-[-30%] bottom-[5%] w-[450px] h-[450px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 40%, #FEFBEA 0%, #FEFBEA 40%, #FFFFFF 100%)",
          }}
        />

        <div className="z-10 w-full pb-24">
          {/* Top Navigation Bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
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

            {/* Tombol Simpan Perubahan (Hanya muncul jika data berubah) */}
            {hasChanges && (
              <button
                onClick={handleSaveChanges}
                disabled={saving}
                className="text-xs bg-gray-900 text-white font-bold px-4 py-2 rounded-full shadow-sm hover:bg-black transition-all disabled:opacity-50 flex items-center gap-1"
              >
                {saving && <Loader2 size={12} className="animate-spin" />}
                Save
              </button>
            )}
          </div>

          {/* 🌟 KARTU IDENTITAS UTAMA (DENGAN ASPEK EDIT AVATAR & USERNAME) */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-[#FEDC34] flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-black uppercase">
                    {fullName?.charAt(0)}
                  </span>
                )}
              </div>

              {/* Input File Hidden untuk Kamera / Galeri HP */}
              <label className="absolute bottom-0 right-0 p-2 bg-gray-950 hover:bg-gray-800 text-white rounded-full shadow-md border-2 border-white cursor-pointer active:scale-90 transition-transform flex items-center justify-center">
                <Camera size={14} className="stroke-[2.5]" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={saving}
                />
              </label>
            </div>

            {/* Area Tampilan & Edit Nama */}
            <div className="mt-4 w-full px-4 flex items-center justify-center gap-2">
              {isEditingName ? (
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setHasChanges(true);
                  }}
                  onBlur={() => setIsEditingName(false)}
                  autoFocus
                  className="text-center text-xl font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-xl focus:outline-none border-2 border-gray-200 focus:border-[#FEDC34] w-[80%]"
                />
              ) : (
                <>
                  <h2
                    onClick={() => setIsEditingName(true)}
                    className="text-2xl font-bold text-gray-900 tracking-[-0.04em] cursor-pointer hover:opacity-80 border-b border-transparent hover:border-gray-300 transition-all"
                  >
                    {fullName}
                  </h2>
                </>
              )}
            </div>

            <p className="text-xs font-semibold text-gray-400 mt-1.5 bg-gray-100 px-3 py-0.5 rounded-full">
              ID: {user?.id.substring(0, 8)}...
            </p>
          </div>

          {/* Detail Informasi Akun */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
              Detail Informasi
            </h3>

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
        <div className="w-full z-10 mb-4 mt-auto">
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
      <FloatingNavbar />
    </div>
  );
}
