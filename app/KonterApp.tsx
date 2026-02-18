"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabaseClient";

// Kalau grafik masih dipakai, wajib import ini:
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";


import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
<div className="h-[260px] rounded-xl border bg-muted/20 flex items-center justify-center text-sm text-muted-foreground">
  Grafik dinonaktifkan sementara (RAM 2GB). Aktifkan lagi setelah stabil.
</div>
import {
  TrendingUp,
  Package,
  Wrench,
  Smartphone,
  Wallet,
  Users,
  Settings,
  Plus,
  Search,
  MoreVertical,
  Receipt,
  Calendar,
  ClipboardList,
  BadgeCheck,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Download,
} from "lucide-react";

/**
 * Web App Konter Pulsa • ACC • Service HP
 * - Full UI modern, siap pakai (front-end)
 * - Data tersimpan di localStorage
 * - Modul: Dashboard, Penjualan, Stok/Inventori, Service, Pelanggan, Laporan, Pengaturan
 *
 * Catatan:
 * - Ini adalah UI lengkap tanpa backend. Cocok untuk dipakai langsung di proyek Next.js/React.
 */

// ---------- util ----------
const LS_KEY = "konter_app_v1";

function id(prefix = "ID") {
  return `${prefix}-${Math.random().toString(16).slice(2, 8).toUpperCase()}-${Date.now()
    .toString()
    .slice(-5)}`;
}

function rupiah(n: number | string | null | undefined) {
  const x = Number(n ?? 0);
  return x.toLocaleString("id-ID", { style: "currency", currency: "IDR" });
}

