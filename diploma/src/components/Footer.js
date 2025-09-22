import React from 'react';
import './../compstyle/Footer.css';
import sponsor1 from './../assets/sponsor1.jpg';
import sponsor2 from './../assets/sponsor2.png';
import { useTranslation } from 'react-i18next';

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-section social">
          <h3>{t('follow_us')}</h3>
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
          <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-tiktok"></i></a>
          <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube"></i></a>
        </div>
        <div className="footer-section contact">
          <h3>{t('contact_us')}</h3>
          <p>Email: contact@autoshqip.com</p>
          <p>Phone: +355 69 836 9361</p>
        </div>
        <div className="footer-section sponsors">
          <h3>{t('our_sponsors')}</h3>
          <a href="https://www.shell.com/" target="_blank" rel="noopener noreferrer">
            <img src={sponsor1} alt="Sponsor 1" />
          </a>
          <a href="https://www.if-insurance.com/about-if" target="_blank" rel="noopener noreferrer">
            <img src={sponsor2} alt="Sponsor 2" />
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>{t('copyright')}</p>
      </div>
    </footer>
  );
}

export default Footer;