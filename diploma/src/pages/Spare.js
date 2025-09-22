import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCar, FaCog, FaTools, FaSprayCan, FaWhmcs, FaPlug, FaScrewdriver, FaInfoCircle, FaQuestionCircle, FaShoppingCart, FaBookmark } from 'react-icons/fa';
import api from './../api';
import './../pagestyle/Spare.css';
import { useTranslation } from 'react-i18next';

const Spare = () => {
    const { t } = useTranslation(['translation', 'dynamic']);
    const location = useLocation();
    const navigate = useNavigate();
    const [view, setView] = useState('categories');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);
    const [parts, setParts] = useState([]);
    const [initialParts, setInitialParts] = useState([]);
    const [searched, setSearched] = useState(false);
    const [selectedPart, setSelectedPart] = useState(null);
    const [filters, setFilters] = useState({
        vehicleType: '',
        carMark: '',
        carModel: '',
        yearFrom: '',
        yearTo: '',
        priceFrom: '',
        priceTo: '',
        location: '',
        condition: []
    });
    const [availableMarks, setAvailableMarks] = useState([]);
    const [availableModels, setAvailableModels] = useState([]);
    const [savedSearches, setSavedSearches] = useState([]);
    const [userId, setUserId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

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

    const [categories, setCategories] = useState([]);

    const categoryIcons = {
        'Engine Parts': <FaCog />,
        'Brake System': <FaCar />,
        'Suspension': <FaWhmcs />,
        'Exhaust System': <FaScrewdriver />,
        'Transmission': <FaCog />,
        'Electrical': <FaPlug />,
        'Body Parts': <FaCar />,
        'Interior': <FaInfoCircle />,
        'Wheels & Tires': <FaQuestionCircle />,
        'Accessories': <FaShoppingCart />,
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/parts/categories');
                setCategories(response.data);
            } catch (error) {
                console.error(t('error_fetching_categories'), error);
            }
        };
        fetchCategories();
    }, [t]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const partId = params.get('partId');
        if (partId) {
            const fetchPart = async () => {
                try {
                    const response = await api.get(`/parts/${partId}`);
                    setSelectedPart(response.data);
                } catch (error) {
                    console.error(t('error_fetching_part'), error);
                }
            };
            fetchPart();
        }
    }, [location.search, t]);

    const vehicleData = {
        car: {
            marks: ['Mercedes-Benz', 'BMW', 'Audi', 'Ford', 'Toyota', 'Renault', 'Volkswagen', 'Skoda'],
            models: {
                'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class'],
                'BMW': ['3 Series', '5 Series', 'X5'],
                'Audi': ['A4', 'A6', 'Q7'],
                'Ford': ['Focus', 'Fiesta', 'Mondeo'],
                'Toyota': ['Corolla', 'Camry', 'RAV4'],
                'Renault': ['Clio', 'Megane', 'Captur'],
                'Volkswagen': ['Golf', 'Passat', 'Tiguan'],
                'Skoda': ['Octavia', 'Superb', 'Kodiaq']
            }
        },
        van: {
            marks: ['Mercedes-Benz', 'Fiat', 'Opel', 'Renault', 'Iveco'],
            models: {
                'Mercedes-Benz': ['Sprinter', 'Vito'],
                'Fiat': ['Ducato', 'Doblo'],
                'Opel': ['Vivaro', 'Movano'],
                'Renault': ['Trafic', 'Master'],
                'Iveco': ['Daily']
            }
        },
        motorcycle: {
            marks: ['Honda', 'Yamaha', 'Suzuki', 'Ducati', 'KTM'],
            models: {
                'Honda': ['CBR', 'Africa Twin'],
                'Yamaha': ['MT-07', 'R1'],
                'Suzuki': ['GSX-R', 'V-Strom'],
                'Ducati': ['Panigale', 'Monster'],
                'KTM': ['Duke', 'Adventure']
            }
        }
    };

    const albanianCities = ['Tirana', 'Durres', 'Vlora', 'Shkoder', 'Fier', 'Korce', 'Elbasan', 'Berat', 'Lushnje', 'Kavaje', 'Gjirokaster', 'Sarande'];

    const fetchParts = useCallback(async () => {
        if (!selectedSubCategory) return;
        try {
            const apiResponse = await api.get('/parts');
            let partsFromApi = apiResponse.data || [];

            partsFromApi = partsFromApi.filter(p => p.subCategoryId === selectedSubCategory.id);

            const storedParts = JSON.parse(localStorage.getItem('parts'));
            if (storedParts) {
                partsFromApi = partsFromApi.map(part => {
                    const storedPart = storedParts.find(p => p.id === part.id);
                    if (storedPart) {
                        return { ...part, reserved: storedPart.reserved };
                    }
                    return part;
                });
            }
            setInitialParts(partsFromApi);
            setParts(partsFromApi);
        } catch (error) {
            console.error(t("error_fetching_parts"), error);
        }
    }, [selectedSubCategory, t]);

    useEffect(() => {
        if (view === 'parts' && selectedSubCategory) {
            fetchParts(filters);
        }
    }, [view, selectedSubCategory, fetchParts, filters]);

    const handleSearch = () => {
        console.log('initialParts:', initialParts);
        console.log('filters:', filters);
        let filteredParts = [...initialParts];
        if (filters.vehicleType) {
            filteredParts = filteredParts.filter(p => p.vehicleType === filters.vehicleType);
        }
        if (filters.carMark) {
            filteredParts = filteredParts.filter(p => p.carMark === filters.carMark);
        }
        if (filters.carModel) {
            filteredParts = filteredParts.filter(p => p.carModel === filters.carModel);
        }
        if (filters.yearFrom) {
            filteredParts = filteredParts.filter(p => p.year >= filters.yearFrom);
        }
        if (filters.yearTo) {
            filteredParts = filteredParts.filter(p => p.year <= filters.yearTo);
        }
        if (filters.priceFrom) {
            filteredParts = filteredParts.filter(p => p.price >= filters.priceFrom);
        }
        if (filters.priceTo) {
            filteredParts = filteredParts.filter(p => p.price <= filters.priceTo);
        }
        if (filters.location) {
            filteredParts = filteredParts.filter(p => p.location === filters.location);
        }
        if (filters.condition.length > 0) {
            filteredParts = filteredParts.filter(p => filters.condition.includes(p.condition));
        }
        console.log('filteredParts:', filteredParts);
        setParts(filteredParts);
        setSearched(true);
    };

    const handleSaveSearch = () => {
        const searchName = prompt(t("enter_search_name"));
        if (searchName) {
            const newSearch = { name: searchName, filters };
            const updatedSearches = [...savedSearches, newSearch];
            setSavedSearches(updatedSearches);
            localStorage.setItem('savedPartSearches', JSON.stringify(updatedSearches));
        }
    };

    const handleLoadSearch = (searchToLoad) => {
        setFilters(searchToLoad.filters);
        const { vehicleType, carMark } = searchToLoad.filters;
        if (vehicleType) {
            setAvailableMarks(vehicleData[vehicleType]?.marks || []);
        }
        if (carMark) {
            setAvailableModels(vehicleData[vehicleType]?.models[carMark] || []);
        }
    };

    const handleDeleteSearch = (indexToDelete) => {
        const updatedSearches = savedSearches.filter((_, index) => index !== indexToDelete);
        setSavedSearches(updatedSearches);
        localStorage.setItem('savedPartSearches', JSON.stringify(updatedSearches));
    };

    const handleVehicleTypeChange = (e) => {
        const type = e.target.value;
        setFilters(prev => ({ ...prev, vehicleType: type, carMark: '', carModel: '' }));
        setAvailableMarks(vehicleData[type]?.marks || []);
        setAvailableModels([]);
    };

    const handleMarkChange = (e) => {
        const mark = e.target.value;
        setFilters(prev => ({ ...prev, carMark: mark, carModel: '' }));
        setAvailableModels(vehicleData[filters.vehicleType]?.models[mark] || []);
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const handleConditionChange = (condition) => {
        setFilters(prev => ({
            ...prev,
            condition: prev.condition.includes(condition) ?
                prev.condition.filter(c => c !== condition) :
                [...prev.condition, condition]
        }));
    };

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setView('subcategories');
    };

    const handleSubCategoryClick = (subCategory) => {
        setSelectedSubCategory(subCategory);
        setSearched(false);
        fetchParts();
        setView('parts');
    };

    const handlePartClick = (part) => {
        setSelectedPart(part);
    };

    const [showReserveModal, setShowReserveModal] = useState(false);

    const handleReserveClick = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert(t('please_log_in_to_reserve'));
            return;
        }
        setShowReserveModal(true);
    };

    const handleReservationSubmit = async (formData) => {
        const updatedParts = parts.map(p => p.id === selectedPart.id ? { ...p, reserved: true, reservedBy: userId } : p);
        setParts(updatedParts);
        setSelectedPart({ ...selectedPart, reserved: true, reservedBy: userId });
        localStorage.setItem('parts', JSON.stringify(updatedParts));
        alert(t('part_reserved_successfully'));
        setShowReserveModal(false);
    };

    const handleCancelReservation = (part) => {
        if (part.reservedBy !== userId) {
            return alert(t("cannot_cancel_other_reservation"));
        }
        if (window.confirm(t('are_you_sure_cancel_reservation'))) {
            const updatedParts = parts.map(p => p.id === part.id ? { ...p, reserved: false, reservedBy: null } : p);
            setParts(updatedParts);
            if (selectedPart && selectedPart.id === part.id) {
                setSelectedPart({ ...selectedPart, reserved: false, reservedBy: null });
            }
            localStorage.setItem('parts', JSON.stringify(updatedParts));
            alert(t('reservation_cancelled_successfully'));
        }
    };

    const handleSave = async (partAdId) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert(t('please_log_in_to_save'));
            return;
        }

        try {
            await api.post('/saved-items', { partAdId: String(partAdId) }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            alert(t('part_saved_successfully'));
        } catch (error) {
            if (error.response?.status === 409) {
                alert(t('already_saved_part'));
            } else {
                alert(error.response?.data?.message || t('failed_to_save_part'));
            }
        }
    };

    const isOwner = (part) => {
        console.log('part.sellerId:', part.sellerId);
        console.log('userId:', userId);
        return part.sellerId === userId;
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('are_you_sure_delete_ad'))) {
            try {
                await api.delete(`/parts/${id}`);
                setInitialParts(prevParts => prevParts.filter(p => p.id !== id));
                setParts(prevParts => prevParts.filter(p => p.id !== id));
            } catch (error) {
                alert(error.response?.data?.message || t('failed_to_delete_ad'));
            }
        }
    };

    const handleModify = (part) => {
        // For now, just log the part to be modified
        console.log('Modify part:', part);
    };

    const handleBackClick = () => {
        const params = new URLSearchParams(location.search);
        if (params.get('from') === 'saved-items') {
            navigate('/saved-items');
        } else {
            setSelectedPart(null);
        }
    };

    const renderCategories = () => {
        return (
            <div>
                <h1 className="main-title">{t('automotive_parts')}</h1>
                <div className="title-underline"></div>
                <div className="category-grid"> {/* Use a grid for better layout */}
                    {categories.map(category => (
                        <div key={category.id} className="category-card" onClick={() => handleCategoryClick(category)}>
                            <div className="category-icon">{categoryIcons[category.name]}</div>
                            <h3>{t(category.name, { ns: 'dynamic' })}</h3>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderSubCategories = () => (
        <div>
            <button className="back-btn" onClick={() => { setView('categories'); setSelectedCategory(null); }}>{t('back_to_categories')}</button>
            <h2>{t(selectedCategory.name, { ns: 'dynamic' })}</h2>
            <div className="subcategory-list">
                {selectedCategory.subCategories.map((sub) => (
                    <div key={sub.id} className="subcategory-item" onClick={() => handleSubCategoryClick(sub)}>
                        {t(sub.name, { ns: 'dynamic' })}
                    </div>
                ))}
            </div>
        </div>
    );

    const renderParts = () => {
        const itemsPerPage = 5;
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = parts.slice(indexOfFirstItem, indexOfLastItem);

        return (
            <div className="parts-view" style={{ display: 'flex' }}>
                <div className="filters-sidebar" style={{ flex: '35%' }}>
                    <button className="back-btn" onClick={() => { setView('subcategories'); setParts([]); }}>{t('back_to_subcategories')}</button>
                    <h3>{t('filters')}</h3>
                    
                    <label htmlFor="vehicleType">{t('vehicle_type')}</label>
                    <select id="vehicleType" value={filters.vehicleType} onChange={handleVehicleTypeChange}>
                        <option value="">{t('all_types')}</option>
                        <option value="car">{t('car')}</option>
                        <option value="van">{t('van')}</option>
                        <option value="motorcycle">{t('motorcycle')}</option>
                    </select>

                    <label htmlFor="carMark">{t('mark')}</label>
                    <select id="carMark" value={filters.carMark} onChange={handleMarkChange} disabled={!filters.vehicleType}>
                        <option value="">{t('all_marks')}</option>
                        {availableMarks.map(mark => <option key={mark} value={mark}>{mark}</option>)}
                    </select>

                    <label htmlFor="carModel">{t('model')}</label>
                    <select id="carModel" value={filters.carModel} onChange={e => handleFilterChange('carModel', e.target.value)} disabled={!filters.carMark}>
                        <option value="">{t('all_models')}</option>
                        {availableModels.map(model => <option key={model} value={model}>{model}</option>)}
                    </select>

                    <label>{t('year_range')}</label>
                    <div className="range-inputs">
                        <input type="number" placeholder={t('from')} value={filters.yearFrom} onChange={e => handleFilterChange('yearFrom', e.target.value)} />
                        <input type="number" placeholder={t('to')} value={filters.yearTo} onChange={e => handleFilterChange('yearTo', e.target.value)} />
                    </div>

                    <label>{t('price_range')}</label>
                    <div className="range-inputs">
                        <input type="number" placeholder={t('from')} value={filters.priceFrom} onChange={e => handleFilterChange('priceFrom', e.target.value)} />
                        <input type="number" placeholder={t('to')} value={filters.priceTo} onChange={e => handleFilterChange('priceTo', e.target.value)} />
                    </div>

                    <label>{t('condition')}</label>
                    <div className="checkbox-group">
                        <input type="checkbox" id="conditionNew" checked={filters.condition.includes('New')} onChange={() => handleConditionChange('New')} />
                        <label htmlFor="conditionNew">{t('new')}</label>
                        <input type="checkbox" id="conditionUsed" checked={filters.condition.includes('Used')} onChange={() => handleConditionChange('Used')} />
                        <label htmlFor="conditionUsed">{t('used')}</label>
                    </div>

                    <button onClick={handleSearch}>{t('search')}</button>
                    <button onClick={handleSaveSearch} className="save-search-btn">{t('save_search')}</button>

                    {savedSearches.length > 0 && (
                        <div className="saved-searches">
                            <h4>{t('saved_searches_title')}</h4>
                            <ul>
                                {savedSearches.map((search, index) => (
                                    <li key={index}>
                                        <span>{search.name}</span>
                                        <button onClick={() => handleLoadSearch(search)}>{t('load')}</button>
                                        <button onClick={() => handleDeleteSearch(index)}>X</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="parts-list" style={{ flex: '65%' }}>
                    <h2>{t(selectedSubCategory.name, { ns: 'dynamic' })}</h2>
                    <p>{t('parts_found', { count: parts.length })}</p>
                    <div className="part-cards">
                        {currentItems.map(part => (
                            <div key={part.id} className={`part-card ${part.reserved ? 'reserved' : ''} ${part.package === 'premium' ? 'premium' : ''}`} onClick={() => !part.reserved && handlePartClick(part)}>
                                
                                {part.reserved && <div className="reserved-badge">{t('reserved')}</div>}
                                <img src={part.imageUrl} alt={part.name} className="part-image-placeholder" />
                                <div className="part-details">
                                    <div className="part-name">{part.name}</div>
                                    {part.vehicleType && part.carMark && part.carModel && (
                                        <div className="part-vehicle-info">{`${part.vehicleType} - ${part.carMark} ${part.carModel}`}</div>
                                    )}
                                    <div className="part-price">€{part.price}</div>
                                    <div className="part-location-phone">{`${part.location} • ${part.phone} • ${part.year}`}</div>
                                    <div className="ad-actions">
                                        {isOwner(part) && (
                                            <>
                                                <button className="ad-action-btn" onClick={(e) => {e.stopPropagation(); handleModify(part)}}>{t('modify')}</button>
                                                <button className="ad-action-btn" onClick={(e) => {e.stopPropagation(); handleDelete(part.id)}}>{t('delete')}</button>
                                            </>
                                        )}
                                    </div>
                                    {part.reserved && part.reservedBy === userId && <button className="cancel-reservation-btn" onClick={(e) => {e.stopPropagation(); handleCancelReservation(part);}}>{t('cancel_reservation')}</button>}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="pagination">
                        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>{t('previous')}</button>
                        <span>{t('page_of', { currentPage, totalPages: Math.ceil(parts.length / itemsPerPage) })}</span>
                        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(parts.length / itemsPerPage)))} disabled={currentPage === Math.ceil(parts.length / itemsPerPage)}>{t('next')}</button>
                    </div>
                </div>
            </div>
        );
    };

    const renderPartDetail = () => {
        console.log('selectedPart:', selectedPart);
        return (
            <div className="part-detail-view">
                <button className="back-btn" onClick={handleBackClick}>{t('back_to_parts')}</button>
                <div className="part-detail-content">
                    <div className="part-detail-left">
                        <h2>{selectedPart.name}</h2>
                        <div className="spec-section">
                            <h2>{t('spare_info')}</h2>
                            <div className="spec-grid">
                                                                                            <div className="spec-item">
                                                                <span className="spec-label">{t('mark_label')}</span>
                                                                <span className="spec-value">{selectedPart.carMark}</span>
                                                            </div>
                                                            <div className="spec-item">
                                                                <span className="spec-label">{t('model_label')}</span>
                                                                <span className="spec-value">{selectedPart.carModel}</span>
                                                            </div>                                <div className="spec-item">
                                    <span className="spec-label">{t('condition_label')}</span>
                                    <span className="spec-value">{selectedPart.condition}</span>
                                </div>
                                <div className="spec-item">
                                    <span className="spec-label">{t('location_label')}</span>
                                    <span className="spec-value">{selectedPart.location}</span>
                                </div>
                                <div className="spec-item">
                                    <span className="spec-label">{t('year_label')}</span>
                                    <span className="spec-value">{selectedPart.year}</span>
                                </div>
                                <div className="spec-item">
                                    <span className="spec-label">{t('price_label')}</span>
                                    <span className="spec-value">€{selectedPart.price}</span>
                                </div>
                            </div>
                        </div>
                        <div className="reserve-btn-container">
                            {!selectedPart.reserved && <button className="reserve-btn" onClick={handleReserveClick}>{t('reserve_part')}</button>}
                            {selectedPart.reserved && <button className="cancel-reservation-btn" onClick={() => handleCancelReservation(selectedPart)}>{t('cancel_reservation')}</button>}
                        </div>
                        <div className="description-section">
                            <h3>{t('description')}</h3>
                            <p>{selectedPart.description}</p>
                        </div>
                        <div className="seller-info">
                            <h3>{t('seller_information')}</h3>
                            <p>{t('seller_name', { name: selectedPart.sellerName })}</p>
                            
                            <p>{t('seller_contact', { phone: selectedPart.phone })}</p>
                        </div>
                    </div>
                    <div className="part-detail-right">
                        <img src={selectedPart.imageUrl} alt={selectedPart.name} />
                        <button className="save-btn" onClick={() => handleSave(selectedPart.id)}><FaBookmark /> {t('save')}</button>
                    </div>
                </div>
                {showReserveModal && <ReservationModal part={selectedPart} onClose={() => setShowReserveModal(false)} onSubmit={handleReservationSubmit} />}
            </div>
        );
    };

    const ReservationModal = ({ part, onClose, onSubmit }) => {
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
                        <h3>{t('reserve_part_title', { partName: part.name })}</h3>
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

    return (
        <div className="spare-page">
            {selectedPart ? renderPartDetail() : view === 'categories' ? renderCategories() : view === 'subcategories' ? renderSubCategories() : renderParts()}
        </div>
    );
};

export default Spare;