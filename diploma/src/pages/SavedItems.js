import React, { useState, useEffect } from 'react';
import api from './../api';
import './../pagestyle/SavedItems.css';

const SavedItems = () => {
    const [savedVehicleAds, setSavedVehicleAds] = useState([]);
    const [savedPartAds, setSavedPartAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSavedItems = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                let apiVehicleAds = [];
                let apiPartAds = [];

                if (token) {
                    const response = await api.get('/saved-items', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    apiVehicleAds = response.data.savedVehicleAds || [];
                    apiPartAds = response.data.savedPartAds || [];
                }

                const staticVehicleAds = JSON.parse(localStorage.getItem('savedStaticVehicles')) || [];
                const staticPartAds = JSON.parse(localStorage.getItem('savedStaticParts')) || [];

                setSavedVehicleAds([...apiVehicleAds, ...staticVehicleAds.map(v => ({ vehicleAd: v, isStatic: true }))]);
                setSavedPartAds([...apiPartAds, ...staticPartAds.map(p => ({ partAd: p, isStatic: true }))]);

            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch saved items.');
            }
            setLoading(false);
        };

        fetchSavedItems();
    }, []);

    const handleRemove = async (type, id, isStatic) => {
        if (isStatic) {
            if (type === 'vehicle') {
                const savedStaticVehicles = JSON.parse(localStorage.getItem('savedStaticVehicles')) || [];
                const updatedStaticVehicles = savedStaticVehicles.filter(v => v.id !== id);
                localStorage.setItem('savedStaticVehicles', JSON.stringify(updatedStaticVehicles));
                setSavedVehicleAds(prev => prev.filter(item => item.vehicleAd.id !== id));
            } else {
                const savedStaticParts = JSON.parse(localStorage.getItem('savedStaticParts')) || [];
                const updatedStaticParts = savedStaticParts.filter(p => p.id !== id);
                localStorage.setItem('savedStaticParts', JSON.stringify(updatedStaticParts));
                setSavedPartAds(prev => prev.filter(item => item.partAd.id !== id));
            }
            alert('Item removed successfully! (simulated)');
        } else {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    alert('You must be logged in to perform this action.');
                    return;
                }

                const body = type === 'vehicle' ? { vehicleAdId: id } : { partAdId: id };

                await api.delete('/saved-items', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    data: body,
                });

                if (type === 'vehicle') {
                    setSavedVehicleAds(prev => prev.filter(item => item.vehicleAd.id !== id));
                } else {
                    setSavedPartAds(prev => prev.filter(item => item.partAd.id !== id));
                }
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to remove item.');
            }
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="saved-items-container">
            <h1>My Saved Items</h1>
            <div className="saved-items-section">
                <h2>Saved Vehicles</h2>
                {savedVehicleAds.length > 0 ? (
                    <div className="saved-items-grid">
                        {savedVehicleAds.map(item => (
                            <div key={item.id} className="saved-item-card">
                                <img src={item.vehicleAd.imageUrl || 'https://via.placeholder.com/300x200'} alt={item.vehicleAd.name} />
                                <div className="item-info">
                                    <h3>{item.vehicleAd.name}</h3>
                                    <p>€{item.vehicleAd.price.toLocaleString()}</p>
                                    <button onClick={() => handleRemove('vehicle', item.vehicleAd.id, item.isStatic)}>Remove</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>You have no saved vehicles.</p>
                )}
            </div>
            <div className="saved-items-section">
                <h2>Saved Parts</h2>
                {savedPartAds.length > 0 ? (
                    <div className="saved-items-grid">
                        {savedPartAds.map(item => (
                            <div key={item.id} className="saved-item-card">
                                <img src={item.partAd.imageUrl || 'https://via.placeholder.com/300x200'} alt={item.partAd.name} />
                                <div className="item-info">
                                    <h3>{item.partAd.name}</h3>
                                    <p>€{item.partAd.price.toLocaleString()}</p>
                                    <button onClick={() => handleRemove('part', item.partAd.id, item.isStatic)}>Remove</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>You have no saved parts.</p>
                )}
            </div>
        </div>
    );
};

export default SavedItems;
