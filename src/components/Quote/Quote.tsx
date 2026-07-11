import "./Quote.css";
import { FiHeart } from "react-icons/fi";
import { FaQuoteLeft } from "react-icons/fa";

function Quote() {
  return (
    <section className="quote">

      <FaQuoteLeft className="quote-icon" />

      <h2>Lar é onde o amor está</h2>

      <FiHeart className="quote-heart" />

      <p>Obrigada por fazer parte dessa história!</p>

      <button className="quote-button">
        VER LISTA DE PRESENTES
      </button>

    </section>
  );
}

export default Quote;