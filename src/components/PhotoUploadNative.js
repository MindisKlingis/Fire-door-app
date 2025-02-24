import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PhotoUploadNative = ({ onUpload, photoTypes, uploadedPhotos, isSurveySaved }) => {
  const handlePhotoCapture = async (photoType) => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1280,
      maxHeight: 1280,
      includeBase64: true,
      saveToPhotos: false,
    };

    try {
      // Show action sheet to choose between camera and gallery
      Alert.alert(
        'Upload Photo',
        'Choose photo source',
        [
          {
            text: 'Camera',
            onPress: async () => {
              const result = await launchCamera(options);
              handlePhotoResult(result, photoType);
            },
          },
          {
            text: 'Photo Library',
            onPress: async () => {
              const result = await launchImageLibrary(options);
              handlePhotoResult(result, photoType);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Error handling photo:', error);
      Alert.alert('Error', 'Failed to handle photo. Please try again.');
    }
  };

  const handlePhotoResult = (result, photoType) => {
    if (result.assets && result.assets[0]) {
      const file = result.assets[0];
      onUpload(photoType, {
        uri: file.uri,
        type: file.type || 'image/jpeg',
        name: file.fileName || `${photoType}.jpg`,
      });
    }
  };

  const renderPhotoButton = (type, label) => {
    const isUploaded = uploadedPhotos[type];

    return (
      <View style={styles.photoItem} key={type}>
        <TouchableOpacity
          style={[styles.photoButton, isUploaded && styles.photoButtonUploaded]}
          onPress={() => handlePhotoCapture(type)}
        >
          <Icon
            name={isUploaded ? 'check-circle' : 'camera'}
            size={24}
            color={isUploaded ? '#28a745' : '#007bff'}
          />
        </TouchableOpacity>
        <Text style={styles.photoLabel}>{label}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Required Photos</Text>
      <View style={styles.photoGrid}>
        {renderPhotoButton(photoTypes.FRONT_DOOR, 'Front Door')}
        {renderPhotoButton(photoTypes.TOP_LEAF, 'Top Leaf')}
        {renderPhotoButton(photoTypes.TOP_LEAF_DOUBLE, 'Top Leaf Double')}
      </View>
      <Text style={styles.sectionTitle}>Additional Photos</Text>
      <View style={styles.photoGrid}>
        {renderPhotoButton(photoTypes.FAULTS_3, 'Fault Photo 1')}
        {renderPhotoButton(photoTypes.FAULTS_4, 'Fault Photo 2')}
        {renderPhotoButton(photoTypes.FAULTS_5, 'Fault Photo 3')}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    justifyContent: 'flex-start',
  },
  photoItem: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: 16,
  },
  photoButton: {
    width: 56,
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007bff',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
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
  photoButtonUploaded: {
    borderColor: '#28a745',
    backgroundColor: '#f8fff8',
  },
  photoLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default PhotoUploadNative; 