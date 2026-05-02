import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

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
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const load = async () => {
    const { data } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
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
              <th className="p-3 font-medium">Détails</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">Aucune commande</td></tr>
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
                <td className="p-3">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(o)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">Commande {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-semibold text-muted-foreground mb-1">Client</h3>
                  <p>{selectedOrder.full_name}</p>
                  <p>{selectedOrder.phone}</p>
                  {selectedOrder.email && <p>{selectedOrder.email}</p>}
                </div>
                <div>
                  <h3 className="font-semibold text-muted-foreground mb-1">Adresse de livraison</h3>
                  <p>{selectedOrder.address}</p>
                  <p>{selectedOrder.city}, {selectedOrder.wilaya}</p>
                </div>
              </div>
              
              {selectedOrder.notes && (
                <div className="text-sm bg-muted/50 p-3 rounded-lg">
                  <span className="font-semibold">Notes :</span> {selectedOrder.notes}
                </div>
              )}

              <div>
                <h3 className="font-semibold text-lg border-b pb-2 mb-3">Produits commandés</h3>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map((item: any) => (
                    <div key={item.id} className="flex gap-4 items-center bg-muted/20 p-2 rounded-lg border">
                      {item.product_image ? (
                        <img src={item.product_image} alt={item.product_name} className="w-16 h-16 object-cover rounded-md" />
                      ) : (
                        <div className="w-16 h-16 bg-muted flex items-center justify-center rounded-md text-xs text-muted-foreground">Image</div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.selected_color && `Couleur: ${item.selected_color}`}
                          {item.selected_color && item.selected_size && " | "}
                          {item.selected_size && `Taille: ${item.selected_size}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{item.quantity} x {Number(item.unit_price).toFixed(0)} DA</p>
                        <p className="text-sm text-gold">{(item.quantity * Number(item.unit_price)).toFixed(0)} DA</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t text-sm">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sous-total:</span>
                    <span>{Number(selectedOrder.subtotal).toFixed(0)} DA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Livraison:</span>
                    <span>{Number(selectedOrder.shipping).toFixed(0)} DA</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-gold">{Number(selectedOrder.total).toFixed(0)} DA</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
