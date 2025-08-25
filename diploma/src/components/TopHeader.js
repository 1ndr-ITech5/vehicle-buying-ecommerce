import { useState } from "react";
import { Link } from "react-router-dom"; // ✅ import Link
import "./../compstyle/TopHeader.css";

export default function TopHeader() {
  const [language, setLanguage] = useState("AL");
  const [open, setOpen] = useState(false);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setOpen(false);
  };

  return (
    <div className="top-header">
      <div className="top-header-container">
        {/* Left side - Login */}
        <Link to="/my-account" className="login-link">
          Log in
        </Link>

        {/* Language selector */}
        <div className="language-selector">
          <button
            className="lang-btn"
            onClick={() => setOpen(!open)}
          >
            <img
              src={
                language === "AL"
                  ? "https://flagcdn.com/w20/al.png"
                  : "https://flagcdn.com/w20/gb.png"
              }
              alt="flag"
            />
            <span>{language === "AL" ? "Shqip" : "English"}</span>
            <i className={`fas fa-chevron-down arrow ${open ? "up" : ""}`}></i>
          </button>

          {open && (
            <div className="dropdown">
              <button
                onClick={() => handleLanguageChange("AL")}
                className="dropdown-item"
              >
                <img
                  src="https://flagcdn.com/w20/al.png"
                  alt="Albanian flag"
                />
                Shqip
              </button>
              <button
                onClick={() => handleLanguageChange("EN")}
                className="dropdown-item"
              >
                <img
                  src="https://flagcdn.com/w20/gb.png"
                  alt="English flag"
                />
                English
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}