import './Features.css'


import {
  FiFilm,
} from "react-icons/fi";

import { FaDice } from "react-icons/fa";
import { LuBlocks, LuPlane } from "react-icons/lu";

const Features = () => {
  return (
    <section className="features">
      <div className="features-heading">
        <p>As pequenas coisas que amamos fazer juntos</p>
        <h2>Amantes de</h2>
      </div>

      <div className="features-list">
      <div className="feature-item">
        <div className="feature-icon-wrap"><FiFilm className="feature-icon" /></div>
        <span>VER FILMES</span>
      </div>

      <div className="feature-item">
        <div className="feature-icon-wrap"><LuPlane className="feature-icon" /></div>
        <span>VIAJAR</span>
      </div>

      <div className="feature-item">
        <div className="feature-icon-wrap"><LuBlocks className="feature-icon" /></div>
        <span>LEGOS</span>
      </div>

      <div className="feature-item">
        <div className="feature-icon-wrap"><FaDice className="feature-icon" /></div>
        <span>JOGOS DE TABULEIRO</span>
      </div>
      </div>

    </section>
  )
}

export default Features
