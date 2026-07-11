import './App.css'

import Header from './components/Header/Header.tsx'
import Hero from './components/Hero/Hero.tsx'
import Countdown from './components/Countdown/Countdown.tsx'
import About from './components/About/About.tsx'
import Features from './components/Features/Features.tsx'
import Gallery from './components/Gallery/Gallery.tsx'
import Quote from './components/Quote/Quote.tsx'
import Footer from './components/Footer/Footer.tsx'

function App() {

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

export default App
