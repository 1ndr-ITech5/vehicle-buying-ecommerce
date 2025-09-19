import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopHeader from "./components/TopHeader";
import Header from "./components/Header";
import Home from "./pages/Home";
import VehicleAds from "./pages/VehicleAds";
import Spare from "./pages/Spare";
import MyAcc from "./pages/MyAcc";
import SavedItems from "./pages/SavedItems";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      
        <div>
          <TopHeader />
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vehicle-ads" element={<VehicleAds />} />
            <Route path="/spare-parts" element={<Spare />} />
            <Route path="/my-account" element={<MyAcc />} />
            <Route path="/saved-items" element={<SavedItems />} />
          </Routes>
          <Footer />
        </div>
      
    </Router>
  );
}

export default App;