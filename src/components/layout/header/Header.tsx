import "./Header.css";

import { Link } from "react-router-dom";
import HeartIcon from '../../ui/HeartIcon'

function Header() {
  return (
    <header className="header">

      <Link to="/" className="logo">
        <HeartIcon />
      </Link>

      <nav className="menu">
        <Link to="/">Início</Link>
        <Link to="/gifts">Presentes</Link>
      </nav>

      <button className="btn-confirmar">
        Confirmar Presença
      </button>

    </header>
  );
}

export default Header;
