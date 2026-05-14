"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function Home() {
  const supabase = createClient();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      // Mengambil data transaksi dari Supabase
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching data:", error);
      } else {
        setTransactions(data || []);
      }
      setLoading(false);
    }

    fetchTransactions();
  }, []);

  // Menghitung total (Pemasukan - Pengeluaran)
  const totalBalance = transactions.reduce((acc, item) => {
    return item.type === "income" ? acc + item.amount : acc - item.amount;
  }, 0);

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-20">
      {/* Header Dashboard */}
      <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg mb-6">
        <p className="text-sm opacity-80">Total Saldo Anda</p>
        <h1 className="text-3xl font-bold mt-1">
          Rp {totalBalance.toLocaleString("id-ID")}
        </h1>
      </div>

      {/* Daftar Transaksi Terakhir */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="font-semibold text-gray-700 mb-4">Transaksi Terakhir</h2>

        {loading ? (
          <p className="text-gray-400 text-center py-4">Memuat data...</p>
        ) : transactions.length === 0 ? (
          <p className="text-gray-400 text-center py-4">Belum ada transaksi.</p>
        ) : (
          <div className="space-y-4">
            {transactions.map((t) => (
              <div key={t.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium text-gray-800">{t.category}</p>
                  <p className="text-xs text-gray-500">{t.note}</p>
                </div>
                <p className={`font-bold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                  {t.type === 'income' ? '+' : '-'} Rp {t.amount.toLocaleString("id-ID")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tombol Tambah (Floating Action Button) */}
      <button className="fixed bottom-6 right-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl font-bold hover:bg-blue-700 transition-colors">
        +
      </button>
    </main>
  );
}