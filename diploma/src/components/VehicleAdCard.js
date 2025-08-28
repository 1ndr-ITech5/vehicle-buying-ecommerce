
import React from 'react';
import './../compstyle/VehicleAdCard.css';

const VehicleAdCard = ({ ad }) => {
  const isPremium = ad.package === 'premium';

  return (
    <div className={`vehicle-ad-card ${isPremium ? 'premium' : ''}`}>
      {isPremium && <div className="premium-badge">Premium</div>}
      <img src={ad.imageUrl || '/api/placeholder/400/250'} alt={`${ad.make} ${ad.model}`} />
      <div className="ad-details">
        <h3>{ad.name}</h3>
        <p>{ad.year} - {ad.fuel}</p>
        <p>{ad.location}</p>
        <p className="price">{ad.price} €</p>
      </div>
    </div>
  );
};

export default VehicleAdCard;
