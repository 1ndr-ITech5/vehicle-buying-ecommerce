import React, { useState, useEffect } from 'react';
import './../compstyle/SparePartForm.css';
import { useTranslation } from 'react-i18next';

const categories = [
    { name: 'Engine Parts', subCategories: [ { name: 'Filters' }, { name: 'Belts & Chains' }, { name: 'Gaskets & Seals' } ] },
    { name: 'Brake System', subCategories: [ { name: 'Brake Pads' }, { name: 'Brake Discs' }, { name: 'Calipers' } ] },
    { name: 'Suspension', subCategories: [ { name: 'Shock Absorbers' }, { name: 'Control Arms' }, { name: 'Ball Joints' } ] },
    { name: 'Exhaust System', subCategories: [ { name: 'Mufflers' }, { name: 'Catalytic Converters' }, { name: 'Exhaust Pipes' } ] },
    { name: 'Transmission', subCategories: [ { name: 'Clutch Kits' }, { name: 'Flywheels' }, { name: 'Gearboxes' } ] },
    { name: 'Electrical', subCategories: [ { name: 'Batteries' }, { name: 'Alternators' }, { name: 'Spark Plugs' } ] },
    { name: 'Body Parts', subCategories: [ { name: 'Bumpers' }, { name: 'Fenders' }, { name: 'Doors' } ] },
    { name: 'Interior', subCategories: [ { name: 'Seats' }, { name: 'Dashboards' }, { name: 'Floor Mats' } ] },
    { name: 'Wheels & Tires', subCategories: [ { name: 'Tires' }, { name: 'Rims' }, { name: 'Hubcaps' } ] },
    { name: 'Accessories', subCategories: [ { name: 'Car Covers' }, { name: 'Phone Holders' }, { name: 'Roof Racks' } ] },
];

const SparePartForm = ({ selectedPackage, adType, onFormSubmit, onBack, initialData }) => {
  const { t } = useTranslation(['translation', 'dynamic']);
  const [formData, setFormData] = useState(
    initialData
      ? { ...initialData }
      : {
          name: '',
          category: '',
          subCategory: '',
          condition: 'New',
          location: '',
          description: '',
          detailedCompatibility: '',
          installationDifficulty: 'Easy',
          year: '',
          price: '',
          phone: '',
          sellerName: '',
          vehicleType: '',
          carMark: '',
          carModel: '',
        }
  );
  const [image, setImage] = useState(null);
  const [subCategories, setSubCategories] = useState([]);

  useEffect(() => {
    if (formData.category) {
      const selectedCategory = categories.find(cat => cat.name === formData.category);
      if (selectedCategory) {
        setSubCategories(selectedCategory.subCategories);
      }
    } else {
      setSubCategories([]);
    }
  }, [formData.category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('formData:', formData);
    onFormSubmit(formData, image);
  };

  const isPremium = selectedPackage === 'premium';

  return (
    <div className="spare-part-form-container">
      <button type="button" className="back-btn-top" onClick={onBack}>{t('go_back')}</button>
      <h2>{initialData ? t('edit') : t('create_a_new')} {t('spare_parts_ad')}</h2>
      
      <form onSubmit={handleSubmit} className="spare-part-form">
        <div className="form-section">
          <h3>{t('part_details')}</h3>
          <div className="form-row">
            <div>
              <label htmlFor="name">{t('part_name')}</label>
              <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label htmlFor="vehicleType">{t('vehicle_type')}</label>
              <input id="vehicleType" type="text" name="vehicleType" value={formData.vehicleType} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="carMark">{t('mark')}</label>
              <input id="carMark" type="text" name="carMark" value={formData.carMark} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="carModel">{t('model')}</label>
              <input id="carModel" type="text" name="carModel" value={formData.carModel} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label htmlFor="category">{t('part_category')}</label>
              <select id="category" name="category" value={formData.category} onChange={handleChange} required>
                <option value="">{t('select_category')}</option>
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>{t(cat.name, { ns: 'dynamic' })}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="subCategory">{t('sub_category')}</label>
              <select id="subCategory" name="subCategory" value={formData.subCategory} onChange={handleChange} required disabled={!formData.category}>
                <option value="">{t('select_subcategory')}</option>
                {subCategories.map(subCat => (
                  <option key={subCat.name} value={subCat.name}>{t(subCat.name, { ns: 'dynamic' })}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="condition">{t('condition')}</label>
              <select id="condition" name="condition" value={formData.condition} onChange={handleChange} required>
                <option value="New">{t('new')}</option>
                <option value="Used">{t('used')}</option>
              </select>
            </div>
          </div>
        </div>

        {isPremium && (
          <div className="form-section">
            <h3>{t('premium_features')}</h3>
            <div className="form-row">
              <div>
                <label htmlFor="detailedCompatibility">{t('detailed_compatibility_list')}</label>
                <textarea id="detailedCompatibility" name="detailedCompatibility" value={formData.detailedCompatibility} onChange={handleChange} rows="3" />
              </div>
            </div>
            <div className="form-row">
              <div>
                <label htmlFor="installationDifficulty">{t('installation_difficulty')}</label>
                <select id="installationDifficulty" name="installationDifficulty" value={formData.installationDifficulty} onChange={handleChange}>
                  <option value="Easy">{t('easy')}</option>
                  <option value="Medium">{t('medium')}</option>
                  <option value="Hard">{t('hard')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="year">{t('year')}</label>
                <input id="year" type="number" name="year" value={formData.year} onChange={handleChange} />
              </div>
            </div>
          </div>
        )}

        <div className="form-section seller-info-section">
          <h3>{t('seller_information')}</h3>
          <div className="form-row">
            <div>
              <label htmlFor="sellerName">{t('name')}</label>
              <input id="sellerName" type="text" name="sellerName" value={formData.sellerName} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="location">{t('location')}</label>
              <input id="location" type="text" name="location" value={formData.location} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="phone">{t('phone_number')}</label>
              <input id="phone" type="text" name="phone" value={formData.phone} onChange={handleChange} required />
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

export default SparePartForm;