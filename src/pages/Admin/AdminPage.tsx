import { useCallback, useEffect, useState } from 'react'
import { FiCheck, FiEdit2, FiLogOut, FiRefreshCw, FiTrash2 } from 'react-icons/fi'

import { supabase } from '../../lib/supabase'
import './AdminPage.css'

interface Guest {
  id: string
  name: string
  created_at: string
}

interface PixRequest {
  id: string
  product_name: string
  quota_value: number | string
  status: 'pendente'
  created_at: string
}

interface GiftSummary {
  id: number
  name: string
  quotas: number
  purchased_quotas: number
}

const formatCurrency = (value: number | string) => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const formatDate = (value: string) => new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

function AdminPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [guests, setGuests] = useState<Guest[]>([])
  const [pixRequests, setPixRequests] = useState<PixRequest[]>([])
  const [giftSummary, setGiftSummary] = useState<GiftSummary[]>([])

  const loadDashboard = useCallback(async () => {
    if (!supabase) return

    const [guestsResult, requestsResult, giftsResult] = await Promise.all([
      supabase.rpc('admin_list_guest_rsvps'),
      supabase.rpc('admin_list_pending_pix_payment_requests'),
      supabase.rpc('admin_list_gift_quota_summary'),
    ])

    const requestError = guestsResult.error ?? requestsResult.error ?? giftsResult.error
    if (requestError) {
      setError('Não foi possível carregar os dados administrativos.')
      return
    }

    setGuests((guestsResult.data ?? []) as Guest[])
    setPixRequests((requestsResult.data ?? []) as PixRequest[])
    setGiftSummary((giftsResult.data ?? []) as GiftSummary[])
  }, [])

  const validateSession = useCallback(async () => {
    if (!supabase) {
      setError('O Supabase não está configurado neste site.')
      setIsLoading(false)
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setIsAuthorized(false)
      setIsLoading(false)
      return
    }

    const { data: authorized, error: authorizationError } = await supabase.rpc('is_site_admin')
    if (authorizationError || !authorized) {
      await supabase.auth.signOut()
      setError('Esta conta não tem acesso à administração.')
      setIsAuthorized(false)
      setIsLoading(false)
      return
    }

    setIsAuthorized(true)
    setIsLoading(false)
    await loadDashboard()
  }, [loadDashboard])

  useEffect(() => {
    void validateSession()
  }, [validateSession])

  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase) return

    setIsSubmitting(true)
    setError('')
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError('E-mail ou senha inválidos.')
      setIsSubmitting(false)
      return
    }

    await validateSession()
    setIsSubmitting(false)
  }

  const editGuest = async (guest: Guest) => {
    const name = window.prompt('Nome do convidado:', guest.name)?.trim()
    if (!name || name === guest.name || !supabase) return

    const { error: updateError } = await supabase.rpc('admin_update_guest_rsvp', { p_guest_id: guest.id, p_name: name })
    if (updateError) setError('Não foi possível editar o convidado.')
    else await loadDashboard()
  }

  const deleteGuest = async (guest: Guest) => {
    if (!supabase || !window.confirm(`Excluir a confirmação de presença de ${guest.name}?`)) return

    const { error: deleteError } = await supabase.rpc('admin_delete_guest_rsvp', { p_guest_id: guest.id })
    if (deleteError) setError('Não foi possível excluir o convidado.')
    else await loadDashboard()
  }

  const confirmQuota = async (request: PixRequest) => {
    if (!supabase || !window.confirm(`Confirmar o Pix de ${request.product_name}? A cota será adicionada ao presente.`)) return

    const { error: confirmError } = await supabase.rpc('admin_confirm_pix_payment_request', { p_request_id: request.id })
    if (confirmError) setError(confirmError.message.includes('Todas as cotas') ? confirmError.message : 'Não foi possível confirmar esta cota.')
    else await loadDashboard()
  }

  const deleteQuota = async (request: PixRequest) => {
    if (!supabase || !window.confirm(`Excluir a solicitação pendente de ${request.product_name}?`)) return

    const { error: deleteError } = await supabase.rpc('admin_delete_pix_payment_request', { p_request_id: request.id })
    if (deleteError) setError('Não foi possível excluir esta solicitação.')
    else await loadDashboard()
  }

  const logout = async () => {
    await supabase?.auth.signOut()
    setIsAuthorized(false)
    setGuests([])
    setPixRequests([])
    setGiftSummary([])
  }

  if (isLoading) return <main className="admin-loading">Carregando administração…</main>

  if (!isAuthorized) {
    return (
      <main className="admin-login-page">
        <form className="admin-login-card" onSubmit={login}>
          <p className="admin-eyebrow">Área restrita</p>
          <h1>Administração do chá</h1>
          <p>Entre para acompanhar presenças e confirmações de Pix.</p>
          <label htmlFor="admin-email">E-mail</label>
          <input id="admin-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
          <label htmlFor="admin-password">Senha</label>
          <input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
          <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Entrando…' : 'Entrar'}</button>
          {error && <p className="admin-error" role="alert">{error}</p>}
        </form>
      </main>
    )
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">Área restrita</p>
          <h1>Olá, casal! ☕</h1>
          <p>Acompanhem com carinho cada confirmação do chá de casa nova.</p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-icon-button" type="button" onClick={() => void loadDashboard()} aria-label="Atualizar dados"><FiRefreshCw /></button>
          <button className="admin-logout" type="button" onClick={() => void logout()}><FiLogOut /> Sair</button>
        </div>
      </header>

      {error && <p className="admin-error admin-page-error" role="alert">{error}</p>}

      <section className="admin-section">
        <div className="admin-section-heading"><div><p className="admin-eyebrow">Presenças confirmadas</p><h2>Quem vai celebrar com vocês</h2></div><span>{guests.length}</span></div>
        {guests.length ? (
          <div className="admin-list">
            {guests.map((guest) => <article className="admin-row" key={guest.id}><div><h3>{guest.name}</h3><p>Confirmado em {formatDate(guest.created_at)}</p></div><div className="admin-row-actions"><button type="button" onClick={() => void editGuest(guest)}><FiEdit2 /> Editar</button><button className="danger" type="button" onClick={() => void deleteGuest(guest)}><FiTrash2 /> Excluir</button></div></article>)}
          </div>
        ) : <p className="admin-empty">Nenhuma presença confirmada por enquanto.</p>}
      </section>

      <section className="admin-section">
        <div className="admin-section-heading"><div><p className="admin-eyebrow">Pagamentos</p><h2>Cotas pendentes de confirmação</h2></div><span>{pixRequests.length}</span></div>
        {pixRequests.length ? (
          <div className="admin-list">
            {pixRequests.map((request) => <article className="admin-row" key={request.id}><div><h3>{request.product_name}</h3><p>{formatCurrency(request.quota_value)} · Solicitado em {formatDate(request.created_at)}</p></div><div className="admin-row-actions"><button className="confirm" type="button" onClick={() => void confirmQuota(request)}><FiCheck /> Confirmar cota</button><button className="danger" type="button" onClick={() => void deleteQuota(request)}><FiTrash2 /> Excluir cota</button></div></article>)}
          </div>
        ) : <p className="admin-empty">Nenhuma cota aguardando confirmação.</p>}
      </section>

      <section className="admin-section">
        <div className="admin-section-heading"><div><p className="admin-eyebrow">Lista de presentes</p><h2>Cotas já compradas</h2></div></div>
        <div className="admin-gift-grid">
          {giftSummary.map((gift) => <article className="admin-gift-card" key={gift.id}><h3>{gift.name}</h3><strong>{gift.purchased_quotas}<small> / {gift.quotas} cotas</small></strong><div><span style={{ width: `${(gift.purchased_quotas / gift.quotas) * 100}%` }} /></div></article>)}
        </div>
      </section>
    </main>
  )
}

export default AdminPage
