import "./Hero.css";
import { FiChevronDown } from "react-icons/fi";
import heroImage from "../../../../assets/images/Hero.png";
import HeartIcon from '../../../../components/ui/HeartIcon'

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
        <h1>Chá</h1>
        <h1>Casa Nova</h1>

        <h2>Beatriz & Guilherme</h2>

        <span>01 de Abril de 2027</span>

        <div className="hero-divider">
          <span className="line"></span>

          <HeartIcon className="heart" />

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
