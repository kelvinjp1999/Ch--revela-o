import "./Quote.css";

import { FaQuoteLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import HeartIcon from '../../../../components/ui/HeartIcon'

function Quote() {
  return (
    <section className="quote">

      <FaQuoteLeft className="quote-icon" />

      <h2>Lar é onde o amor está</h2>

      <HeartIcon className="quote-heart" />

      <p>Obrigada por fazer parte dessa história!</p>

      <Link to="/gifts">
        <button className="quote-button">
          VER LISTA DE PRESENTES
        </button>
      </Link>

    </section>
  );
}

export default Quote;
