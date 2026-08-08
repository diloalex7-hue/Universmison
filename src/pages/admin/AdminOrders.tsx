import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Printer, Download } from "lucide-react";

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

  const exportToCSV = () => {
    const headers = ["N°", "Client", "Téléphone", "Wilaya", "Adresse", "Date", "Statut", "Total"];
    const rows = filtered.map(o => [
      o.order_number,
      `"${o.full_name}"`,
      o.phone,
      `"${o.wilaya}"`,
      `"${o.address}"`,
      new Date(o.created_at).toLocaleDateString("fr-FR"),
      o.status,
      o.total
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `commandes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printInvoice = (order: any) => {
    const win = window.open('', '_blank');
    if (!win) return;
    const logoUrl = window.location.origin + '/logo.png';
    win.document.write(`
      <html>
        <head>
          <title>Facture Proforma - ${order.order_number}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Inter:wght@400;500;600&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #0f172a; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #d4af37; padding-bottom: 20px; }
            .logo-container img { height: 60px; object-fit: contain; }
            .invoice-title { text-align: right; }
            .invoice-title h1 { font-family: 'Playfair Display', serif; color: #0f172a; margin: 0 0 5px 0; font-size: 28px; text-transform: uppercase; letter-spacing: 1px; }
            .invoice-title p { margin: 0; color: #64748b; font-size: 14px; }
            .info-section { display: flex; justify-content: space-between; margin-bottom: 40px; background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #d4af37; }
            .info-block { flex: 1; }
            .info-block h3 { margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; }
            .info-block p { margin: 0 0 4px 0; font-size: 14px; line-height: 1.5; }
            .table { border-collapse: collapse; width: 100%; margin-bottom: 30px; }
            .table th { background: #0f172a; color: #ffffff; padding: 12px 15px; text-align: left; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
            .table th.text-right { text-align: right; }
            .table td { border-bottom: 1px solid #e2e8f0; padding: 15px; font-size: 14px; }
            .table td.text-right { text-align: right; font-weight: 500; }
            .product-name { font-weight: 600; color: #0f172a; display: block; margin-bottom: 4px; }
            .product-meta { color: #64748b; font-size: 12px; }
            .totals { width: 320px; margin-left: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
            .totals-row { display: flex; justify-content: space-between; padding: 12px 15px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
            .totals-row:last-child { border-bottom: none; }
            .totals-row.grand-total { background: #0f172a; color: white; font-size: 18px; font-weight: bold; }
            .totals-row.grand-total .val { color: #d4af37; }
            .footer { margin-top: 60px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            @media print {
              body { padding: 0; }
              .info-section { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .table th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .totals-row.grand-total { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-container">
              <img src="${logoUrl}" alt="Univers Maison" />
            </div>
            <div class="invoice-title">
              <h1>Facture Proforma</h1>
              <p>Réf: <strong>${order.order_number}</strong></p>
              <p>Date: ${new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
          
          <div class="info-section">
            <div class="info-block">
              <h3>Facturé à</h3>
              <p><strong>${order.full_name}</strong></p>
              <p>${order.phone}</p>
              ${order.email ? `<p>${order.email}</p>` : ''}
            </div>
            <div class="info-block">
              <h3>Expédié à</h3>
              <p>${order.address}</p>
              <p>${order.city ? order.city + ', ' : ''}${order.wilaya}</p>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Désignation</th>
                <th>Prix Unitaire</th>
                <th>Qté</th>
                <th class="text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              ${order.order_items?.map((item: any) => `
                <tr>
                  <td>
                    <span class="product-name">${item.product_name}</span>
                    <span class="product-meta">
                      ${item.selected_color ? `Couleur: ${item.selected_color}` : ''}
                      ${item.selected_color && item.selected_size ? ' | ' : ''}
                      ${item.selected_size ? `Taille: ${item.selected_size}` : ''}
                    </span>
                  </td>
                  <td>${Number(item.unit_price).toLocaleString('fr-FR')} DA</td>
                  <td>${item.quantity}</td>
                  <td class="text-right">${(item.quantity * Number(item.unit_price)).toLocaleString('fr-FR')} DA</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>Sous-total</span>
              <span>${Number(order.subtotal).toLocaleString('fr-FR')} DA</span>
            </div>
            <div class="totals-row">
              <span>Frais de livraison</span>
              <span>${Number(order.shipping).toLocaleString('fr-FR')} DA</span>
            </div>
            ${order.discount ? `
            <div class="totals-row" style="color: #ef4444;">
              <span>Remise (${order.coupon_code || ''})</span>
              <span>-${Number(order.discount).toLocaleString('fr-FR')} DA</span>
            </div>
            ` : ''}
            <div class="totals-row grand-total">
              <span>Total Net</span>
              <span class="val">${Number(order.total).toLocaleString('fr-FR')} DA</span>
            </div>
          </div>

          <div class="footer">
            <p>Merci pour votre confiance !</p>
            <p>Univers Maison - L'Art de la Table & Décoration</p>
          </div>

          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif tracking-tight">Commandes</h1>
          <p className="text-muted-foreground mt-1">{orders.length} commandes au total</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Exporter CSV
          </Button>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
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

              <div className="flex justify-between items-center pt-4 border-t text-sm">
                <Button variant="outline" onClick={() => printInvoice(selectedOrder)}>
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimer la facture
                </Button>
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
