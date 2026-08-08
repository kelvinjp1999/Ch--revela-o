import { useEffect, useState } from 'react'
import { FiCheck, FiClipboard, FiCoffee, FiCpu, FiGrid, FiHome, FiShield, FiX } from 'react-icons/fi'

import Footer from '../../components/layout/footer/Footer'
import Header from '../../components/layout/header/Header'
import GiftsHero from '../../features/gifts/components/gifts-hero/GiftsHero'
import { gifts, type Gift, type GiftCategory } from '../../features/gifts/data/gifts'
import HeartIcon from '../../components/ui/HeartIcon'
import { supabase } from '../../lib/supabase'
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
  const pixCode = '00020101021226850014br.gov.bcb.pix2563pix.ficticio.chacasanova.com.br/cobv/abc123520400005303986540520.005802BR5922Beatriz e Guilherme6009Sao Paulo62070503***6304FAKE'

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
    if (!selectedGift || !supabase) return

    setIsSubmitting(true)
    setPixError('')
    const { error } = selectedGift.id === 0
      ? await supabase.rpc('create_free_contribution')
      : await supabase.rpc('reserve_gift_quota', { p_gift_id: selectedGift.id })
    setIsSubmitting(false)

    if (error) {
      setPixError(error.message.includes('Todas as cotas') ? error.message : 'Não foi possível registrar sua contribuição. Tente novamente.')
      return
    }

    if (selectedGift.id !== 0) {
      setStoredGifts((currentGifts) => currentGifts.map((gift) => (
        gift.id === selectedGift.id ? { ...gift, purchasedQuotas: gift.purchasedQuotas + 1 } : gift
      )))
    }
    setIsPixConfirmed(true)
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
                <p className="pix-kicker">Pagamento sinalizado</p>
                <h2 id="pix-modal-title">Obrigada por fazer parte do nosso lar!</h2>
                <p>Assim que o Pix for identificado, a sua cota de <strong>{selectedGift.name}</strong> será reservada com carinho.</p>
                <button type="button" className="pix-confirm-button" onClick={closePixModal}>Que alegria!</button>
              </div>
            ) : (
              <>
                <span className="pix-icon"><FiCoffee /></span>
                <p className="pix-kicker">Uma cota cheia de carinho</p>
                <h2 id="pix-modal-title">{selectedGift.name}</h2>
                <p className="pix-description">Copie o código Pix abaixo para nos ajudar a deixar o novo lar ainda mais especial.</p>

                <div className="pix-code-box">
                  <span>{pixCode}</span>
                  <button type="button" onClick={copyPixCode} aria-label="Copiar código Pix">
                    {hasCopied ? <FiCheck /> : <FiClipboard />}
                    {hasCopied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>

                <p className="pix-security"><FiShield aria-hidden="true" /> Código fictício para demonstração</p>
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
