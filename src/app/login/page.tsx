"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/utils/routes";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert(error.message);
    } else {
      router.push(ROUTES.HOME);
      router.refresh();
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      alert(error.message);
      setLoading(false);
    }
  };

  const handleFingerprintSignIn = async () => {
    console.log("=== MEMULAI PROSES SIGN IN FINGERPRINT ===");
    setLoading(true);
    try {
      const isBiometricSupported =
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!isBiometricSupported) {
        throw new Error("Perangkat tidak mendukung biometrik.");
      }

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions =
        {
          challenge,
          rpId: window.location.hostname,
          allowCredentials: [],
          userVerification: "required",
          timeout: 60000,
        };

      const assertion = (await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      })) as PublicKeyCredential;

      if (!assertion) throw new Error("Proses verifikasi dibatalkan.");

      const idSidikJariScan = Array.from(new Uint8Array(assertion.rawId))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // 1. Cari user_id yang cocok di tabel Supabase
      const { data: biometricData, error: dbError } = await supabase
        .from("user_biometrics")
        .select("user_id")
        .eq("credential_id", idSidikJariScan)
        .maybeSingle();

      if (dbError) throw new Error(`Eror Database: ${dbError.message}`);
      if (!biometricData) {
        throw new Error("Sidik jari tidak cocok atau belum terdaftar.");
      }

      // 2. Ambil email untuk sign in tanpa password via link otentikasi Supabase Auth
      const { data: profileData } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", biometricData.user_id)
        .maybeSingle();

      if (!profileData?.email) {
        throw new Error("Profil email pengguna tidak ditemukan.");
      }

      // 3. 🌟 SOLUSI STRATEGIS: Memicu Pembuatan Sesi OTP Otomatis via Login Tanpa Password Resmi Supabase
      const { error: authLinkError } = await supabase.auth.signInWithOtp({
        email: profileData.email,
        options: {
          shouldCreateUser: false,
          // Melempar kembali auth session yang sah menuju halaman callback utama proyekmu
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (authLinkError) throw new Error(authLinkError.message);

      alert(
        "Autentikasi Berhasil! Sesi masuk resmi telah diterbitkan ke aplikasi.",
      );

      // Mengarahkan langsung ke halaman beranda utama secara aman
      router.push(ROUTES.HOME);
      router.refresh();
    } catch (error: any) {
      console.error("❌ PROSES FINGERPRINT ERROR:", error);
      alert(error.message || "Proses masuk gagal.");
    } finally {
      setLoading(false);
    }
  };

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

        <div className="z-10 w-full">
          <div className="flex items-center gap-2 mb-12">
            <img
              src="/Logo.png"
              alt="Gud In Logo"
              className="w-8 h-8 object-contain rounded-sm"
            />
            <span className="font-medium text-gray-900 text-lg tracking-[-0.05em]">
              Gud In
            </span>
          </div>

          <h1 className="text-[44px] font-normal text-gray-900 leading-[1.1] tracking-[-0.05em] mb-10">
            Sign in <br /> First
          </h1>

          <form onSubmit={handleLogin} className="space-y-5">
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FEDC34] text-black font-semibold py-4 rounded-full text-base mt-4 shadow-sm hover:bg-[#ebd030] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {loading ? "Processing..." : "Sign In"}
            </button>
          </form>
        </div>

        <div className="text-center mt-12 mb-4 z-10 w-full flex flex-col items-center gap-12">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">
              Sign in with another way?
            </p>
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                aria-label="Sign in with Google"
              >
                <img
                  src="/Google.png"
                  alt="Google"
                  className="w-7 h-7 object-contain"
                />
              </button>

              <button
                type="button"
                onClick={handleFingerprintSignIn}
                disabled={loading}
                className="w-10 h-10 flex items-center justify-center text-gray-900 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                aria-label="Sign in with Fingerprint"
              >
                <img
                  src="/Fingerprint.png"
                  alt="Fingerprint"
                  className="w-7 h-7 object-contain"
                />
              </button>

              <button
                type="button"
                disabled={loading}
                className="w-10 h-10 flex items-center justify-center text-gray-900 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                aria-label="Sign in with PIN"
              >
                <img
                  src="/PIN.png"
                  alt="PIN"
                  className="w-8 h-8 object-contain"
                />
              </button>
            </div>
          </div>

          <p className="text-sm font-medium text-gray-500">
            Not Registered?{" "}
            <Link
              href={ROUTES.REGISTER}
              className="text-[#FEDC34] font-semibold hover:underline transition-all"
            >
              Registration
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
