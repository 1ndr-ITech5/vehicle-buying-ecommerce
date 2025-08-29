import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './../compstyle/NewVehicles.css';

const API_URL = 'http://localhost:3001/api';

function NewVehicles() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);

  const fetchVehicles = useCallback(async () => {
    try {
      const response = await axios.get('/db.json');
      setVehicles(response.data.vehicles.slice(0, 6));
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return (
    <div className="new-vehicle-section">
      <div className="new-car-grid">
        {vehicles.map(vehicle => (
          <div className="new-car-card" key={vehicle.id} onClick={() => navigate(`/vehicle-ads?vehicleId=${vehicle.id}`)}>
            <div className="new-car-image-placeholder" style={{ backgroundImage: `url(${vehicle.imageUrl || 'https://via.placeholder.com/300x200'})`, backgroundSize: 'cover' }}></div>
            <div className="new-car-details">
              <p className="new-car-price">€{vehicle.price.toLocaleString()}</p>
              <p className="new-car-name">{vehicle.name}</p>
              <p className="new-car-specs">{`${vehicle.year} • ${vehicle.transmission} • ${vehicle.fuel}`}</p>
              <p className="new-car-location-phone">{`${vehicle.location} • ${vehicle.phone}`}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NewVehicles;