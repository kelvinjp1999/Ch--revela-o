import { supabase } from './supabase'

export type AdminNotification =
  | { type: 'presence'; name: string; id: string }
  | { type: 'quota'; productName: string; value: number; id: string }

export async function notifyAdmin(notification: AdminNotification) {
  if (!supabase) return false

  const { error } = await supabase.functions.invoke('send-admin-notification', {
    body: {
      ...notification,
      adminUrl: `${window.location.origin}/admin${notification.type === 'quota' ? `#pix-${notification.id}` : ''}`,
    },
  })

  return !error
}
