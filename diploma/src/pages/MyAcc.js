import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './../api'; // Import the new api instance
import './../pagestyle/MyAcc.css';
import VehicleForm from './../components/VehicleForm';
import SparePartForm from './../components/SparePartForm';
import xhuljoImage from './../assets/xhuljo.avif';
import { useTranslation } from 'react-i18next';

const MyAcc = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('auth');
  const [authMode, setAuthMode] = useState('login');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [adType, setAdType] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [showAdForm, setShowAdForm] = useState(false);
  const [adFormData, setAdFormData] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ cardNumber: '', expiry: '', cvv: '', cardholderName: '' });

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [resetForm, setResetForm] = useState({ email: '', confirmationCode: '', newPassword: '', step: 1 });
  const [passwordValidation, setPasswordValidation] = useState({ length: false, number: false });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setCurrentView('welcome');
    }
  }, []);

  useEffect(() => {
    const password = registerForm.password;
    setPasswordValidation({ length: password.length >= 8, number: /\d/.test(password) });
  }, [registerForm.password]);

  const handleLoginChange = (field, value) => setLoginForm(prev => ({ ...prev, [field]: value }));
  const handleRegisterChange = (field, value) => setRegisterForm(prev => ({ ...prev, [field]: value }));
  const handleResetChange = (field, value) => setResetForm(prev => ({ ...prev, [field]: value }));
  const handlePaymentChange = (field, value) => setPaymentForm(prev => ({ ...prev, [field]: value }));

  const isPaymentFormValid = () => {
    const { cardNumber, expiry, cvv, cardholderName } = paymentForm;
    return cardNumber && expiry && cvv && cardholderName;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      return alert(t("passwords_do_not_match"));
    }
    try {
      await api.post('/auth/register', { email: registerForm.email, password: registerForm.password });
      alert(t('registration_successful'));
      setAuthMode('login');
    } catch (error) {
      alert(error.response?.data?.message || t('registration_failed'));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', loginForm);
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      setCurrentView('welcome');
    } catch (error) {
      alert(error.response?.data?.message || t('login_failed'));
    }
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { token: refreshToken });
      } catch (error) {
        console.error(t('failed_to_logout'), error);
      }
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setCurrentView('auth');
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    alert(t('password_reset_not_implemented'));
  };

  const handleAdTypeSelection = (type) => setAdType(type);
  const handlePackageSelection = (packageType) => { setSelectedPackage(packageType); setShowAdForm(true); };
  const handleAdFormSubmit = (formData, image) => {
    setAdFormData(formData);
    setImageFile(image);
    setShowAdForm(false);
    setShowPayment(true);
  };

  const handleAdFormBack = () => {
    setShowAdForm(false);
    setSelectedPackage('');
  };

  const handlePayment = async () => {
    let imageUrl = '';
    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);

      try {
        const uploadResponse = await api.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        imageUrl = uploadResponse.data.imageUrl;
      } catch (error) {
        console.error('Error uploading image:', error);
        alert(t('failed_to_upload_image'));
        return;
      }
    }

    try {
      let response;
      if (adType === 'vehicle') {
        const { category, historyCheck, sellOnCredit, ...dataToSend } = adFormData;
        response = await api.post(
          '/vehicles',
          { ...dataToSend, "package": selectedPackage, imageUrl, historyCheck, sellOnCredit, vehicleCategory: category, createdAt: new Date().toISOString() }
        );
      } else {
        response = await api.post(
          '/parts',
          { ...adFormData, "package": selectedPackage, imageUrl, createdAt: new Date().toISOString() }
        );
      }

      alert(t('payment_processed_successfully', { price: selectedPackage === 'standard' ? '2' : '5' }));
      setShowPayment(false);
      setAdType('');
      setSelectedPackage('');
      setAdFormData(null);
      setImageFile(null);
      navigate(adType === 'vehicle' ? '/vehicle-ads' : '/spare-parts', { state: { newAd: response.data } });
    } catch (error) {
      console.error(`Error creating ${adType} ad:`, error);
      alert(t('failed_to_create_ad', { adType }));
    }
  };

  const getPackageFeatures = (adType, packageType) => {
    const packages = {
      vehicle: { 
        standard: [
          t('feature_1_picture'),
          t('feature_vehicle_name'),
          t('feature_vehicle_type'),
          t('feature_model'),
          t('feature_year'),
          t('feature_location'),
          t('feature_colour'),
          t('feature_car_plates'),
          t('feature_80_char_desc'),
          t('feature_5_days_active'),
        ], 
        premium: [
          t('feature_everything_in_standard'),
          t('feature_mileage'),
          t('feature_transmission_type'),
          t('feature_engine_power'),
          t('feature_fuel_type'),
          t('feature_multiple_pictures'),
          t('feature_240_char_desc'),
          t('feature_1_modification'),
          t('feature_8_days_active'),
          t('feature_gold_highlight'),
        ] 
      },
      spareparts: { 
        standard: [
          t('feature_1_picture'),
          t('feature_part_name'),
          t('feature_part_category'),
          t('feature_compatible_car_models'),
          t('feature_condition'),
          t('feature_location'),
          t('feature_80_char_desc'),
          t('feature_5_days_active'),
        ], 
        premium: [
          t('feature_everything_in_standard'),
          t('feature_year'),
          t('feature_detailed_compatibility'),
          t('feature_installation_difficulty'),
          t('feature_unlimited_desc'),
          t('feature_1_modification'),
          t('feature_8_days_active'),
          t('feature_gold_highlight'),
        ] 
      }
    };
    return packages[adType]?.[packageType] || [];
  };

  const renderAuthView = () => (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-tabs">
          <button className={`tab ${authMode === 'login' ? 'active' : ''}`} onClick={() => setAuthMode('login')}>{t('login')}</button>
          <button className={`tab ${authMode === 'register' ? 'active' : ''}`} onClick={() => setAuthMode('register')}>{t('register')}</button>
        </div>
        {authMode === 'login' ? (
          <div className="auth-form">
            <h2>{t('hello_welcome_back')}</h2>
            <form onSubmit={handleLogin}>
              <div className="input-group"><input type="email" placeholder={t('email')} value={loginForm.email} onChange={(e) => handleLoginChange('email', e.target.value)} required /></div>
              <div className="input-group password-group"><input type={showPassword ? 'text' : 'password'} placeholder={t('password')} value={loginForm.password} onChange={(e) => handleLoginChange('password', e.target.value)} required /><button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>{showPassword ? '👁️' : '👁️‍🗨️'}</button></div>
              <button type="button" className="forgot-password" onClick={() => setShowPasswordReset(true)}>{t('forgot_password')}</button>
              <button type="submit" className="auth-submit">{t('login')}</button>
            </form>
          </div>
        ) : (
          <div className="auth-form">
            <h2>{t('create_your_account')}</h2>
            <form onSubmit={handleRegister}>
              <div className="input-group"><input type="email" placeholder={t('email')} value={registerForm.email} onChange={(e) => handleRegisterChange('email', e.target.value)} required /></div>
              <div className="input-group password-group"><input type={showPassword ? 'text' : 'password'} placeholder={t('password')} value={registerForm.password} onChange={(e) => handleRegisterChange('password', e.target.value)} required /><button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>{showPassword ? '👁️' : '👁️‍🗨️'}</button></div>
              <div className="input-group password-group"><input type={showConfirmPassword ? 'text' : 'password'} placeholder={t('confirm_password')} value={registerForm.confirmPassword} onChange={(e) => handleRegisterChange('confirmPassword', e.target.value)} required /><button type="button" className="eye-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</button></div>
              <div className="password-validation"><div className={`validation-item ${passwordValidation.length ? 'valid' : ''}`}><span className="circle"></span>{t('at_least_8_characters')}</div><div className={`validation-item ${passwordValidation.number ? 'valid' : ''}`}><span className="circle"></span>{t('at_least_1_number')}</div></div>
              <button type="submit" className="auth-submit">{t('register')}</button>
            </form>
          </div>
        )}
      </div>
      {showPasswordReset && (
        <div className="modal-overlay"><div className="modal"><div className="modal-header"><h3>{t('reset_password')}</h3><button className="close-btn" onClick={() => setShowPasswordReset(false)}>×</button></div><form onSubmit={handlePasswordReset}><div className="input-group"><input type="email" placeholder={t('enter_your_email')} value={resetForm.email} onChange={(e) => handleResetChange('email', e.target.value)} required /></div><button type="submit" className="modal-submit">{t('send_confirmation_code')}</button></form></div></div>
      )}
    </div>
  );

  const renderWelcomeView = () => (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1>{t('welcome_to_autoshqip')}</h1>
        <div className="welcome-image">
                    <img src={xhuljoImage} alt="AutoShqip - Your automotive marketplace" />
        </div>
        <div className="welcome-description">
          <h2>{t('about_autoshqip')}</h2>
          <p>{t('autoshqip_description')}</p>
        </div>
        <div className="welcome-actions">
          <button className="action-btn primary" onClick={() => navigate('/vehicle-ads')}>{t('browse_vehicle_ads')}</button>
          <button className="action-btn secondary" onClick={() => setCurrentView('adCreation')}>{t('place_your_ad')}</button>
          <button className="action-btn tertiary" onClick={() => navigate('/saved-items')}>{t('saved_items')}</button>
        </div>
        <button className="logout-btn" onClick={handleLogout}>{t('logout')}</button>
      </div>
    </div>
  );

  const renderAdCreationView = () => (
    <div className="ad-creation-container">
      {!adType ? (
        <div className="ad-type-selection"><h2>{t('choose_ad_type')}</h2><div className="ad-type-options"><div className="ad-type-card" onClick={() => handleAdTypeSelection('vehicle')}><div className="ad-type-icon">🚗</div><h3>{t('vehicle_ad')}</h3><p>{t('sell_your_car')}</p></div><div className="ad-type-card" onClick={() => handleAdTypeSelection('spareparts')}><div className="ad-type-icon">🔧</div><h3>{t('spare_parts_ad')}</h3><p>{t('sell_spare_parts')}</p></div></div><button className="back-btn" onClick={() => setCurrentView('welcome')}>{t('back_to_welcome')}</button></div>
      ) : !selectedPackage ? (
        <div className="package-selection"><h2>{t('choose_your_package', { adType: adType === 'vehicle' ? t('vehicle_ad') : t('spare_parts_ad') })}</h2><div className="packages"><div className="package-card standard"><div className="package-header"><h3>{t('standard')}</h3><div className="price">€2</div></div><div className="package-features"><ul>{getPackageFeatures(adType, 'standard').map((feature, index) => (<li key={index}>{feature}</li>))}</ul></div><button className="package-btn" onClick={() => handlePackageSelection('standard')}>{t('choose_standard')}</button></div><div className="package-card premium"><div className="package-header"><h3>{t('premium')}</h3><div className="price">€5</div></div><div className="package-features"><ul>{getPackageFeatures(adType, 'premium').map((feature, index) => (<li key={index}>{feature}</li>))}</ul></div><button className="package-btn premium-btn" onClick={() => handlePackageSelection('premium')}>{t('choose_premium')}</button></div></div><button className="back-btn" onClick={() => setAdType('')}>{t('back_to_ad_type')}</button></div>
      ) : showAdForm ? (
        adType === 'vehicle' ? (
          <VehicleForm selectedPackage={selectedPackage} adType={adType} onFormSubmit={handleAdFormSubmit} onBack={handleAdFormBack} />
        ) : (
          <SparePartForm selectedPackage={selectedPackage} adType={adType} onFormSubmit={handleAdFormSubmit} onBack={handleAdFormBack} />
        )
      ) : showPayment ? (
        <div className="payment-section"><h2>{t('payment')}</h2><div className="payment-summary"><div className="summary-item"><span>{t('ad_type')}</span><span>{adType === 'vehicle' ? t('vehicle_ad') : t('spare_parts_ad')}</span></div><div className="summary-item"><span>{t('package')}</span><span>{selectedPackage === 'standard' ? t('standard') : t('premium')}</span></div><div className="summary-item total"><span>{t('total')}</span><span>€{selectedPackage === 'standard' ? '2' : '5'}</span></div></div><div className="payment-form"><h3>{t('payment_details')}</h3><div className="input-group"><input type="text" placeholder={t('card_number')} value={paymentForm.cardNumber} onChange={(e) => handlePaymentChange('cardNumber', e.target.value)} required /></div><div className="input-row"><div className="input-group"><input type="text" placeholder={t('mmyy')} value={paymentForm.expiry} onChange={(e) => handlePaymentChange('expiry', e.target.value)} required /></div><div className="input-group"><input type="text" placeholder={t('cvv')} value={paymentForm.cvv} onChange={(e) => handlePaymentChange('cvv', e.target.value)} required /></div></div><div className="input-group"><input type="text" placeholder={t('cardholder_name')} value={paymentForm.cardholderName} onChange={(e) => handlePaymentChange('cardholderName', e.target.value)} required /></div></div><div className="payment-actions"><button className="payment-btn" onClick={handlePayment} disabled={!isPaymentFormValid()}>{t('pay', { price: selectedPackage === 'standard' ? '2' : '5' })}</button><button className="back-btn" onClick={() => {setShowPayment(false); setShowAdForm(true);}}>{t('back_to_form')}</button></div></div>
      ) : null}
    </div>
  );

  return (
    <div className="myacc-container">
      {currentView === 'auth' && renderAuthView()}
      {currentView === 'welcome' && renderWelcomeView()}
      {currentView === 'adCreation' && renderAdCreationView()}
    </div>
  );
};

export default MyAcc;