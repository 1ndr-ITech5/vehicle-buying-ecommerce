import React, { useState, useEffect } from 'react';
import './../compstyle/SparePartForm.css';

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
  const [formData, setFormData] = useState(
    initialData
      ? { ...initialData }
      : {
          name: '',
          category: '',
          subCategory: '',
          compatibleModels: '',
          condition: 'New',
          location: '',
          description: '',
          detailedCompatibility: '',
          installationDifficulty: 'Easy',
          year: '',
          price: '',
          phone: '',
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
    onFormSubmit(formData, image);
  };

  const isPremium = selectedPackage === 'premium';

  return (
    <div className="spare-part-form-container">
      <button type="button" className="back-btn-top" onClick={onBack}>← Go Back</button>
      <h2>{initialData ? 'Edit' : 'Create a New'} Spare Part Ad</h2>
      
      <form onSubmit={handleSubmit} className="spare-part-form">
        <div className="form-section">
          <h3>Part Details</h3>
          <div className="form-row">
            <div>
              <label htmlFor="name">Ad Name</label>
              <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label htmlFor="category">Part Category</label>
              <select id="category" name="category" value={formData.category} onChange={handleChange} required>
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="subCategory">Sub-Category</label>
              <select id="subCategory" name="subCategory" value={formData.subCategory} onChange={handleChange} required disabled={!formData.category}>
                <option value="">Select Sub-Category</option>
                {subCategories.map(subCat => (
                  <option key={subCat.name} value={subCat.name}>{subCat.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div>
              <label htmlFor="compatibleModels">Compatible Car Models</label>
              <input id="compatibleModels" type="text" name="compatibleModels" value={formData.compatibleModels} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="condition">Condition</label>
              <select id="condition" name="condition" value={formData.condition} onChange={handleChange} required>
                <option value="New">New</option>
                <option value="Used">Used</option>
              </select>
            </div>
          </div>
        </div>

        {isPremium && (
          <div className="form-section">
            <h3>Premium Features</h3>
            <div className="form-row">
              <div>
                <label htmlFor="detailedCompatibility">Detailed Compatibility List</label>
                <textarea id="detailedCompatibility" name="detailedCompatibility" value={formData.detailedCompatibility} onChange={handleChange} rows="3" />
              </div>
            </div>
            <div className="form-row">
              <div>
                <label htmlFor="installationDifficulty">Installation Difficulty</label>
                <select id="installationDifficulty" name="installationDifficulty" value={formData.installationDifficulty} onChange={handleChange}>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div>
                <label htmlFor="year">Year</label>
                <input id="year" type="number" name="year" value={formData.year} onChange={handleChange} />
              </div>
            </div>
          </div>
        )}

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

export default SparePartForm;
