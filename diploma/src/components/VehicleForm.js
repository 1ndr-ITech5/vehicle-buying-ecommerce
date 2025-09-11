import React, { useState } from 'react';
import './../compstyle/VehicleForm.css';

const VehicleForm = ({ selectedPackage, adType, onFormSubmit, onBack, initialData }) => {
  const [formData, setFormData] = useState(
    initialData
      ? {
          ...initialData,
          historyCheck: initialData.historyCheck || {
            accidents: 'questionable',
            stolen: 'questionable',
            mileage: 'questionable',
          },
        }
      : {
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
        }
  );
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
      <h2>{initialData ? 'Edit' : 'Create a New'} {adType === 'vehicle' ? 'Vehicle' : 'Spare Part'} Ad</h2>
      
      <form onSubmit={handleSubmit} className="vehicle-form">
        <div className="form-section">
          <h3>Vehicle Details</h3>
          <div className="form-row">
            <div>
              <label htmlFor="name">Ad Name</label>
              <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label htmlFor="category">Category</label>
              <select id="category" name="category" value={formData.category} onChange={handleChange} required>
                <option value="">Select Category</option>
                <option value="car">Car</option>
                <option value="van">Van</option>
                <option value="motorcycle">Motorcycle</option>
              </select>
            </div>
            <div>
              <label htmlFor="make">Make</label>
              <input id="make" type="text" name="make" value={formData.make} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="model">Model</label>
              <input id="model" type="text" name="model" value={formData.model} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label htmlFor="year">Year</label>
              <input id="year" type="number" name="year" value={formData.year} onChange={handleChange} required min="0" />
            </div>
            <div>
              <label htmlFor="color">Color</label>
              <input id="color" type="text" name="color" value={formData.color} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="carPlates">Car Plates</label>
              <input id="carPlates" type="text" name="carPlates" value={formData.carPlates} onChange={handleChange} required />
            </div>
          </div>
        </div>

        {isPremium && (
          <div className="form-section">
            <h3>Premium Features</h3>
            <div className="form-row">
              <div>
                <label htmlFor="fuel">Fuel Type</label>
                <select id="fuel" name="fuel" value={formData.fuel} onChange={handleChange} required>
                  <option value="">Fuel Type</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label htmlFor="mileage">Mileage</label>
                <input id="mileage" type="number" name="mileage" value={formData.mileage} onChange={handleChange} required min="0" />
              </div>
              <div>
                <label htmlFor="transmission">Transmission</label>
                <select id="transmission" name="transmission" value={formData.transmission} onChange={handleChange} required>
                  <option value="">Transmission</option>
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Semi-Automatic">Semi-Automatic</option>
                </select>
              </div>
              <div>
                <label htmlFor="power">Power (HP)</label>
                <input id="power" type="number" name="power" value={formData.power} onChange={handleChange} required min="0" />
              </div>
              <div>
                <label htmlFor="engine">Engine</label>
                <input id="engine" type="text" name="engine" value={formData.engine} onChange={handleChange} required />
              </div>
            </div>
          </div>
        )}

        <div className="form-section history-check-section">
          <h3>History Check</h3>
          <div className="form-row">
            <div className="history-check-item">
              <span className="history-check-label">Vehicle is clear of accidents:</span>
              <div className="radio-group">
                <label><input type="radio" name="accidents" value="passed" checked={formData.historyCheck.accidents === 'passed'} onChange={handleChange} /> Yes</label>
                <label><input type="radio" name="accidents" value="failed" checked={formData.historyCheck.accidents === 'failed'} onChange={handleChange} /> No</label>
              </div>
            </div>
            <div className="history-check-item">
              <span className="history-check-label">Vehicle is not stolen:</span>
              <div className="radio-group">
                <label><input type="radio" name="stolen" value="passed" checked={formData.historyCheck.stolen === 'passed'} onChange={handleChange} /> Yes</label>
                <label><input type="radio" name="stolen" value="failed" checked={formData.historyCheck.stolen === 'failed'} onChange={handleChange} /> No</label>
              </div>
            </div>
            <div className="history-check-item">
              <span className="history-check-label">Mileage is correct:</span>
              <div className="radio-group">
                <label><input type="radio" name="mileage" value="passed" checked={formData.historyCheck.mileage === 'passed'} onChange={handleChange} /> Yes</label>
                <label><input type="radio" name="mileage" value="failed" checked={formData.historyCheck.mileage === 'failed'} onChange={handleChange} /> No</label>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section seller-info-section">
          <h3>Seller Information</h3>
          <div className="form-row">
            <div>
              <label htmlFor="location">Location</label>
              <input id="location" type="text" name="location" value={formData.location} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="phone">Phone Number</label>
              <input id="phone" type="text" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Pricing and Description</h3>
          <div className="form-row">
            <div>
              <label htmlFor="price">Price</label>
              <input id="price" type="number" name="price" value={formData.price} onChange={handleChange} required min="0" />
            </div>
            <div className="checkbox-group">
              <label htmlFor="sellOnCredit">Sell on credit?</label>
              <input id="sellOnCredit" type="checkbox" name="sellOnCredit" checked={formData.sellOnCredit} onChange={handleChange} />
            </div>
          </div>
          <div>
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} required maxLength={isPremium ? undefined : 80} rows="5" />
          </div>
        </div>

        <div className="form-section">
          <label htmlFor="image">Upload Image</label>
          <input id="image" type="file" name="image" onChange={handleImageChange} />
        </div>

        <button type="submit" className="submit-btn">{initialData ? 'Save Changes' : 'Proceed to Payment'}</button>
      </form>
    </div>
  );
};

export default VehicleForm;