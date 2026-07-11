import './Header.css'
import {FiHeart} from 'react-icons/fi'


function Header() {
    return(
        <header className="header">
            <div className="logo">
                <FiHeart/>
            </div>

            <nav className="menu">
                <a href="#">Inicio</a>
                <a href="#">Presentes</a>
            </nav>

            <button className="btn-confirmar">
                Confirmar Presença
            </button>
            
        </header>
    )
}

export default Header