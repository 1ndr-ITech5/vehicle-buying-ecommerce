import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaQuestionCircle, FaTimesCircle, FaPhone, FaMapMarkerAlt, FaBookmark } from 'react-icons/fa';
import axios from 'axios';
import VehicleForm from './../components/VehicleForm';
import api from './../api';
import './../pagestyle/VehicleAds.css';
import { useTranslation } from 'react-i18next';

const InsuranceCalculator = ({ baseRate }) => {
  const { t } = useTranslation();
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
      <h3>{t('insurance_calculator')}</h3>
      <div className="form-group">
        <label>{t('age')}</label>
        <input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
      </div>
      <div className="form-group">
        <label>{t('years_of_experience')}</label>
        <input type="number" value={experience} onChange={(e) => setExperience(e.target.value)} />
      </div>
      <div className="form-group">
        <label>{t('crashed_before')}</label>
        <select value={crashed} onChange={(e) => setCrashed(e.target.value)}>
          <option value="no">{t('no')}</option>
          <option value="yes">{t('yes')}</option>
        </select>
      </div>
      <button onClick={calculateInsurance}>{t('calculate')}</button>
      {insurance && <div className="calculated-insurance">{t('estimated_insurance', { insurance })}</div>}
    </div>
  );
};

const HistoryCheck = ({ history }) => {
  const { t } = useTranslation(['translation', 'dynamic']);
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
      <h3>{t('history_check')}</h3>
      <ul>
        {history && Object.entries(history).map(([key, value]) => (
          <li key={key}>
            <span>{t(key, { ns: 'dynamic' })}</span>
            {getIcon(value)}
          </li>
        ))}
      </ul>
    </div>
  );
};

const ReservationModal = ({ vehicle, onClose, onSubmit }) => {
  const { t } = useTranslation();
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
          <h3>{t('reserve_vehicle_title', { vehicleName: vehicle.name })}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input type="text" name="name" placeholder={t('name')} value={formData.name} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <input type="tel" name="phone" placeholder={t('phone')} value={formData.phone} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <input type="email" name="email" placeholder={t('email')} value={formData.email} onChange={handleChange} required />
          </div>
          <button type="submit" className="modal-submit">{t('confirm_reservation')}</button>
        </form>
      </div>
    </div>
  );
};

