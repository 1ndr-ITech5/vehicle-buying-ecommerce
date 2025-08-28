
import React, { useState } from 'react';
import axios from 'axios';
import './../compstyle/VehicleForm.css';

const API_URL = 'http://localhost:3001/api';

const VehicleForm = ({ selectedPackage, onVehicleCreated }) => {
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
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(`${API_URL}/vehicles`,
        { ...formData, packageType: selectedPackage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onVehicleCreated(response.data);
    } catch (error) {
      console.error('Error creating vehicle ad:', error);
      alert('Failed to create vehicle ad.');
    }
  };

  return (
    <div className="vehicle-form-container">
      <h2>Create a New Vehicle Ad</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Ad Name" onChange={handleChange} required />
        <input type="text" name="make" placeholder="Make" onChange={handleChange} required />
        <input type="text" name="model" placeholder="Model" onChange={handleChange} required />
        <input type="number" name="year" placeholder="Year" onChange={handleChange} required />
        <input type="number" name="price" placeholder="Price" onChange={handleChange} required />
        <input type="number" name="mileage" placeholder="Mileage" onChange={handleChange} required />
        <input type="text" name="transmission" placeholder="Transmission" onChange={handleChange} />
        <input type="text" name="fuel" placeholder="Fuel Type" onChange={handleChange} required />
        <input type="text" name="color" placeholder="Color" onChange={handleChange} required />
        <input type="text" name="location" placeholder="Location" onChange={handleChange} required />
        <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} required />
        <textarea name="description" placeholder="Description" onChange={handleChange} required />
        <input type="text" name="imageUrl" placeholder="Image URL" onChange={handleChange} />
        <input type="number" name="power" placeholder="Power (HP)" onChange={handleChange} required />
        <input type="text" name="engine" placeholder="Engine" onChange={handleChange} required />
        <input type="text" name="carPlates" placeholder="Car Plates" onChange={handleChange} required />
        <button type="submit">Create Ad</button>
      </form>
    </div>
  );
};

export default VehicleForm;
