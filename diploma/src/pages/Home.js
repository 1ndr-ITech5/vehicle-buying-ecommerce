import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './../pagestyle/Home.css';
import homeImage from './../assets/jokic.avif';
import NewVehicles from './../components/NewVehicles';

const API_URL = 'http://localhost:3001/api';
const SLIDES_TO_SHOW = 3;

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
  const [name, setName] = useState('');
  const [editingReview, setEditingReview] = useState(null);

  // Carousel State
  const [currentIndex, setCurrentIndex] = useState(SLIDES_TO_SHOW);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [displayReviews, setDisplayReviews] = useState([]);

  const enableCarousel = reviews.length >= SLIDES_TO_SHOW;

  useEffect(() => {
    if (reviews.length > 0 && !enableCarousel) {
      setDisplayReviews([...reviews]);
    } else if (enableCarousel) {
      const slides = [
        ...reviews.slice(-SLIDES_TO_SHOW),
        ...reviews,
        ...reviews.slice(0, SLIDES_TO_SHOW),
      ];
      setDisplayReviews(slides);
      setCurrentIndex(SLIDES_TO_SHOW);
    } else {
      setDisplayReviews([]);
    }
  }, [reviews, enableCarousel]);

  const nextReview = () => {
    if (!enableCarousel || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(prevIndex => prevIndex + 1);
  };

  const prevReview = () => {
    if (!enableCarousel || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(prevIndex => prevIndex - 1);
  };

  useEffect(() => {
    if (enableCarousel) {
      const interval = setInterval(() => {
        nextReview();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [enableCarousel, nextReview]);

  const handleTransitionEnd = () => {
    setIsTransitioning(false);
    if (currentIndex === 0) {
      setCurrentIndex(reviews.length);
    } else if (currentIndex === reviews.length + SLIDES_TO_SHOW) {
      setCurrentIndex(SLIDES_TO_SHOW);
    }
  };

  useEffect(() => {
    if (enableCarousel) {
      if (!isTransitioning && (currentIndex === reviews.length || currentIndex === SLIDES_TO_SHOW)) {
      } else if (isTransitioning) {
          const timer = setTimeout(() => {
              setIsTransitioning(false);
          }, 1000);
          return () => clearTimeout(timer);
      }
    }
  }, [currentIndex, isTransitioning, reviews.length, enableCarousel]);

  const vehicleData = {
    car: { marks: ['Mercedes-Benz', 'BMW', 'Audi', 'Ford', 'Toyota', 'Renault', 'Volkswagen', 'Skoda'], models: { 'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class'], 'BMW': ['3 Series', '5 Series', 'X5'], 'Audi': ['A4', 'A6', 'Q7'], 'Ford': ['Focus', 'Fiesta', 'Mondeo'], 'Toyota': ['Corolla', 'Camry', 'RAV4'], 'Renault': ['Clio', 'Megane', 'Captur'], 'Volkswagen': ['Golf', 'Passat', 'Tiguan'], 'Skoda': ['Octavia', 'Superb', 'Kodiaq'] } },
    van: { marks: ['Mercedes-Benz', 'Fiat', 'Opel', 'Renault', 'Iveco'], models: { 'Mercedes-Benz': ['Sprinter', 'Vito'], 'Fiat': ['Ducato', 'Doblo'], 'Opel': ['Vivaro', 'Movano'], 'Renault': ['Trafic', 'Master'], 'Iveco': ['Daily'] } },
    motorcycle: { marks: ['Honda', 'Yamaha', 'Suzuki', 'Ducati', 'KTM'], models: { 'Honda': ['CBR', 'Africa Twin'], 'Yamaha': ['MT-07', 'R1'], 'Suzuki': ['GSX-R', 'V-Strom'], 'Ducati': ['Panigale', 'Monster'], 'KTM': ['Duke', 'Adventure'] } }
  };

  const fetchLatestVehicles = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/vehicles`);
      const shuffled = response.data.sort(() => 0.5 - Math.random());
      setLatestVehicles(shuffled.slice(0, 6));
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
    if (mark) {
      setAvailableModels(vehicleData[activeVehicleCategory].models[mark] || []);
    } else {
      setAvailableModels([]);
    }
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
        await axios.post(`${API_URL}/reviews`, { name: name || 'Anonymous User', rating, comment });
        setRating(0);
        setComment('');
        setName('');
        fetchReviews();
      } catch (error) {
        console.error("Error submitting review:", error);
      }
    }
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await axios.delete(`${API_URL}/reviews/${reviewId}`);
        fetchReviews();
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  };

  const handleEdit = (review) => {
    setEditingReview({ ...review });
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    if (!editingReview) return;
    try {
      await axios.put(`${API_URL}/reviews/${editingReview.id}`, {
        name: editingReview.name,
        rating: editingReview.rating,
        comment: editingReview.comment,
      });
      setEditingReview(null);
      fetchReviews();
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  return (
    <div className="home-container">
        {editingReview && (
            <div className="edit-modal">
                <div className="edit-modal-content">
                    <h3>Edit Review</h3>
                    <form onSubmit={handleUpdateReview}>
                        <div className="comment-input">
                            <label>Name:</label>
                            <input type="text" value={editingReview.name} onChange={(e) => setEditingReview({ ...editingReview, name: e.target.value })} />
                        </div>
                        <div className="comment-input">
                            <label>Comment:</label>
                            <textarea value={editingReview.comment} onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })} rows="4"></textarea>
                        </div>
                        <div className="rating-input">
                            <p>Rating:</p>
                            <div className="star-rating-input">{[...Array(5)].map((_, i) => (<span key={i} className={i < editingReview.rating ? 'star filled' : 'star'} onClick={() => setEditingReview({ ...editingReview, rating: i + 1 })}>★</span>))}
                            </div>
                        </div>
                        <button type="submit">Update Review</button>
                        <button type="button" onClick={() => setEditingReview(null)}>Cancel</button>
                    </form>
                </div>
            </div>
        )}

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

        <div className="latest-text">
          <h2>Latest Cars</h2>
        </div>

        <NewVehicles />

        <div className="reviews-section">
            <h2>Customer Reviews</h2>
            {enableCarousel ? (
                <div className="reviews-carousel">
                    <button className="carousel-btn prev" onClick={prevReview} disabled={isTransitioning}>&#10094;</button>
                    <div className="reviews-viewport">
                        <div
                            className="reviews-container"
                            style={{
                                transform: `translateX(calc(-${currentIndex * (100 / SLIDES_TO_SHOW)}% - ${currentIndex * 20}px))`,
                                transition: isTransitioning ? 'transform 1s ease-in-out' : 'none',
                            }}
                            onTransitionEnd={handleTransitionEnd}
                        >
                            {displayReviews.map((review, index) => (
                                <div className="review-card" key={review.id || index}>
                                    <div className="review-card-content">
                                        <div className="review-header">
                                            <span className="reviewer-name">{review.name}</span>
                                            <div className="star-rating">{[...Array(5)].map((_, i) => (<span key={i} className={i < review.rating ? 'star filled' : 'star'}>★</span>))}
                                            </div>
                                        </div>
                                        <p className="review-comment">{review.comment}</p>
                                        <div className="review-actions">
                                            <button onClick={() => handleEdit(review)}>Edit</button>
                                            <button onClick={() => handleDelete(review.id)}>Delete</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button className="carousel-btn next" onClick={nextReview} disabled={isTransitioning}>&#10095;</button>
                </div>
            ) : (
                <div className="static-reviews-container">
                    {reviews.map(review => (
                        <div className="review-card" key={review.id}>
                            <div className="review-card-content">
                                <div className="review-header">
                                    <span className="reviewer-name">{review.name}</span>
                                    <div className="star-rating">{[...Array(5)].map((_, i) => (<span key={i} className={i < review.rating ? 'star filled' : 'star'}>★</span>))}
                                    </div>
                                </div>
                                <p className="review-comment">{review.comment}</p>
                                <div className="review-actions">
                                    <button onClick={() => handleEdit(review)}>Edit</button>
                                    <button onClick={() => handleDelete(review.id)}>Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="review-form-container">
                <h3>Leave a Review</h3>
                <form onSubmit={handleSubmitReview} className="review-form">
                    <div className="rating-input"><p>Your Rating:</p><div className="star-rating-input">{[...Array(5)].map((_, i) => (<span key={i} className={i < (hoverRating || rating) ? 'star filled' : 'star'} onClick={() => setRating(i + 1)} onMouseEnter={() => setHoverRating(i + 1)} onMouseLeave={() => setHoverRating(0)}>★</span>))}
                    </div></div>
                    <div className="comment-input"><label htmlFor="name">Your Name (optional):</label><input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Leave blank for anonymous" /></div>
                    <div className="comment-input"><label htmlFor="comment">Your Comment:</label><textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience with us..." rows="4" required></textarea></div>
                    <button type="submit" className="submit-review-btn">Submit Review</button>
                </form>
            </div>
        </div>
    </div>
  );
}

export default Home;