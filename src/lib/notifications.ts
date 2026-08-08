import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

export interface OrderStatusNotification {
  order_id: string;
  order_number: string;
  status: string;
}

export const Notifications = {
  async requestPermission() {
    if (!Capacitor.isNativePlatform()) return false;
    try {
      const { display } = await LocalNotifications.requestPermissions();
      return display === 'granted';
    } catch (e) {
      console.error('Push permission error:', e);
      return false;
    }
  },

  async schedule(title: string, body: string, id: number = new Date().getTime(), extra: any = {}) {
    if (!Capacitor.isNativePlatform()) return;
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return;

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: id % 1000000,
            schedule: { at: new Date(Date.now() + 1000) }, // Schedule 1 second from now
            actionTypeId: '',
            extra,
            sound: 'default',
          }
        ]
      });
    } catch (e) {
      console.error('Failed to schedule local notification:', e);
    }
  },

  async checkOrderStatusChanges(userId: string) {
    if (!Capacitor.isNativePlatform()) return;
    if (!userId) return;

    try {
      const storageKey = `last_order_status_${userId}`;
      const lastStateStr = localStorage.getItem(storageKey);
      const lastState = lastStateStr ? JSON.parse(lastStateStr) : {};

      // Fetch current orders for user
      const { data: orders } = await supabase
        .from('orders')
        .select('id, order_number, status')
        .eq('user_id', userId);

      if (!orders) return;

      const newState: Record<string, string> = {};
      
      orders.forEach(order => {
        newState[order.id] = order.status;
        
        // If we have a previous state and the status has changed
        if (lastState[order.id] && lastState[order.id] !== order.status) {
          // Status has changed! Let's notify.
          this.notifyOrderStatusChange(order.order_number, order.status);
        }
      });

      // Save new state
      localStorage.setItem(storageKey, JSON.stringify(newState));
    } catch (e) {
      console.error('Error checking order status changes:', e);
    }
  },

  notifyOrderStatusChange(orderNumber: string, newStatus: string) {
    let title = `Mise à jour commande ${orderNumber}`;
    let body = `Votre commande a été mise à jour.`;

    switch (newStatus) {
      case 'confirmed':
        title = `Commande Confirmée 🎉`;
        body = `Votre commande ${orderNumber} est en cours de préparation.`;
        break;
      case 'shipped':
        title = `Commande Expédiée 🚚`;
        body = `Votre commande ${orderNumber} est en route vers vous !`;
        break;
      case 'delivered':
        title = `Commande Livrée 📦`;
        body = `Votre commande ${orderNumber} a été livrée. Merci de votre confiance !`;
        break;
      case 'cancelled':
        title = `Commande Annulée ❌`;
        body = `Votre commande ${orderNumber} a été annulée.`;
        break;
    }

    this.schedule(title, body, parseInt(orderNumber.replace(/\D/g, '').slice(-5)) || new Date().getTime());
  }
};
