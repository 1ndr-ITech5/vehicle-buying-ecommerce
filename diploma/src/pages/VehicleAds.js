import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaCheckCircle, FaQuestionCircle, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';
import VehicleForm from './../components/VehicleForm';
import api from './../api';
import './../pagestyle/VehicleAds.css';

const InsuranceCalculator = ({ baseRate }) => {
  const [age, setAge] = useState('');
  const [experience, setExperience] = useState('');
  const [crashed, setCrashed] = useState('no');
  const [insurance, setInsurance] = useState(null);

  const calculateInsurance = () => {
    let calculatedInsurance = baseRate;
    if (age < 25) {
      calculatedInsurance *= 1.5;
    }
    if (experience < 2) {
      calculatedInsurance *= 1.5;
    }
    if (crashed === 'yes') {
      calculatedInsurance *= 2;
    }
    setInsurance(calculatedInsurance.toFixed(2));
  };

  return (
    <div className="insurance-calculator-section">
      <h3>Insurance Calculator</h3>
      <div className="form-group">
        <label>Age</label>
        <input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Years of Experience</label>
        <input type="number" value={experience} onChange={(e) => setExperience(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Crashed Before?</label>
        <select value={crashed} onChange={(e) => setCrashed(e.target.value)}>
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </div>
      <button onClick={calculateInsurance}>Calculate</button>
      {insurance && <div className="calculated-insurance">Estimated Insurance: €{insurance} / year</div>}
    </div>
  );
};

const HistoryCheck = ({ history }) => {
  const getIcon = (status) => {
    switch (status) {
      case 'passed':
        return <FaCheckCircle color="green" />;
      case 'questionable':
        return <FaQuestionCircle color="orange" />;
      case 'failed':
        return <FaTimesCircle color="red" />;
      default:
        return null;
    }
  };

  return (
    <div className="history-check-section">
      <h3>History Check</h3>
      <ul>
        {history && Object.entries(history).map(([key, value]) => (
          <li key={key}>
            <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
            {getIcon(value)}
          </li>
        ))}
      </ul>
    </div>
  );
};

const ReservationModal = ({ vehicle, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Reserve {vehicle.name}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          </div>
          <button type="submit" className="modal-submit">Confirm Reservation</button>
        </form>
      </div>
    </div>
  );
};

const VehicleAds = () => {
  const location = useLocation();
  const [activeVehicleCategory, setActiveVehicleCategory] = useState('car');
  const [filters, setFilters] = useState({ type: '', model: '', yearFrom: '', yearTo: '', priceFrom: '', priceTo: '', powerFrom: '', powerTo: '', mileageFrom: '', mileageTo: '', transmitor: '', fuel: '', colour: '', location: '' });
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [savedSearches, setSavedSearches] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [searched, setSearched] = useState(false);
  const [searchAfterUpdate, setSearchAfterUpdate] = useState(false);
  const [installments, setInstallments] = useState(0);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserId(payload.userId);
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }
  }, []);

  const isOwner = (vehicle) => {
    return vehicle.ownerId === userId;
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this ad?')) {
      try {
        await api.delete(`/vehicles/${id}`);
        setAllVehicles(prevVehicles => prevVehicles.filter(v => v.id !== id));
        setVehicles(prevVehicles => prevVehicles.filter(v => v.id !== id));
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete ad.');
      }
    }
  };

  const handleModify = (vehicle) => {
    if (vehicle.package === 'premium' && vehicle.modifiedOnce) {
      alert('This premium ad has already been modified once.');
      return;
    }
    setEditingVehicle(vehicle);
    setShowEditModal(true);
  };

  const handleUpdate = async (formData, image) => {
    try {
      // TODO: Handle image upload if the image is changed
      const { ...dataToSend } = formData;
      const response = await api.put(`/vehicles/${editingVehicle.id}`, dataToSend);
      alert('Ad updated successfully!');
      setShowEditModal(false);
      setEditingVehicle(null);
      // Update the vehicle in the list
      setAllVehicles(prevVehicles => prevVehicles.map(v => v.id === editingVehicle.id ? response.data : v));
      setVehicles(prevVehicles => prevVehicles.map(v => v.id === editingVehicle.id ? response.data : v));
    } catch (error) {
      console.error('Error updating vehicle ad:', error);
      alert('Failed to update vehicle ad. Please try again.');
    }
  };

  const vehicleData = {
    car: { marks: ['Mercedes-Benz', 'BMW', 'Audi', 'Ford', 'Toyota', 'Renault', 'Volkswagen', 'Skoda'], models: { 'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class'], 'BMW': ['3 Series', '5 Series', 'X5'], 'Audi': ['A4', 'A6', 'Q7'], 'Ford': ['Focus', 'Fiesta', 'Mondeo'], 'Toyota': ['Corolla', 'Camry', 'RAV4'], 'Renault': ['Clio', 'Megane', 'Captur'], 'Volkswagen': ['Golf', 'Passat', 'Tiguan'], 'Skoda': ['Octavia', 'Superb', 'Kodiaq'] } },
    van: { marks: ['Mercedes-Benz', 'Fiat', 'Opel', 'Renault', 'Iveco'], models: { 'Mercedes-Benz': ['Sprinter', 'Vito'], 'Fiat': ['Ducato', 'Doblo'], 'Opel': ['Vivaro', 'Movano'], 'Renault': ['Trafic', 'Master'], 'Iveco': ['Daily'] } },
    motorcycle: { marks: ['Honda', 'Yamaha', 'Suzuki', 'Ducati', 'KTM'], models: { 'Honda': ['CBR', 'Africa Twin'], 'Yamaha': ['MT-07', 'R1'], 'Suzuki': ['GSX-R', 'V-Strom'], 'Ducati': ['Panigale', 'Monster'], 'KTM': ['Duke', 'Adventure'] } }
  };

  const transmitorOptions = ['Manual', 'Automatic', 'Semi-Automatic'];
  const fuelOptions = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
  const colourOptions = ['Black', 'White', 'Silver', 'Blue', 'Red', 'Green', 'Yellow'];
  const albanianCities = ['Tirana', 'Durres', 'Vlora', 'Shkoder', 'Fier', 'Korce', 'Elbasan', 'Berat', 'Lushnje', 'Kavaje', 'Gjirokaster', 'Sarande'];

  const fetchAllVehicles = React.useCallback(async () => {
    try {
      console.log('Fetching vehicles...');
      // Fetch from db.json using the global axios instance
      const dbJsonResponse = await axios.get('/db.json');
      const vehiclesFromDbJson = dbJsonResponse.data.vehicles || [];
      console.log('Vehicles from db.json:', vehiclesFromDbJson);

      // Fetch from API using the configured api instance
      const apiResponse = await api.get('/vehicles');
      const vehiclesFromApi = apiResponse.data || [];
      console.log('Vehicles from API:', vehiclesFromApi);

      // Merge and remove duplicates (API data takes precedence)
      const allVehiclesMap = new Map();
      vehiclesFromDbJson.forEach(vehicle => allVehiclesMap.set(vehicle.id, vehicle));
      vehiclesFromApi.forEach(vehicle => allVehiclesMap.set(vehicle.id, vehicle));

      let mergedVehicles = Array.from(allVehiclesMap.values());
      console.log('Merged vehicles:', mergedVehicles);

      setAllVehicles(mergedVehicles);
      setVehicles(mergedVehicles);
      setTotalPages(Math.ceil(mergedVehicles.length / 8));
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  }, []);

  useEffect(() => {
    fetchAllVehicles();
  }, [fetchAllVehicles]);

  useEffect(() => {
    if (location.state?.newAd) {
      const newAd = location.state.newAd;
      setAllVehicles(prevVehicles => {
        if (!prevVehicles.find(v => v.id === newAd.id)) {
          return [newAd, ...prevVehicles];
        }
        return prevVehicles;
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.newAd]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryFilters = {};
    let category = activeVehicleCategory;
    let shouldSearch = false;
    for (const [key, value] of params.entries()) {
      if (key === 'category') {
        category = value;
        shouldSearch = true;
      } else if (value) {
        queryFilters[key] = value;
        shouldSearch = true;
      }
    }

    if (shouldSearch) {
      setActiveVehicleCategory(category);
      setFilters(prev => ({ ...prev, ...queryFilters }));
      setSearchAfterUpdate(true);
    }
  }, [location.search, allVehicles]);

  

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const vehicleId = params.get('vehicleId');
    if (vehicleId && allVehicles.length > 0) {
      const vehicle = allVehicles.find(v => v.id === parseInt(vehicleId));
      if (vehicle) {
        setSelectedVehicle(vehicle);
      }
    }
  }, [location.search, allVehicles]);

  const handleFilterChange = (filterName, value) => {
    let processedValue = value;
    if (filterName === 'yearFrom' || filterName === 'yearTo') {
      const year = parseInt(value, 10);
      if (year < 1990) {
        processedValue = '1990';
      } else if (year > 2025) {
        processedValue = '2025';
      }
    }
    if (filterName === 'priceFrom' || filterName === 'priceTo') {
        const price = parseInt(value, 10);
        if (price < 0) {
            processedValue = '0';
        }
    }
    setFilters(prev => ({ ...prev, [filterName]: processedValue }));
  };

  const handleSearch = () => {
    let filteredVehicles = [...allVehicles];
    // Filtering
    if (filters.type) {
        filteredVehicles = filteredVehicles.filter(v => v.make === filters.type);
    }
    if (filters.model) {
        filteredVehicles = filteredVehicles.filter(v => v.model === filters.model);
    }
    if (filters.yearFrom) {
        filteredVehicles = filteredVehicles.filter(v => v.year >= filters.yearFrom);
    }
    if (filters.yearTo) {
        filteredVehicles = filteredVehicles.filter(v => v.year <= filters.yearTo);
    }
    if (filters.priceFrom) {
        filteredVehicles = filteredVehicles.filter(v => v.price >= filters.priceFrom);
    }
    if (filters.priceTo) {
        filteredVehicles = filteredVehicles.filter(v => v.price <= filters.priceTo);
    }
    if (filters.powerFrom) {
        filteredVehicles = filteredVehicles.filter(v => v.power >= filters.powerFrom);
    }
    if (filters.powerTo) {
        filteredVehicles = filteredVehicles.filter(v => v.power <= filters.powerTo);
    }
    if (filters.mileageFrom) {
        filteredVehicles = filteredVehicles.filter(v => v.mileage >= filters.mileageFrom);
    }
    if (filters.mileageTo) {
        filteredVehicles = filteredVehicles.filter(v => v.mileage <= filters.mileageTo);
    }
    if (filters.transmitor) {
        filteredVehicles = filteredVehicles.filter(v => v.transmission === filters.transmitor);
    }
    if (filters.fuel) {
        filteredVehicles = filteredVehicles.filter(v => v.fuel === filters.fuel);
    }
    if (filters.colour) {
        filteredVehicles = filteredVehicles.filter(v => v.color === filters.colour);
    }
    if (filters.location) {
        filteredVehicles = filteredVehicles.filter(v => v.location === filters.location);
    }
    if (activeVehicleCategory) {
        filteredVehicles = filteredVehicles.filter(v => v.vehicleCategory === activeVehicleCategory);
    }

    setVehicles(filteredVehicles);
    setTotalPages(Math.ceil(filteredVehicles.length / 8));
    setCurrentPage(1);
    setSearched(true);
  };

  useEffect(() => {
    if (allVehicles.length > 0) {
        handleSearch();
    }
  }, [activeVehicleCategory]);

  const handleVehicleCategoryChange = (category) => {
    setActiveVehicleCategory(category);
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

  useEffect(() => {
    const sortedVehicles = [...vehicles].sort((a, b) => {
      if (sortBy === 'price_asc') {
        return a.price - b.price;
      }
      if (sortBy === 'price_desc') {
        return b.price - a.price;
      }
      if (sortBy === 'year_asc') {
        return a.year - b.year;
      }
      if (sortBy === 'year_desc') {
        return b.year - a.year;
      }
      if (sortBy === 'recent') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });
    if (JSON.stringify(sortedVehicles) !== JSON.stringify(vehicles)) {
      setVehicles(sortedVehicles);
    }
  }, [sortBy, vehicles]);

  const handleReserveClick = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('Please log in to reserve a vehicle.');
      return;
    }
    setShowReserveModal(true);
  };

  const handleReservationSubmit = async (formData) => {
    try {
      await api.post(`/vehicles/${selectedVehicle.id}/reserve`, formData);
      alert('Reservation successful!');
      setShowReserveModal(false);
      fetchAllVehicles(); // Refetch vehicles to update reserved status
      setSelectedVehicle({ ...selectedVehicle, reserved: true });
    } catch (error) {
      alert(error.response?.data?.message || 'Reservation failed.');
    }
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
            <div className="filter-group"><label>Location</label><select value={filters.location} onChange={(e) => handleFilterChange('location', e.target.value)}><option value="">Select Location</option>{albanianCities.map(city => (<option key={city} value={city}>{city}</option>))}</select></div>
            {activeVehicleCategory !== 'motorcycle' && <div className="filter-group"><label>Gearbox</label><select value={filters.transmitor} onChange={(e) => handleFilterChange('transmitor', e.target.value)}><option value="">Select Gearbox</option>{transmitorOptions.map(option => (<option key={option} value={option}>{option}</option>))}</select></div>}
            <div className="filter-group"><label>Fuel</label><select value={filters.fuel} onChange={(e) => handleFilterChange('fuel', e.target.value)}><option value="">Select Fuel</option>{fuelOptions.map(option => (<option key={option} value={option}>{option}</option>))}</select></div>
            <div className="filter-group range-filter"><label>Mileage</label><div className="range-inputs"><input type="number" placeholder="From" value={filters.mileageFrom} onChange={(e) => handleFilterChange('mileageFrom', e.target.value)} /><input type="number" placeholder="To" value={filters.mileageTo} onChange={(e) => handleFilterChange('mileageTo', e.target.value)} /></div></div>
            <button className="search-button" onClick={handleSearch}>Search</button>
            
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
              {(searched ? vehicles : allVehicles).slice((currentPage - 1) * 8, currentPage * 8).map(vehicle => (
                <div key={vehicle.id} className={`vehicle-card ${vehicle.reserved ? 'reserved' : ''}`} onClick={() => !vehicle.reserved && setSelectedVehicle(vehicle)} title={vehicle.reserved ? 'This vehicle is reserved' : ''}>
                  {vehicle.reserved && <div className="reserved-badge">Reserved</div>}
                  <div className="vehicle-image"><img src={vehicle.imageUrl || 'https://via.placeholder.com/300x200'} alt={vehicle.name} /></div>
                  <div className="vehicle-info">
                    <div className="vehicle-price">€{vehicle.price.toLocaleString()}</div>
                    <div className="vehicle-name">{vehicle.name}</div>
                    <div className="vehicle-details">{vehicle.year} • {vehicle.mileage.toLocaleString()} km • {vehicle.transmission} • {vehicle.fuel}</div>
                    <div className="vehicle-location-phone">{vehicle.location} • {vehicle.phone}</div>
                    {isOwner(vehicle) && (
                      <div className="ad-actions">
                        <button onClick={(e) => {e.stopPropagation(); handleModify(vehicle)}}>Modify</button>
                        <button onClick={(e) => {e.stopPropagation(); handleDelete(vehicle.id)}}>Delete</button>
                      </div>
                    )}
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
                <div className="price-section">
                  <div className="main-price">€{selectedVehicle.price.toLocaleString()}</div>
                  <div className="price-actions">
                    <div className={`installments-section ${!selectedVehicle.sellOnCredit ? 'disabled' : ''}`}>
                      <span>Pay by installments:</span>
                      <div className="installment-options">
                        <button onClick={() => setInstallments(3)} disabled={!selectedVehicle.sellOnCredit}>3 months</button>
                        <button onClick={() => setInstallments(6)} disabled={!selectedVehicle.sellOnCredit}>6 months</button>
                        <button onClick={() => setInstallments(9)} disabled={!selectedVehicle.sellOnCredit}>9 months</button>
                      </div>
                      {installments > 0 && <div className="installment-result">€{(selectedVehicle.price / installments).toFixed(2)} / month</div>}
                      {!selectedVehicle.sellOnCredit && <div className="credit-not-offered">The seller does not offer this vehicle on credit.</div>}
                    </div>
                    {!selectedVehicle.reserved && <button className="reserve-btn" onClick={handleReserveClick}>Reserve Vehicle</button>}
                  </div>
                </div>
                {selectedVehicle.historyCheck && <HistoryCheck history={selectedVehicle.historyCheck} />}
                {selectedVehicle.description && <div className="description-section"><h3>Description</h3><p>{selectedVehicle.description}</p></div>}
                <div className="seller-section"><h3>Seller Information</h3><div className="seller-info"><div className="seller-item"><span className="spec-label">Phone:</span><span className="spec-value">{selectedVehicle.phone}</span></div><div className="seller-item"><span className="spec-label">Location:</span><span className="spec-value">{selectedVehicle.location}</span></div></div></div>
            </div>
            <div className="detail-right">
              <div className="vehicle-image-detail">
                <img src={selectedVehicle.imageUrl || 'https://via.placeholder.com/300x200'} alt={selectedVehicle.name} />
              </div>
              {selectedVehicle.insuranceBaseRate && <InsuranceCalculator baseRate={selectedVehicle.insuranceBaseRate} />}
            </div>
          </div>
          {showReserveModal && <ReservationModal vehicle={selectedVehicle} onClose={() => setShowReserveModal(false)} onSubmit={handleReservationSubmit} />}
        </div>
      )}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Vehicle Ad</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <VehicleForm
              selectedPackage={editingVehicle.package}
              adType="vehicle"
              onFormSubmit={handleUpdate}
              onBack={() => setShowEditModal(false)}
              initialData={editingVehicle}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleAds;
