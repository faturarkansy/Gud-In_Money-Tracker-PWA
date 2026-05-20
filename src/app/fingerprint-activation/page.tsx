"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { ROUTES } from "@/utils/routes";
import { createClient } from "@/utils/supabase/client";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function FingerprintActivationPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  // Fungsi pembantu untuk memvalidasi status biometrik di database
  const checkBiometricStatus = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_biometrics")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (data && !error) {
      setIsRegistered(true);
    } else {
      setIsRegistered(false);
    }
  };

  useEffect(() => {
    const checkUserAndBiometrics = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(ROUTES.LOGIN);
        return;
      }

      setUser(user);
      await checkBiometricStatus(user.id);
    };

    checkUserAndBiometrics();
  }, [router, supabase]);

  const handleActivation = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const isBiometricSupported =
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!isBiometricSupported) {
        throw new Error(
          "Perangkat ini tidak mendukung fitur sensor sidik jari / biometrik.",
        );
      }

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const userIdBuffer = new TextEncoder().encode(user.id);

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions =
        {
          challenge,
          rp: { name: "Gud In App", id: window.location.hostname },
          user: {
            id: userIdBuffer,
            name: user.email || "user@gudin.id",
            displayName: user.user_metadata?.full_name || "User Gud In",
          },
          // 🌟 PERBAIKAN: Menyediakan dua parameter algoritma standar (ES256 & RS256) untuk hilangkan warning kuning
          pubKeyCredParams: [
            { alg: -7, type: "public-key" }, // ES256
            { alg: -257, type: "public-key" }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
            requireResidentKey: true,
            residentKey: "required",
          },
          timeout: 60000,
        };

      const credential = (await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      })) as PublicKeyCredential;

      if (!credential)
        throw new Error("Proses pemindaian sidik jari dibatalkan.");

      // Konversi array biner rawId menjadi format string Hexadecimal
      const credentialId = Array.from(new Uint8Array(credential.rawId))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const response = credential.response as AuthenticatorAttestationResponse;
      const publicKey = btoa(
        String.fromCharCode(...new Uint8Array(response.attestationObject)),
      );

      // Operasi aman simpan atau overwrite data biometrik lewat kombinasi .upsert()
      const { error: dbError } = await supabase.from("user_biometrics").upsert(
        {
          user_id: user.id,
          credential_id: credentialId,
          public_key: publicKey,
        },
        { onConflict: "user_id" },
      );

      if (dbError) {
        throw new Error(`Gagal sinkronisasi database: ${dbError.message}`);
      }

      alert(
        isRegistered
          ? "Sidik Jari Keamanan Berhasil Diperbarui!"
          : "Aktivasi Sidik Jari Berhasil Terdaftar sebagai Kunci Utama!",
      );

      // SINKRONISASI INSTAN: Paksa perbarui state lokal agar UI langsung sinkron tanpa perlu refresh manual
      await checkBiometricStatus(user.id);

      router.push(ROUTES.HOME);
    } catch (error: any) {
      alert(error.message || "Gagal memproses data sidik jari perangkat.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push(ROUTES.HOME);
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-0 sm:p-4">
      <div className="relative w-full max-w-md min-h-screen sm:min-h-screen sm:rounded-[40px] sm:shadow-2xl bg-[#FCFCF9] overflow-hidden p-6 sm:p-8 flex flex-col justify-between">
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

          <h1 className="text-[44px] font-normal text-gray-900 leading-[1.1] tracking-[-0.05em] mb-4">
            {isRegistered ? "Update" : "Fingerprint"} <br />{" "}
            {isRegistered ? "Biometric" : "Activation"}
          </h1>
        </div>

        <div className="z-10 w-full flex flex-col items-center justify-center my-auto px-4">
          <div className="w-full max-w-[350px] h-[350px] flex items-center justify-center">
            <DotLottieReact
              src="/Fingerprint.json"
              loop
              autoplay
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <div className="z-10 w-full flex items-center justify-between mt-auto pt-6 mb-4">
          <button
            onClick={handleActivation}
            disabled={loading}
            className="px-10 py-4 bg-[#FEDC34] text-black font-semibold rounded-full text-base shadow-sm hover:bg-[#ebd030] active:scale-[0.97] transition-all disabled:opacity-50"
          >
            {loading ? "Processing..." : isRegistered ? "Update" : "Activate"}
          </button>

          <button
            onClick={handleSkip}
            disabled={loading}
            className="flex items-center gap-1 text-gray-900 font-medium text-base hover:opacity-80 active:scale-[0.97] transition-all disabled:opacity-50 py-2 px-4"
          >
            <span>Skip</span>
            <ChevronRight size={22} className="stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
