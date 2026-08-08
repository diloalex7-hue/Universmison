import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Package, Tags, ShoppingBag, TrendingUp,
  DollarSign, ArrowUpRight, ArrowDownRight, Activity, BarChart2
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { format, parseISO, subDays } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    revenue: 0,
    realRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
  });
  
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [p, c, o] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total, status, created_at"),
      ]);
      const allOrders = o.data ?? [];
      const revenue = allOrders.reduce((s, r: any) => s + Number(r.total || 0), 0);
      const realRevenue = allOrders.reduce((s, r: any) => r.status === "delivered" ? s + Number(r.total || 0) : s, 0);
      
      setStats({
        products: p.count ?? 0,
        categories: c.count ?? 0,
        orders: allOrders.length,
        revenue,
        realRevenue,
        pendingOrders: allOrders.filter((r: any) => r.status === "pending").length,
        deliveredOrders: allOrders.filter((r: any) => r.status === "delivered").length,
        cancelledOrders: allOrders.filter((r: any) => r.status === "cancelled").length,
      });

      // Prepare chart data (last 7 days)
      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(new Date(), 6 - i);
        return format(d, 'yyyy-MM-dd');
      });

      const groupedByDate = allOrders.reduce((acc: any, order: any) => {
        if (!order.created_at) return acc;
        const d = format(parseISO(order.created_at), 'yyyy-MM-dd');
        if (!acc[d]) acc[d] = 0;
        if (order.status !== 'cancelled') acc[d] += Number(order.total || 0);
        return acc;
      }, {});

      const finalChartData = last7Days.map(d => ({
        name: format(parseISO(d), "dd MMM", { locale: fr }),
        total: groupedByDate[d] || 0
      }));

      setChartData(finalChartData);
    })();
  }, []);

  const formatDA = (n: number) => n.toLocaleString("fr-FR") + " DA";

  const mainCards = [
    {
      label: "Chiffre d'affaires",
      subtitle: "Toutes les commandes",
      value: formatDA(stats.revenue),
      icon: DollarSign,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
      borderColor: "border-amber-200 dark:border-amber-900/30",
    },
    {
      label: "Revenus confirmés",
      subtitle: "Commandes livrées uniquement",
      value: formatDA(stats.realRevenue),
      icon: TrendingUp,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      trend: stats.orders > 0 ? `${((stats.deliveredOrders / stats.orders) * 100).toFixed(0)}%` : "0%",
      trendUp: true,
      borderColor: "border-emerald-200 dark:border-emerald-900/30",
    },
  ];

  const statCards = [
    {
      label: "Produits",
      value: stats.products,
      icon: Package,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
    },
    {
      label: "Catégories",
      value: stats.categories,
      icon: Tags,
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-600",
    },
    {
      label: "Commandes",
      value: stats.orders,
      icon: ShoppingBag,
      iconBg: "bg-sky-500/10",
      iconColor: "text-sky-600",
    },
    {
      label: "Taux de livraison",
      value: stats.orders > 0 ? `${((stats.deliveredOrders / stats.orders) * 100).toFixed(0)}%` : "—",
      icon: Activity,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
    },
  ];

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-serif tracking-tight text-foreground">
          Tableau de bord
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Vue d'ensemble de votre boutique
        </p>
      </header>

      {/* Revenue Cards (2-column) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {mainCards.map((card) => (
          <div
            key={card.label}
            className={`relative overflow-hidden rounded-2xl border ${card.borderColor} bg-card p-6 shadow-sm hover:shadow-md transition-shadow duration-300`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {card.label}
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                  {card.subtitle}
                </p>
                <p className="text-3xl font-serif font-semibold mt-3 tracking-tight">
                  {card.value}
                </p>
              </div>
              <div className={`h-11 w-11 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
            {card.trend && (
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium">
                {card.trendUp ? (
                  <span className="flex items-center gap-0.5 text-emerald-600">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    {card.trend}
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-red-500">
                    <ArrowDownRight className="h-3.5 w-3.5" />
                    {card.trend}
                  </span>
                )}
                <span className="text-muted-foreground/60">taux de livraison</span>
              </div>
            )}
            {/* Decorative gradient blob */}
            <div className={`absolute -bottom-8 -right-8 h-32 w-32 rounded-full ${card.iconBg} blur-2xl opacity-40 pointer-events-none`} />
          </div>
        ))}
      </div>

      {/* Stat Cards (4-column) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className={`h-9 w-9 rounded-lg ${card.iconBg} flex items-center justify-center mb-3`}>
              <card.icon className={`h-4 w-4 ${card.iconColor}`} />
            </div>
            <p className="text-2xl font-serif font-semibold tracking-tight">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-lg">Évolution des revenus (7 derniers jours)</h2>
          <div className={`h-8 w-8 rounded-lg bg-gold/10 flex items-center justify-center`}>
            <BarChart2 className="h-4 w-4 text-gold" />
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "currentColor" }}
                className="text-muted-foreground"
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "currentColor" }}
                className="text-muted-foreground"
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
                itemStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
                formatter={(value: number) => [`${value.toLocaleString("fr-FR")} DA`, "Revenu"]}
                labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '4px' }}
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#d4af37" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTotal)" 
                activeDot={{ r: 6, fill: "#d4af37", stroke: "var(--background)", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-serif text-lg mb-4">Répartition des commandes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatusCard
            label="En attente"
            count={stats.pendingOrders}
            total={stats.orders}
            color="bg-amber-500"
            lightColor="bg-amber-500/10"
            textColor="text-amber-700 dark:text-amber-400"
          />
          <StatusCard
            label="Livrées"
            count={stats.deliveredOrders}
            total={stats.orders}
            color="bg-emerald-500"
            lightColor="bg-emerald-500/10"
            textColor="text-emerald-700 dark:text-emerald-400"
          />
          <StatusCard
            label="Annulées"
            count={stats.cancelledOrders}
            total={stats.orders}
            color="bg-red-500"
            lightColor="bg-red-500/10"
            textColor="text-red-700 dark:text-red-400"
          />
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, count, total, color, lightColor, textColor }: {
  label: string; count: number; total: number; color: string; lightColor: string; textColor: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className={`rounded-xl ${lightColor} p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-bold uppercase tracking-wider ${textColor}`}>{label}</span>
        <span className={`text-lg font-serif font-semibold ${textColor}`}>{count}</span>
      </div>
      <div className="h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground mt-1.5">{pct.toFixed(0)}% du total</p>
    </div>
  );
}
