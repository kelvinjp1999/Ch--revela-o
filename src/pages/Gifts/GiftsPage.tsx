import { useEffect, useState } from 'react'
import { FiCheck, FiClipboard, FiCoffee, FiCpu, FiGrid, FiHome, FiShield, FiX } from 'react-icons/fi'

import Footer from '../../components/layout/footer/Footer'
import Header from '../../components/layout/header/Header'
import GiftsHero from '../../features/gifts/components/gifts-hero/GiftsHero'
import { gifts, type Gift, type GiftCategory } from '../../features/gifts/data/gifts'
import HeartIcon from '../../components/ui/HeartIcon'
import { supabase } from '../../lib/supabase'
import pixQrCode from '../../assets/images/pix-qr-code.png'
import './GiftsPage.css'

const categories = [
  { id: 'todos', label: 'Todos', icon: FiGrid },
  { id: 'cozinha', label: 'Cozinha', icon: FiCoffee },
  { id: 'eletros', label: 'Eletros', icon: FiCpu },
  { id: 'casa', label: 'Casa', icon: FiHome },
] as const

const freeContribution: Gift = {
  id: 0,
  name: 'Contribuição livre',
  category: 'casa',
  price: 0,
  quotas: 1,
  purchasedQuotas: 0,
  image: '',
}

interface DatabaseGift {
  id: number
  name: string
  category: string
  price: number | string
  quotas: number
  purchased_quotas: number
  image: string
}

