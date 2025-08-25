import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './../pagestyle/VehicleAds.css';

const API_URL = 'http://localhost:3001/api';

const VehicleAds = () => {
  const [activeVehicleCategory, setActiveVehicleCategory] = useState('car');
  const [filters, setFilters] = useState({ type: '', model: '', yearFrom: '', yearTo: '', priceFrom: '', priceTo: '', powerFrom: '', powerTo: '', mileageFrom: '', mileageTo: '', transmitor: '', fuel: '', colour: '', location: '' });
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [savedSearches, setSavedSearches] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const vehicleData = {
    car: { marks: ['Mercedes-Benz', 'BMW', 'Audi', 'Ford', 'Toyota', 'Renault', 'Volkswagen', 'Skoda'], models: { 'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class'], 'BMW': ['3 Series', '5 Series', 'X5'], 'Audi': ['A4', 'A6', 'Q7'], 'Ford': ['Focus', 'Fiesta', 'Mondeo'], 'Toyota': ['Corolla', 'Camry', 'RAV4'], 'Renault': ['Clio', 'Megane', 'Captur'], 'Volkswagen': ['Golf', 'Passat', 'Tiguan'], 'Skoda': ['Octavia', 'Superb', 'Kodiaq'] } },
    van: { marks: ['Mercedes-Benz', 'Fiat', 'Opel', 'Renault', 'Iveco'], models: { 'Mercedes-Benz': ['Sprinter', 'Vito'], 'Fiat': ['Ducato', 'Doblo'], 'Opel': ['Vivaro', 'Movano'], 'Renault': ['Trafic', 'Master'], 'Iveco': ['Daily'] } },
    motorcycle: { marks: ['Honda', 'Yamaha', 'Suzuki', 'Ducati', 'KTM'], models: { 'Honda': ['CBR', 'Africa Twin'], 'Yamaha': ['MT-07', 'R1'], 'Suzuki': ['GSX-R', 'V-Strom'], 'Ducati': ['Panigale', 'Monster'], 'KTM': ['Duke', 'Adventure'] } }
  };

  const transmitorOptions = ['Manual', 'Automatic', 'Semi-Automatic'];
  const fuelOptions = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
  const colourOptions = ['Black', 'White', 'Silver', 'Blue', 'Red', 'Green', 'Yellow'];
  const albanianCities = ['Tirana', 'Durres', 'Vlora', 'Shkoder', 'Fier', 'Korce', 'Elbasan', 'Berat', 'Lushnje', 'Kavaje', 'Gjirokaster', 'Sarande'];

  const fetchVehicles = async () => {
    try {
      const params = { ...filters, sortBy, vehicleCategory: activeVehicleCategory };
      const response = await axios.get(`${API_URL}/vehicles`, { params });
      setVehicles(response.data);
      setTotalPages(Math.ceil(response.data.length / 8));
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [sortBy, activeVehicleCategory]);

  useEffect(() => {
    const loadedSearches = JSON.parse(localStorage.getItem('vehicleSearches') || '[]');
    setSavedSearches(loadedSearches);
  }, []);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleVehicleCategoryChange = (category) => {
    setActiveVehicleCategory(category);
    setFilters(prev => ({ ...prev, type: '', model: '' }));
  };

  const handleSaveSearch = () => {
    const searchName = prompt("Enter a name for this search:");
    if (searchName) {
        const newSearch = { name: searchName, filters, vehicleCategory: activeVehicleCategory };
        const updatedSearches = [...savedSearches, newSearch];
        setSavedSearches(updatedSearches);
        localStorage.setItem('vehicleSearches', JSON.stringify(updatedSearches));
    }
  };

  const handleLoadSearch = (searchToLoad) => {
    setActiveVehicleCategory(searchToLoad.vehicleCategory);
    setFilters(searchToLoad.filters);
  };

  const handleDeleteSearch = (indexToDelete) => {
    const updatedSearches = savedSearches.filter((_, index) => index !== indexToDelete);
    setSavedSearches(updatedSearches);
    localStorage.setItem('vehicleSearches', JSON.stringify(updatedSearches));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="vehicle-ads-container">
      {!selectedVehicle ? (
        <div className="main-content">
          <div className="filters-section">
            <div className="vehicle-category-tabs">
                <button className={`category-tab ${activeVehicleCategory === 'car' ? 'active' : ''}`} onClick={() => handleVehicleCategoryChange('car')}>🚗 Car</button>
                <button className={`category-tab ${activeVehicleCategory === 'van' ? 'active' : ''}`} onClick={() => handleVehicleCategoryChange('van')}>🚐 Van</button>
                <button className={`category-tab ${activeVehicleCategory === 'motorcycle' ? 'active' : ''}`} onClick={() => handleVehicleCategoryChange('motorcycle')}>🏍️ Motorcycle</button>
            </div>
            <h2>Search Filters</h2>
            <div className="filter-group"><label>Mark</label><select value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)}><option value="">Select Mark</option>{vehicleData[activeVehicleCategory].marks.map(type => (<option key={type} value={type}>{type}</option>))}</select></div>
            <div className="filter-group"><label>Model</label><select value={filters.model} onChange={(e) => handleFilterChange('model', e.target.value)} disabled={!filters.type}><option value="">Select Model</option>{(vehicleData[activeVehicleCategory].models[filters.type] || []).map(model => (<option key={model} value={model}>{model}</option>))}</select></div>
            <div className="filter-group range-filter"><label>Year</label><div className="range-inputs"><input type="number" placeholder="From" value={filters.yearFrom} onChange={(e) => handleFilterChange('yearFrom', e.target.value)} /><input type="number" placeholder="To" value={filters.yearTo} onChange={(e) => handleFilterChange('yearTo', e.target.value)} /></div></div>
            <div className="filter-group range-filter"><label>Price (€)</label><div className="range-inputs"><input type="number" placeholder="From" value={filters.priceFrom} onChange={(e) => handleFilterChange('priceFrom', e.target.value)} /><input type="number" placeholder="To" value={filters.priceTo} onChange={(e) => handleFilterChange('priceTo', e.target.value)} /></div></div>
            <button className="search-button" onClick={fetchVehicles}>Search</button>
            <div className="saved-searches-section">
                <button className="save-search-button" onClick={handleSaveSearch}>Save Search</button>
                {savedSearches.length > 0 && <h4>Saved Searches</h4>}
                {savedSearches.map((search, index) => (
                    <div key={index} className="saved-search-item">
                        <span>{search.name}</span>
                        <div className="saved-search-buttons">
                            <button onClick={() => handleLoadSearch(search)}>Load</button>
                            <button className="delete-button" onClick={() => handleDeleteSearch(index)}>X</button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
          <div className="vehicles-section">
            <div className="sort-section">
              <label>Sort by:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="recent">Recent Ads</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="year_asc">Year: Old to New</option>
                <option value="year_desc">Year: New to Old</option>
              </select>
              <span className="results-count">{vehicles.length} results</span>
            </div>
            <div className="vehicle-cards">
              {vehicles.slice((currentPage - 1) * 8, currentPage * 8).map(vehicle => (
                <div key={vehicle.id} className="vehicle-card" onClick={() => setSelectedVehicle(vehicle)}>
                  <div className="vehicle-image"><img src={vehicle.imageUrl || 'https://via.placeholder.com/300x200'} alt={vehicle.name} /></div>
                  <div className="vehicle-info">
                    <div className="vehicle-price">€{vehicle.price.toLocaleString()}</div>
                    <div className="vehicle-name">{vehicle.name}</div>
                    <div className="vehicle-details">{vehicle.year} • {vehicle.mileage.toLocaleString()} km • {vehicle.transmission} • {vehicle.fuel}</div>
                    <div className="vehicle-location-phone">{vehicle.location} • {vehicle.phone}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="pagination">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Previous</button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</button>
            </div>
            <button className="back-to-top" onClick={scrollToTop}>Back to Top</button>
          </div>
        </div>
      ) : (
        <div className="vehicle-detail">
          <div className="detail-header"><button className="back-button" onClick={() => setSelectedVehicle(null)}>← Back to List</button><h1>{selectedVehicle.name}</h1></div>
          <div className="detail-content">
            <div className="detail-left">
                <div className="spec-section"><h2>Vehicle Specifications</h2><div className="spec-grid"><div className="spec-item"><span className="spec-label">Make:</span><span className="spec-value">{selectedVehicle.make}</span></div><div className="spec-item"><span className="spec-label">Model:</span><span className="spec-value">{selectedVehicle.model}</span></div><div className="spec-item"><span className="spec-label">Year:</span><span className="spec-value">{selectedVehicle.year}</span></div><div className="spec-item"><span className="spec-label">Engine:</span><span className="spec-value">{selectedVehicle.engine}</span></div><div className="spec-item"><span className="spec-label">Fuel:</span><span className="spec-value">{selectedVehicle.fuel}</span></div><div className="spec-item"><span className="spec-label">Mileage:</span><span className="spec-value">{selectedVehicle.mileage.toLocaleString()} km</span></div><div className="spec-item"><span className="spec-label">Gearbox:</span><span className="spec-value">{selectedVehicle.transmission}</span></div><div className="spec-item"><span className="spec-label">Colour:</span><span className="spec-value">{selectedVehicle.color}</span></div><div className="spec-item"><span className="spec-label">Car Plates:</span><span className="spec-value">{selectedVehicle.carPlates}</span></div><div className="spec-item"><span className="spec-label">Power:</span><span className="spec-value">{selectedVehicle.power} HP</span></div></div></div>
                <div className="price-section"><div className="main-price">€{selectedVehicle.price.toLocaleString()}</div></div>
                <div className="description-section"><h3>Description</h3><p>{selectedVehicle.description}</p></div>
            </div>
            <div className="detail-right">
                <div className="seller-section"><h3>Seller Information</h3><div className="seller-info"><div className="seller-item"><span className="seller-label">Phone:</span><span className="seller-value">{selectedVehicle.phone}</span></div><div className="seller-item"><span className="seller-label">Location:</span><span className="seller-value">{selectedVehicle.location}</span></div></div></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleAds;