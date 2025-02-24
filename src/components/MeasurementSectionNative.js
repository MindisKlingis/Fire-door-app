import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const MeasurementSectionNative = ({
  measurements,
  onMeasurementChange,
  onPhotoCapture,
  onPhotoRemove,
  validationErrors,
}) => {
  const renderMeasurementInput = (label, field, placeholder, keyboardType = 'numeric') => (
    <View style={styles.measurementGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            validationErrors[field] && styles.inputError
          ]}
          value={measurements[field] || ''}
          onChangeText={(value) => onMeasurementChange(field, value)}
          keyboardType={keyboardType}
          placeholder={placeholder}
        />
        <TouchableOpacity
          style={styles.photoButton}
          onPress={() => onPhotoCapture(field)}
        >
          <Icon name="camera" size={24} color="#007bff" />
        </TouchableOpacity>
      </View>
      {measurements[`${field}PhotoUrl`] && (
        <View style={styles.photoPreview}>
          <Image
            source={{ uri: measurements[`${field}PhotoUrl`] }}
            style={styles.previewImage}
          />
          <TouchableOpacity
            style={styles.removePhotoButton}
            onPress={() => onPhotoRemove(field)}
          >
            <Icon name="close-circle" size={20} color="#dc3545" />
          </TouchableOpacity>
        </View>
      )}
      {validationErrors[field] && (
        <Text style={styles.errorText}>{validationErrors[field]}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderMeasurementInput(
        'Leaf Thickness (mm)',
        'leafThickness',
        'Enter thickness'
      )}
      {renderMeasurementInput(
        'Leaf Gap (mm)',
        'leafGap',
        'Enter gap'
      )}
      {renderMeasurementInput(
        'Threshold Gap (mm)',
        'thresholdGap',
        'Enter gap'
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  measurementGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  inputError: {
    borderColor: '#dc3545',
  },
  photoButton: {
    width: 40,
    height: 40,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#007bff',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  photoPreview: {
    marginTop: 8,
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 4,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
  },
});

export default MeasurementSectionNative; 