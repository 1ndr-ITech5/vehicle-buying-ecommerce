import React from 'react';
import './../compstyle/Footer.css';
import sponsor1 from './../assets/sponsor1.jpg';
import sponsor2 from './../assets/sponsor2.png';

function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-section social">
          <h3>Follow Us</h3>
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
          <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-tiktok"></i></a>
          <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube"></i></a>
        </div>
        <div className="footer-section contact">
          <h3>Contact Us</h3>
          <p>Email: contact@autoshqip.com</p>
          <p>Phone: +355 69 123 4567</p>
        </div>
        <div className="footer-section sponsors">
          <h3>Our Sponsors</h3>
          <img src={sponsor1} alt="Sponsor 1" />
          <img src={sponsor2} alt="Sponsor 2" />
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 AutoShqip. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