function clampNum(v: string | number | null | undefined, min: number = 0) {
  const n = Number(String(v ?? "").replace(/[^0-9.-]/g, ""));
  if (Number.isNaN(n)) return min;
  return n < min ? min : n;
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function downloadJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function parseJSONSafe<T>(s: string, fallback: T): T {
  try {
    const x = JSON.parse(s) as T;
    return (x ?? fallback) as T;
  } catch {
    return fallback;
  }
}

// ---------- seeded sample data ----------
const seed = {
  settings: {
    toko: "POIN CELL",
    alamat: "Jl. RAYA SURUSUNDA, DEPAN BRILINK UPIT",
    telp: "085821690725",
    pajakPct: 0,
    biayaAdminPulsa: 0,
    currency: "RP",
    lowStockThreshold: 5,
  },
  customers: [
    {
      id: "CUST-001",
      nama: "Rizky",
      telp: "0812xxxxxxx",
      catatan: "Pelanggan service rutin",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
    },
    {
      id: "CUST-002",
      nama: "Sari",
      telp: "0821xxxxxxx",
      catatan: "Suka beli aksesoris",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    },
  ],
  products: [
    {
      id: "PRD-ACC-001",
      nama: "Kabel Data Type-C 1m",
      kategori: "Aksesoris",
      barcode: "",
      hargaBeli: 12000,
      hargaJual: 25000,
      stok: 18,
      satuan: "pcs",
      supplier: "",
      updatedAt: Date.now() - 1000 * 60 * 60 * 12,
    },
    {
      id: "PRD-ACC-002",
      nama: "Tempered Glass Universal",
      kategori: "Aksesoris",
      barcode: "",
      hargaBeli: 5000,
      hargaJual: 15000,
      stok: 6,
      satuan: "pcs",
      supplier: "",
      updatedAt: Date.now() - 1000 * 60 * 60 * 36,
    },
    {
      id: "PRD-ACC-003",
      nama: "Headset Bluetooth",
      kategori: "Aksesoris",
      barcode: "",
      hargaBeli: 75000,
      hargaJual: 110000,
      stok: 4,
      satuan: "pcs",
      supplier: "",
      updatedAt: Date.now() - 1000 * 60 * 60 * 2,
    },
    {
      id: "PRD-SVC-001",
      nama: "Jasa Ganti LCD (Umum)",
      kategori: "Service",
      barcode: "",
      hargaBeli: 0,
      hargaJual: 250000,
      stok: null,
      satuan: "jasa",
      supplier: "",
      updatedAt: Date.now() - 1000 * 60 * 60 * 2,
    },
  ],
  pulsaProducts: [
    { id: "PLS-TRI-10", operator: "Tri", nominal: 10000, hargaModal: 9800, hargaJual: 10500 },
    { id: "PLS-TRI-20", operator: "Tri", nominal: 20000, hargaModal: 19600, hargaJual: 20500 },
    { id: "PLS-IM3-25", operator: "Indosat", nominal: 25000, hargaModal: 24500, hargaJual: 25500 },
    { id: "PLS-TSEL-50", operator: "Telkomsel", nominal: 50000, hargaModal: 49500, hargaJual: 51000 },
  ],
  sales: [
    {
      id: "SLS-001",
      tanggal: todayISO(),
      tipe: "Aksesoris",
      customerId: "CUST-002",
      items: [{ productId: "PRD-ACC-001", nama: "Kabel Data Type-C 1m", qty: 1, harga: 25000 }],
      catatan: "",
      pembayaran: "Tunai",
      subtotal: 25000,
      pajak: 0,
      total: 25000,
      createdAt: Date.now() - 1000 * 60 * 60 * 3,
    },
    {
      id: "SLS-002",
      tanggal: todayISO(),
      tipe: "Pulsa",
      customerId: "CUST-001",
      items: [{ productId: "PLS-TRI-10", nama: "Tri 10.000", qty: 1, harga: 10500 }],
      nomorTujuan: "0812xxxxxxx",
      catatan: "",
      pembayaran: "QRIS",
      subtotal: 10500,
      pajak: 0,
      total: 10500,
      createdAt: Date.now() - 1000 * 60 * 60 * 8,
    },
  ],
  serviceOrders: [
    {
      id: "SVC-001",
      tanggalMasuk: todayISO(),
      customerId: "CUST-001",
      namaCustomer: "Rizky",
      telp: "0812xxxxxxx",
      device: "Samsung A12",
      keluhan: "LCD retak, touchscreen sebagian tidak respons",
      estimasiBiaya: 250000,
      dp: 50000,
      status: "Dalam Proses",
      teknisi: "Budi",
      catatan: "Menunggu sparepart",
      tanggalSelesai: "",
      createdAt: Date.now() - 1000 * 60 * 60 * 6,
    },
  ],
};

function useLocalState() {
  const [state, setState] = useState(() => {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(LS_KEY) : null;
    const fromLS = raw ? parseJSONSafe(raw, null) : null;
    return fromLS ?? seed;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  const reset = () => {
    setState(seed);
    try {
      window.localStorage.setItem(LS_KEY, JSON.stringify(seed));
    } catch {
      // ignore
    }
  };

  return { state, setState, reset };
}

// ---------- small UI helpers ----------
type StatCardTrend = { delta: number };

type StatCardProps = {
  title: string;
  value: React.ReactNode;
  icon?: React.ElementType;
  hint?: string;
  trend?: StatCardTrend;
};

function StatCard({ title, value, icon: Icon, hint, trend }: StatCardProps) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        <div className="mt-2 flex items-center gap-2">
          {trend ? (
            <Badge variant={trend.delta >= 0 ? "default" : "destructive"} className="rounded-full">
              {trend.delta >= 0 ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
              {Math.abs(trend.delta)}%
            </Badge>
          ) : null}
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

type EmptyStateProps = {
  title: string;
  desc: string;
  action?: React.ReactNode;
};

function EmptyState({ title, desc, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border bg-background">
        <ClipboardList className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

type PillVariant = "default" | "ok" | "warn" | "danger";

type PillProps = {
  children: React.ReactNode;
  variant?: PillVariant;
};

function Pill({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "ok" | "warn" | "bad";
}) {
  const cls =
    variant === "ok"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : variant === "warn"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : variant === "bad"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-muted text-foreground border-border";

  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${cls}`}>{children}</span>;
}

function moneyInputProps() {
  return {
    inputMode: "numeric",
    pattern: "[0-9]*",
  };
}

// ---------- main app ----------
export default function KonterApp() {
  const { state, setState, reset } = useLocalState();

  // Ambil produk dari Supabase saat pertama kali halaman dibuka
  const didLoadRef = useRef(false);

useEffect(() => {
  if (didLoadRef.current) return;
  didLoadRef.current = true;

  console.log("LOAD PRODUCTS useEffect fired (once)");
  loadProductsFromDB();
}, []);


async function loadProductsFromDB() {
  console.log("LOAD PRODUCTS: start");

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  console.log("LOAD PRODUCTS: error =", error);
  console.log("LOAD PRODUCTS: data =", data);

  if (error) {
    console.error("Error ambil produk:", error.message);
    return;
  }

  setState((prev: any) => ({
    ...prev,
    products: (data ?? []).map((p: any) => ({
      id: p.id,
      nama: p.name,
      kategori: p.category ?? "Aksesoris",
      barcode: p.barcode ?? "",
      hargaBeli: Number(p.buy_price ?? 0),
      hargaJual: Number(p.sell_price ?? 0),
      stok: p.stock === null ? null : Number(p.stock ?? 0),
      satuan: p.unit ?? "pcs",
      supplier: p.supplier ?? "",
      updatedAt: Date.now(),
    })),
  }));
}
function mapProductToDb(p: any) {
  return {
    // id jangan dikirim kalau kosong (biar uuid auto)
    ...(p.id ? { id: p.id } : {}),
    name: p.nama,
    category: p.kategori ?? "Aksesoris",
    buy_price: Number(p.hargaBeli ?? 0),
    sell_price: Number(p.hargaJual ?? 0),
    stock: p.stok === null || p.stok === undefined ? null : Number(p.stok ?? 0),
    unit: p.satuan ?? "pcs",
    low_stock_threshold: Number(p.lowStockThreshold ?? 5),
  };
}

function mapProductFromDb(row: any) {
  return {
    id: row.id,
    nama: row.name,
    kategori: row.category ?? "Aksesoris",
    hargaBeli: Number(row.buy_price ?? 0),
    hargaJual: Number(row.sell_price ?? 0),
    stok: row.stock === null ? null : Number(row.stock ?? 0),
    satuan: row.unit ?? "pcs",
    lowStockThreshold: Number(row.low_stock_threshold ?? 5),
    createdAt: row.created_at,
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
  };
}

// SIMPAN (insert/update) ke Supabase, lalu update state
async function saveProductToDB(patch: any) {
  console.log("SAVE PRODUCT: patch =", patch);

  // update kalau ada id, insert kalau id kosong
  const payload = mapProductToDb(patch);

  let res;
  if (patch.id) {
    res = await supabase
      .from("products")
      .update(payload)
      .eq("id", patch.id)
      .select("*")
      .single();
  } else {
    res = await supabase
      .from("products")
      .insert(payload)
      .select("*")
      .single();
  }

  const { data, error } = res;
  console.log("SAVE PRODUCT: error =", error);
  console.log("SAVE PRODUCT: data =", data);

  if (error) {
    alert("Gagal simpan produk: " + error.message);
    return;
  }

  const mapped = mapProductFromDb(data);

  setState((prev: any) => {
    const exists = prev.products.some((x: any) => x.id === mapped.id);
    return {
      ...prev,
      products: exists
        ? prev.products.map((x: any) => (x.id === mapped.id ? { ...x, ...mapped } : x))
        : [mapped, ...prev.products],
    };
  });
}

// HAPUS di Supabase + state
async function deleteProductFromDB(idv: string) {
  const ok = confirm("Hapus produk ini?");
  if (!ok) return;

  const { error } = await supabase.from("products").delete().eq("id", idv);
  if (error) {
    alert("Gagal hapus produk: " + error.message);
    return;
  }

  setState((prev: any) => ({
    ...prev,
    products: prev.products.filter((p: any) => p.id !== idv),
  }));
}

// UPDATE stok di Supabase + state (aksi +/-)
async function adjustStockInDB(idv: string, delta: number) {
  const current = state.products.find((p: any) => p.id === idv);
  if (!current) return;
  if (typeof current.stok !== "number") return;

  const newStock = Math.max(0, (current.stok ?? 0) + delta);

  const { data, error } = await supabase
    .from("products")
    .update({ stock: newStock })
    .eq("id", idv)
    .select("*")
    .single();

  if (error) {
    alert("Gagal update stok: " + error.message);
    return;
  }

  const mapped = mapProductFromDb(data);
  setState((prev: any) => ({
    ...prev,
    products: prev.products.map((p: any) => (p.id === idv ? { ...p, ...mapped } : p)),
  }));
}



  // global search (header)
  const [globalQ, setGlobalQ] = useState("");

  // dialogs
  const [dlgProductOpen, setDlgProductOpen] = useState(false);
  const [dlgCustomerOpen, setDlgCustomerOpen] = useState(false);
  const [dlgSaleOpen, setDlgSaleOpen] = useState(false);
  const [dlgServiceOpen, setDlgServiceOpen] = useState(false);

  const [editProduct, setEditProduct] = useState(null);
  const [editCustomer, setEditCustomer] = useState(null);
  const [editService, setEditService] = useState(null);

  // current tab
  const [tab, setTab] = useState("dashboard");

  // computed
  const lowStock = useMemo(() => {
    const t = clampNum(state.settings.lowStockThreshold, 0);
    return state.products
      .filter((p) => typeof p.stok === "number")
      .filter((p) => (p.stok ?? 0) <= t)
      .sort((a, b) => (a.stok ?? 0) - (b.stok ?? 0));
  }, [state.products, state.settings.lowStockThreshold]);

  const salesToday = useMemo(() => state.sales.filter((s) => s.tanggal === todayISO()), [state.sales]);

  const omzetToday = useMemo(() => salesToday.reduce((acc, s) => acc + (Number(s.total) || 0), 0), [salesToday]);

  const serviceOpenCount = useMemo(
    () => (state.serviceOrders ?? []).filter((x) => x.status !== "Selesai").length,
    [state.serviceOrders]
  );

  const salesByDay = useMemo(() => {
    // last 14 days
    const days = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      days.push({ tanggal: iso, total: 0, trx: 0 });
    }
    const map = new Map(days.map((x) => [x.tanggal, x]));
    for (const s of state.sales) {
      const row = map.get(s.tanggal);
      if (row) {
        row.total += Number(s.total) || 0;
        row.trx += 1;
      }
    }
    return days;
  }, [state.sales]);

  const salesByType = useMemo(() => {
    const types = ["Pulsa", "Aksesoris", "Service"];
    const base = types.map((t) => ({ tipe: t, total: 0 }));
    const map = new Map(base.map((x) => [x.tipe, x]));
    for (const s of state.sales) {
      const row = map.get(s.tipe);
      if (row) row.total += Number(s.total) || 0;
    }
    return base;
  }, [state.sales]);

  const topProducts = useMemo(() => {
    const count = new Map();
    for (const s of state.sales) {
      for (const it of s.items || []) {
        const key = it.nama || it.productId;
        count.set(key, (count.get(key) || 0) + (Number(it.qty) || 0));
      }
    }
    return [...count.entries()]
      .map(([nama, qty]) => ({ nama, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 6);
  }, [state.sales]);

  // global search results (quick)
  const globalMatches = useMemo(() => {
    const q = globalQ.trim().toLowerCase();
    if (!q) return null;

    const prod = state.products
      .filter((p) => `${p.nama} ${p.id} ${p.kategori}`.toLowerCase().includes(q))
      .slice(0, 5)
      .map((p) => ({ kind: "product", id: p.id, title: p.nama, sub: p.kategori }));

    const cust = state.customers
      .filter((c) => `${c.nama} ${c.id} ${c.telp}`.toLowerCase().includes(q))
      .slice(0, 5)
      .map((c) => ({ kind: "customer", id: c.id, title: c.nama, sub: c.telp }));

    const svc = state.serviceOrders
      .filter((s) => `${s.id} ${s.namaCustomer} ${s.device} ${s.status}`.toLowerCase().includes(q))
      .slice(0, 5)
      .map((s) => ({ kind: "service", id: s.id, title: `${s.device}`, sub: `${s.status} • ${s.namaCustomer}` }));

    return [...prod, ...cust, ...svc].slice(0, 12);
  }, [globalQ, state.products, state.customers, state.serviceOrders]);

  // ---------- actions ----------
 type ProductPatch = { id: string } & Partial<any>;

function UpsertProduct(patch: any) {
    setState((prev) => {
      const exists = prev.products.some((p) => p.id === patch.id);
      const next = {
        ...prev,
        products: exists
          ? prev.products.map((p) => (p.id === patch.id ? { ...p, ...patch, updatedAt: Date.now() } : p))
          : [{ ...patch, updatedAt: Date.now() }, ...prev.products],
      };
      return next;
    });
  }

  function deleteProduct(idv: string) {
  setState((prev: any) => ({
    ...prev,
    products: prev.products.filter((p: any) => p.id !== idv),
  }));
}

  function upsertCustomer(patch: any) {
  setState((prev: any) => {
    const exists = prev.customers.some((c: any) => c.id === patch.id);
    return {
      ...prev,
      customers: exists
        ? prev.customers.map((c: any) => (c.id === patch.id ? { ...c, ...patch } : c))
        : [{ ...patch }, ...prev.customers],
    };
  });
}

  function deleteCustomer(idv: string) {
  setState((prev: any) => ({
    ...prev,
    customers: prev.customers.filter((c: any) => c.id !== idv),
  }));
}
 function addSale(sale: any) {
  setState((prev: any) => {
    // ...
      // update stock for aksesoris only
      const nextProducts = prev.products.map((p: any) => {
        if (sale.tipe !== "Aksesoris") return p;
        const it = sale.items?.find((x : any) => x.productId === p.id);
        if (!it) return p;
        if (typeof p.stok !== "number") return p;
        const qty = clampNum(it.qty, 0);
        return { ...p, stok: Math.max(0, (p.stok ?? 0) - qty), updatedAt: Date.now() };
      });

      return {
        ...prev,
        sales: [{ ...sale, createdAt: Date.now() }, ...prev.sales],
        products: nextProducts,
      };
    });
  }

type ServiceOrderPatch = { id: string } & Record<string, any>;

function upsertService(patch: ServiceOrderPatch) {
  setState((prev: any) => {
    const exists = prev.serviceOrders.some((s: any) => s.id === patch.id);
    return {
      ...prev,
      serviceOrders: exists
        ? prev.serviceOrders.map((s: any) => (s.id === patch.id ? { ...s, ...patch } : s))
        : [patch, ...prev.serviceOrders],
    };
  });
}
  function upsertService(patch) {
    setState((prev) => {
      const exists = prev.serviceOrders.some((s) => s.id === patch.id);
      return {
        ...prev,
        serviceOrders: exists
          ? prev.serviceOrders.map((s) => (s.id === patch.id ? { ...s, ...patch } : s))
          : [{ ...patch, createdAt: Date.now() }, ...prev.serviceOrders],
      };
    });
  }

  function deleteService(idv) {
    setState((prev) => ({ ...prev, serviceOrders: prev.serviceOrders.filter((s) => s.id !== idv) }));
  }

  function updateSettings(patch) {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  }

  // ---------- layout ----------
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border bg-card shadow-sm">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight">{state.settings.toko}</div>
              <div className="text-xs text-muted-foreground leading-tight">Jual-Beli • ACC • Service</div>
            </div>
          </div>

          <div className="ml-auto flex flex-1 items-center justify-end gap-2">
            <div className="relative hidden w-full max-w-lg md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={globalQ}
                onChange={(e) => setGlobalQ(e.target.value)}
                placeholder="Cari produk / pelanggan / service…"
                className="rounded-2xl pl-9"
              />
              {globalMatches?.length ? (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] rounded-2xl border bg-popover shadow-xl">
                  <div className="p-2">
                    <div className="px-2 pb-1 text-xs text-muted-foreground">Hasil cepat</div>
                    <div className="max-h-72 overflow-auto">
                      {globalMatches.map((m) => (
                        <button
                          key={`${m.kind}-${m.id}`}
                          onClick={() => {
                            setGlobalQ("");
                            if (m.kind === "product") setTab("inventory");
                            if (m.kind === "customer") setTab("customers");
                            if (m.kind === "service") setTab("service");
                          }}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-muted"
                        >
                          <div>
                            <div className="text-sm font-medium">{m.title}</div>
                            <div className="text-xs text-muted-foreground">{m.sub}</div>
                          </div>
                          <Badge variant="secondary" className="rounded-full">
                            {m.kind === "product" ? "Produk" : m.kind === "customer" ? "Pelanggan" : "Service"}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <Button
                variant="secondary"
                className="rounded-2xl"
                onClick={() => {
                  setEditProduct(null);
                  setDlgProductOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Produk
              </Button>
              <Button
                variant="secondary"
                className="rounded-2xl"
                onClick={() => {
                  setEditService(null);
                  setDlgServiceOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Service
              </Button>
              <Button
                className="rounded-2xl"
                onClick={() => {
                  setDlgSaleOpen(true);
                }}
              >
                <Receipt className="mr-2 h-4 w-4" />
                Transaksi
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-2xl">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl">
                <DropdownMenuLabel>Menu Cepat</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setEditCustomer(null);
                    setDlgCustomerOpen(true);
                  }}
                >
                  <Users className="mr-2 h-4 w-4" /> Tambah Pelanggan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadJSON(`backup-${todayISO()}.json`, state)}>
                  <Download className="mr-2 h-4 w-4" /> Backup Data (JSON)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-rose-600">
                      Reset ke Data Contoh
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset data?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Ini akan menghapus data yang tersimpan di perangkat dan mengembalikan data contoh.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-2xl">Batal</AlertDialogCancel>
                      <AlertDialogAction
                        className="rounded-2xl"
                        onClick={() => {
                          reset();
                        }}
                      >
                        Reset
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <TabsList className="h-auto w-full justify-start gap-2 rounded-2xl bg-muted/60 p-1 md:w-auto">
              <TabsTrigger value="dashboard" className="rounded-2xl">
                <TrendingUp className="mr-2 h-4 w-4" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="sales" className="rounded-2xl">
                <Wallet className="mr-2 h-4 w-4" /> Penjualan
              </TabsTrigger>
              <TabsTrigger value="inventory" className="rounded-2xl">
                <Package className="mr-2 h-4 w-4" /> Inventori
              </TabsTrigger>
              <TabsTrigger value="service" className="rounded-2xl">
                <Wrench className="mr-2 h-4 w-4" /> Service
              </TabsTrigger>
              <TabsTrigger value="customers" className="rounded-2xl">
                <Users className="mr-2 h-4 w-4" /> Pelanggan
              </TabsTrigger>
              <TabsTrigger value="reports" className="rounded-2xl">
                <ClipboardList className="mr-2 h-4 w-4" /> Laporan
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-2xl">
                <Settings className="mr-2 h-4 w-4" /> Pengaturan
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-wrap items-center gap-2">
              {lowStock.length ? (
                <Pill variant="warn">
                  <AlertTriangle className="mr-1 h-3.5 w-3.5" /> {lowStock.length} stok menipis
                </Pill>
              ) : (
                <Pill variant="ok">
                  <BadgeCheck className="mr-1 h-3.5 w-3.5" /> stok aman
                </Pill>
              )}
              <Pill>
                <Calendar className="mr-1 h-3.5 w-3.5" /> {todayISO()}
              </Pill>
            </div>
          </div>

          <TabsContent value="dashboard" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Omzet Hari Ini"
                value={rupiah(omzetToday)}
                icon={Wallet}
                hint={`${salesToday.length} transaksi`}
              />
              <StatCard
                title="Service Aktif"
                value={serviceOpenCount}
                icon={Wrench}
                hint="Belum selesai"
              />
              <StatCard
                title="Produk"
                value={state.products.length}
                icon={Package}
                hint={`${lowStock.length} menipis`}
              />
              <StatCard
                title="Pelanggan"
                value={state.customers.length}
                icon={Users}
                hint="Tersimpan"
              />
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <Card className="rounded-2xl shadow-sm lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Omzet 14 Hari Terakhir</CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesByDay} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tanggal" tick={{ fontSize: 11 }} interval={2} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => rupiah(v)} />
                      <Line type="monotone" dataKey="total" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Komposisi Penjualan</CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesByType} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tipe" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => rupiah(v)} />
                      <Bar dataKey="total" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Stok Menipis</CardTitle>
                  <Button
                    variant="secondary"
                    className="rounded-2xl"
                    onClick={() => {
                      setTab("inventory");
                    }}
                  >
                    Lihat Inventori
                  </Button>
                </CardHeader>
                <CardContent>
                  {lowStock.length ? (
                    <div className="space-y-2">
                      {lowStock.slice(0, 6).map((p) => (
                        <div key={p.id} className="flex items-center justify-between rounded-2xl border bg-card p-3">
                          <div>
                            <div className="text-sm font-medium">{p.nama}</div>
                            <div className="text-xs text-muted-foreground">{p.id} • {p.kategori}</div>
                          </div>
                          <Pill variant={p.stok === 0 ? "bad" : "warn"}>{p.stok} {p.satuan}</Pill>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState title="Stok aman" desc="Tidak ada item di bawah batas stok." />
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Produk Terlaris</CardTitle>
                </CardHeader>
                <CardContent>
                  {topProducts.length ? (
                    <div className="space-y-2">
                      {topProducts.map((p) => (
                        <div key={p.nama} className="flex items-center justify-between rounded-2xl border bg-card p-3">
                          <div className="text-sm font-medium">{p.nama}</div>
                          <Pill>{p.qty} terjual</Pill>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState title="Belum ada data" desc="Mulai buat transaksi untuk melihat statistik." />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sales" className="mt-6">
            <SalesView
              state={state}
              onNew={() => setDlgSaleOpen(true)}
              onDelete={(idv) => deleteSale(idv)}
            />
          </TabsContent>

          <TabsContent value="inventory" className="mt-6">
            <InventoryView
             state={state}
    onNew={() => {
      setEditProduct(null);
      setDlgProductOpen(true);
    }}
    onEdit={(p) => {
      setEditProduct(p);
      setDlgProductOpen(true);
    }}
    onDelete={(idv) => deleteProductFromDB(idv)}
    onAdjustStock={(idv, delta) => adjustStockInDB(idv, delta)}
  />
</TabsContent>

          <TabsContent value="service" className="mt-6">
            <ServiceView
              state={state}
              onNew={() => {
                setEditService(null);
                setDlgServiceOpen(true);
              }}
              onEdit={(s) => {
                setEditService(s);
                setDlgServiceOpen(true);
              }}
              onDelete={(idv) => deleteService(idv)}
              onMarkDone={(svc) => {
                // Optionally auto create sale for service when done
                const total = clampNum(svc.estimasiBiaya, 0);
                const paid = clampNum(svc.dp, 0);
                const remaining = Math.max(0, total - paid);
                upsertService({ ...svc, status: "Selesai", tanggalSelesai: todayISO(), catatan: svc.catatan || "" });
                if (remaining > 0) {
                  // create a sale for service completion payment
                  addSale({
                    id: id("SLS"),
                    tanggal: todayISO(),
                    tipe: "Service",
                    customerId: svc.customerId || "",
                    items: [{ productId: "SVC", nama: `Pelunasan Service ${svc.device}`, qty: 1, harga: remaining }],
                    catatan: `Auto dari ${svc.id}`,
                    pembayaran: "Tunai",
                    subtotal: remaining,
                    pajak: 0,
                    total: remaining,
                  });
                }
              }}
            />
          </TabsContent>

          <TabsContent value="customers" className="mt-6">
            <CustomersView
              state={state}
              onNew={() => {
                setEditCustomer(null);
                setDlgCustomerOpen(true);
              }}
              onEdit={(c) => {
                setEditCustomer(c);
                setDlgCustomerOpen(true);
              }}
              onDelete={(idv) => deleteCustomer(idv)}
            />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <ReportsView state={state} />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <SettingsView state={state} onChange={updateSettings} onBackup={() => downloadJSON(`backup-${todayISO()}.json`, state)} />
          </TabsContent>
        </Tabs>
      </main>

      {/* dialogs */}
      <ProductDialog
         open={dlgProductOpen}
        onOpenChange={(v) => {
    setDlgProductOpen(v);
    if (!v) setEditProduct(null);
  }}
  initial={editProduct}
  onSave={async (p) => {
    await saveProductToDB(p);
    setDlgProductOpen(false);
    setEditProduct(null);
  }}
/>

      <CustomerDialog
        open={dlgCustomerOpen}
        onOpenChange={(v) => {
          setDlgCustomerOpen(v);
          if (!v) setEditCustomer(null);
        }}
        initial={editCustomer}
        onSave={(c) => {
          upsertCustomer(c);
          setDlgCustomerOpen(false);
          setEditCustomer(null);
        }}
      />

      <SaleDialog
        open={dlgSaleOpen}
        onOpenChange={setDlgSaleOpen}
        state={state}
        onSave={(sale) => {
          addSale(sale);
          setDlgSaleOpen(false);
        }}
      />

      <ServiceDialog
        open={dlgServiceOpen}
        onOpenChange={(v) => {
          setDlgServiceOpen(v);
          if (!v) setEditService(null);
        }}
        state={state}
        initial={editService}
        onSave={(svc) => {
          upsertService(svc);
          setDlgServiceOpen(false);
          setEditService(null);
        }}
      />

      <footer className="border-t bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>
            {state.settings.toko} • {state.settings.alamat}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" /> Data tersimpan di perangkat (localStorage)
          </div>
        </div>
      </footer>
    </div>
  );
}

// ---------- Sales View ----------
function SalesView({ state, onNew, onDelete }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return state.sales
      .filter((s) => (type === "all" ? true : s.tipe === type))
      .filter((s) => (from ? s.tanggal >= from : true))
      .filter((s) => (to ? s.tanggal <= to : true))
      .filter((s) => {
        if (!qq) return true;
        const cust = state.customers.find((c) => c.id === s.customerId);
        const hay = `${s.id} ${s.tanggal} ${s.tipe} ${s.pembayaran} ${cust?.nama || ""} ${s.items
          ?.map((it) => it.nama)
          .join(" ")}`.toLowerCase();
        return hay.includes(qq);
      });
  }, [q, type, from, to, state.sales, state.customers]);

  const total = useMemo(() => filtered.reduce((acc, s) => acc + (Number(s.total) || 0), 0), [filtered]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm md:flex-row md:items-end md:justify-between">
        <div className="grid w-full gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <Label>Cari</Label>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ID / pelanggan / item…" className="rounded-2xl" />
          </div>
          <div>
            <Label>Tipe</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Semua" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="Pulsa">Pulsa</SelectItem>
                <SelectItem value="Aksesoris">Aksesoris</SelectItem>
                <SelectItem value="Service">Service</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Dari</Label>
              <Input value={from} onChange={(e) => setFrom(e.target.value)} type="date" className="rounded-2xl" />
            </div>
            <div>
              <Label>Sampai</Label>
              <Input value={to} onChange={(e) => setTo(e.target.value)} type="date" className="rounded-2xl" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-base font-semibold">{rupiah(total)}</div>
          </div>
          <Button className="rounded-2xl" onClick={onNew}>
            <Plus className="mr-2 h-4 w-4" /> Transaksi
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Riwayat Penjualan</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length ? (
            <Table>
              <TableCaption>{filtered.length} transaksi</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => {
                  const cust = state.customers.find((c) => c.id === s.customerId);
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="whitespace-nowrap">{s.tanggal}</TableCell>
                      <TableCell className="font-mono text-xs">{s.id}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="rounded-full">
                          {s.tipe}
                        </Badge>
                      </TableCell>
                      <TableCell>{cust?.nama || "-"}</TableCell>
                      <TableCell>{s.pembayaran}</TableCell>
                      <TableCell className="text-right font-semibold">{rupiah(s.total)}</TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="rounded-2xl">
                              Hapus
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus transaksi?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Data transaksi {s.id} akan dihapus. (Stok tidak otomatis kembali — untuk sederhana.)
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-2xl">Batal</AlertDialogCancel>
                              <AlertDialogAction className="rounded-2xl" onClick={() => onDelete(s.id)}>
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="Belum ada transaksi"
              desc="Buat transaksi pulsa, aksesoris, atau service."
              action={
                <Button className="rounded-2xl" onClick={onNew}>
                  <Plus className="mr-2 h-4 w-4" /> Transaksi
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- Inventory View ----------
function InventoryView({ state, onNew, onEdit, onDelete, onAdjustStock }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");

  const items = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return state.products
      .filter((p) => (cat === "all" ? true : p.kategori === cat))
      .filter((p) => {
        if (!qq) return true;
        return `${p.nama} ${p.id} ${p.kategori} ${p.barcode || ""}`.toLowerCase().includes(qq);
      })
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }, [q, cat, state.products]);

  const categories = useMemo(() => {
    const set = new Set(state.products.map((p) => p.kategori));
    return ["all", ...Array.from(set)];
  }, [state.products]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm md:flex-row md:items-end md:justify-between">
        <div className="grid w-full gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <Label>Cari</Label>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nama / ID / barcode…" className="rounded-2xl" />
          </div>
          <div>
            <Label>Kategori</Label>
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Semua" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c === "all" ? "Semua" : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button className="rounded-2xl" onClick={onNew}>
          <Plus className="mr-2 h-4 w-4" /> Produk
        </Button>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Daftar Produk</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length ? (
            <Table>
              <TableCaption>{items.length} produk</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Beli</TableHead>
                  <TableHead className="text-right">Jual</TableHead>
                  <TableHead className="text-right">Stok</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium">{p.nama}</div>
                      <div className="text-xs text-muted-foreground font-mono">{p.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="rounded-full">
                        {p.kategori}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{rupiah(p.hargaBeli)}</TableCell>
                    <TableCell className="text-right font-semibold">{rupiah(p.hargaJual)}</TableCell>
                    <TableCell className="text-right">
                      {typeof p.stok === "number" ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-2xl"
                            onClick={() => onAdjustStock(p.id, -1)}
                            title="Kurangi stok"
                          >
                            -
                          </Button>
                          <span className="min-w-[64px] text-right">
                            {p.stok} {p.satuan}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-2xl"
                            onClick={() => onAdjustStock(p.id, +1)}
                            title="Tambah stok"
                          >
                            +
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="rounded-2xl">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl">
                          <DropdownMenuItem onClick={() => onEdit(p)}>Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-rose-600">
                                Hapus
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus produk?</AlertDialogTitle>
                                <AlertDialogDescription>{p.nama} akan dihapus dari inventori.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-2xl">Batal</AlertDialogCancel>
                                <AlertDialogAction className="rounded-2xl" onClick={() => onDelete(p.id)}>
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="Produk kosong"
              desc="Tambahkan produk aksesoris atau jasa service."
              action={
                <Button className="rounded-2xl" onClick={onNew}>
                  <Plus className="mr-2 h-4 w-4" /> Produk
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- Service View ----------
function ServiceView({ state, onNew, onEdit, onDelete, onMarkDone }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const items = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return (state.serviceOrders ?? [])

      .filter((s) => (status === "all" ? true : s.status === status))
      .filter((s) => {
        if (!qq) return true;
        return `${s.id} ${s.namaCustomer} ${s.telp} ${s.device} ${s.keluhan} ${s.status}`.toLowerCase().includes(qq);
      })
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [q, status, state.serviceOrders]);

  const statuses = ["all", "Masuk", "Dalam Proses", "Menunggu", "Selesai", "Batal"];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm md:flex-row md:items-end md:justify-between">
        <div className="grid w-full gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <Label>Cari</Label>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ID / nama / device / status…" className="rounded-2xl" />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Semua" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "all" ? "Semua" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button className="rounded-2xl" onClick={onNew}>
          <Plus className="mr-2 h-4 w-4" /> Order Service
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {items.length ? (
          items.map((s) => (
            <Card key={s.id} className="rounded-2xl shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base">{s.device}</CardTitle>
                    <Badge variant="secondary" className="rounded-full">
                      {s.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">{s.id}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{s.namaCustomer} • {s.telp}</div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-2xl">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-2xl">
                    <DropdownMenuItem onClick={() => onEdit(s)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        if (s.status !== "Selesai") onMarkDone(s);
                      }}
                      disabled={s.status === "Selesai"}
                    >
                      Tandai Selesai
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-rose-600">
                          Hapus
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus order service?</AlertDialogTitle>
                          <AlertDialogDescription>{s.id} akan dihapus.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-2xl">Batal</AlertDialogCancel>
                          <AlertDialogAction className="rounded-2xl" onClick={() => onDelete(s.id)}>
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-2xl border bg-card p-3">
                  <div className="text-xs text-muted-foreground">Keluhan</div>
                  <div className="text-sm">{s.keluhan}</div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-2xl border bg-card p-3">
                    <div className="text-xs text-muted-foreground">Masuk</div>
                    <div className="text-sm font-medium">{s.tanggalMasuk}</div>
                  </div>
                  <div className="rounded-2xl border bg-card p-3">
                    <div className="text-xs text-muted-foreground">Estimasi</div>
                    <div className="text-sm font-semibold">{rupiah(s.estimasiBiaya)}</div>
                  </div>
                  <div className="rounded-2xl border bg-card p-3">
                    <div className="text-xs text-muted-foreground">DP</div>
                    <div className="text-sm font-semibold">{rupiah(s.dp)}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs text-muted-foreground">Teknisi: <span className="font-medium text-foreground">{s.teknisi || "-"}</span></div>
                  {s.status === "Selesai" ? (
                    <Pill variant="ok">
                      <BadgeCheck className="mr-1 h-3.5 w-3.5" /> Selesai {s.tanggalSelesai || ""}
                    </Pill>
                  ) : (
                    <Pill variant="warn">
                      <Clock className="mr-1 h-3.5 w-3.5" /> Berjalan
                    </Pill>
                  )}
                </div>

                {s.catatan ? (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Catatan:</span> {s.catatan}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))
        ) : (
          <EmptyState
            title="Belum ada order service"
            desc="Tambah order service untuk tracking perangkat masuk sampai selesai."
            action={
              <Button className="rounded-2xl" onClick={onNew}>
                <Plus className="mr-2 h-4 w-4" /> Order Service
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}

// ---------- Customers View ----------
function CustomersView({ state, onNew, onEdit, onDelete }) {
  const [q, setQ] = useState("");

  const items = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return state.customers
      .filter((c) => {
        if (!qq) return true;
        return `${c.nama} ${c.id} ${c.telp} ${c.catatan || ""}`.toLowerCase().includes(qq);
      })
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [q, state.customers]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm md:flex-row md:items-end md:justify-between">
        <div className="w-full md:max-w-xl">
          <Label>Cari</Label>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nama / ID / nomor…" className="rounded-2xl" />
        </div>
        <Button className="rounded-2xl" onClick={onNew}>
          <Plus className="mr-2 h-4 w-4" /> Pelanggan
        </Button>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Daftar Pelanggan</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length ? (
            <Table>
              <TableCaption>{items.length} pelanggan</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Catatan</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="font-medium">{c.nama}</div>
                      <div className="text-xs text-muted-foreground font-mono">{c.id}</div>
                    </TableCell>
                    <TableCell>{c.telp}</TableCell>
                    <TableCell className="text-muted-foreground">{c.catatan || "-"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="rounded-2xl">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl">
                          <DropdownMenuItem onClick={() => onEdit(c)}>Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-rose-600">
                                Hapus
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus pelanggan?</AlertDialogTitle>
                                <AlertDialogDescription>{c.nama} akan dihapus.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-2xl">Batal</AlertDialogCancel>
                                <AlertDialogAction className="rounded-2xl" onClick={() => onDelete(c.id)}>
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="Belum ada pelanggan"
              desc="Simpan pelanggan untuk mempermudah transaksi dan service."
              action={
                <Button className="rounded-2xl" onClick={onNew}>
                  <Plus className="mr-2 h-4 w-4" /> Pelanggan
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- Reports View ----------
function ReportsView({ state }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const data = useMemo(() => {
    const filtered = state.sales
      .filter((s) => (from ? s.tanggal >= from : true))
      .filter((s) => (to ? s.tanggal <= to : true));

    const omzet = filtered.reduce((a, s) => a + (Number(s.total) || 0), 0);
    const trx = filtered.length;

    // estimasi laba sederhana: (hargaJual - hargaBeli) untuk aksesoris, pulsa: (hargaJual - hargaModal)
    let laba = 0;

    for (const s of filtered) {
      if (s.tipe === "Aksesoris") {
        for (const it of s.items || []) {
          const prod = state.products.find((p) => p.id === it.productId);
          const beli = Number(prod?.hargaBeli) || 0;
          laba += (Number(it.harga) - beli) * (Number(it.qty) || 0);
        }
      }
      if (s.tipe === "Pulsa") {
        for (const it of s.items || []) {
          const pp = state.pulsaProducts.find((p) => p.id === it.productId);
          const modal = Number(pp?.hargaModal) || 0;
          laba += (Number(it.harga) - modal) * (Number(it.qty) || 0);
        }
      }
      if (s.tipe === "Service") {
        // jasa dianggap laba kotor penuh
        laba += Number(s.total) || 0;
      }
    }

    const byType = ["Pulsa", "Aksesoris", "Service"].map((t) => ({
      tipe: t,
      omzet: filtered.filter((s) => s.tipe === t).reduce((a, s) => a + (Number(s.total) || 0), 0),
      trx: filtered.filter((s) => s.tipe === t).length,
    }));

    return { filtered, omzet, trx, laba, byType };
  }, [from, to, state.sales, state.products, state.pulsaProducts]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm md:flex-row md:items-end md:justify-between">
        <div className="grid w-full gap-3 md:grid-cols-3">
          <div>
            <Label>Dari</Label>
            <Input value={from} onChange={(e) => setFrom(e.target.value)} type="date" className="rounded-2xl" />
          </div>
          <div>
            <Label>Sampai</Label>
            <Input value={to} onChange={(e) => setTo(e.target.value)} type="date" className="rounded-2xl" />
          </div>
          <div className="flex items-end gap-2">
            <Button
              variant="secondary"
              className="rounded-2xl"
              onClick={() => {
                setFrom("");
                setTo("");
              }}
            >
              Reset Filter
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Omzet</div>
            <div className="text-base font-semibold">{rupiah(data.omzet)}</div>
          </div>
          <Separator orientation="vertical" className="h-10" />
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Laba (estimasi)</div>
            <div className="text-base font-semibold">{rupiah(data.laba)}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Ringkasan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border bg-card p-3">
              <div className="text-sm text-muted-foreground">Transaksi</div>
              <div className="text-sm font-semibold">{data.trx}</div>
            </div>
            <div className="flex items-center justify-between rounded-2xl border bg-card p-3">
              <div className="text-sm text-muted-foreground">Omzet</div>
              <div className="text-sm font-semibold">{rupiah(data.omzet)}</div>
            </div>
            <div className="flex items-center justify-between rounded-2xl border bg-card p-3">
              <div className="text-sm text-muted-foreground">Laba (estimasi)</div>
              <div className="text-sm font-semibold">{rupiah(data.laba)}</div>
            </div>
            <p className="text-xs text-muted-foreground">
              Laba dihitung sederhana: Aksesoris (jual-beli), Pulsa (jual-modal), Service (diasumsikan jasa).
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Omzet per Tipe</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byType} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tipe" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => rupiah(v)} />
                <Bar dataKey="omzet" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Transaksi Terfilter</CardTitle>
        </CardHeader>
        <CardContent>
          {data.filtered.length ? (
            <Table>
              <TableCaption>{data.filtered.length} transaksi</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.tanggal}</TableCell>
                    <TableCell className="font-mono text-xs">{s.id}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="rounded-full">{s.tipe}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{rupiah(s.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="Tidak ada data" desc="Ubah rentang tanggal untuk menampilkan laporan." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- Settings View ----------
function SettingsView({ state, onChange, onBackup }) {
  const s = state.settings;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Profil Toko</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2">
            <Label>Nama Toko</Label>
            <Input value={s.toko} onChange={(e) => onChange({ toko: e.target.value })} className="rounded-2xl" />
          </div>
          <div className="grid gap-2">
            <Label>Alamat</Label>
            <Input value={s.alamat} onChange={(e) => onChange({ alamat: e.target.value })} className="rounded-2xl" />
          </div>
          <div className="grid gap-2">
            <Label>Telepon</Label>
            <Input value={s.telp} onChange={(e) => onChange({ telp: e.target.value })} className="rounded-2xl" />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Aturan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2">
            <Label>Pajak (%)</Label>
            <Input
              {...moneyInputProps()}
              value={String(s.pajakPct)}
              onChange={(e) => onChange({ pajakPct: clampNum(e.target.value, 0) })}
              className="rounded-2xl"
            />
            <p className="text-xs text-muted-foreground">Dipakai saat membuat transaksi (opsional).</p>
          </div>
          <div className="grid gap-2">
            <Label>Batas Stok Menipis</Label>
            <Input
              {...moneyInputProps()}
              value={String(s.lowStockThreshold)}
              onChange={(e) => onChange({ lowStockThreshold: clampNum(e.target.value, 0) })}
              className="rounded-2xl"
            />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Button className="rounded-2xl" onClick={onBackup}>
              <Download className="mr-2 h-4 w-4" /> Backup Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Catatan</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="list-disc space-y-1 pl-5">
            <li>Data tersimpan di <span className="font-mono">localStorage</span> (perangkat/browser). Untuk multi-user, perlu backend.</li>
            <li>Menu Transaksi mendukung: Pulsa, Aksesoris, dan pembayaran pelunasan Service.</li>
            <li>Stok otomatis berkurang hanya untuk transaksi Aksesoris.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- Dialog: Product ----------
function ProductDialog({ open, onOpenChange, initial, onSave }) {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState(() => ({
    id: initial?.id || "",
    nama: initial?.nama || "",
    kategori: initial?.kategori || "Aksesoris",
    barcode: initial?.barcode || "",
    hargaBeli: initial?.hargaBeli ?? 0,
    hargaJual: initial?.hargaJual ?? 0,
    stok: typeof initial?.stok === "number" ? initial?.stok : 0,
    satuan: initial?.satuan || "pcs",
    supplier: initial?.supplier || "",
    isJasa: initial?.kategori === "Service" || initial?.satuan === "jasa" || typeof initial?.stok !== "number",
  }));

  useEffect(() => {
    if (!open) return;
    setForm({
      id: initial?.id || "",
      nama: initial?.nama || "",
      kategori: initial?.kategori || "Aksesoris",
      barcode: initial?.barcode || "",
      hargaBeli: initial?.hargaBeli ?? 0,
      hargaJual: initial?.hargaJual ?? 0,
      stok: typeof initial?.stok === "number" ? initial?.stok : 0,
      satuan: initial?.satuan || "pcs",
      supplier: initial?.supplier || "",
      isJasa: initial?.kategori === "Service" || initial?.satuan === "jasa" || typeof initial?.stok !== "number",
    });
  }, [open, initial]);

  const canSave = form.nama.trim().length > 0 && clampNum(form.hargaJual, 0) >= 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-h-[85vh] overflow-y-auto">

        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Produk" : "Tambah Produk"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label>Nama</Label>
            <Input value={form.nama} onChange={(e) => setForm((p) => ({ ...p, nama: e.target.value }))} className="rounded-2xl" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Kategori</Label>
              <Select
                value={form.kategori}
                onValueChange={(v) => {
                  const isJasa = v === "Service";
                  setForm((p) => ({
                    ...p,
                    kategori: v,
                    isJasa,
                    satuan: isJasa ? "jasa" : p.satuan || "pcs",
                    stok: isJasa ? null : clampNum(p.stok ?? 0, 0),
                  }));
                }}
              >
                <SelectTrigger className="rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="Aksesoris">Aksesoris</SelectItem>
                  <SelectItem value="Service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Barcode (opsional)</Label>
              <Input value={form.barcode} onChange={(e) => setForm((p) => ({ ...p, barcode: e.target.value }))} className="rounded-2xl" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Harga Beli</Label>
              <Input
                {...moneyInputProps()}
                value={String(form.hargaBeli ?? 0)}
                onChange={(e) => setForm((p) => ({ ...p, hargaBeli: clampNum(e.target.value, 0) }))}
                className="rounded-2xl"
              />
            </div>
            <div className="grid gap-2">
              <Label>Harga Jual</Label>
              <Input
                {...moneyInputProps()}
                value={String(form.hargaJual ?? 0)}
                onChange={(e) => setForm((p) => ({ ...p, hargaJual: clampNum(e.target.value, 0) }))}
                className="rounded-2xl"
              />
            </div>
          </div>

          {!form.isJasa ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Stok</Label>
                <Input
                  {...moneyInputProps()}
                  value={String(form.stok ?? 0)}
                  onChange={(e) => setForm((p) => ({ ...p, stok: clampNum(e.target.value, 0) }))}
                  className="rounded-2xl"
                />
              </div>
              <div className="grid gap-2">
                <Label>Satuan</Label>
                <Input value={form.satuan} onChange={(e) => setForm((p) => ({ ...p, satuan: e.target.value }))} className="rounded-2xl" />
              </div>
            </div>
          ) : (
            <div className="grid gap-2">
              <Label>Satuan</Label>
              <Input value={"jasa"} disabled className="rounded-2xl" />
            </div>
          )}

          <div className="grid gap-2">
            <Label>Supplier (opsional)</Label>
            <Input value={form.supplier} onChange={(e) => setForm((p) => ({ ...p, supplier: e.target.value }))} className="rounded-2xl" />
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 bg-background pt-3">
  <Button variant="outline" className="rounded-2xl" onClick={() => onOpenChange(false)}>
    Batal
  </Button>

  <Button
    className="rounded-2xl"
    disabled={!canSave}
    onClick={() => {
      onSave({
        id: form.id,
        tanggalMasuk: form.tanggalMasuk,
        customerId: form.customerId || "",
        namaCustomer: form.namaCustomer.trim(),
        telp: form.telp.trim(),
        device: form.device.trim(),
        keluhan: form.keluhan.trim(),
        estimasiBiaya: clampNum(form.estimasiBiaya, 0),
        dp: clampNum(form.dp, 0),
        status: form.status,
        teknisi: form.teknisi.trim(),
        catatan: form.catatan.trim(),
        tanggalSelesai: form.tanggalSelesai,
      });
    }}
  >
    Simpan
  </Button>
</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Dialog: Customer ----------
function CustomerDialog({ open, onOpenChange, initial, onSave }) {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState(() => ({
    id: initial?.id || id("CUST"),
    nama: initial?.nama || "",
    telp: initial?.telp || "",
    catatan: initial?.catatan || "",
  }));

  useEffect(() => {
    if (!open) return;
    setForm({
      id: initial?.id || id("CUST"),
      nama: initial?.nama || "",
      telp: initial?.telp || "",
      catatan: initial?.catatan || "",
    });
  }, [open, initial]);

  const canSave = form.nama.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-h-[85vh] overflow-y-auto">

        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Pelanggan" : "Tambah Pelanggan"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label>Nama</Label>
            <Input value={form.nama} onChange={(e) => setForm((p) => ({ ...p, nama: e.target.value }))} className="rounded-2xl" />
          </div>
          <div className="grid gap-2">
            <Label>No. HP</Label>
            <Input value={form.telp} onChange={(e) => setForm((p) => ({ ...p, telp: e.target.value }))} className="rounded-2xl" />
          </div>
          <div className="grid gap-2">
            <Label>Catatan</Label>
            <Textarea value={form.catatan} onChange={(e) => setForm((p) => ({ ...p, catatan: e.target.value }))} className="rounded-2xl" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-2xl" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            className="rounded-2xl"
            disabled={!canSave}
            onClick={() =>
              onSave({
                id: form.id,
                nama: form.nama.trim(),
                telp: form.telp.trim(),
                catatan: form.catatan.trim(),
              })
            }
          >
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Dialog: Sale ----------
function SaleDialog({ open, onOpenChange, state, onSave }) {
  const [tipe, setTipe] = useState("Pulsa");
  const [tanggal, setTanggal] = useState(todayISO());
  const [customerId, setCustomerId] = useState("");
  const [pembayaran, setPembayaran] = useState("Tunai");
  const [catatan, setCatatan] = useState("");

  // pulsa
  const [nomorTujuan, setNomorTujuan] = useState("");
  const [pulsaId, setPulsaId] = useState(state.pulsaProducts?.[0]?.id || "");

  // aksesoris
  const [prodId, setProdId] = useState("");
  const [qty, setQty] = useState(1);

  // service
  const [serviceDesc, setServiceDesc] = useState("");
  const [servicePrice, setServicePrice] = useState(0);

  useEffect(() => {
    if (!open) return;
    setTanggal(todayISO());
    setCustomerId("");
    setPembayaran("Tunai");
    setCatatan("");
    setNomorTujuan("");
    setPulsaId(state.pulsaProducts?.[0]?.id || "");
    setProdId(state.products.find((p) => p.kategori === "Aksesoris")?.id || "");
    setQty(1);
    setServiceDesc("");
    setServicePrice(0);
    setTipe("Pulsa");
  }, [open, state.pulsaProducts, state.products]);

  const pajakPct = clampNum(state.settings.pajakPct, 0);

  const summary = useMemo(() => {
    if (tipe === "Pulsa") {
      const pp = state.pulsaProducts.find((p) => p.id === pulsaId);
      const harga = Number(pp?.hargaJual) || 0;
      const subtotal = harga;
      const pajak = Math.round((subtotal * pajakPct) / 100);
      const total = subtotal + pajak;
      return { items: [{ productId: pp?.id || "", nama: `${pp?.operator || ""} ${pp?.nominal || ""}`.trim(), qty: 1, harga }], subtotal, pajak, total };
    }

    if (tipe === "Aksesoris") {
      const p = state.products.find((x) => x.id === prodId);
      const harga = Number(p?.hargaJual) || 0;
      const q = clampNum(qty, 1);
      const subtotal = harga * q;
      const pajak = Math.round((subtotal * pajakPct) / 100);
      const total = subtotal + pajak;
      return { items: [{ productId: p?.id || "", nama: p?.nama || "", qty: q, harga }], subtotal, pajak, total };
    }

    // Service
    const harga = clampNum(servicePrice, 0);
    const subtotal = harga;
    const pajak = Math.round((subtotal * pajakPct) / 100);
    const total = subtotal + pajak;
    return { items: [{ productId: "SVC", nama: serviceDesc || "Jasa Service", qty: 1, harga }], subtotal, pajak, total };
  }, [tipe, pulsaId, prodId, qty, serviceDesc, servicePrice, pajakPct, state.pulsaProducts, state.products]);

  const canSave = useMemo(() => {
    if (!tanggal) return false;
    if (tipe === "Pulsa") return Boolean(pulsaId) && nomorTujuan.trim().length >= 8;
    if (tipe === "Aksesoris") return Boolean(prodId) && clampNum(qty, 1) > 0;
    return (serviceDesc.trim().length > 0 || servicePrice > 0) && clampNum(servicePrice, 0) >= 0;
  }, [tanggal, tipe, pulsaId, nomorTujuan, prodId, qty, serviceDesc, servicePrice]);


const NONE = "__none__"; // taruh di atas return(), dalam SaleDialog


return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-h-[85vh] overflow-y-auto">

        <DialogHeader>
          <DialogTitle>Transaksi Baru</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Tanggal</Label>
              <Input value={tanggal} onChange={(e) => setTanggal(e.target.value)} type="date" className="rounded-2xl" />
            </div>
            <div className="grid gap-2">
              <Label>Tipe</Label>
              <Select value={tipe} onValueChange={setTipe}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="Pulsa">Pulsa</SelectItem>
                  <SelectItem value="Aksesoris">Aksesoris</SelectItem>
                  <SelectItem value="Service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Pelanggan (opsional)</Label>

              <Select
                      value={customerId ? customerId : NONE}
                      onValueChange={(v) => setCustomerId(v === NONE ? "" : v)}
>
                        <SelectTrigger className="rounded-2xl">
                       <SelectValue placeholder="Pilih pelanggan" />
                       </SelectTrigger>

                      <SelectContent className="rounded-2xl">
                       <SelectItem value={NONE}>Tanpa pelanggan</SelectItem>

                       {state.customers.map((c) => (
                       <SelectItem key={c.id} value={c.id}>
                       {c.nama} • {c.telp}
                       </SelectItem>
    ))}
  </SelectContent>
</Select>


            </div>
            <div className="grid gap-2">
              <Label>Pembayaran</Label>
              <Select value={pembayaran} onValueChange={setPembayaran}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="Tunai">Tunai</SelectItem>
                  <SelectItem value="QRIS">QRIS</SelectItem>
                  <SelectItem value="Transfer">Transfer</SelectItem>
                  <SelectItem value="Debit">Debit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {tipe === "Pulsa" ? (
            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label>Paket Pulsa</Label>
                <Select value={pulsaId} onValueChange={setPulsaId}>
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {state.pulsaProducts.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.operator} {p.nominal.toLocaleString("id-ID")} • {rupiah(p.hargaJual)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>No. Tujuan</Label>
                <Input value={nomorTujuan} onChange={(e) => setNomorTujuan(e.target.value)} placeholder="08xxxxxxxxxx" className="rounded-2xl" />
              </div>
            </div>
          ) : null}

          {tipe === "Aksesoris" ? (
            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label>Produk</Label>
                <Select value={prodId} onValueChange={setProdId}>
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {state.products
                      .filter((p) => p.kategori === "Aksesoris")
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nama} • stok {typeof p.stok === "number" ? p.stok : "-"} • {rupiah(p.hargaJual)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Qty</Label>
                  <Input
                    {...moneyInputProps()}
                    value={String(qty)}
                    onChange={(e) => setQty(clampNum(e.target.value, 1))}
                    className="rounded-2xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Info Stok</Label>
                  <Input
                    value={(() => {
                      const p = state.products.find((x) => x.id === prodId);
                      if (!p) return "-";
                      return typeof p.stok === "number" ? `${p.stok} ${p.satuan}` : "-";
                    })()}
                    disabled
                    className="rounded-2xl"
                  />
                </div>
              </div>
            </div>
          ) : null}

          {tipe === "Service" ? (
            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label>Deskripsi</Label>
                <Input value={serviceDesc} onChange={(e) => setServiceDesc(e.target.value)} placeholder="Contoh: Ganti baterai / Jasa flash" className="rounded-2xl" />
              </div>
              <div className="grid gap-2">
                <Label>Harga</Label>
                <Input
                  {...moneyInputProps()}
                  value={String(servicePrice)}
                  onChange={(e) => setServicePrice(clampNum(e.target.value, 0))}
                  className="rounded-2xl"
                />
              </div>
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label>Catatan (opsional)</Label>
            <Textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} className="rounded-2xl" />
          </div>

          <div className="rounded-2xl border bg-card p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{rupiah(summary.subtotal)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pajak ({pajakPct}%)</span>
              <span className="font-semibold">{rupiah(summary.pajak)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total</span>
              <span className="text-base font-semibold">{rupiah(summary.total)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className="rounded-2xl" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            className="rounded-2xl"
            disabled={!canSave}
            onClick={() => {
              onSave({
                id: id("SLS"),
                tanggal,
                tipe,
                customerId: customerId || "",
                items: summary.items,
                nomorTujuan: tipe === "Pulsa" ? nomorTujuan.trim() : undefined,
                catatan: catatan.trim(),
                pembayaran,
                subtotal: summary.subtotal,
                pajak: summary.pajak,
                total: summary.total,
              });
            }}
          >
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Dialog: Service Order ----------
function ServiceDialog({ open, onOpenChange, state, initial, onSave }) {
  const isEdit = Boolean(initial);

  const [form, setForm] = useState(() => ({
    id: initial?.id || id("SVC"),
    tanggalMasuk: initial?.tanggalMasuk || todayISO(),
    customerId: initial?.customerId || "",
    namaCustomer: initial?.namaCustomer || "",
    telp: initial?.telp || "",
    device: initial?.device || "",
    keluhan: initial?.keluhan || "",
    estimasiBiaya: initial?.estimasiBiaya ?? 0,
    dp: initial?.dp ?? 0,
    status: initial?.status || "Masuk",
    teknisi: initial?.teknisi || "",
    catatan: initial?.catatan || "",
    tanggalSelesai: initial?.tanggalSelesai || "",
  }));

  useEffect(() => {
    if (!open) return;
    setForm({
      id: initial?.id || id("SVC"),
      tanggalMasuk: initial?.tanggalMasuk || todayISO(),
      customerId: initial?.customerId || "",
      namaCustomer: initial?.namaCustomer || "",
      telp: initial?.telp || "",
      device: initial?.device || "",
      keluhan: initial?.keluhan || "",
      estimasiBiaya: initial?.estimasiBiaya ?? 0,
      dp: initial?.dp ?? 0,
      status: initial?.status || "Masuk",
      teknisi: initial?.teknisi || "",
      catatan: initial?.catatan || "",
      tanggalSelesai: initial?.tanggalSelesai || "",
    });
  }, [open, initial]);

  const canSave = form.device.trim().length > 0 && form.namaCustomer.trim().length > 0 && form.telp.trim().length > 0;

  const statuses = ["Masuk", "Dalam Proses", "Menunggu", "Selesai", "Batal"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Order Service" : "Order Service Baru"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Tanggal Masuk</Label>
              <Input value={form.tanggalMasuk} onChange={(e) => setForm((p) => ({ ...p, tanggalMasuk: e.target.value }))} type="date" className="rounded-2xl" />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Pelanggan (ambil cepat)</Label>
            <Select
             value={form.customerId ? form.customerId : "none"}
    onValueChange={(v) => {
      if (v === "none") {
        setForm((p) => ({ ...p, customerId: "" }));
        return;
      }

      const c = state.customers.find((x) => x.id === v);
      setForm((p) => ({
        ...p,
        customerId: v,
        namaCustomer: c?.nama || p.namaCustomer,
        telp: c?.telp || p.telp,
      }));
    }}
  >
    <SelectTrigger className="rounded-2xl">
      <SelectValue placeholder="Pilih pelanggan" />
    </SelectTrigger>

    <SelectContent className="rounded-2xl">
      <SelectItem value="none">Tidak pilih</SelectItem>

      {state.customers.map((c) => (
        <SelectItem key={c.id} value={c.id}>
          {c.nama} • {c.telp}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Nama</Label>
              <Input value={form.namaCustomer} onChange={(e) => setForm((p) => ({ ...p, namaCustomer: e.target.value }))} className="rounded-2xl" />
            </div>
            <div className="grid gap-2">
              <Label>No. HP</Label>
              <Input value={form.telp} onChange={(e) => setForm((p) => ({ ...p, telp: e.target.value }))} className="rounded-2xl" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Perangkat</Label>
            <Input value={form.device} onChange={(e) => setForm((p) => ({ ...p, device: e.target.value }))} placeholder="Contoh: iPhone 11 / Xiaomi Redmi 9" className="rounded-2xl" />
          </div>

          <div className="grid gap-2">
            <Label>Keluhan</Label>
            <Textarea value={form.keluhan} onChange={(e) => setForm((p) => ({ ...p, keluhan: e.target.value }))} className="rounded-2xl" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Estimasi Biaya</Label>
              <Input
                {...moneyInputProps()}
                value={String(form.estimasiBiaya ?? 0)}
                onChange={(e) => setForm((p) => ({ ...p, estimasiBiaya: clampNum(e.target.value, 0) }))}
                className="rounded-2xl"
              />
            </div>
            <div className="grid gap-2">
              <Label>DP</Label>
              <Input
                {...moneyInputProps()}
                value={String(form.dp ?? 0)}
                onChange={(e) => setForm((p) => ({ ...p, dp: clampNum(e.target.value, 0) }))}
                className="rounded-2xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Teknisi</Label>
              <Input value={form.teknisi} onChange={(e) => setForm((p) => ({ ...p, teknisi: e.target.value }))} className="rounded-2xl" />
            </div>
            <div className="grid gap-2">
              <Label>Tanggal Selesai (opsional)</Label>
              <Input value={form.tanggalSelesai} onChange={(e) => setForm((p) => ({ ...p, tanggalSelesai: e.target.value }))} type="date" className="rounded-2xl" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Catatan</Label>
            <Textarea value={form.catatan} onChange={(e) => setForm((p) => ({ ...p, catatan: e.target.value }))} className="rounded-2xl" />
          </div>

          <div className="rounded-2xl border bg-card p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sisa Bayar</span>
              <span className="text-base font-semibold">{rupiah(Math.max(0, clampNum(form.estimasiBiaya, 0) - clampNum(form.dp, 0)))}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className="rounded-2xl" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            className="rounded-2xl"
            disabled={!canSave}
            onClick={() => {
              onSave({
                id: form.id,
                tanggalMasuk: form.tanggalMasuk,
                customerId: form.customerId || "",
                namaCustomer: form.namaCustomer.trim(),
                telp: form.telp.trim(),
                device: form.device.trim(),
                keluhan: form.keluhan.trim(),
                estimasiBiaya: clampNum(form.estimasiBiaya, 0),
                dp: clampNum(form.dp, 0),
                status: form.status,
                teknisi: form.teknisi.trim(),
                catatan: form.catatan.trim(),
                tanggalSelesai: form.tanggalSelesai,
              });
            }}
          >
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
