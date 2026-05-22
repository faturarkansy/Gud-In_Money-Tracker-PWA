"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/utils/routes";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State untuk visibilitas password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State untuk penanganan error teks merah
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  // Fungsi validasi kekuatan password standar keamanan
  const validatePassword = (pass: string) => {
    if (pass.length < 8) {
      return "Password wajib minimal 8 karakter.";
    }
    if (!/[A-Z]/.test(pass)) {
      return "Password must contain at least one uppercasecase letter (A-Z).";
    }
    if (!/[a-z]/.test(pass)) {
      return "Password must contain at least one lowercase letter (a-z).";
    }
    if (!/[0-9]/.test(pass)) {
      return "Password must contain at least one number (0-9).";
    }
    return "";
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset state error sebelum validasi baru dilakukan
    setPasswordError("");
    setConfirmError("");

    // 1. Validasi Aturan Kekuatan Password
    const passValidationError = validatePassword(password);
    if (passValidationError) {
      setPasswordError(passValidationError);
      return;
    }

    // 2. Validasi Kesamaan Password Confirmation
    if (password !== confirmPassword) {
      setConfirmError("Confirm password does not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Registrasi berhasil! Silakan login menggunakan akun baru Anda.");
      router.push(ROUTES.LOGIN);
    }
    setLoading(false);
  };

  return (
    // Pembungkus Luar (Mockup ruang desktop/tablet)
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-0 sm:p-4">
      {/* Bingkai Utama Mockup Handphone */}
      <div className="relative w-full max-w-md min-h-screen sm:min-h-[90vh] sm:rounded-[40px] sm:shadow-2xl bg-[#FCFCF9] overflow-hidden p-6 sm:p-8 flex flex-col justify-between">
        {/* Lingkaran dekoratif samar di latar belakang kanan bawah */}
        <div
          className="absolute right-[-30%] bottom-[5%] w-[450px] h-[450px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 40%, #FEFBEA 0%, #FEFBEA 40%, #FFFFFF 100%)",
          }}
        />

        {/* Bagian Atas: Logo & Header */}
        <div className="z-10 w-full">
          {/* Logo Gud In */}
          <div className="flex items-center gap-2 mb-12">
            <img
              src="/logo/Logo.png"
              alt="Gud In Logo"
              className="w-8 h-8 object-contain rounded-sm"
            />
            <span className="font-medium text-gray-900 text-lg tracking-[-0.05em]">
              Gud In
            </span>
          </div>

          {/* Judul Halaman */}
          <h1 className="text-[44px] font-normal text-gray-900 leading-[1.1] tracking-[-0.05em] mb-10">
            Registration
          </h1>

          {/* Form Utama */}
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Input Email */}
            <div className="space-y-2">
              <label className="block text-md font-medium text-gray-800 ml-1">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="ex: you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-6 py-2.5 bg-[#E4E4E4] border-2 border-transparent rounded-full text-black placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#FEDC34] text-base transition-all disabled:opacity-50"
              />
            </div>

            {/* Input Password */}
            <div className="space-y-2">
              <label className="block text-md font-medium text-gray-800 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="****"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-6 py-3.5 bg-[#E4E4E4] border-2 border-transparent rounded-full text-black placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#FEDC34] text-base pr-12 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-700 hover:text-black transition-colors disabled:opacity-50"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {/* Pesan Error Validasi Password */}
              {passwordError && (
                <p className="text-red-500 text-xs font-medium ml-2 mt-1 animate-fadeIn">
                  {passwordError}
                </p>
              )}
            </div>

            {/* Input Password Confirmation */}
            <div className="space-y-2">
              <label className="block text-md font-medium text-gray-800 ml-1">
                Password Confirmation
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="****"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-6 py-3.5 bg-[#E4E4E4] border-2 border-transparent rounded-full text-black placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#FEDC34] text-base pr-12 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-700 hover:text-black transition-colors disabled:opacity-50"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {/* Pesan Error Konfirmasi Password */}
              {confirmError && (
                <p className="text-red-500 text-xs font-medium ml-2 mt-1 animate-fadeIn">
                  {confirmError}
                </p>
              )}
            </div>

            {/* Tombol Register */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FEDC34] text-black font-semibold py-4 rounded-full text-base mt-6 shadow-sm hover:bg-[#ebd030] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {loading ? "Processing..." : "Register"}
            </button>
          </form>
        </div>

        {/* Bagian Bawah: Opsi Kembali ke Login */}
        <div className="text-center mt-12 mb-4 z-10 w-full">
          <p className="text-sm font-medium text-gray-500">
            Back to{" "}
            <Link
              href={ROUTES.LOGIN}
              className="text-[#FEDC34] font-semibold hover:underline transition-all"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
