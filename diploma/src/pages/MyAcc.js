import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './../pagestyle/MyAcc.css';

const API_URL = 'http://localhost:3001/api';

const MyAcc = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('auth');
  const [authMode, setAuthMode] = useState('login');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [adType, setAdType] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [showPayment, setShowPayment] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [resetForm, setResetForm] = useState({ email: '', confirmationCode: '', newPassword: '', step: 1 });
  const [passwordValidation, setPasswordValidation] = useState({ length: false, number: false });

  useEffect(() => {
    const token = localStorage.getItem('token');
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

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      return alert("Passwords do not match!");
    }
    try {
      await axios.post(`${API_URL}/auth/register`, { email: registerForm.email, password: registerForm.password });
      alert('Registration successful! Please login.');
      setAuthMode('login');
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/auth/login`, loginForm);
      localStorage.setItem('token', response.data.token);
      setCurrentView('welcome');
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentView('auth');
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    alert('Password reset functionality is not yet implemented.');
  };

  const handleAdTypeSelection = (type) => setAdType(type);
  const handlePackageSelection = (packageType) => { setSelectedPackage(packageType); setShowPayment(true); };
  const handlePayment = () => { alert(`Payment of €${selectedPackage === 'standard' ? '2' : '5'} processed successfully!`); setShowPayment(false); setCurrentView('welcome'); setAdType(''); setSelectedPackage(''); };

  const getPackageFeatures = (adType, packageType) => {
    const packages = {
      vehicle: { standard: ['✓ 1 picture', '✓ Vehicle name/title', '✓ Type (Car, Motorcycle, etc.)', '✓ Model', '✓ Year', '✓ Fuel type', '✓ Location', '✓ Colour', '✓ 80 characters description', '✓ 1 modification allowed', '✓ 5 days active'], premium: ['✓ Everything in Standard', '✓ Mileage', '✓ Transmission type', '✓ Engine power', '✓ Multiple pictures (up to 5)', '✓ Unlimited description length', '✓ 3 modifications allowed', '✓ 8 days active', '✓ First 3 days on top of list', '✓ Gold highlight for 3 days'] },
      spareparts: { standard: ['✓ 1 picture', '✓ Part name/title', '✓ Part category', '✓ Compatible car models', '✓ Condition (New/Used)', '✓ Location', '✓ Part number (if available)', '✓ 80 characters description', '✓ 1 modification allowed', '✓ 5 days active'], premium: ['✓ Everything in Standard', '✓ Multiple pictures (up to 5)', '✓ Detailed compatibility list', '✓ Installation difficulty level', '✓ Warranty information', '✓ Unlimited description length', '✓ 3 modifications allowed', '✓ 8 days active', '✓ First 3 days on top of list', '✓ Gold highlight for 3 days'] }
    };
    return packages[adType]?.[packageType] || [];
  };

  const renderAuthView = () => (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-tabs">
          <button className={`tab ${authMode === 'login' ? 'active' : ''}`} onClick={() => setAuthMode('login')}>Login</button>
          <button className={`tab ${authMode === 'register' ? 'active' : ''}`} onClick={() => setAuthMode('register')}>Register</button>
        </div>
        {authMode === 'login' ? (
          <div className="auth-form">
            <h2>Hello! Welcome back!</h2>
            <form onSubmit={handleLogin}>
              <div className="input-group"><input type="email" placeholder="Email" value={loginForm.email} onChange={(e) => handleLoginChange('email', e.target.value)} required /></div>
              <div className="input-group password-group"><input type={showPassword ? 'text' : 'password'} placeholder="Password" value={loginForm.password} onChange={(e) => handleLoginChange('password', e.target.value)} required /><button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>{showPassword ? '👁️' : '👁️‍🗨️'}</button></div>
              <button type="button" className="forgot-password" onClick={() => setShowPasswordReset(true)}>Forgot password?</button>
              <button type="submit" className="auth-submit">Login</button>
            </form>
          </div>
        ) : (
          <div className="auth-form">
            <h2>Create your AutoShqip account!</h2>
            <form onSubmit={handleRegister}>
              <div className="input-group"><input type="email" placeholder="Email" value={registerForm.email} onChange={(e) => handleRegisterChange('email', e.target.value)} required /></div>
              <div className="input-group password-group"><input type={showPassword ? 'text' : 'password'} placeholder="Password" value={registerForm.password} onChange={(e) => handleRegisterChange('password', e.target.value)} required /><button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>{showPassword ? '👁️' : '👁️‍🗨️'}</button></div>
              <div className="input-group password-group"><input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm Password" value={registerForm.confirmPassword} onChange={(e) => handleRegisterChange('confirmPassword', e.target.value)} required /><button type="button" className="eye-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</button></div>
              <div className="password-validation"><div className={`validation-item ${passwordValidation.length ? 'valid' : ''}`}><span className="circle"></span>At least 8 characters</div><div className={`validation-item ${passwordValidation.number ? 'valid' : ''}`}><span className="circle"></span>At least 1 number</div></div>
              <button type="submit" className="auth-submit">Register</button>
            </form>
          </div>
        )}
      </div>
      {showPasswordReset && (
        <div className="modal-overlay"><div className="modal"><div className="modal-header"><h3>Reset Password</h3><button className="close-btn" onClick={() => setShowPasswordReset(false)}>×</button></div><form onSubmit={handlePasswordReset}><div className="input-group"><input type="email" placeholder="Enter your email" value={resetForm.email} onChange={(e) => handleResetChange('email', e.target.value)} required /></div><button type="submit" className="modal-submit">Send Confirmation Code</button></form></div></div>
      )}
    </div>
  );

  const renderWelcomeView = () => (
    <div className="welcome-container"><div className="welcome-content"><h1>Welcome to AutoShqip</h1><div className="welcome-image"><img src="/api/placeholder/600/300" alt="AutoShqip - Your automotive marketplace" /></div><div className="welcome-description"><h2>About AutoShqip</h2><p>AutoShqip is Albania's premier automotive marketplace...</p></div><div className="welcome-actions"><button className="action-btn primary" onClick={() => navigate('/vehicle-ads')}>Browse Vehicle Ads</button><button className="action-btn secondary" onClick={() => setCurrentView('adCreation')}>Place Your Ad</button></div><button className="logout-btn" onClick={handleLogout}>Logout</button></div></div>
  );

  const renderAdCreationView = () => (
    <div className="ad-creation-container">
      {!adType ? (
        <div className="ad-type-selection"><h2>Choose Ad Type</h2><div className="ad-type-options"><div className="ad-type-card" onClick={() => handleAdTypeSelection('vehicle')}><div className="ad-type-icon">🚗</div><h3>Vehicle Ad</h3><p>Sell your car, motorcycle, or other vehicles</p></div><div className="ad-type-card" onClick={() => handleAdTypeSelection('spareparts')}><div className="ad-type-icon">🔧</div><h3>Spare Parts Ad</h3><p>Sell automotive parts and accessories</p></div></div><button className="back-btn" onClick={() => setCurrentView('welcome')}>← Back to Welcome</button></div>
      ) : !selectedPackage ? (
        <div className="package-selection"><h2>Choose Your Package for {adType === 'vehicle' ? 'Vehicle Ad' : 'Spare Parts Ad'}</h2><div className="packages"><div className="package-card standard"><div className="package-header"><h3>Standard</h3><div className="price">€2</div></div><div className="package-features"><ul>{getPackageFeatures(adType, 'standard').map((feature, index) => (<li key={index}>{feature}</li>))}</ul></div><button className="package-btn" onClick={() => handlePackageSelection('standard')}>Choose Standard</button></div><div className="package-card premium"><div className="package-header"><h3>Premium</h3><div className="price">€5</div><div className="popular">Most Popular</div></div><div className="package-features"><ul>{getPackageFeatures(adType, 'premium').map((feature, index) => (<li key={index}>{feature}</li>))}</ul></div><button className="package-btn premium-btn" onClick={() => handlePackageSelection('premium')}>Choose Premium</button></div></div><button className="back-btn" onClick={() => setAdType('')}>← Back to Ad Type</button></div>
      ) : showPayment ? (
        <div className="payment-section"><h2>Payment</h2><div className="payment-summary"><div className="summary-item"><span>Ad Type:</span><span>{adType === 'vehicle' ? 'Vehicle Ad' : 'Spare Parts Ad'}</span></div><div className="summary-item"><span>Package:</span><span>{selectedPackage === 'standard' ? 'Standard' : 'Premium'}</span></div><div className="summary-item total"><span>Total:</span><span>€{selectedPackage === 'standard' ? '2' : '5'}</span></div></div><div className="payment-form"><h3>Payment Details</h3><div className="input-group"><input type="text" placeholder="Card Number" /></div><div className="input-row"><div className="input-group"><input type="text" placeholder="MM/YY" /></div><div className="input-group"><input type="text" placeholder="CVV" /></div></div><div className="input-group"><input type="text" placeholder="Cardholder Name" /></div></div><div className="payment-actions"><button className="payment-btn" onClick={handlePayment}>Pay €{selectedPackage === 'standard' ? '2' : '5'}</button><button className="back-btn" onClick={() => setShowPayment(false)}>← Back to Packages</button></div></div>
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