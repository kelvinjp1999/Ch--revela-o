import "./Quote.css";
import { FiHeart } from "react-icons/fi";
import { FaQuoteLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

function Quote() {
  return (
    <section className="quote">

      <FaQuoteLeft className="quote-icon" />

      <h2>Lar é onde o amor está</h2>

      <FiHeart className="quote-heart" />

      <p>Obrigada por fazer parte dessa história!</p>

      <Link to="/Gifts">
        <button className="quote-button">
          VER LISTA DE PRESENTES
        </button>
      </Link>

    </section>
  );
}

export default Quote;