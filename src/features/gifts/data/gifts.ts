export type GiftCategory = 'cozinha' | 'eletros' | 'casa'

export interface Gift {
  id: number
  name: string
  category: GiftCategory
  price: number
  quotas: number
  purchasedQuotas: number
  image: string
}

export const gifts: Gift[] = [
  { id: 1, name: 'Air Fryer', category: 'eletros', price: 450, quotas: 5, purchasedQuotas: 0, image: 'https://picsum.photos/600/400?1' },
  { id: 2, name: 'Batedeira Planetária', category: 'eletros', price: 890, quotas: 6, purchasedQuotas: 2, image: 'https://picsum.photos/600/400?2' },
  { id: 3, name: 'Jogo de Panelas', category: 'cozinha', price: 650, quotas: 5, purchasedQuotas: 1, image: 'https://picsum.photos/600/400?3' },
  { id: 4, name: 'Liquidificador', category: 'cozinha', price: 320, quotas: 4, purchasedQuotas: 3, image: 'https://picsum.photos/600/400?4' },
  { id: 5, name: 'Aparelho de Jantar', category: 'casa', price: 580, quotas: 5, purchasedQuotas: 1, image: 'https://picsum.photos/600/400?5' },
  { id: 6, name: 'Robô Aspirador', category: 'casa', price: 1450, quotas: 10, purchasedQuotas: 5, image: 'https://picsum.photos/600/400?6' },
]
