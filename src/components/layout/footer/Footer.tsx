import "./Footer.css";



import { FiInstagram } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import HeartIcon from '../../ui/HeartIcon'


function Footer() {
  return (
    <footer className="footer">
      <svg aria-hidden="true" className="footer-wave" preserveAspectRatio="none" viewBox="0 0 720 230">
        <path d="M0 115C83 67 118 141 211 87C317 25 396 25 487 91C576 142 624 65 720 107V230H0Z" />
      </svg>

      <div className="footer-content">
        <h2 className="footer-monogram">
          <span>B &amp; G</span>
          <HeartIcon aria-hidden="true" title="" />
        </h2>
        
        <div className="footer-social">

          <a
            aria-label="Instagram"
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
          >
            <FiInstagram />
          </a>

          <a
            aria-label="WhatsApp"
            href="https://wa.me/5500000000000"
            target="_blank"
            rel="noreferrer"
          >
            <FaWhatsapp />
          </a>

        </div>
      </div>
    </footer>
  );
}

export default Footer;
