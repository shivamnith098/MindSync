import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  ScrollView, 
  Alert, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Dimensions
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

import { uploadAINote } from '../services/api';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

export default function UploadAiNoteScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [showCropOptions, setShowCropOptions] = useState(false);
  const animationRef = useRef(null);

  // Request camera permissions when component mounts
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permissions to use this feature');
      }
    })();
  }, []);

  useEffect(() => {
    if (loading && animationRef.current) {
      animationRef.current.play();
    }
  }, [loading]);

  const getMimeType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
    if (ext === 'png') return 'image/png';
    if (ext === 'pdf') return 'application/pdf';
    if (ext === 'txt') return 'text/plain';
    return 'application/octet-stream';
  };

  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result?.assets && result.assets.length > 0) {
        await processFile(result.assets[0]);
      } else {
        Alert.alert("No file selected");
      }
    } catch (err) {
      console.error("Document picker error:", err);
      Alert.alert("Error", "Failed to select document");
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setShowCropOptions(true);
      }
    } catch (err) {
      console.error("Image picker error:", err);
      Alert.alert("Error", "Failed to select image");
    }
  };

  const handleCameraCapture = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setShowCropOptions(true);
      }
    } catch (err) {
      console.error("Camera capture error:", err);
      Alert.alert("Error", "Failed to capture image");
    }
  };

  const handleCropImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 1,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setShowCropOptions(false);
        
        await processFile({
          uri: result.assets[0].uri,
          name: 'cropped_image.jpg',
          mimeType: 'image/jpeg',
        });
      } else {
        setShowCropOptions(false);
      }
    } catch (err) {
      console.error("Image cropping error:", err);
      Alert.alert("Error", "Failed to crop image");
      setShowCropOptions(false);
    }
  };

  const skipCropping = async () => {
    setShowCropOptions(false);
    await processFile({
      uri: imageUri,
      name: 'image.jpg',
      mimeType: 'image/jpeg',
    });
  };
  
  const processFile = async (file) => {
    try {
      const selectedFile = {
        uri: file.uri,
        name: file.name || 'file.jpg',
        mimeType: file.mimeType || getMimeType(file.name || 'file.jpg'),
      };

      setLoading(true);
      const res = await uploadAINote("123", selectedFile); // Replace with actual userId
      setResponse(res?.note);
      
      // No auto-navigation - removed
    } catch (err) {
      console.error("Upload AI Note Error:", err?.response?.data || err.message);
      Alert.alert("Upload Failed", "Something went wrong while processing your file.");
    } finally {
      setLoading(false);
    }
  };

  const navigateToConceptCluster = () => {
    if (response?.concepts && response.concepts.length > 0) {
      navigation.navigate('ConceptCluster', { 
        newConcepts: response.concepts,
        fromUpload: true 
      });
    }
  };

  const navigateToLinkedNotes = (concept) => {
    navigation.navigate('LinkedNotes', { topic: concept });
  };

  const renderConceptBadges = () => {
    if (!response?.concepts || response.concepts.length === 0) {
      return <Text style={styles.noConcepts}>No concepts identified</Text>;
    }
    
    return (
      <View style={styles.conceptsContainer}>
        {response.concepts.map((concept, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.conceptBadge}
            onPress={() => navigateToLinkedNotes(concept)}
          >
            <Text style={styles.conceptText}>{concept}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <LinearGradient
          colors={['#5B86E5', '#36D1DC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <Text style={styles.heading}>📸 Capture Knowledge</Text>
          <Text style={styles.subheading}>Upload images or documents to extract concepts automatically</Text>
        </LinearGradient>

        {imageUri && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => setImageUri(null)}
            >
              <MaterialIcons name="delete" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.uploadButton} onPress={handleCameraCapture}>
            <LinearGradient
              colors={['#36D1DC', '#5B86E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Ionicons name="camera" size={24} color="white" />
              <Text style={styles.buttonText}>Take Photo</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadButton} onPress={handleImagePick}>
            <LinearGradient
              colors={['#5B86E5', '#36D1DC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Ionicons name="image" size={24} color="white" />
              <Text style={styles.buttonText}>Pick Image</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadButton} onPress={handleDocumentPick}>
            <LinearGradient
              colors={['#36D1DC', '#5B86E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <MaterialIcons name="file-upload" size={24} color="white" />
              <Text style={styles.buttonText}>Pick Document</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <LottieView
              ref={animationRef}
              source={require('../assets/image.png')}
              style={styles.animation}
              autoPlay
              loop
            />
            <Text style={styles.loadingText}>Analyzing with Gemini AI...</Text>
          </View>
        )}

        {response && (
          <View style={styles.responseContainer}>
            <LinearGradient
              colors={['#34A853', '#1E8E3E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.successBanner}
            >
              <FontAwesome5 name="check-circle" size={20} color="white" />
              <Text style={styles.successText}>Processing Complete</Text>
            </LinearGradient>

            <View style={styles.noteCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="document-text" size={22} color="#5B86E5" />
                <Text style={styles.cardLabel}>Extracted Content</Text>
              </View>
              <Text style={styles.noteContent}>{response.content}</Text>

              <View style={styles.divider} />

              <View style={styles.cardHeader}>
                <Ionicons name="bulb" size={22} color="#5B86E5" />
                <Text style={styles.cardLabel}>Concepts Identified</Text>
              </View>
              {renderConceptBadges()}

              {response.concepts && response.concepts.length > 0 && (
                <View style={styles.navigationButtonsContainer}>
                  <TouchableOpacity 
                    style={styles.navigateButton}
                    onPress={navigateToConceptCluster}
                  >
                    <Text style={styles.navigateButtonText}>View in Concept Clusters</Text>
                    <MaterialIcons name="arrow-forward" size={18} color="#5B86E5" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Crop Options Modal */}
      <Modal
        visible={showCropOptions}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adjust Your Image</Text>
            <Text style={styles.modalDescription}>Would you like to crop this image before analysis?</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={skipCropping}>
                <Text style={styles.modalButtonText}>Skip</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.modalButton, styles.primaryButton]} onPress={handleCropImage}>
                <Text style={styles.primaryButtonText}>Crop Image</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  header: {
    padding: 24,
    paddingTop: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subheading: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  imagePreview: {
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    resizeMode: 'contain',
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  buttonContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  uploadButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  animation: {
    width: 200,
    height: 200,
  },
  loadingText: {
    marginTop: 10,
    color: '#5B86E5',
    fontSize: 16,
    fontWeight: '600',
  },
  responseContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  successText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8,
    color: '#333',
  },
  noteContent: {
    fontSize: 16,
    color: '#444',
    marginBottom: 16,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 16,
  },
  conceptsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  noConcepts: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#999',
    marginTop: 4,
  },
  conceptBadge: {
    backgroundColor: '#EBF3FE',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#5B86E5',
  },
  conceptText: {
    color: '#5B86E5',
    fontWeight: '600',
    fontSize: 14,
  },
  navigationButtonsContainer: {
    marginTop: 20,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#5B86E5',
    borderRadius: 10,
  },
  navigateButtonText: {
    color: '#5B86E5',
    fontWeight: '600',
    marginRight: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    marginHorizontal: 6,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#5B86E5',
    borderColor: '#5B86E5',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  }
});