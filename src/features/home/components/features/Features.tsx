import './Features.css'


import {
  FiCalendar,
  FiCoffee,
  FiHome,
} from "react-icons/fi";

import { LuPlane } from "react-icons/lu";

const Features = () => {
  return (
    <section className="features">

      <div className="feature-item">
        <FiCalendar className="feature-icon" />

        <h3>JUNTOS DESDE</h3>

        <span>2020</span>
      </div>

      <div className="feature-item">
        <LuPlane className="feature-icon" />

        <h3>AMANTES DE</h3>

        <span>VIAGEM</span>
      </div>

      <div className="feature-item">
        <FiCoffee className="feature-icon" />

        <h3>CAFÉ, FILMES E</h3>

        <span>BONS VINHOS</span>
      </div>

      <div className="feature-item">
        <FiHome className="feature-icon" />

        <h3>CONSTRUINDO</h3>

        <span>NOSSO LAR</span>
      </div>

    </section>
  )
}

export default Features
