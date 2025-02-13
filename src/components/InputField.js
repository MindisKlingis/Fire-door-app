import React from 'react';
import './InputField.css';

const InputField = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  error,
  required = false,
  placeholder = '',
  min,
  max,
  pattern,
  className = '',
  disabled = false
}) => {
  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={name}>
        {label}
        {required && <span className="required">*</span>}
      </label>
      
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        pattern={pattern}
        disabled={disabled}
        className={error ? 'error' : ''}
      />
      
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default InputField; 