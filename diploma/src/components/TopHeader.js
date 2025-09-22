import { useState } from "react";
import { Link } from "react-router-dom";
import "./../compstyle/TopHeader.css";
import { useTranslation } from "react-i18next";

export default function TopHeader() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    setOpen(false);
  };

  return (
    <div className="top-header">
      <div className="top-header-container">
        {/* Left side - Login */}
        <Link to="/my-account" className="login-link">
          {t('login')}
        </Link>

        {/* Language selector */}
        <div className="language-selector">
          <button
            className="lang-btn"
            onClick={() => setOpen(!open)}
          >
            <img
              src={
                i18n.language === "al"
                  ? "https://flagcdn.com/w20/al.png"
                  : "https://flagcdn.com/w20/gb.png"
              }
              alt="flag"
            />
            <span>{i18n.language === "al" ?  t("shqip") : t("english")}</span>
            <i className={`fas fa-chevron-down arrow ${open ? "up" : ""}`}></i>
          </button>

          {open && (
            <div className="dropdown">
              <button
                onClick={() => handleLanguageChange("al")}
                className="dropdown-item"
              >
                <img
                  src="https://flagcdn.com/w20/al.png"
                  alt="Albanian flag"
                />
                {t('shqip')}
              </button>
              <button
                onClick={() => handleLanguageChange("en")}
                className="dropdown-item"
              >
                <img
                  src="https://flagcdn.com/w20/gb.png"
                  alt="English flag"
                />
                {t('english')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}