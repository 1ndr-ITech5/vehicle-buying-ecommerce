import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './../pagestyle/Home.css';
import homeImage from './../assets/jokic.avif';

const API_URL = 'http://localhost:3001/api';

function Home() {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);
  const [filters, setFilters] = useState({ type: '', model: '', yearFrom: '', yearTo: '', priceFrom: '', priceTo: '', city: '' });
  const [activeVehicleCategory, setActiveVehicleCategory] = useState('car');
  const [availableModels, setAvailableModels] = useState([]);
  const [latestVehicles, setLatestVehicles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const vehicleData = {
    car: { marks: ['Mercedes-Benz', 'BMW', 'Audi', 'Ford', 'Toyota', 'Renault', 'Volkswagen', 'Skoda'], models: { 'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class'], 'BMW': ['3 Series', '5 Series', 'X5'], 'Audi': ['A4', 'A6', 'Q7'], 'Ford': ['Focus', 'Fiesta', 'Mondeo'], 'Toyota': ['Corolla', 'Camry', 'RAV4'], 'Renault': ['Clio', 'Megane', 'Captur'], 'Volkswagen': ['Golf', 'Passat', 'Tiguan'], 'Skoda': ['Octavia', 'Superb', 'Kodiaq'] } },
    van: { marks: ['Mercedes-Benz', 'Fiat', 'Opel', 'Renault', 'Iveco'], models: { 'Mercedes-Benz': ['Sprinter', 'Vito'], 'Fiat': ['Ducato', 'Doblo'], 'Opel': ['Vivaro', 'Movano'], 'Renault': ['Trafic', 'Master'], 'Iveco': ['Daily'] } },
    motorcycle: { marks: ['Honda', 'Yamaha', 'Suzuki', 'Ducati', 'KTM'], models: { 'Honda': ['CBR', 'Africa Twin'], 'Yamaha': ['MT-07', 'R1'], 'Suzuki': ['GSX-R', 'V-Strom'], 'Ducati': ['Panigale', 'Monster'], 'KTM': ['Duke', 'Adventure'] } }
  };

  const fetchLatestVehicles = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/vehicles?limit=6`);
      setLatestVehicles(response.data);
    } catch (error) {
      console.error("Error fetching latest vehicles:", error);
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/reviews`);
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  }, []);

  useEffect(() => {
    fetchLatestVehicles();
    fetchReviews();
    const handleScroll = () => {
        const imageText = document.querySelector('.image-text');
        if (imageText) {
            const imageTextTop = imageText.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            if (imageTextTop < windowHeight * 0.8) {
                setAnimate(true);
            }
        }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchLatestVehicles, fetchReviews]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleMarkChange = (e) => {
    const mark = e.target.value;
    setFilters(prev => ({ ...prev, type: mark, model: '' }));
    setAvailableModels(vehicleData[activeVehicleCategory].models[mark] || []);
  };

  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    queryParams.append('category', activeVehicleCategory);
    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        queryParams.append(key, value);
      }
    }
    navigate(`/vehicle-ads?${queryParams.toString()}`);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (rating > 0 && comment) {
      try {
        await axios.post(`${API_URL}/reviews`, { name: 'Anonymous User', rating, comment });
        setRating(0);
        setComment('');
        fetchReviews();
      } catch (error) {
        console.error("Error submitting review:", error);
      }
    }
  };

  return (
    <div className="home-container">
        
        <div className="image-container">
            <img src={homeImage} alt="Family in a car" className="home-image" />
            <div className={`image-text ${animate ? 'animate' : ''}`}>
                <h1 className="new-quote">Find Your Next Adventure</h1>
                <p className="new-quote-small">The best vehicles for the best price</p>
            </div>
        </div>

        <div className="overlay-box">
            <div className="search-form">
                <div className="vehicle-tabs">
                    <button className={`tab-btn ${activeVehicleCategory === 'car' ? 'active' : ''}`} onClick={() => setActiveVehicleCategory('car')}>🚗 Car</button>
                    <button className={`tab-btn ${activeVehicleCategory === 'van' ? 'active' : ''}`} onClick={() => setActiveVehicleCategory('van')}>🚐 Van</button>
                    <button className={`tab-btn ${activeVehicleCategory === 'motorcycle' ? 'active' : ''}`} onClick={() => setActiveVehicleCategory('motorcycle')}>🏍️ Motorcycle</button>
                </div>
                <div className="form-row">
                    <div className="form-group"><label>Mark</label><select value={filters.type} onChange={handleMarkChange}><option value="">Select Mark</option>{vehicleData[activeVehicleCategory].marks.map(mark => (<option key={mark} value={mark}>{mark}</option>))}</select></div>
                    <div className="form-group"><label>Model</label><select value={filters.model} onChange={(e) => handleFilterChange('model', e.target.value)} disabled={!filters.type}><option value="">Select Model</option>{availableModels.map(model => (<option key={model} value={model}>{model}</option>))}</select></div>
                </div>
                <div className="form-row">
                    <div className="form-group range-group"><label>Year</label><div className="range-inputs"><input type="text" placeholder="From" value={filters.yearFrom} onChange={(e) => handleFilterChange('yearFrom', e.target.value)} /><input type="text" placeholder="To" value={filters.yearTo} onChange={(e) => handleFilterChange('yearTo', e.target.value)} /></div></div>
                    <div className="form-group range-group"><label>Price</label><div className="range-inputs"><input type="text" placeholder="From" value={filters.priceFrom} onChange={(e) => handleFilterChange('priceFrom', e.target.value)} /><input type="text" placeholder="To" value={filters.priceTo} onChange={(e) => handleFilterChange('priceTo', e.target.value)} /></div></div>
                </div>
                <div className="form-row">
                    <div className="form-group"><label>City</label><input type="text" id="city" name="city" value={filters.city} onChange={(e) => handleFilterChange('city', e.target.value)} /></div>
                    <div className="form-group"><button className="search-btn-red" onClick={handleSearch}>Search</button></div>
                </div>
            </div>
        </div>

        <div className="latest-cars-container">
            <h2 className="fjale">Latest Cars</h2>
            <div className="car-grid">
                {latestVehicles.map(vehicle => (
                    <div className="car-card" key={vehicle.id} onClick={() => navigate(`/vehicle-ads?vehicleId=${vehicle.id}`)}>
                        <div className="car-image-placeholder" style={{ backgroundImage: `url(${vehicle.imageUrl || 'https://via.placeholder.com/300x200'})`, backgroundSize: 'cover' }}></div>
                        <div className="car-details">
                            <p className="car-price">€{vehicle.price.toLocaleString()}</p>
                            <p className="car-name">{vehicle.name}</p>
                            <p className="car-specs">{`${vehicle.year} • ${vehicle.mileage.toLocaleString()} km`}</p>
                            <p className="car-location">{vehicle.location}</p>
                            <p className="car-phone">{vehicle.phone}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="reviews-section">
            <h2>Customer Reviews</h2>
            <div className="reviews-container">
                {reviews.map((review) => (
                    <div className="review-card" key={review.id}>
                        <div className="review-header"><span className="reviewer-name">{review.name}</span><div className="star-rating">{[...Array(5)].map((_, i) => (<span key={i} className={i < review.rating ? 'star filled' : 'star'}>★</span>))}</div></div>
                        <p className="review-comment">{review.comment}</p>
                    </div>
                ))}
            </div>
            <div className="review-form-container">
                <h3>Leave a Review</h3>
                <form onSubmit={handleSubmitReview} className="review-form">
                    <div className="rating-input"><p>Your Rating:</p><div className="star-rating-input">{[...Array(5)].map((_, i) => (<span key={i} className={i < (hoverRating || rating) ? 'star filled' : 'star'} onClick={() => setRating(i + 1)} onMouseEnter={() => setHoverRating(i + 1)} onMouseLeave={() => setHoverRating(0)}>★</span>))}</div></div>
                    <div className="comment-input"><label htmlFor="comment">Your Comment:</label><textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience with us..." rows="4" required></textarea></div>
                    <button type="submit" className="submit-review-btn">Submit Review</button>
                </form>
            </div>
        </div>
    </div>
  );
}

export default Home;
