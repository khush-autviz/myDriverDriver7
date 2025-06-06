import React, { useState, useEffect } from 'react'
import { 
  SafeAreaView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  ScrollView,
  Image,
  Alert,
  Platform,
  PermissionsAndroid,
  Linking
} from 'react-native'
import { Black, Gold, Gray, LightGold, White } from '../../constants/Color'
import { useNavigation } from '@react-navigation/native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { 
  launchImageLibrary, 
  ImageLibraryOptions,
  ImagePickerResponse
} from 'react-native-image-picker'
import { useAuthStore } from '../../store/authStore'
import { useMutation } from '@tanstack/react-query'
import { vehicleDocumentsApi } from '../../constants/Api'
import { ShowToast } from '../../lib/Toast'
import { Loader } from '../../lib/Loader'

// Define TypeScript interface for document data
interface DocumentDataType {
  drivingLicenseFront: string | null;
  drivingLicenseBack: string | null;
  vehicleRegistration: string | null;
  profilePhoto: string | null;
}

export default function VehicleDocuments() {
  const USER = useAuthStore(state => state.user) 
  const SETUSER = useAuthStore(state => state.setUser)
  const navigation: any = useNavigation()
  const [documentData, setDocumentData] = useState<DocumentDataType>({
    drivingLicenseFront: null,
    drivingLicenseBack: null,
    vehicleRegistration: null,
    profilePhoto: null
  })
  
  // Document upload mutation
  const DocumentUploadMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FormData }) =>
      vehicleDocumentsApi(id, payload),
    onSuccess: (response) => {
      console.log('document upload success', response);
      SETUSER({...USER,accountStatus: response.data.accountStatus})
      navigation.navigate('approval-screen')
    },
    onError: (error) => {
      console.log('document upload error', error);
      ShowToast(error.message, { type: 'error' });
      // Alert.alert('Error', 'Failed to upload documents. Please try again.');
    }
  });

  const handleImageUpload = async (type: keyof DocumentDataType) => {
    // Simple options for image picker
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      selectionLimit: 1,
    };
  
    try {
      console.log('Launching image library...');
      const result = await launchImageLibrary(options);
      
      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.uri) {
          console.log(`Selected image URI: ${asset.uri}`);
          setDocumentData(prev => ({
            ...prev,
            [type]: asset.uri
          }));
        }
      }
    } catch (error) {
      console.error('Error in image picker:', error);
      // Alert.alert('Error', 'Something went wrong when trying to pick an image');
      ShowToast('Something went wrong when trying to pick an image', {type: 'error'})
    }
  };

  const handleSubmit = () => {
    // Validate all fields are filled
    const requiredFields = ['drivingLicenseFront', 'drivingLicenseBack', 'vehicleRegistration', 'profilePhoto'] as const;
    const missingFields = requiredFields.filter(field => !documentData[field]);
    
    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(field => {
        switch(field) {
          case 'drivingLicenseFront': return 'Driving License (Front)';
          case 'drivingLicenseBack': return 'Driving License (Back)';
          case 'vehicleRegistration': return 'Vehicle Registration';
          case 'profilePhoto': return 'Profile Photo';
          default: return field;
        }
      });
      
      // Alert.alert('Missing Documents', `Please upload all required documents: ${fieldNames.join(', ')}`);
      ShowToast(`Please upload all required documents: ${fieldNames.join(', ')}`, {type: 'warning'})
      return;
    }
    
    // Create FormData for API submission
    const formData = new FormData();
    
    // Helper function to append images to FormData
    const appendImageToFormData = (fieldName: string, uri: string | null) => {
      if (!uri) return;
      
      const imageName = uri.split('/').pop() || `${fieldName}.jpg`;
      const imageType = imageName.endsWith('.png') ? 'image/png' : 'image/jpeg';
      
      // @ts-ignore - TypeScript doesn't recognize the FormData append with file object
      formData.append(fieldName, {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        type: imageType,
        name: imageName,
      });
    };
    
    // Append all document images
    appendImageToFormData('drivingLicenseFront', documentData.drivingLicenseFront);
    appendImageToFormData('drivingLicenseBack', documentData.drivingLicenseBack);
    appendImageToFormData('vehicleRegistration', documentData.vehicleRegistration);
    appendImageToFormData('profilePhoto', documentData.profilePhoto);
    
    console.log('Document data:', documentData);
    console.log('USER ID:', USER?.id);
    
    // Call the mutation with the FormData
    if (USER?.id) {
      DocumentUploadMutation.mutateAsync({id: USER.id, payload: formData});
    } else {
      Alert.alert('Error', 'User ID not found. Please log in again.');
    }
  }

  // Helper function to render document upload sections
  const renderDocumentUploader = (
    title: string, 
    field: keyof DocumentDataType, 
    description: string
  ) => (
    <>
      <Text style={styles.labelText}>{title} <Text style={styles.requiredField}>*</Text></Text>
      {description && <Text style={styles.descriptionText}>{description}</Text>}
      <TouchableOpacity 
        style={styles.imageUploadButton}
        onPress={() => handleImageUpload(field)}
        activeOpacity={0.7}
      >
        {documentData[field] ? (
          <Image 
            source={{ uri: documentData[field] as string }} 
            style={styles.previewImage} 
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.uploadButtonText}>Upload Image</Text>
        )}
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      {DocumentUploadMutation.isPending && <Loader />}
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <View style={styles.backRow}>
          <Ionicons name="chevron-back" size={20} color={Gold} />
          <Text style={styles.backText}>Back</Text>
        </View>
      </TouchableOpacity>
      
      <Text style={styles.headerText}>Vehicle Documents</Text>
      <Text style={styles.subHeaderText}>Please upload clear images of all required documents</Text>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderDocumentUploader(
          'Driving License (Front)', 
          'drivingLicenseFront',
          'Upload a clear image of the front side of your driving license'
        )}
        
        {renderDocumentUploader(
          'Driving License (Back)', 
          'drivingLicenseBack',
          'Upload a clear image of the back side of your driving license'
        )}
        
        {renderDocumentUploader(
          'Vehicle Registration', 
          'vehicleRegistration',
          'Upload a clear image of your vehicle registration certificate'
        )}
        
        {renderDocumentUploader(
          'Profile Photo', 
          'profilePhoto',
          'Upload a recent passport-sized photo of yourself'
        )}
        
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          activeOpacity={0.7}
          disabled={DocumentUploadMutation.isPending}
        >
          <Text style={styles.submitButtonText}>
            {DocumentUploadMutation.isPending ? 'Uploading...' : 'Submit Documents'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Black,
    flex: 1,
    // paddingTop: 30,
    paddingHorizontal: 20,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: Gold,
    fontSize: 16,
  },
  headerText: {
    color: Gold,
    fontWeight: '500',
    fontSize: 24,
    marginTop: 20,
    marginBottom: 5,
  },
  subHeaderText: {
    color: LightGold,
    fontSize: 14,
    marginBottom: 15,
  },
  labelText: {
    color: LightGold,
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
  },
  descriptionText: {
    color: Gray,
    fontSize: 12,
    marginTop: 5,
  },
  imageUploadButton: {
    borderColor: White,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 10,
    height: 150,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  uploadButtonText: {
    color: Gray,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  submitButton: {
    backgroundColor: Gold,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  submitButtonText: {
    color: White,
    fontWeight: '500',
    fontSize: 16,
  },
  requiredField: {
    color: Gold,
  }
})