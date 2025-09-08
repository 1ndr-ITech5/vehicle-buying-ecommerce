
import React, { useState } from 'react';
import './../compstyle/VehicleForm.css';

const VehicleForm = ({ selectedPackage, adType, onFormSubmit, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    make: '',
    model: '',
    year: '',
    price: '',
    mileage: '',
    transmission: '',
    fuel: '',
    color: '',
    location: '',
    phone: '',
    description: '',
    power: '',
    engine: '',
    carPlates: '',
    category: '',
    historyCheck: {
      accidents: 'questionable',
      stolen: 'questionable',
      mileage: 'questionable',
    },
  });
  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'accidents' || name === 'stolen' || name === 'mileage') {
      setFormData(prev => ({
        ...prev,
        historyCheck: {
          ...prev.historyCheck,
          [name]: value,
        },
      }));
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFormSubmit(formData, image);
  };

  const isPremium = selectedPackage === 'premium';

  return (
    <div className="vehicle-form-container">
      <button type="button" className="back-btn-top" onClick={onBack}>← Go Back</button>
      <h2>Create a New {adType === 'vehicle' ? 'Vehicle' : 'Spare Part'} Ad</h2>
      
      <form onSubmit={handleSubmit} className="vehicle-form">
        <div className="form-section">
          <label htmlFor="image">Upload Image</label>
          <input id="image" type="file" name="image" onChange={handleImageChange} />
        </div>

        <div className="form-section">
          <input type="text" name="name" placeholder="Ad Name" onChange={handleChange} required />
          
          <div className="form-row">
            <select name="category" onChange={handleChange} required>
              <option value="">Select Category</option>
              <option value="car">Car</option>
              <option value="van">Van</option>
              <option value="motorcycle">Motorcycle</option>
            </select>
            <input type="text" name="make" placeholder="Make" onChange={handleChange} required />
            <input type="text" name="model" placeholder="Model" onChange={handleChange} required />
          </div>

          <div className="form-row">
            <input type="number" name="year" placeholder="Year" onChange={handleChange} required min="0" />
            <input type="text" name="color" placeholder="Color" onChange={handleChange} required />
            <input type="text" name="carPlates" placeholder="Car Plates" onChange={handleChange} required />
            {isPremium && 
              <select name="fuel" onChange={handleChange} required>
                <option value="">Fuel Type</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            }
            {isPremium && <input type="number" name="mileage" placeholder="Mileage" onChange={handleChange} required min="0" />}
          </div>
        </div>

        <div className="form-section history-check-section">
          <h3>History Check</h3>
          <div className="checkbox-group">
            <div className="history-check-item">
              <span className="history-check-label">Vehicle is clear of accidents:</span>
              <div className="radio-group">
                <label><input type="radio" name="accidents" value="passed" onChange={handleChange} /> Yes</label>
                <label><input type="radio" name="accidents" value="failed" onChange={handleChange} /> No</label>
              </div>
            </div>
            <div className="history-check-item">
              <span className="history-check-label">Vehicle is not stolen:</span>
              <div className="radio-group">
                <label><input type="radio" name="stolen" value="passed" onChange={handleChange} /> Yes</label>
                <label><input type="radio" name="stolen" value="failed" onChange={handleChange} /> No</label>
              </div>
            </div>
            <div className="history-check-item">
              <span className="history-check-label">Mileage is correct:</span>
              <div className="radio-group">
                <label><input type="radio" name="mileage" value="passed" onChange={handleChange} /> Yes</label>
                <label><input type="radio" name="mileage" value="failed" onChange={handleChange} /> No</label>
              </div>
            </div>
          </div>
        </div>

        {isPremium && <div className="form-section">
            <div className="form-row">
              <select name="transmission" onChange={handleChange} required>
                  <option value="">Transmission</option>
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Semi-Automatic">Semi-Automatic</option>
              </select>
              <input type="number" name="power" placeholder="Power (HP)" onChange={handleChange} required min="0" />
              <input type="text" name="engine" placeholder="Engine" onChange={handleChange} required />
            </div>
          </div>}

        <div className="form-section seller-info-section">
          <h3>Seller Information</h3>
          <div className="form-row">
            <input type="text" name="location" placeholder="Location" onChange={handleChange} required />
            <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} required />
          </div>
        </div>

        <div className="form-section">
          <div className="form-row price-section">
            <input type="number" name="price" placeholder="Price" onChange={handleChange} required min="0" />
            <div className="checkbox-group">
              <label><input type="checkbox" name="sellOnCredit" onChange={handleChange} /> Sell on credit?</label>
            </div>
          </div>
          <textarea name="description" placeholder="Description" onChange={handleChange} required maxLength={isPremium ? undefined : 80} rows="5" />
        </div>

        <button type="submit" className="submit-btn">Proceed to Payment</button>
      </form>
    </div>
  );
};

export default VehicleForm;
