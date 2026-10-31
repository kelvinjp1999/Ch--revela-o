import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char] ?? char))

serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return Response.json({ error: 'Método não permitido' }, { status: 405, headers: corsHeaders })

  const apiKey = Deno.env.get('RESEND_API_KEY')
  const to = Deno.env.get('ADMIN_NOTIFICATION_EMAIL')
  const from = Deno.env.get('MAIL_FROM') ?? Deno.env.get('RESEND_FROM_EMAIL')
  if (!apiKey || !to || !from) {
    return Response.json({ error: 'Configuração de e-mail ausente' }, { status: 500, headers: corsHeaders })
  }

  let payload: Record<string, unknown>
  try {
    payload = await request.json()
  } catch {
    return Response.json({ error: 'Conteúdo inválido' }, { status: 400, headers: corsHeaders })
  }

  const adminUrl = typeof payload.adminUrl === 'string' ? payload.adminUrl : ''
  const siteUrl = Deno.env.get('SITE_URL')
  let validAdminUrl = false
  try {
    const parsedAdminUrl = new URL(adminUrl)
    const parsedSiteUrl = new URL(siteUrl ?? '')
    validAdminUrl = parsedAdminUrl.origin === parsedSiteUrl.origin && parsedAdminUrl.pathname === '/admin'
  } catch {
    validAdminUrl = false
  }
  if (!validAdminUrl) {
    return Response.json({ error: 'Link administrativo inválido' }, { status: 400, headers: corsHeaders })
  }

  let subject: string
  let details: string
  if (payload.type === 'presence' && typeof payload.name === 'string' && payload.name.trim() && typeof payload.id === 'string') {
    subject = 'Nova confirmação de presença'
    details = `<p><strong>${escapeHtml(payload.name.trim())}</strong> confirmou presença no chá de casa nova.</p>`
  } else if (payload.type === 'quota' && typeof payload.productName === 'string' && typeof payload.value === 'number' && typeof payload.id === 'string') {
    subject = 'Nova cota aguardando confirmação'
    details = `<p>Uma solicitação de cota para <strong>${escapeHtml(payload.productName)}</strong> foi recebida.</p><p>Valor: ${payload.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>`
  } else {
    return Response.json({ error: 'Notificação inválida' }, { status: 400, headers: corsHeaders })
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html: `${details}<p><a href="${escapeHtml(adminUrl)}">Abrir administração</a></p>`,
    }),
  })

  if (!response.ok) return Response.json({ error: 'Falha ao enviar o e-mail' }, { status: 502, headers: corsHeaders })
  return Response.json({ sent: true }, { headers: corsHeaders })
})
