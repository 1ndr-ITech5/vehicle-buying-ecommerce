import React, { useState } from 'react';
import './../compstyle/VehicleForm.css';
import { useTranslation } from 'react-i18next';

const VehicleForm = ({ selectedPackage, adType, onFormSubmit, onBack, initialData }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(
    initialData
      ? {
          ...initialData,
          historyCheck: initialData.historyCheck || {
            accidents: null,
            stolen: null,
            mileage_check: null,
          },
          insuranceBaseRate: initialData.insuranceBaseRate || '',
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
            accidents: null,
            stolen: null,
            mileage_check: null,
          },
          insuranceBaseRate: '',
        }
  );
  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'accidents' || name === 'stolen' || name === 'mileage_check') {
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
      <button type="button" className="back-btn-top" onClick={onBack}>{t('go_back')}</button>
      <h2>{initialData ? t('edit') : t('create_a_new')} {adType === 'vehicle' ? t('vehicle') : t('spare_part')} {t('ad')}</h2>
      
      <form onSubmit={handleSubmit} className="vehicle-form">
        <div className="form-section">
          <h3>{t('vehicle_details')}</h3>
          <div className="form-row">
            <div>
              <label htmlFor="name">{t('ad_name')}</label>
              <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label htmlFor="category">{t('category')}</label>
              <select id="category" name="category" value={formData.category} onChange={handleChange} required>
                <option value="">{t('select_category')}</option>
                <option value="car">{t('car')}</option>
                <option value="van">{t('van')}</option>
                <option value="motorcycle">{t('motorcycle')}</option>
              </select>
            </div>
            <div>
              <label htmlFor="make">{t('make')}</label>
              <input id="make" type="text" name="make" value={formData.make} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="model">{t('model')}</label>
              <input id="model" type="text" name="model" value={formData.model} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label htmlFor="year">{t('year')}</label>
              <input id="year" type="number" name="year" value={formData.year} onChange={handleChange} required min="0" />
            </div>
            <div>
              <label htmlFor="color">{t('color')}</label>
              <input id="color" type="text" name="color" value={formData.color} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="carPlates">{t('car_plates_label')}</label>
              <input id="carPlates" type="text" name="carPlates" value={formData.carPlates} onChange={handleChange} required />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>{t('contact_location')}</h3>
          <div className="form-row">
            <div>
              <label htmlFor="phone">{t('phone')}</label>
              <input id="phone" type="text" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="location">{t('location')}</label>
              <input id="location" type="text" name="location" value={formData.location} onChange={handleChange} required />
            </div>
          </div>
        </div>

        {isPremium && (
          <div className="form-section">
            <h3>{t('premium_features')}</h3>
            <div className="form-row">
              <div>
                <label htmlFor="fuel">{t('fuel_type')}</label>
                <select id="fuel" name="fuel" value={formData.fuel} onChange={handleChange} required>
                  <option value="">{t('select_fuel')}</option>
                  <option value="Petrol">{t('petrol')}</option>
                  <option value="Diesel">{t('diesel')}</option>
                  <option value="Electric">{t('electric')}</option>
                  <option value="Hybrid">{t('hybrid')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="mileage">{t('mileage')}</label>
                <input id="mileage" type="number" name="mileage" value={formData.mileage} onChange={handleChange} required min="0" />
              </div>
              <div>
                <label htmlFor="transmission">{t('transmission')}</label>
                <select id="transmission" name="transmission" value={formData.transmission} onChange={handleChange} required>
                  <option value="">{t('select_gearbox')}</option>
                  <option value="Manual">{t('manual')}</option>
                  <option value="Automatic">{t('automatic')}</option>
                  <option value="Semi-Automatic">{t('semi_automatic')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="power">{t('power_hp')}</label>
                <input id="power" type="number" name="power" value={formData.power} onChange={handleChange} required min="0" />
              </div>
              <div>
                <label htmlFor="engine">{t('engine')}</label>
                <input id="engine" type="text" name="engine" value={formData.engine} onChange={handleChange} required />
              </div>
            </div>
          </div>
        )}

        <div className="form-section history-check-section">
          <h3>{t('history_check')}</h3>
          <div className="form-row">
            <div className="history-check-item">
              <span className="history-check-label">{t('vehicle_clear_of_accidents')}</span>
              <div className="radio-group">
                <label><input type="radio" name="accidents" value="passed" checked={formData.historyCheck.accidents === 'passed'} onChange={handleChange} /> {t('yes')}</label>
                <label><input type="radio" name="accidents" value="failed" checked={formData.historyCheck.accidents === 'failed'} onChange={handleChange} /> {t('no')}</label>
              </div>
            </div>
            <div className="history-check-item">
              <span className="history-check-label">{t('vehicle_not_stolen')}</span>
              <div className="radio-group">
                <label><input type="radio" name="stolen" value="passed" checked={formData.historyCheck.stolen === 'passed'} onChange={handleChange} /> {t('yes')}</label>
                <label><input type="radio" name="stolen" value="failed" checked={formData.historyCheck.stolen === 'failed'} onChange={handleChange} /> {t('no')}</label>
              </div>
            </div>
            <div className="history-check-item">
              <span className="history-check-label">{t('mileage_is_correct')}</span>
              <div className="radio-group">
                <label><input type="radio" name="mileage_check" value="passed" checked={formData.historyCheck.mileage_check === 'passed'} onChange={handleChange} /> {t('yes')}</label>
                <label><input type="radio" name="mileage_check" value="failed" checked={formData.historyCheck.mileage_check === 'failed'} onChange={handleChange} /> {t('no')}</label>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>{t('insurance_calculator')}</h3>
          <div className="form-row">
            <div>
              <label htmlFor="insuranceBaseRate">{t('insurance_base_rate')}</label>
              <input id="insuranceBaseRate" type="number" name="insuranceBaseRate" value={formData.insuranceBaseRate} onChange={handleChange} />
            </div>
          </div>
        </div>

        

        

        <div className="form-section">
          <h3>{t('pricing_and_description')}</h3>
          <div className="form-row">
            <div>
              <label htmlFor="price">{t('price')}</label>
              <input id="price" type="number" name="price" value={formData.price} onChange={handleChange} required min="0" />
            </div>
            <div className="checkbox-group">
              <label htmlFor="sellOnCredit">{t('sell_on_credit')}</label>
              <input id="sellOnCredit" type="checkbox" name="sellOnCredit" checked={formData.sellOnCredit} onChange={handleChange} />
            </div>
          </div>
          <div>
            <label htmlFor="description">{t('description')}</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} required maxLength={isPremium ? undefined : 80} rows="5" />
          </div>
        </div>

        <div className="form-section">
          <label htmlFor="image">{t('upload_image')}</label>
          <input id="image" type="file" name="image" onChange={handleImageChange} />
        </div>

        <button type="submit" className="submit-btn">{initialData ? t('save_changes') : t('proceed_to_payment')}</button>
      </form>
    </div>
  );
};

export default VehicleForm;