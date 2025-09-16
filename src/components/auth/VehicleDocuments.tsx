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
  Linking,
  ActivityIndicator,
  KeyboardAvoidingView
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
      navigation.reset({
        index: 0,
        routes: [{ name: 'approval-screen' }],
      })
    },
    onError: (error: any) => {
      console.log('document upload error', error);
      ShowToast(error?.response?.data?.message || 'Failed to upload documents. Please try again with less than 1MB file size.', { type: 'error' });
      // Alert.alert('Error', 'Failed to upload documents. Please try again.');
    }
  });

  const handleImageUpload = async (type: keyof DocumentDataType) => {
    // Enhanced options for image picker with better compression
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 1500,        // Reduced from 2000 (36% smaller)
      maxWidth: 1500,         // Reduced from 2000 (36% smaller)
      selectionLimit: 1,
      quality: 0.5,           // Reduced from 0.8 (50% more compression)
 // Additional compression
    };

    // Helper function for document names
    const getDocumentName = (docType: keyof DocumentDataType) => {
      switch(docType) {
        case 'drivingLicenseFront': return 'Driving License (Front)';
        case 'drivingLicenseBack': return 'Driving License (Back)';
        case 'vehicleRegistration': return 'Vehicle Registration';
        case 'profilePhoto': return 'Profile Photo';
        default: return 'Document';
      }
    };
  
    try {
      console.log('Launching image library...');
      const result = await launchImageLibrary(options);
      console.log('Image picker result:', result);
      
      if (result.didCancel) {
        console.log('User cancelled image selection');
        return;
      }
      
      if (result.errorMessage) {
        console.log('Image picker error:', result.errorMessage);
        ShowToast('Failed to select image', { type: 'error' });
        return;
      }
      
      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        if (asset.uri) {
          // Smaller size limit for better performance (BIGGEST IMPACT)
          const maxSizeInBytes = 50 * 1024; // 200KB instead of 1MB (80% reduction)
          const documentName = getDocumentName(type);
          
          console.log(`Selected ${documentName} URI: ${asset.uri}`);
          
          // Method 1: Use fileSize from asset (if available)
          let fileSizeInBytes = asset.fileSize || 0;
          
          // Method 2: Try to get more accurate file size using fetch (for better accuracy)
          try {
            const response = await fetch(asset.uri);
            const blob = await response.blob();
            fileSizeInBytes = blob.size;
            console.log(`✅ Got accurate file size from blob: ${fileSizeInBytes} bytes`);
          } catch (fetchError) {
            console.log('❌ Could not fetch blob, using asset.fileSize:', asset.fileSize);
            // Fallback to asset.fileSize if available
            if (!asset.fileSize) {
              console.log('⚠️ No file size available, allowing upload with warning');
              ShowToast(`${documentName} selected (size validation not available)`, { 
                type: 'warning' 
              });
              
              setDocumentData(prev => ({
                ...prev,
                [type]: asset.uri
              }));
              return;
            }
          }
          
          const fileSizeInKB = (fileSizeInBytes / 1024).toFixed(2);
          console.log(`File size: ${fileSizeInKB}KB (${fileSizeInBytes} bytes)`);
          
          // 🚫 REJECT IF TOO LARGE
          if (fileSizeInBytes > maxSizeInBytes) {
            ShowToast(`Image too large! Please select a smaller image.`, { 
              type: 'error' 
            });
            return;
          }
          
          // ✅ IMAGE SIZE IS ACCEPTABLE
          console.log(`✅ ${documentName} size valid: ${fileSizeInKB}KB`);
          // ShowToast(`${documentName} selected (${fileSizeInKB}KB)`, { 
          //   type: 'success' 
          // });
          
          setDocumentData(prev => ({
            ...prev,
            [type]: asset.uri
          }));
        }
      }
    } catch (error) {
      console.error('Error in image picker:', error);
      ShowToast('Something went wrong while selecting image', { type: 'error' });
    }
  };

  // Enhanced submit function with network check
  const handleSubmit = async () => {


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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1, backgroundColor: Black}}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
    <SafeAreaView style={styles.container}>
      {/* {DocumentUploadMutation.isPending && <Loader />} */}
      {/* <TouchableOpacity onPress={() => navigation.goBack()}>
        <View style={styles.backRow}>
          <Ionicons name="chevron-back" size={20} color={Gold} />
          <Text style={styles.backText}>Back</Text>
        </View>
      </TouchableOpacity> */}
      
      <Text style={styles.headerText}>Vehicle Documents</Text>
      <Text style={styles.subHeaderText}>Please upload clear images of all required documents</Text>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderDocumentUploader(
          'Driving License', 
          'drivingLicenseFront',
          'Upload a clear image of the front side of your driving license'
        )}
        
        {renderDocumentUploader(
          'Criminal Record Check', 
          'drivingLicenseBack',
          'Upload a clear image of your criminal record check'
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
            {DocumentUploadMutation.isPending ? <ActivityIndicator size="small" color={Black} /> : 'Submit Documents'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Black,
    flex: 1,
    // paddingTop: 30,
    paddingHorizontal: 20,
    marginHorizontal: Platform.OS === 'ios' ? 20 : 0,
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