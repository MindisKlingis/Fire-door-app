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
  const doorTypes = ['With VP Panel', 'Single', 'Double', 'Leaf & half'];
  const materialTypes = [
    'Timber based',
    'Composite',
    'Steel',
    'Timber leaf with steel frame',
    'custom'
  ];

  const renderDoorTypeButtons = () => (
    <View>
      <View style={styles.optionsGroup}>
        {doorTypes.map((type) => {
          const isVPPanel = type === 'With VP Panel';
          return (
            <TouchableOpacity
              key={type}
              style={[
                styles.optionButton,
                isVPPanel 
                  ? (configuration.hasVPPanel && styles.optionButtonSelected)
                  : (configuration.type === type && styles.optionButtonSelected),
                validationErrors.doorType && !isVPPanel && styles.optionButtonError,
              ]}
              onPress={() => {
                if (isVPPanel) {
                  onConfigurationChange('hasVPPanel', !configuration.hasVPPanel);
                } else {
                  onConfigurationChange('type', type);
                }
              }}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  isVPPanel 
                    ? (configuration.hasVPPanel && styles.optionButtonTextSelected)
                    : (configuration.type === type && styles.optionButtonTextSelected),
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.additionalOptions}>
        <TouchableOpacity
          style={[
            styles.optionButton,
            configuration.hasFanLight && styles.optionButtonSelected,
          ]}
          onPress={() => onConfigurationChange('hasFanLight', !configuration.hasFanLight)}
        >
          <Text
            style={[
              styles.optionButtonText,
              configuration.hasFanLight && styles.optionButtonTextSelected,
            ]}
          >
            With Fan Light
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionButton,
            configuration.hasSidePanels && styles.optionButtonSelected,
          ]}
          onPress={() => onConfigurationChange('hasSidePanels', !configuration.hasSidePanels)}
        >
          <Text
            style={[
              styles.optionButtonText,
              configuration.hasSidePanels && styles.optionButtonTextSelected,
            ]}
          >
            With Side Panel(s)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Door Set Configuration *</Text>
        {renderDoorTypeButtons()}
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
    gap: 8,
    justifyContent: 'flex-start',
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0,
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
    textAlign: 'center',
  },
  optionButtonTextSelected: {
    color: '#fff',
  },
  additionalOptions: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
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