import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  TextInput,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const DoorConfigurationNative = ({
  configuration,
  material,
  onConfigurationChange,
  onMaterialChange,
  validationErrors,
}) => {
  const doorTypes = ['Single', 'Double', 'Leaf & half'];
  const materialTypes = [
    'Timber-Based Door Set',
    'Composite Door Set',
    'Metal Door Set',
    'Wooden Leaf with Metal Frame',
    'custom'
  ];

  const renderDoorTypeButtons = () => (
    <View style={styles.optionsGroup}>
      {doorTypes.map((type) => (
        <TouchableOpacity
          key={type}
          style={[
            styles.optionButton,
            configuration.type === type && styles.optionButtonSelected,
            validationErrors.doorType && styles.optionButtonError,
          ]}
          onPress={() => onConfigurationChange('type', type)}
        >
          <Text
            style={[
              styles.optionButtonText,
              configuration.type === type && styles.optionButtonTextSelected,
            ]}
          >
            {type}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Door Set Configuration *</Text>
        {renderDoorTypeButtons()}
        <View style={styles.additionalOptions}>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>With Fan Light</Text>
            <Switch
              value={configuration.hasFanLight}
              onValueChange={(value) => onConfigurationChange('hasFanLight', value)}
              trackColor={{ false: '#e0e0e0', true: '#007bff' }}
              thumbColor={Platform.OS === 'ios' ? '#fff' : configuration.hasFanLight ? '#0056b3' : '#f4f3f4'}
            />
          </View>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>With Side Panel(s)</Text>
            <Switch
              value={configuration.hasSidePanels}
              onValueChange={(value) => onConfigurationChange('hasSidePanels', value)}
              trackColor={{ false: '#e0e0e0', true: '#007bff' }}
              thumbColor={Platform.OS === 'ios' ? '#fff' : configuration.hasSidePanels ? '#0056b3' : '#f4f3f4'}
            />
          </View>
        </View>
        {validationErrors.doorType && (
          <Text style={styles.errorText}>{validationErrors.doorType}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fire Door Material *</Text>
        <View style={styles.materialSection}>
          <View style={styles.optionsGroup}>
            {materialTypes.slice(0, 2).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionButton,
                  material.type === type && styles.optionButtonSelected,
                ]}
                onPress={() => onMaterialChange('type', type)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    material.type === type && styles.optionButtonTextSelected,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.materialDropdownSection}>
            <Picker
              selectedValue={material.type}
              onValueChange={(value) => onMaterialChange('type', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select Additional Options" value="" />
              {materialTypes.slice(2).map((type) => (
                <Picker.Item
                  key={type}
                  label={type === 'custom' ? 'Other (specify)' : type}
                  value={type}
                />
              ))}
            </Picker>
            {material.type === 'custom' && (
              <TextInput
                style={styles.customMaterialInput}
                value={material.customType}
                onChangeText={(value) => onMaterialChange('customType', value)}
                placeholder="Enter custom material"
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  optionsGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
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
  additionalOptions: {
    marginTop: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 14,
    color: '#666',
  },
  materialSection: {
    marginTop: 8,
  },
  materialDropdownSection: {
    marginTop: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  customMaterialInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
  },
});

export default DoorConfigurationNative; 