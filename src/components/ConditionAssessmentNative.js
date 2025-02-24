import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ConditionAssessmentNative = ({
  formData,
  onInputChange,
  onPhotoCapture,
  onPhotoRemove,
  validationErrors,
}) => {
  const renderConditionGroup = (
    label,
    field,
    defectField,
    customDefectField,
    options,
    required = false
  ) => (
    <View style={styles.conditionGroup}>
      <Text style={styles.label}>{label}{required && ' *'}</Text>
      <View style={styles.optionsGroup}>
        {['Y', 'N'].map((value) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.optionButton,
              formData[field] === value && styles.optionButtonSelected,
              validationErrors[field] && styles.optionButtonError,
            ]}
            onPress={() => onInputChange(field, value)}
          >
            <Text
              style={[
                styles.optionButtonText,
                formData[field] === value && styles.optionButtonTextSelected,
              ]}
            >
              {value}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {formData[field] === 'N' && (
        <View style={styles.defectSection}>
          <View style={styles.defectHeader}>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={() => onPhotoCapture(field)}
            >
              <Icon name="camera" size={24} color="#007bff" />
            </TouchableOpacity>
            <Picker
              selectedValue={formData[defectField]}
              onValueChange={(value) => onInputChange(defectField, value)}
              style={styles.defectPicker}
            >
              <Picker.Item label="Select Defect" value="" />
              {options.map((option) => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
              <Picker.Item label="Other (specify)" value="custom" />
            </Picker>
          </View>

          {formData[defectField] === 'custom' && (
            <TextInput
              style={styles.customDefectInput}
              value={formData[customDefectField]}
              onChangeText={(value) => onInputChange(customDefectField, value)}
              placeholder="Enter custom defect"
            />
          )}

          {formData.defectPhotos[field]?.url && (
            <View style={styles.photoPreview}>
              <Image
                source={{ uri: formData.defectPhotos[field].url }}
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
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderConditionGroup(
        'Frame in good condition',
        'frameCondition',
        'frameDefect',
        'frameCustomDefect',
        [
          { label: 'Damaged', value: 'damaged' },
          { label: 'Loose', value: 'loose' },
          { label: 'Rusted', value: 'rusted' },
        ]
      )}

      {renderConditionGroup(
        'Handles/furniture sufficient',
        'handlesSufficient',
        'handlesDefect',
        'handlesCustomDefect',
        [
          { label: 'Loose', value: 'loose' },
          { label: 'Missing', value: 'missing' },
          { label: 'Damaged', value: 'damaged' },
        ]
      )}

      {renderConditionGroup(
        'Signage satisfactory',
        'signageSatisfactory',
        'signageDefect',
        'signageCustomDefect',
        [
          { label: 'Missing', value: 'missing' },
          { label: 'Damaged', value: 'damaged' },
          { label: 'Incorrect', value: 'incorrect' },
        ]
      )}

      {renderConditionGroup(
        'Self Closer Device Functional',
        'selfCloserFunctional',
        'selfCloserDefect',
        'selfCloserCustomDefect',
        [
          { label: 'Not Closing', value: 'not closing' },
          { label: 'Slamming', value: 'slamming' },
          { label: 'Missing', value: 'missing' },
        ]
      )}

      {renderConditionGroup(
        'Hinges Compliant',
        'hingesCondition',
        'hingesDefect',
        'hingesCustomDefect',
        [
          { label: 'Leaking Oil', value: 'leaking oil' },
          { label: 'Screws Missing', value: 'screws missing' },
        ]
      )}

      <View style={styles.finalAssessment}>
        <Text style={styles.sectionTitle}>Final Assessment</Text>
        
        <View style={styles.assessmentGroup}>
          <Text style={styles.label}>Upgrade/Replacement/No Access *</Text>
          <View style={styles.optionsGroup}>
            {['Upgrade', 'Replace Doorset', 'Replace leaf', 'No Access'].map((value) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.optionButton,
                  formData.upgradeReplacement === value && styles.optionButtonSelected,
                  validationErrors.upgradeReplacement && styles.optionButtonError,
                ]}
                onPress={() => onInputChange('upgradeReplacement', value)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    formData.upgradeReplacement === value && styles.optionButtonTextSelected,
                  ]}
                >
                  {value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.assessmentGroup}>
          <Text style={styles.label}>Overall Condition *</Text>
          <View style={styles.optionsGroup}>
            {['Good', 'Fair', 'Poor'].map((value) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.optionButton,
                  formData.overallCondition === value && styles.optionButtonSelected,
                  validationErrors.overallCondition && styles.optionButtonError,
                ]}
                onPress={() => onInputChange('overallCondition', value)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    formData.overallCondition === value && styles.optionButtonTextSelected,
                  ]}
                >
                  {value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.notesGroup}>
          <Text style={styles.label}>Additional Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={formData.conditionDetails.notes}
            onChangeText={(value) => onInputChange('notes', value, 'conditionDetails')}
            multiline
            numberOfLines={4}
            placeholder="Enter additional notes"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
  },
  conditionGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  optionsGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  optionButtonError: {
    borderColor: '#dc3545',
  },
  optionButtonText: {
    color: '#333',
    fontSize: 14,
  },
  optionButtonTextSelected: {
    color: '#fff',
  },
  defectSection: {
    marginTop: 8,
  },
  defectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
    marginRight: 8,
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
  defectPicker: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  customDefectInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    marginTop: 8,
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
  finalAssessment: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  assessmentGroup: {
    marginBottom: 16,
  },
  notesGroup: {
    marginTop: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    height: 100,
    textAlignVertical: 'top',
  },
});

export default ConditionAssessmentNative; 