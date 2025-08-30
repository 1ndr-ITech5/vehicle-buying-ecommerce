
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
    imageUrl: '',
    power: '',
    engine: '',
    carPlates: '',
    category: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFormSubmit(formData);
  };

  const isPremium = selectedPackage === 'premium';

  return (
    <div className="vehicle-form-container">
      <h2>Create a New {adType === 'vehicle' ? 'Vehicle' : 'Spare Part'} Ad</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Ad Name" onChange={handleChange} required />
        {adType === 'vehicle' && (
          <>
            <select name="category" onChange={handleChange} required>
              <option value="">Select Category</option>
              <option value="car">Car</option>
              <option value="van">Van</option>
              <option value="motorcycle">Motorcycle</option>
            </select>
            <input type="text" name="make" placeholder="Make" onChange={handleChange} required />
            <input type="text" name="model" placeholder="Model" onChange={handleChange} required />
            <input type="number" name="year" placeholder="Year" onChange={handleChange} required />
            <input type="text" name="fuel" placeholder="Fuel Type" onChange={handleChange} required />
            <input type="text" name="color" placeholder="Color" onChange={handleChange} required />
            {isPremium && (
              <>
                <input type="number" name="mileage" placeholder="Mileage" onChange={handleChange} required />
                <input type="text" name="transmission" placeholder="Transmission" onChange={handleChange} />
                <input type="number" name="power" placeholder="Power (HP)" onChange={handleChange} required />
                <input type="text" name="engine" placeholder="Engine" onChange={handleChange} required />
                <input type="text" name="carPlates" placeholder="Car Plates" onChange={handleChange} required />
              </>
            )}
          </>
        )}
        {adType === 'spareparts' && (
            <>
              <input type="text" name="category" placeholder="Part Category" onChange={handleChange} required />
              <input type="text" name="compatibleModels" placeholder="Compatible Car Models" onChange={handleChange} required />
              <input type="text" name="condition" placeholder="Condition (New/Used)" onChange={handleChange} required />
              <input type="text" name="partNumber" placeholder="Part Number (if available)" onChange={handleChange} />
              {isPremium && (
                <>
                  <input type="text" name="compatibilityList" placeholder="Detailed Compatibility List" onChange={handleChange} />
                  <input type="text" name="installationDifficulty" placeholder="Installation Difficulty" onChange={handleChange} />
                  <input type="text" name="warranty" placeholder="Warranty Information" onChange={handleChange} />
                </>
              )}
            </>
        )}

        <input type="number" name="price" placeholder="Price" onChange={handleChange} required />
        <input type="text" name="location" placeholder="Location" onChange={handleChange} required />
        <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} required />
        <textarea name="description" placeholder="Description" onChange={handleChange} required maxLength={isPremium ? undefined : 80} />
        <input type="text" name="imageUrl" placeholder="Image URL" onChange={handleChange} />
        
        <div className="form-buttons">
          <button type="button" className="back-btn" onClick={onBack}>Go Back</button>
          <button type="submit">Proceed to Payment</button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;
