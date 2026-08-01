import "./GiftsHero.css";

import HeartIcon from '../../../../components/ui/HeartIcon'

function GiftsHero() {
  return (
    <section className="giftsHero">

      <HeartIcon className="giftsHero-icon" />

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
