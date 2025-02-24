import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001';

const PHOTO_TYPES = {
  FRONT_DOOR: 'frontDoorPicture',
  TOP_LEAF: 'topLeafPicture',
  TOP_LEAF_DOUBLE: 'topLeafDoublePicture',
  FAULTS_3: 'unmentionedFaults3',
  FAULTS_4: 'unmentionedFaults4',
  FAULTS_5: 'unmentionedFaults5'
};

const { width } = Dimensions.get('window');

const FireDoorSurveyFormNative = ({ navigation }) => {
  // State management
  const [formData, setFormData] = useState({
    doorPinNo: 0,
    floor: '',
    room: '',
    locationOfDoorSet: '',
    doorType: '',
    doorConfiguration: {
      type: '',
      hasFanLight: false,
      hasSidePanels: false
    },
    doorMaterial: {
      type: '',
      customType: ''
    },
    rating: 'FD30s',
    surveyed: '',
    leafGap: '',
    thresholdGap: '',
    showExtendedThresholdGap: false,
    measurements: {
      leafGapPhoto: null,
      leafGapPhotoUrl: null,
      thresholdGapPhoto: null,
      thresholdGapPhotoUrl: null,
      leafThicknessPhoto: null,
      leafThicknessPhotoUrl: null
    },
    leafThickness: '',
    combinedStripsCondition: '',
    combinedStripsDefect: '',
    selfCloserFunctional: '',
    selfCloserDefect: '',
    selfCloserCustomDefect: '',
    hingesCondition: '',
    hingesDefect: '',
    hingesCustomDefect: '',
    frameCondition: '',
    frameDefect: '',
    frameCustomDefect: '',
    handlesSufficient: '',
    handlesDefect: '',
    handlesCustomDefect: '',
    signageSatisfactory: '',
    signageDefect: '',
    signageCustomDefect: '',
    doorGuardWorking: '',
    glazingSufficient: '',
    glazingDefect: '',
    glazingCustomDefect: '',
    glazingBeading: '',
    glazing30Minutes: '',
    fanLightsSufficient: '',
    fanLightsDefect: '',
    fanLightsCustomDefect: '',
    headerPanelsSufficient: '',
    upgradeReplacement: '',
    overallCondition: '',
    addDetail: '',
    conditionDetails: {
      leafGap: '',
      thresholdGap: '',
      notes: ''
    },
    customSection: {
      label: '',
      value: '',
      defect: '',
      customDefect: '',
      componentName: '',
      description: ''
    },
    defectPhotos: {
      frame: null,
      handles: null,
      signage: null,
      selfCloser: null,
      hinges: null,
      glazing: null,
      fanLights: null,
      combinedStrips: null,
      customSection: null
    }
  });

  const [surveyId, setSurveyId] = useState(null);
  const [isSurveySaved, setIsSurveySaved] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState(
    Object.values(PHOTO_TYPES).reduce((acc, type) => ({ ...acc, [type]: false }), {})
  );
  const [validationErrors, setValidationErrors] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load saved notifications on mount
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const savedNotifications = await AsyncStorage.getItem('doorNotifications');
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  // Form validation
  const validateField = (field, value, section = null) => {
    let error = '';
    const fieldValue = section ? value[field] : value;

    switch (field) {
      case 'locationOfDoorSet':
        if (!fieldValue?.trim()) {
          error = 'Location of Door Set is required';
        }
        break;
      case 'rating':
        if (!fieldValue) {
          error = 'Fire Resistance Rating is required';
        }
        break;
      case 'doorType':
        if (!fieldValue) {
          error = 'Door Type is required';
        }
        break;
      case 'surveyed':
        if (!fieldValue) {
          error = 'Surveyed field is required';
        }
        break;
      // Add more validation cases as needed
    }

    return error;
  };

  // Handle input changes
  const handleInputChange = (field, value, section = null) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    const error = validateField(field, value, section);
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));

    setError('');
  };

  // Handle photo capture/upload
  const handlePhotoCapture = async (photoType) => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1280,
      maxHeight: 1280,
      includeBase64: true,
    };

    try {
      const result = await launchCamera(options);
      if (result.assets && result.assets[0]) {
        const file = result.assets[0];
        handlePhotoUpload(photoType, {
          uri: file.uri,
          type: file.type,
          name: file.fileName || `${photoType}.jpg`,
        });
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    }
  };

  // Handle form submission
  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Validate form
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        Alert.alert('Validation Error', 'Please fill in all required fields');
        return;
      }

      // Prepare survey data
      const surveyData = {
        doorNumber: formData.doorPinNo.toString(),
        floor: formData.floor || '',
        room: formData.room || '',
        locationOfDoorSet: formData.locationOfDoorSet.trim(),
        doorType: formData.doorType || '',
        doorConfiguration: formData.doorConfiguration,
        doorMaterial: formData.doorMaterial,
        rating: formData.rating,
        surveyed: formData.surveyed,
        // Add other fields as needed
      };

      // Save to backend
      const response = await axios.post(`${API_BASE_URL}/api/surveys`, surveyData);
      
      if (response.data.success) {
        setSurveyId(response.data._id);
        setIsSurveySaved(true);
        Alert.alert('Success', 'Survey saved successfully!');
        
        // Reset form for next survey
        resetForm();
      }
    } catch (error) {
      console.error('Error saving survey:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save survey');
    } finally {
      setIsLoading(false);
    }
  };

  // Render form sections
  const renderFormSection = (title, children) => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Fire Door Survey</Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {/* Basic Information Section */}
        {renderFormSection('Basic Information', (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Door/Pin No.</Text>
              <TextInput
                style={styles.input}
                value={formData.doorPinNo.toString()}
                onChangeText={(value) => handleInputChange('doorPinNo', parseInt(value) || 0)}
                keyboardType="numeric"
                placeholder="Enter door number"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location of Door Set *</Text>
              <TextInput
                style={[
                  styles.input,
                  validationErrors.locationOfDoorSet && styles.inputError
                ]}
                value={formData.locationOfDoorSet}
                onChangeText={(value) => handleInputChange('locationOfDoorSet', value)}
                placeholder="Enter door set location"
              />
              {validationErrors.locationOfDoorSet && (
                <Text style={styles.errorText}>{validationErrors.locationOfDoorSet}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Floor</Text>
              <Picker
                selectedValue={formData.floor}
                onValueChange={(value) => handleInputChange('floor', value)}
                style={styles.picker}
              >
                <Picker.Item label="Select Floor" value="" />
                <Picker.Item label="Basement" value="B" />
                <Picker.Item label="Ground" value="G" />
                <Picker.Item label="First" value="1" />
                <Picker.Item label="Second" value="2" />
                <Picker.Item label="Third" value="3" />
              </Picker>
            </View>
          </>
        ))}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.saveButton, isLoading && styles.disabledButton]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isSurveySaved ? 'Update Survey' : 'Save Survey'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  formSection: {
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    padding: 12,
    backgroundColor: '#6c757d',
    borderRadius: 4,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    padding: 12,
    backgroundColor: '#007bff',
    borderRadius: 4,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FireDoorSurveyFormNative; 