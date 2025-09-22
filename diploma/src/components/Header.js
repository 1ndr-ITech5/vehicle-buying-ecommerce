import React from "react";
import { NavLink, Link } from "react-router-dom";
import logo from "../assets/logo.jpg";
import "./../compstyle/Header.css";
import { useTranslation } from "react-i18next";

export default function Header() {
  const { t } = useTranslation();

  return (
    <nav className="main-header">
      <Link to="/" className="logo-link">
        <div className="logo">
          <img src={logo} alt="AutoShqip Logo" />
          <span className="autoshqip-title">AutoShqip</span>
        </div>
      </Link>

      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>{t('home')}</NavLink>
        <NavLink to="/vehicle-ads" className={({ isActive }) => (isActive ? "active" : "")}>{t('vehicle_ads')}</NavLink>
        <NavLink to="/spare-parts" className={({ isActive }) => (isActive ? "active" : "")}>{t('automotive_parts')}</NavLink>
        <NavLink to="/my-account" className={({ isActive }) => (isActive ? "active" : "")}>{t('my_account')}</NavLink>
      </div>
    </nav>
  );
}