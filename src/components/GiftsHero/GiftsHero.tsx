import "./GiftsHero.css";
import { FiHeart } from "react-icons/fi";

function GiftsHero() {
  return (
    <section className="giftsHero">

      <FiHeart className="giftsHero-icon" />

      <h1 className="giftsHero-title">
        Nossos presentes
      </h1>

      <p className="giftsHero-text">
        Escolha um presente ou contribua com uma cota.
        Assim, você nos ajuda a construir nosso novo lar!
      </p>

    </section>
  );
}

export default GiftsHero;