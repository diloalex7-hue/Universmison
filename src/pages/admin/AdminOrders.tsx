import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const colors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-700",
  confirmed: "bg-blue-500/10 text-blue-700",
  shipped: "bg-purple-500/10 text-purple-700",
  delivered: "bg-emerald-500/10 text-emerald-700",
  cancelled: "bg-red-500/10 text-red-700",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Statut mis à jour");
    load();
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Commandes</h1>
          <p className="text-muted-foreground mt-1">{orders.length} commandes au total</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </header>

      <div className="bg-background border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3 font-medium">N°</th>
              <th className="p-3 font-medium">Client</th>
              <th className="p-3 font-medium">Téléphone</th>
              <th className="p-3 font-medium">Wilaya</th>
              <th className="p-3 font-medium">Total</th>
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Aucune commande</td></tr>
            ) : filtered.map((o) => (
              <tr key={o.id} className="border-t hover:bg-muted/30">
                <td className="p-3 font-mono text-xs">{o.order_number}</td>
                <td className="p-3 font-medium">{o.full_name}</td>
                <td className="p-3">{o.phone}</td>
                <td className="p-3">{o.wilaya}</td>
                <td className="p-3 font-medium">{Number(o.total).toFixed(0)} DA</td>
                <td className="p-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString("fr-FR")}</td>
                <td className="p-3">
                  <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                    <SelectTrigger className={`w-36 h-8 text-xs ${colors[o.status] ?? ""}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
