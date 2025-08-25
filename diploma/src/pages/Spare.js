import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './../pagestyle/Spare.css';

const API_URL = 'http://localhost:3001/api';

const Spare = () => {
    const [view, setView] = useState('categories');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);
    const [parts, setParts] = useState([]);
    const [selectedPart, setSelectedPart] = useState(null);
    const [filters, setFilters] = useState({ vehicleType: '', carMark: '', carModel: '', yearFrom: '', yearTo: '', priceFrom: '', priceTo: '', location: '', condition: [] });
    const [availableMarks, setAvailableMarks] = useState([]);
    const [availableModels, setAvailableModels] = useState([]);
    const [savedSearches, setSavedSearches] = useState([]);

    const vehicleData = {
        car: { marks: ['Mercedes-Benz', 'BMW', 'Audi', 'Ford', 'Toyota', 'Renault', 'Volkswagen', 'Skoda'], models: { 'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class'], 'BMW': ['3 Series', '5 Series', 'X5'], 'Audi': ['A4', 'A6', 'Q7'], 'Ford': ['Focus', 'Fiesta', 'Mondeo'], 'Toyota': ['Corolla', 'Camry', 'RAV4'], 'Renault': ['Clio', 'Megane', 'Captur'], 'Volkswagen': ['Golf', 'Passat', 'Tiguan'], 'Skoda': ['Octavia', 'Superb', 'Kodiaq'] } },
        van: { marks: ['Mercedes-Benz', 'Fiat', 'Opel', 'Renault', 'Iveco'], models: { 'Mercedes-Benz': ['Sprinter', 'Vito'], 'Fiat': ['Ducato', 'Doblo'], 'Opel': ['Vivaro', 'Movano'], 'Renault': ['Trafic', 'Master'], 'Iveco': ['Daily'] } },
        motorcycle: { marks: ['Honda', 'Yamaha', 'Suzuki', 'Ducati', 'KTM'], models: { 'Honda': ['CBR', 'Africa Twin'], 'Yamaha': ['MT-07', 'R1'], 'Suzuki': ['GSX-R', 'V-Strom'], 'Ducati': ['Panigale', 'Monster'], 'KTM': ['Duke', 'Adventure'] } }
    };
    const albanianCities = ['Tirana', 'Durres', 'Vlora', 'Shkoder', 'Fier', 'Korce', 'Elbasan', 'Berat', 'Lushnje', 'Kavaje', 'Gjirokaster', 'Sarande'];

    useEffect(() => {
        const loadedSearches = JSON.parse(localStorage.getItem('savedPartSearches') || '[]');
        setSavedSearches(loadedSearches);
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/parts/categories`);
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }, []);

    const fetchParts = useCallback(async () => {
        if (!selectedSubCategory) return;
        try {
            const params = { ...filters, subCategoryId: selectedSubCategory.id };
            const response = await axios.get(`${API_URL}/parts`, { params });
            setParts(response.data);
        } catch (error) {
            console.error("Error fetching parts:", error);
        }
    }, [selectedSubCategory, filters]);

    useEffect(() => {
        if (view === 'categories') {
            fetchCategories();
        }
    }, [view, fetchCategories]);

    useEffect(() => {
        if (view === 'parts' && selectedSubCategory) {
            fetchParts();
        }
    }, [view, selectedSubCategory, fetchParts]);

    const handleSearch = () => {
        fetchParts();
    };

    const handleSaveSearch = () => {
        const searchName = prompt("Enter a name for this search:");
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
        let processedValue = value;
        if (filterName.includes('price')) { processedValue = value ? Math.max(0, Number(value)) : ''; }
        if (filterName.includes('year')) { processedValue = value ? Math.max(1980, Number(value)) : ''; }
        setFilters(prev => ({ ...prev, [filterName]: processedValue }));
    };

    const handleConditionChange = (condition) => setFilters(prev => ({ ...prev, condition: prev.condition.includes(condition) ? prev.condition.filter(c => c !== condition) : [...prev.condition, condition] }));
    const handleCategoryClick = (category) => { setSelectedCategory(category); setView('subcategories'); };
    const handleSubCategoryClick = (subCategory) => { setSelectedSubCategory(subCategory); setView('parts'); };
    const handlePartClick = (part) => { setSelectedPart(part); };

    const renderCategories = () => (
        <div className="categories-section"><h2>Automotive Parts Categories</h2><div className="category-grid">{categories.map(category => (<div key={category.id} className="category-card" onClick={() => handleCategoryClick(category)}><i className={category.icon}></i><h3>{category.name}</h3></div>))}</div></div>
    );

    const renderSubCategories = () => (
        <div className="sub-categories-section"><button className="back-button" onClick={() => { setView('categories'); setSelectedCategory(null); }}>← Back to Categories</button><h2>{selectedCategory.name}</h2><div className="sub-categories-list">{selectedCategory.subCategories.map(sub => (<div key={sub.id} className="sub-category-item" onClick={() => handleSubCategoryClick(sub)}><span>{sub.name}</span><span className="part-count">({sub.partCount} parts)</span></div>))}</div></div>
    );

    const renderParts = () => (
        <div className="main-content">
            <div className="sidebar">
                <div className="filters-section">
                    <button className="back-button" onClick={() => { setView('subcategories'); setParts([]); }}>← Back to Sub-categories</button>
                    <h2>Filters</h2>
                    <div className="filter-group"><label>Vehicle Type</label><select value={filters.vehicleType} onChange={handleVehicleTypeChange}><option value="">All Types</option><option value="car">Car</option><option value="van">Van</option><option value="motorcycle">Motorcycle</option></select></div>
                    <div className="filter-group"><label>Mark</label><select value={filters.carMark} onChange={handleMarkChange} disabled={!filters.vehicleType}><option value="">All Marks</option>{availableMarks.map(mark => (<option key={mark} value={mark}>{mark}</option>))}</select></div>
                    <div className="filter-group"><label>Model</label><select value={filters.carModel} onChange={(e) => handleFilterChange('carModel', e.target.value)} disabled={!filters.carMark}><option value="">All Models</option>{availableModels.map(model => (<option key={model} value={model}>{model}</option>))}</select></div>
                    <div className="filter-group"><label>Year Range</label><div className="price-range"><input type="number" placeholder="From" value={filters.yearFrom} onChange={(e) => handleFilterChange('yearFrom', e.target.value)} /><input type="number" placeholder="To" value={filters.yearTo} onChange={(e) => handleFilterChange('yearTo', e.target.value)} /></div></div>
                    <div className="filter-group"><label>Price Range (€)</label><div className="price-range"><input type="number" placeholder="From" value={filters.priceFrom} onChange={(e) => handleFilterChange('priceFrom', e.target.value)} /><input type="number" placeholder="To" value={filters.priceTo} onChange={(e) => handleFilterChange('priceTo', e.target.value)} /></div></div>
                    <div className="filter-group"><label>Condition</label><div className="checkbox-group"><label className="checkbox-label"><input type="checkbox" checked={filters.condition.includes('New')} onChange={() => handleConditionChange('New')} />New</label><label className="checkbox-label"><input type="checkbox" checked={filters.condition.includes('Used')} onChange={() => handleConditionChange('Used')} />Used</label></div></div>
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
            </div>
            <div className="parts-section"><div className="parts-header"><h2>{selectedSubCategory.name}</h2><span className="parts-count">{parts.length} parts found</span></div><div className="parts-grid">{parts.map(part => (<div key={part.id} className="part-card" onClick={() => handlePartClick(part)}><div className="part-image"><img src={part.imageUrl || 'https://via.placeholder.com/300x200'} alt={part.name} /></div><div className="part-info"><div className="part-price">€{part.price}</div><div className="part-name">{part.name}</div><div className="part-location-phone">{part.location} • {part.phone}</div></div></div>))}</div></div>
        </div>
    );

    const renderPartDetail = () => ( <div className="part-detail"><button className="back-button" onClick={() => setSelectedPart(null)}>← Back to Parts</button><h1>{selectedPart.name}</h1></div> );

    return (
        <div className="space-container">
            {selectedPart ? renderPartDetail() :
             view === 'categories' ? renderCategories() :
             view === 'subcategories' ? renderSubCategories() :
             renderParts()}
        </div>
    );
};

export default Spare;
