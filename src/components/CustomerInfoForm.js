import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CustomerInfoForm.css';

const CustomerInfoForm = () => {
  const navigate = useNavigate();
  const [customerInfo, setCustomerInfo] = useState({
    customerName: '',
    companyName: '',
    address: '',
    city: '',
    postcode: '',
    contactPerson: '',
    phoneNumber: '',
    email: '',
    buildingType: '',
    surveyDate: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    // Remove all validation restrictions
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save customer info to localStorage
    localStorage.setItem('currentCustomer', JSON.stringify({
      ...customerInfo,
      createdAt: new Date().toISOString()
    }));
    
    // Navigate to the survey form
    navigate('/survey');
  };

  const handleCancel = () => {
    navigate('/');
  };

  const handleInputChange = (field, value) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className="customer-info-form">
      <h1>Customer Information</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Customer Details</h2>
          
          <div className="form-group">
            <label>Customer Name *</label>
            <input
              type="text"
              value={customerInfo.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              className={errors.customerName ? 'error' : ''}
            />
            {errors.customerName && <div className="error-message">{errors.customerName}</div>}
          </div>

          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              value={customerInfo.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Address *</label>
            <input
              type="text"
              value={customerInfo.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={errors.address ? 'error' : ''}
            />
            {errors.address && <div className="error-message">{errors.address}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                value={customerInfo.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Postcode *</label>
              <input
                type="text"
                value={customerInfo.postcode}
                onChange={(e) => handleInputChange('postcode', e.target.value)}
                className={errors.postcode ? 'error' : ''}
              />
              {errors.postcode && <div className="error-message">{errors.postcode}</div>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Contact Information</h2>
          
          <div className="form-group">
            <label>Contact Person</label>
            <input
              type="text"
              value={customerInfo.contactPerson}
              onChange={(e) => handleInputChange('contactPerson', e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                value={customerInfo.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className={errors.phoneNumber ? 'error' : ''}
              />
              {errors.phoneNumber && <div className="error-message">{errors.phoneNumber}</div>}
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Building Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Building Type</label>
              <select
                value={customerInfo.buildingType}
                onChange={(e) => handleInputChange('buildingType', e.target.value)}
              >
                <option value="">Select Building Type</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
                <option value="educational">Educational</option>
                <option value="healthcare">Healthcare</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Survey Date</label>
              <input
                type="date"
                value={customerInfo.surveyDate}
                onChange={(e) => handleInputChange('surveyDate', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-button">
            Start Survey
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerInfoForm; 