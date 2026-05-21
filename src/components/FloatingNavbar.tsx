"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/utils/routes";
import { Home as HomeIcon, BarChart3, Target, User } from "lucide-react";

export default function FloatingNavbar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[390px] z-50">
      <nav className="w-full bg-white/95 backdrop-blur-xl rounded-[32px] py-2 px-3 flex justify-between items-center shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-gray-100/80">
        {/* Tombol Home */}
        <Link
          href={ROUTES.HOME}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            pathname === ROUTES.HOME
              ? "text-gray-950 font-bold"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <HomeIcon
            size={20}
            className={
              pathname === ROUTES.HOME
                ? "text-gray-950 stroke-[2.5]"
                : "text-gray-400 stroke-[2]"
            }
          />
          <span className="text-[10px] mt-1 font-medium tracking-tight">
            Home
          </span>
        </Link>

        {/* Tombol Transaction */}
        <Link
          href={ROUTES.TRANSACTION}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            pathname === ROUTES.TRANSACTION
              ? "text-gray-950 font-bold"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <BarChart3
            size={20}
            className={
              pathname === ROUTES.TRANSACTION
                ? "text-gray-950 stroke-[2.5]"
                : "text-gray-400 stroke-[2]"
            }
          />
          <span className="text-[10px] mt-1 font-medium tracking-tight">
            Transaction
          </span>
        </Link>

        {/* Tombol Goals */}
        <Link
          href={ROUTES.GOALS}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            pathname === ROUTES.GOALS
              ? "text-gray-950 font-bold"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Target
            size={20}
            className={
              pathname === ROUTES.GOALS
                ? "text-gray-950 stroke-[2.5]"
                : "text-gray-400 stroke-[2]"
            }
          />
          <span className="text-[10px] mt-1 font-medium tracking-tight">
            Goals
          </span>
        </Link>

        {/* Tombol Profile */}
        <Link
          href={ROUTES.PROFILE}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            pathname === ROUTES.PROFILE
              ? "text-gray-950 font-bold"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <User
            size={20}
            className={
              pathname === ROUTES.PROFILE
                ? "text-gray-950 stroke-[2.5]"
                : "text-gray-400 stroke-[2]"
            }
          />
          <span className="text-[10px] mt-1 font-medium tracking-tight">
            Profile
          </span>
        </Link>

        {/* TOMBOL ACTION SCANNER (+ BUTTON) */}
        <div className="flex justify-center items-center pl-2 pr-1 border-l border-gray-100">
          <button
            onClick={() => {
              const event = new CustomEvent("open-global-scanner");
              window.dispatchEvent(event);
            }}
            className="w-11 h-11 bg-[#FEDC34] hover:bg-[#ebd030] text-black rounded-full flex items-center justify-center shadow-md shadow-yellow-500/10 active:scale-95 transition-all"
            aria-label="Add Transaction"
          >
            <span className="text-2xl font-light leading-none mb-0.5">+</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
