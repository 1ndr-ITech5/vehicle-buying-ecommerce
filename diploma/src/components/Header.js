import React from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/logo.jpg";
import "./../compstyle/Header.css";

export default function Header() {
  return (
    <nav className="main-header">
      <div className="logo">
        <img src={logo} alt="AutoShqip Logo" />
        <span className="autoshqip-title">AutoShqip</span>
      </div>

      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>Home</NavLink>
        <NavLink to="/vehicle-ads" className={({ isActive }) => (isActive ? "active" : "")}>Vehicle Ads</NavLink>
        <NavLink to="/spare-parts" className={({ isActive }) => (isActive ? "active" : "")}>Automotive Parts</NavLink>
        <NavLink to="/my-account" className={({ isActive }) => (isActive ? "active" : "")}>My Account</NavLink>
      </div>
    </nav>
  );
}