const VehicleAds = () => {
  const { t } = useTranslation(['translation', 'dynamic']);
  const location = useLocation();
  const navigate = useNavigate();
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
        console.error(t('invalid_token'), error);
      }
    }
  }, [t]);

  const isOwner = (vehicle) => {
    return vehicle.ownerId === userId;
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('are_you_sure_delete_ad'))) {
      try {
        await api.delete(`/vehicles/${id}`);
        setAllVehicles(prevVehicles => prevVehicles.filter(v => v.id !== id));
        setVehicles(prevVehicles => prevVehicles.filter(v => v.id !== id));
      } catch (error) {
        alert(error.response?.data?.message || t('failed_to_delete_ad'));
      }
    }
  };

  const handleModify = (vehicle) => {
    if (vehicle.package === 'premium' && vehicle.modifiedOnce) {
      alert(t('premium_ad_modified'));
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
      alert(t('ad_updated_successfully'));
      setShowEditModal(false);
      setEditingVehicle(null);
      // Update the vehicle in the list
      setAllVehicles(prevVehicles => prevVehicles.map(v => v.id === editingVehicle.id ? response.data : v));
      setVehicles(prevVehicles => prevVehicles.map(v => v.id === editingVehicle.id ? response.data : v));
    } catch (error) {
      console.error(t('error_updating_vehicle_ad'), error);
      alert(t('failed_to_update_vehicle_ad'));
    }
  };

  const vehicleData = {
    car: { marks: ['Mercedes-Benz', 'BMW', 'Audi', 'Ford', 'Toyota', 'Renault', 'Volkswagen', 'Skoda', 'Land Rover', 'Mazda', 'Volvo', 'Nissan', 'Tesla'], models: { 'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class'], 'BMW': ['3 Series', '5 Series', 'X5'], 'Audi': ['A4', 'A6', 'Q7'], 'Ford': ['Focus', 'Fiesta', 'Mondeo'], 'Toyota': ['Corolla', 'Camry', 'RAV4'], 'Renault': ['Clio', 'Megane', 'Captur'], 'Volkswagen': ['Golf', 'Passat', 'Tiguan'], 'Skoda': ['Octavia', 'Superb', 'Kodiaq'], 'Land Rover': ['Range Rover', 'Defender', 'Discovery'], 'Mazda': ['Mazda3', 'Mazda6', 'CX-5'], 'Volvo': ['XC90', 'S60', 'V60'], 'Nissan': ['Qashqai', 'Juke', 'X-Trail'], 'Tesla': ['Model S', 'Model 3', 'Model X'] } },
    van: { marks: ['Mercedes-Benz', 'Fiat', 'Opel', 'Renault', 'Iveco'], models: { 'Mercedes-Benz': ['Sprinter', 'Vito'], 'Fiat': ['Ducato', 'Doblo'], 'Opel': ['Vivaro', 'Movano'], 'Renault': ['Trafic', 'Master'], 'Iveco': ['Daily'] } },
    motorcycle: { marks: ['Honda', 'Yamaha', 'Suzuki', 'Ducati', 'KTM'], models: { 'Honda': ['CBR', 'Africa Twin'], 'Yamaha': ['MT-07', 'R1'], 'Suzuki': ['GSX-R', 'V-Strom'], 'Ducati': ['Panigale', 'Monster'], 'KTM': ['Duke', 'Adventure'] } }
  };

  const transmitorOptions = ['Manual', 'Automatic', 'Semi-Automatic'];
  const fuelOptions = ['Petrol', 'Diesel', 'Gasoline', 'Electric', 'Hybrid'];
  const colourOptions = ['Black', 'White', 'Silver', 'Blue', 'Red', 'Green', 'Yellow'];
  const albanianCities = ['Tirana', 'Durres', 'Vlora', 'Shkoder', 'Fier', 'Korce', 'Elbasan', 'Berat', 'Lushnje', 'Kavaje', 'Gjirokaster', 'Sarande'];

  const fetchAllVehicles = React.useCallback(async () => {
    try {
      console.log('Fetching vehicles...');
      // Fetch from db.json using the global axios instance
      const dbJsonResponse = await axios.get('/db.json');
      const vehiclesFromDbJson = dbJsonResponse.data.vehicles || [];
      vehiclesFromDbJson.forEach(vehicle => vehicle.isStatic = true);
      console.log('Vehicles from db.json:', vehiclesFromDbJson);

      // Fetch from API using the configured api instance
      const apiResponse = await api.get('/vehicles');
      const vehiclesFromApi = apiResponse.data || [];
      console.log('Vehicles from API:', vehiclesFromApi);

      // Merge and remove duplicates (API data takes precedence)
      const allVehiclesMap = new Map();
      vehiclesFromDbJson.forEach(vehicle => allVehiclesMap.set(vehicle.id, vehicle));
      vehiclesFromApi.forEach(vehicle => {
        vehicle.sellOnCredit = true;
        allVehiclesMap.set(vehicle.id, vehicle)
      });

      let mergedVehicles = Array.from(allVehiclesMap.values());

      if (location.state?.newAd) {
        const newAd = location.state.newAd;
        if (!mergedVehicles.find(v => v.id === newAd.id)) {
          mergedVehicles = [newAd, ...mergedVehicles];
        }
        window.history.replaceState({}, document.title);
      }

      const storedVehicles = JSON.parse(localStorage.getItem('vehicles'));
      if (storedVehicles) {
          mergedVehicles = mergedVehicles.map(vehicle => {
              const storedVehicle = storedVehicles.find(v => v.id === vehicle.id);
              if (storedVehicle) {
                  return { ...vehicle, reserved: storedVehicle.reserved };
              }
              return vehicle;
          });
      }

      console.log('Merged vehicles:', mergedVehicles);

      setAllVehicles(mergedVehicles);
      setVehicles(mergedVehicles);
      setTotalPages(Math.ceil(mergedVehicles.length / 8));
    } catch (error) {
      console.error(t("error_fetching_vehicles"), error);
    }
  }, [location.state?.newAd, t]);

  useEffect(() => {
    fetchAllVehicles();
  }, [fetchAllVehicles]);



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
    if (vehicleId) {
      const fetchVehicle = async () => {
        try {
          const response = await api.get(`/vehicles/${vehicleId}`);
          setSelectedVehicle(response.data);
          setTimeout(() => {
            window.scrollTo(0, 0);
          }, 100); // Scroll to top after a short delay
        } catch (error) {
          console.error("Error fetching vehicle:", error);
        }
      };
      fetchVehicle();
    } else {
      setSelectedVehicle(null);
      const storedScrollPos = sessionStorage.getItem('scrollPos');
      if (storedScrollPos) {
        window.scrollTo(0, parseInt(storedScrollPos));
        sessionStorage.removeItem('scrollPos');
      }
    }
  }, [location.search, allVehicles]);

  const handleFilterChange = (filterName, value) => {
    let processedValue = value;
    if (filterName === 'priceFrom' || filterName === 'priceTo') {
        const price = parseInt(value, 10);
        if (price < 0) {
            processedValue = '0';
        }
    }
    setFilters(prev => ({ ...prev, [filterName]: processedValue }));
  };

  useEffect(() => {
    handleSearch();
  }, [sortBy]);

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

    if (sortBy === 'premium') {
        filteredVehicles = filteredVehicles.filter(v => v.package === 'premium');
    } else if (sortBy !== 'all') {
        filteredVehicles.sort((a, b) => {
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
            return 0;
        });
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

  useEffect(() => {
    setSortBy('all');
  }, [activeVehicleCategory]);

  const handleVehicleCategoryChange = (category) => {
    setActiveVehicleCategory(category);
  };

  const handleSaveSearch = () => {
    const searchName = prompt(t("enter_search_name"));
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



  const handleReserveClick = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert(t('please_log_in_to_reserve_vehicle'));
      return;
    }
    setShowReserveModal(true);
  };

  const handleReservationSubmit = async (formData) => {
    const updatedVehicles = allVehicles.map(v => v.id === selectedVehicle.id ? { ...v, reserved: true, reservedBy: userId } : v);
    setAllVehicles(updatedVehicles);
    setVehicles(updatedVehicles);
    setSelectedVehicle({ ...selectedVehicle, reserved: true, reservedBy: userId });
    localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
    alert(t('vehicle_reserved_successfully'));
    setShowReserveModal(false);
  };

  const handleCancelReservation = async (vehicle) => {
    if (vehicle.reservedBy !== userId) {
        return alert(t("cannot_cancel_other_reservation"));
    }
    if (window.confirm(t('are_you_sure_cancel_reservation'))) {
      const updatedVehicles = allVehicles.map(v => v.id === vehicle.id ? { ...v, reserved: false, reservedBy: null } : v);
      setAllVehicles(updatedVehicles);
      setVehicles(updatedVehicles);
      if (selectedVehicle && selectedVehicle.id === vehicle.id) {
        setSelectedVehicle({ ...selectedVehicle, reserved: false, reservedBy: null });
      }
      localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
      alert(t('reservation_cancelled_successfully'));
    }
  };

  const handleSave = async (vehicleAdId) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert(t('please_log_in_to_save'));
        return;
    }

    try {
        await api.post('/saved-items', { vehicleAdId: String(vehicleAdId) }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        alert(t('vehicle_saved_successfully'));
    } catch (error) {
        if (error.response?.status === 409) {
            alert(t('already_saved_vehicle'));
        } else {
            alert(error.response?.data?.message || t('failed_to_save_vehicle'));
        }
    }
  };

  const handleSaveStatic = (vehicle) => {
    const savedStaticVehicles = JSON.parse(localStorage.getItem('savedStaticVehicles')) || [];
    if (savedStaticVehicles.find(v => v.id === vehicle.id)) {
        alert(t('already_saved_vehicle'));
        return;
    }
    savedStaticVehicles.push(vehicle);
    localStorage.setItem('savedStaticVehicles', JSON.stringify(savedStaticVehicles));
    alert(t('vehicle_saved_successfully_simulated'));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!selectedVehicle) {
      const storedScrollPos = sessionStorage.getItem('scrollPos');
      if (storedScrollPos) {
        window.scrollTo(0, parseInt(storedScrollPos));
        sessionStorage.removeItem('scrollPos');
      }
    }
  }, [selectedVehicle]);

  const handleBackClick = () => {
    if (location.state?.from === 'home') {
      navigate('/');
    } else {
      setSelectedVehicle(null);
    }
  };



  return (
    <div className="vehicle-ads-container">
      {!selectedVehicle ? (
        <div className="main-content">
          <div className="filters-section">
            <div className="vehicle-category-tabs">
                <button className={`category-tab ${activeVehicleCategory === 'car' ? 'active' : ''}`} onClick={() => handleVehicleCategoryChange('car')}>🚗 {t('car')}</button>
                <button className={`category-tab ${activeVehicleCategory === 'van' ? 'active' : ''}`} onClick={() => handleVehicleCategoryChange('van')}>🚐 {t('van')}</button>
                <button className={`category-tab ${activeVehicleCategory === 'motorcycle' ? 'active' : ''}`} onClick={() => handleVehicleCategoryChange('motorcycle')}>🏍️ {t('motorcycle')}</button>
            </div>
            <h2>{t('search_filters')}</h2>
            <div className="filter-group"><label>{t('mark')}</label><select value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)}><option value="">{t('select_mark')}</option>{vehicleData[activeVehicleCategory].marks.map(type => (<option key={type} value={type}>{t(type, { ns: 'dynamic' })}</option>))}</select></div>
            <div className="filter-group"><label>{t('model')}</label><select value={filters.model} onChange={(e) => handleFilterChange('model', e.target.value)} disabled={!filters.type}><option value="">{t('select_model')}</option>{(vehicleData[activeVehicleCategory].models[filters.type] || []).map(model => (<option key={model} value={model}>{t(model, { ns: 'dynamic' })}</option>))}</select></div>
            <div className="filter-group range-filter"><label>{t('year')}</label><div className="range-inputs"><input type="number" placeholder={t('from')} value={filters.yearFrom} onChange={(e) => handleFilterChange('yearFrom', e.target.value)} /><input type="number" placeholder={t('to')} value={filters.yearTo} onChange={(e) => handleFilterChange('yearTo', e.target.value)} /></div></div>
            <div className="filter-group range-filter"><label>{t('price')} (€)</label><div className="range-inputs"><input type="number" placeholder={t('from')} value={filters.priceFrom} onChange={(e) => handleFilterChange('priceFrom', e.target.value)} /><input type="number" placeholder={t('to')} value={filters.priceTo} onChange={(e) => handleFilterChange('priceTo', e.target.value)} /></div></div>
            <div className="filter-group"><label>{t('location')}</label><select value={filters.location} onChange={(e) => handleFilterChange('location', e.target.value)}><option value="">{t('select_location')}</option>{albanianCities.map(city => (<option key={city} value={city}>{city}</option>))}</select></div>
            {activeVehicleCategory !== 'motorcycle' && <div className="filter-group"><label>{t('gearbox')}</label><select value={filters.transmitor} onChange={(e) => handleFilterChange('transmitor', e.target.value)}><option value="">{t('select_gearbox')}</option>{transmitorOptions.map(option => (<option key={option} value={option}>{t(option, { ns: 'dynamic' })}</option>))}</select></div>}
            <div className="filter-group"><label>{t('fuel')}</label><select value={filters.fuel} onChange={(e) => handleFilterChange('fuel', e.target.value)}><option value="">{t('select_fuel')}</option>{fuelOptions.map(option => (<option key={option} value={option}>{t(option, { ns: 'dynamic' })}</option>))}</select></div>
            <div className="filter-group range-filter"><label>{t('mileage')}</label><div className="range-inputs"><input type="number" placeholder={t('from')} value={filters.mileageFrom} onChange={(e) => handleFilterChange('mileageFrom', e.target.value)} /><input type="number" placeholder={t('to')} value={filters.mileageTo} onChange={(e) => handleFilterChange('mileageTo', e.target.value)} /></div></div>
            <button className="search-button" onClick={handleSearch}>{t('search')}</button>
            
            <div className="saved-searches-section">
                <button className="save-search-button" onClick={handleSaveSearch}>{t('save_search')}</button>
                {savedSearches.length > 0 && <h4>{t('saved_searches')}</h4>}
                {savedSearches.map((search, index) => (
                    <div key={index} className="saved-search-item">
                        <span>{search.name}</span>
                        <div className="saved-search-buttons">
                            <button onClick={() => handleLoadSearch(search)}>{t('load')}</button>
                            <button className="delete-button" onClick={() => handleDeleteSearch(index)}>X</button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
          <div className="vehicles-section">
            <div className="sort-section">
              <label>{t('sort_by')}</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="all">{t('all')}</option>
                <option value="premium">{t('premium_ads')}</option>
                <option value="price_asc">{t('price_low_to_high')}</option>
                <option value="price_desc">{t('price_high_to_low')}</option>
                <option value="year_asc">{t('year_old_to_new')}</option>
                <option value="year_desc">{t('year_new_to_old')}</option>
              </select>
              <span className="results-count">{t('results_count', { count: vehicles.length })}</span>
            </div>
            <div className="vehicle-cards">
              {(searched ? vehicles : allVehicles).slice((currentPage - 1) * 8, currentPage * 8).map(vehicle => (
                <div key={vehicle.id} className={`vehicle-card ${vehicle.reserved ? 'reserved' : ''} ${vehicle.package === 'premium' ? 'premium' : ''}`} onClick={() => !vehicle.reserved && setSelectedVehicle(vehicle)} title={vehicle.reserved ? t('vehicle_reserved_tooltip') : ''}>
                  
                  {vehicle.reserved && <div className="reserved-badge">{t('reserved')}</div>}
                  <div className="vehicle-image"><img src={vehicle.imageUrl || 'https://via.placeholder.com/300x200'} alt={vehicle.name} /></div>
                  <div className="vehicle-info">
                    <div className="vehicle-price">€{vehicle.price.toLocaleString()}</div>
                    <div className="vehicle-name">{t(vehicle.name, { ns: 'dynamic' })}</div>
                    <div className="vehicle-details">{vehicle.year} • {vehicle.mileage.toLocaleString()} km • {t(vehicle.transmission, { ns: 'dynamic' })} • {t(vehicle.fuel, { ns: 'dynamic' })}</div>
                    <div className="vehicle-location-phone">{vehicle.location} • {vehicle.phone}</div>
                    <div className="ad-actions">
                      <div className="ad-actions-left">
                        {isOwner(vehicle) && (
                          <>
                            <button className="ad-action-btn" onClick={(e) => {e.stopPropagation(); handleModify(vehicle)}}>{t('modify')}</button>
                            <button className="ad-action-btn" onClick={(e) => {e.stopPropagation(); handleDelete(vehicle.id)}}>{t('delete')}</button>
                          </>
                        )}
                      </div>
                      <div className="ad-actions-right">
                        {vehicle.reserved && vehicle.reservedBy === userId && <button className="ad-action-btn cancel-reservation-btn" onClick={(e) => {e.stopPropagation(); handleCancelReservation(vehicle);}}>{t('cancel_reservation')}</button>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="pagination">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>{t('previous')}</button>
                <span>{t('page_of', { currentPage, totalPages })}</span>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>{t('next')}</button>
            </div>
            <button className="back-to-top" onClick={scrollToTop}>{t('back_to_top')}</button>
          </div>
        </div>
      ) : (
        <div className="vehicle-detail">
          <div className="detail-header"><button className="back-button" onClick={handleBackClick}>{t('back_to_list')}</button><h1>{t(selectedVehicle.name, { ns: 'dynamic' })}</h1></div>
          <div className="detail-content">
            <div className="detail-left">
                <div className="spec-section"><h2>{t('vehicle_specifications')}</h2><div className="spec-grid"><div className="spec-item"><span className="spec-label">{t('make_label')}</span><span className="spec-value">{t(selectedVehicle.make, { ns: 'dynamic' })}</span></div><div className="spec-item"><span className="spec-label">{t('model_label')}</span><span className="spec-value">{t(selectedVehicle.model, { ns: 'dynamic' })}</span></div><div className="spec-item"><span className="spec-label">{t('year_label')}</span><span className="spec-value">{selectedVehicle.year}</span></div><div className="spec-item"><span className="spec-label">{t('engine_label')}</span><span className="spec-value">{selectedVehicle.engine}</span></div><div className="spec-item"><span className="spec-label">{t('fuel_label')}</span><span className="spec-value">{t(selectedVehicle.fuel, { ns: 'dynamic' })}</span></div><div className="spec-item"><span className="spec-label">{t('mileage_label')}</span><span className="spec-value">{selectedVehicle.mileage.toLocaleString()} km</span></div><div className="spec-item"><span className="spec-label">{t('gearbox_label')}</span><span className="spec-value">{t(selectedVehicle.transmission, { ns: 'dynamic' })}</span></div><div className="spec-item"><span className="spec-label">{t('colour_label')}</span><span className="spec-value">{t(selectedVehicle.color, { ns: 'dynamic' })}</span></div><div className="spec-item"><span className="spec-label">{t('car_plates_label')}</span><span className="spec-value">{selectedVehicle.carPlates}</span></div><div className="spec-item"><span className="spec-label">{t('power_label')}</span><span className="spec-value">{selectedVehicle.power} HP</span></div></div></div>
                <div className="price-section">
                  <div className="main-price">€{selectedVehicle.price.toLocaleString()}</div>
                  <div className="price-actions">
                    <div className={`installments-section`}>
                      <span>{t('pay_by_installments')}</span>
                      <div className="installment-options">
                        <button onClick={() => setInstallments(1)}>{t('month_1')}</button>
                        <button onClick={() => setInstallments(3)}>{t('months_3')}</button>
                        <button onClick={() => setInstallments(6)}>{t('months_6')}</button>
                        <button onClick={() => setInstallments(9)}>{t('months_9')}</button>
                        <button onClick={() => setInstallments(12)}>{t('months_12')}</button>
                      </div>
                      {installments > 0 && <div className="installment-result">{t('per_month', { price: (selectedVehicle.price / installments).toFixed(2) })}</div>}
                      
                    </div>
                    
                    {!selectedVehicle.reserved && <button className="reserve-btn" onClick={handleReserveClick}>{t('reserve_vehicle')}</button>}

                  </div>
                </div>
                {selectedVehicle.historyCheck && <HistoryCheck history={selectedVehicle.historyCheck} />}
                {selectedVehicle.description && <div className="description-section"><h3>{t('description')}</h3><p>{selectedVehicle.description}</p></div>}
                                                <div className="seller-info"><div className="seller-item"><FaPhone /><span className="spec-value">{selectedVehicle.phone}</span></div><div className="seller-item"><FaMapMarkerAlt /><span className="spec-value">{selectedVehicle.location}</span></div></div>
            </div>
            <div className="detail-right">
              <div className="vehicle-image-detail">
                <img src={selectedVehicle.imageUrl || 'https://via.placeholder.com/300x200'} alt={selectedVehicle.name} />
              </div>
              {selectedVehicle.insuranceBaseRate && <InsuranceCalculator baseRate={selectedVehicle.insuranceBaseRate} />}
              <button className="save-btn save-btn-styled" onClick={() => selectedVehicle.isStatic ? handleSaveStatic(selectedVehicle) : handleSave(selectedVehicle.id)}><FaBookmark /> {t('save')}</button>
            </div>
          </div>
          {showReserveModal && <ReservationModal vehicle={selectedVehicle} onClose={() => setShowReserveModal(false)} onSubmit={handleReservationSubmit} />}
        </div>
      )}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{t('edit_vehicle_ad')}</h3>
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