function GiftsPage() {
  const [category, setCategory] = useState<GiftCategory | 'todos'>('todos')
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null)
  const [hasCopied, setHasCopied] = useState(false)
  const [isPixConfirmed, setIsPixConfirmed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pixError, setPixError] = useState('')
  const [storedGifts, setStoredGifts] = useState<Gift[]>(gifts)
  const [giftsLoadError, setGiftsLoadError] = useState('')
  const visibleGifts = category === 'todos' ? storedGifts : storedGifts.filter((gift) => gift.category === category)
  const pixCode = '00020101021126580014br.gov.bcb.pix0136333f7cc1-0e15-46ce-ae76-11f494d4766f5204000053039865802BR5921BEATRIZ T DE CARVALHO6013SAO JOSE DOS 62070503***63045CBB'

  const closePixModal = () => {
    setSelectedGift(null)
    setHasCopied(false)
    setIsPixConfirmed(false)
  }

  const openPixModal = (gift: Gift) => {
    setSelectedGift(gift)
    setHasCopied(false)
    setIsPixConfirmed(false)
    setPixError('')
  }

  const copyPixCode = async () => {
    await navigator.clipboard?.writeText(pixCode)
    setHasCopied(true)
  }

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePixModal()
    }

    if (selectedGift) document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [selectedGift])

  useEffect(() => {
    const client = supabase
    if (!client) return

    const loadGifts = async () => {
      const { data, error } = await client.rpc('list_gifts')

      if (error || !data) {
        setGiftsLoadError('Não foi possível atualizar as cotas agora.')
        return
      }

      const giftsFromDatabase = (data as DatabaseGift[]).map((gift) => ({
          id: gift.id,
          name: gift.name,
          category: gift.category as GiftCategory,
          price: Number(gift.price),
          quotas: gift.quotas,
          purchasedQuotas: gift.purchased_quotas,
          image: gift.image,
        }))

      setStoredGifts(giftsFromDatabase)
      setGiftsLoadError('')
    }

    void loadGifts()

    const giftsChannel = client
      .channel('gift-quotas')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'gifts' }, () => {
        void loadGifts()
      })
      .subscribe()

    return () => {
      void client.removeChannel(giftsChannel)
    }
  }, [])

  const confirmPix = async () => {
    if (!selectedGift) return

    if (!supabase) {
      setPixError('O pagamento não está configurado neste site. Tente novamente após a publicação ser atualizada.')
      return
    }

    setIsSubmitting(true)
    setPixError('')
    try {
      const { error } = selectedGift.id === 0
        ? await supabase.rpc('create_free_contribution')
        : await supabase.rpc('create_pix_payment_request', { p_gift_id: selectedGift.id })

      if (error) {
        setPixError(error.message.includes('Todas as cotas') ? error.message : 'Não foi possível registrar sua contribuição. Tente novamente.')
        return
      }

      setIsPixConfirmed(true)
    } catch {
      setPixError('Não foi possível registrar sua contribuição. Verifique sua conexão e tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <GiftsHero />

      <section className="gift-container">
        {giftsLoadError && <p className="gifts-load-error" role="alert">{giftsLoadError}</p>}
        <div className="gift-categories">
          {categories.map(({ id, label, icon: Icon }) => (
            <button
              className={category === id ? 'active' : ''}
              key={id}
              onClick={() => setCategory(id)}
              type="button"
            >
              <Icon />
              {label.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="gift-grid">
          {visibleGifts.map((gift) => (
            <article className="gift-card" key={gift.id}>
              <img alt={gift.name} src={gift.image} />

              <div className="gift-content">
                <h2>{gift.name}</h2>
                <span className="price">R$ {gift.price.toFixed(2)}</span>

                <div className="gift-progress">
                  <span>{gift.purchasedQuotas}/{gift.quotas} cotas</span>
                  <div className="progress">
                    <div
                      className="progress-fill"
                      style={{ width: `${(gift.purchasedQuotas / gift.quotas) * 100}%` }}
                    />
                  </div>
                </div>

                <button type="button" onClick={() => openPixModal(gift)}>ESCOLHER COTA</button>
              </div>
            </article>
          ))}
        </div>

        <div className="free-card">
          <HeartIcon className="free-card-heart" />
          <div>
            <h2>Prefere contribuir com um valor livre?</h2>
            <p>Qualquer contribuição será muito bem-vinda para nos ajudar a construir nosso novo lar.</p>
          </div>
          <button type="button" onClick={() => openPixModal(freeContribution)}>CONTRIBUIR</button>
        </div>
      </section>

      {selectedGift && (
        <div
          className="pix-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePixModal()
          }}
        >
          <section className="pix-modal" role="dialog" aria-modal="true" aria-labelledby="pix-modal-title">
            <button className="pix-close" type="button" onClick={closePixModal} aria-label="Fechar pagamento Pix"><FiX /></button>

            {isPixConfirmed ? (
              <div className="pix-success">
                <span className="pix-icon"><FiCheck /></span>
                <p className="pix-kicker">Pedido recebido</p>
                <h2 id="pix-modal-title">Que alegria ter você com a gente!</h2>
                <p>
                  Obrigada pela contribuição. Assim que o Pix for confirmado, sua cota de
                  {' '}<strong>{selectedGift.name}</strong> entrará na nossa lista de presentes.
                </p>
                <p className="pix-success-note">Seu apoio já deixou nosso novo lar ainda mais especial. 💛</p>
                <button type="button" className="pix-confirm-button" onClick={closePixModal}>Com carinho!</button>
              </div>
            ) : (
              <>
                <span className="pix-icon"><FiCoffee /></span>
                <p className="pix-kicker">Uma cota cheia de carinho</p>
                <h2 id="pix-modal-title">{selectedGift.name}</h2>
                <p className="pix-description">Escaneie o QR code ou copie a chave Pix abaixo para contribuir.</p>

                <img className="pix-qr-code" src={pixQrCode} alt="QR code para pagamento via Pix" />

                <div className="pix-code-box">
                  <span>{pixCode}</span>
                  <button type="button" onClick={copyPixCode} aria-label="Copiar código Pix">
                    {hasCopied ? <FiCheck /> : <FiClipboard />}
                    {hasCopied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>

                <p className="pix-security"><FiShield aria-hidden="true" /> Pagamento seguro via Pix</p>
                <div className="pix-actions">
                  <button type="button" className="pix-cancel-button" onClick={closePixModal}>Cancelar</button>
                  <button type="button" className="pix-confirm-button" onClick={confirmPix} disabled={isSubmitting}>
                    {isSubmitting ? 'Registrando...' : <>Confirmar Pix <FiCheck /></>}
                  </button>
                </div>
                {pixError && <p className="pix-error" role="alert">{pixError}</p>}
              </>
            )}
          </section>
        </div>
      )}

      <Footer />
    </>
  )
}

export default GiftsPage
