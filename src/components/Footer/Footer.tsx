import "./Footer.css";


import { FiInstagram } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import {FiHeart} from 'react-icons/fi'

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-wave"></div>

    
        <h2>B & G</h2>
        
      <div className="footer-social">

        <a
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
        >
          <FiInstagram />
        </a>

        <a
          href="https://wa.me/5500000000000"
          target="_blank"
          rel="noreferrer"
        >
          <FaWhatsapp />
        </a>

      </div>

    </footer>
  );
}

export default Footer;