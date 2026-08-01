import Footer from '../../components/layout/footer/Footer'
import Header from '../../components/layout/header/Header'
import About from '../../features/home/components/about/About'
import Countdown from '../../features/home/components/countdown/Countdown'
import Features from '../../features/home/components/features/Features'
import Gallery from '../../features/home/components/gallery/Gallery'
import Hero from '../../features/home/components/hero/Hero'
import Quote from '../../features/home/components/quote/Quote'

function HomePage() {

  return (
    <>
      <Header />
      <Hero />
      <Countdown />
      <About />
      <Features/>
      <Gallery/>
      <Quote/>
      <Footer/>
    </>
  )
}

export default HomePage
