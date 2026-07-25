import "./Header.css";
import { FiHeart } from "react-icons/fi";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="header">

      <Link to="/" className="logo">
        <FiHeart />
      </Link>

      <nav className="menu">
        <Link to="/">Início</Link>
        <Link to="/Gifts">Presentes</Link>
      </nav>

      <button className="btn-confirmar">
        Confirmar Presença
      </button>

    </header>
  );
}

export default Header;