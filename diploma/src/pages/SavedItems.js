import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from './../api';
import './../pagestyle/SavedItems.css';
import { useTranslation } from 'react-i18next';

const SavedItems = () => {
    const { t } = useTranslation();
    const [savedVehicleAds, setSavedVehicleAds] = useState([]);
    const [savedPartAds, setSavedPartAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

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
                setError(err.response?.data?.message || t('failed_to_fetch_saved_items'));
            }
            setLoading(false);
        };

        fetchSavedItems();
    }, [t]);

    const handleRemove = async (type, id, isStatic, e) => {
        e.stopPropagation(); 
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
            alert(t('item_removed_successfully'));
        } else {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    alert(t('you_must_be_logged_in'));
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
                alert(err.response?.data?.message || t('failed_to_remove_item'));
            }
        }
    };

    if (loading) {
        return <div>{t('loading')}</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    const handlePartClick = (partAd) => {
        navigate(`/spare-parts?partId=${partAd.id}&from=saved-items`);
    };


        return (
        <div className="saved-items-container">
            <div className="header-with-button">
                <button onClick={() => navigate(-1)} className="go-back-button">{t('go_back')}</button>
                <h1>{t('my_saved_items')}</h1>
            </div>
            <div className="saved-items-section">
                <h2>{t('saved_vehicles')}</h2>
                {savedVehicleAds.length > 0 ? (
                    <div className="saved-items-grid">
                        {savedVehicleAds.map(item => (
                            <Link key={item.vehicleAd.id} to={`/vehicle-ads?vehicleId=${item.vehicleAd.id}&from=saved-items`} className="saved-item-card-link">
                                <div className="saved-item-card">
                                    <img src={item.vehicleAd.imageUrl || 'https://via.placeholder.com/300x200'} alt={item.vehicleAd.name} />
                                    <div className="item-info">
                                        <h3>{item.vehicleAd.name}</h3>
                                        <p>€{item.vehicleAd.price.toLocaleString()}</p>
                                        <button onClick={(e) => handleRemove('vehicle', item.vehicleAd.id, item.isStatic, e)}>{t('remove')}</button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p>{t('no_saved_vehicles')}</p>
                )}
            </div>
            <div className="saved-items-section">
                <h2>{t('saved_parts')}</h2>
                {savedPartAds.length > 0 ? (
                    <div className="saved-items-grid">
                        {savedPartAds.map(item => (
                            <div key={item.partAd.id} className="saved-item-card" onClick={() => handlePartClick(item.partAd)}>
                                <img src={item.partAd.imageUrl || 'https://via.placeholder.com/300x200'} alt={item.partAd.name} />
                                <div className="item-info">
                                    <h3>{item.partAd.name}</h3>
                                    <p>€{item.partAd.price.toLocaleString()}</p>
                                    <button onClick={(e) => handleRemove('part', item.partAd.id, item.isStatic, e)}>{t('remove')}</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>{t('no_saved_parts')}</p>
                )}
            </div>
        </div>
    );
};

export default SavedItems;