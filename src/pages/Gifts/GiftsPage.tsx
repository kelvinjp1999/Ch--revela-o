import { useState } from 'react'
import { FiCoffee, FiCpu, FiGrid, FiHome } from 'react-icons/fi'

import Footer from '../../components/layout/footer/Footer'
import Header from '../../components/layout/header/Header'
import GiftsHero from '../../features/gifts/components/gifts-hero/GiftsHero'
import { gifts, type GiftCategory } from '../../features/gifts/data/gifts'
import HeartIcon from '../../components/ui/HeartIcon'
import './GiftsPage.css'

const categories = [
  { id: 'todos', label: 'Todos', icon: FiGrid },
  { id: 'cozinha', label: 'Cozinha', icon: FiCoffee },
  { id: 'eletros', label: 'Eletros', icon: FiCpu },
  { id: 'casa', label: 'Casa', icon: FiHome },
] as const

function GiftsPage() {
  const [category, setCategory] = useState<GiftCategory | 'todos'>('todos')
  const visibleGifts = category === 'todos' ? gifts : gifts.filter((gift) => gift.category === category)

  return (
    <>
      <Header />
      <GiftsHero />

      <section className="gift-container">
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

                <button type="button">ESCOLHER COTA</button>
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
          <button type="button">CONTRIBUIR</button>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default GiftsPage
