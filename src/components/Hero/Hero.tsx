import "./Hero.css";
import { FiHeart, FiChevronDown } from "react-icons/fi";
import heroImage from "../../assets/images/Hero.png";

function Hero() {
  return (
    <section className="hero">
      <img
        src={heroImage}
        alt="Beatriz e Guilherme"
        className="hero-image"
      />

      <div className="hero-overlay"></div>

      <div className="hero-content">
        <h1>Chá de</h1>
        <h1>Panela</h1>

        <h2>Beatriz & Guilherme</h2>

        <span>01 de Abril de 2027</span>

        <div className="hero-divider">
          <span className="line"></span>

          <FiHeart className="heart" />

          <span className="line"></span>
        </div>

        <p>Um novo capítulo está começando</p>
        <p>E queremos que você faça parte dele!</p>

        <div className="scroll-down">
          <FiChevronDown />
        </div>
      </div>
    </section>
  );
}

export default Hero;