// import React, { useState, useEffect } from 'react'
// import { 
//   SafeAreaView, 
//   StyleSheet, 
//   Text, 
//   TextInput, 
//   TouchableOpacity, 
//   View,
//   ScrollView,
//   Image,
//   Alert,
//   Platform,
//   PermissionsAndroid,
//   Linking
// } from 'react-native'
// import { Black, Gold, Gray, LightGold, White } from '../../constants/Color'
// import { useNavigation } from '@react-navigation/native'
// import Ionicons from 'react-native-vector-icons/Ionicons'
// import { 
//   launchImageLibrary, 
//   ImageLibraryOptions,
// } from 'react-native-image-picker'
// import { useAuthStore } from '../../store/authStore'
// import { useMutation } from '@tanstack/react-query'
// import { vehicleDetailsApi } from '../../constants/Api'

// // Define TypeScript interface for vehicle data
// interface VehicleDataType {
//   brand: string;
//   model: string;
//   year: number;
//   color: string;
//   licensePlate: string;
//   vehicleType: string;
//   vehicleImage: string | null;
//   numberPlateImage: string | null;
// }

// export default function VehicleDetails() {
//   const USER = useAuthStore(state => state.user) 
//   const navigation: any = useNavigation()
//   const [vehicleData, setVehicleData] = useState<VehicleDataType>({
//     brand: '',
//     model: '',
//     year: 0,
//     color: '',
//     licensePlate: '',
//     vehicleType: '',
//     vehicleImage: null,
//     numberPlateImage: null
//   })

//   console.log(USER);
  

//   // Check permissions when component mounts
//   useEffect(() => {
//     checkPermissions();
//   }, []);

//   // vehicle detail mutation
//   const VehicleDetailsMutation = useMutation({
//     mutationFn: ({ id, payload }: { id: number; payload: any }) =>
//       vehicleDetailsApi(id, payload),
//     onSuccess: (response) => {
//       console.log('vehicle details mutation success', response);
//     },
//     onError: (error) => {
//       console.log('vehicle details mutation error', error);
//     }
//   });

//   const checkPermissions = async () => {
//     if (Platform.OS === 'android') {
//       try {
//         const result = await PermissionsAndroid.check(
//           PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
//         );
        
//         if (!result) {
//           // Permission not granted yet, show an explanation
//           Alert.alert(
//             'Storage Permission Required',
//             'This app needs access to your storage to upload vehicle images. Please grant permission when prompted.',
//             [
//               { text: 'OK', onPress: () => console.log('OK Pressed') }
//             ]
//           );
//         }
//       } catch (err) {
//         console.warn(err);
//       }
//     }
//   };

// //   const requestStoragePermission = async () => {
// //     if (Platform.OS === 'android') {
// //       try {
// //         const granted = await PermissionsAndroid.request(
// //           PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
// //           {
// //             title: "Storage Permission Required",
// //             message: "This app needs access to your storage to upload vehicle images",
// //             buttonNeutral: "Ask Me Later",
// //             buttonNegative: "Cancel",
// //             buttonPositive: "Grant Permission"
// //           }
// //         );
        
// //         if (granted === PermissionsAndroid.RESULTS.GRANTED) {
// //           console.log("Storage permission granted");
// //           return true;
// //         } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
// //           // User selected "Never ask again", direct them to settings
// //           Alert.alert(
// //             'Permission Required',
// //             'Storage permission is required to upload images. Please enable it in app settings.',
// //             [
// //               { text: 'Cancel', style: 'cancel' },
// //               { text: 'Open Settings', onPress: openSettings }
// //             ]
// //           );
// //           return false;
// //         } else {
// //           console.log("Storage permission denied");
// //           return false;
// //         }
// //       } catch (err) {
// //         console.warn(err);
// //         return false;
// //       }
// //     }
    
// //     // For iOS, we don't need to explicitly request permission for photo library
// //     return true;
// //   };

// const requestStoragePermission = async () => {
//     if (Platform.OS === 'android') {
//       try {
//         let permission;
  
//         if (Platform.Version >= 33) {
//           // Android 13 and above
//           permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
//         } else {
//           // Below Android 13
//           permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
//         }
  
//         const hasPermission = await PermissionsAndroid.check(permission);
  
//         if (!hasPermission) {
//           const granted = await PermissionsAndroid.request(permission, {
//             title: 'Storage Permission Required',
//             message: 'This app needs access to your storage to upload vehicle images',
//             buttonNeutral: 'Ask Me Later',
//             buttonNegative: 'Cancel',
//             buttonPositive: 'Grant Permission',
//           });
  
//           if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//             console.log('Storage permission granted');
//             return true;
//           } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
//             Alert.alert(
//               'Permission Required',
//               'Storage permission is required to upload images. Please enable it in app settings.',
//               [
//                 { text: 'Cancel', style: 'cancel' },
//                 { text: 'Open Settings', onPress: openSettings },
//               ]
//             );
//             return false;
//           } else {
//             console.log('Storage permission denied');
//             return false;
//           }
//         }
  
//         return true;
//       } catch (err) {
//         console.warn(err);
//         return false;
//       }
//     }
  
//     // For iOS, permissions are handled differently
//     return true;
//   };

//   const openSettings = () => {
//     Linking.openSettings().catch(() => {
//       Alert.alert('Unable to open settings');
//     });
//   };

// //   const handleFormData = (field: any, value: any) => {
// //     setVehicleData(prev => ({
// //       ...prev,
// //       [field]: value,
// //     }))
// //   }

// const handleFormData = (field: string, value: string) => {
//     // Special handling for year field to convert string to number
//     if (field === 'year') {
//       const yearValue = value === '' ? 0 : parseInt(value, 10);
//       setVehicleData(prev => ({
//         ...prev,
//         [field]: yearValue,
//       }));
//     } else {
//       setVehicleData(prev => ({
//         ...prev,
//         [field]: value,
//       }));
//     }
//   }

//   const handleImageUpload = async (type: 'vehicleImage' | 'numberPlateImage') => {
//     // First check for permissions
//     const hasPermission = await requestStoragePermission();
//     if (!hasPermission) {
//       Alert.alert(
//         'Permission Denied', 
//         'You need to grant storage permission to upload images',
//         [
//           { text: 'Cancel', style: 'cancel' },
//           { text: 'Try Again', onPress: () => handleImageUpload(type) }
//         ]
//       );
//       return;
//     }

//     const options: ImageLibraryOptions = {
//       mediaType: 'photo',
//       includeBase64: false,
//       maxHeight: 2000,
//       maxWidth: 2000,
//       selectionLimit: 1,
//     };

//     try {
//       console.log('Launching image library...');
//       const result = await launchImageLibrary(options);
//       console.log('Image picker result:', result);
      
//       if (result.didCancel) {
//         console.log('User cancelled image picker');
//       } else if (result.errorCode) {
//         console.log('Image picker error:', result.errorMessage);
//         Alert.alert('Error', `Failed to pick image: ${result.errorMessage}`);
//       } else if (result.assets && result.assets.length > 0) {
//         const asset = result.assets[0];
//         if (asset.uri) {
//           console.log(`Selected image URI: ${asset.uri}`);
//           setVehicleData(prev => ({
//             ...prev,
//             [type]: asset.uri
//           }));
//         }
//       }
//     } catch (error) {
//       console.error('Error in image picker:', error);
//       Alert.alert('Error', 'Something went wrong when trying to pick an image');
//     }
//   };

//   const handleSubmit = () => {
//     // Validate required fields
//     const requiredFields = ['brand', 'model', 'year', 'licensePlate', 'vehicleType']
//     const missingFields = requiredFields.filter(field => !vehicleData[field as keyof VehicleDataType])
    
//     if (missingFields.length > 0) {
//       Alert.alert('Missing Information', 'Please fill in all required fields')
//       return
//     }
    
//     if (!vehicleData.vehicleImage || !vehicleData.numberPlateImage) {
//       Alert.alert('Missing Images', 'Please upload both vehicle and number plate images')
//       return
//     }
    
//     console.log('Vehicle data:', vehicleData)
//     console.log('USER', USER?.id);
    
//     VehicleDetailsMutation.mutateAsync({id: USER?.id, payload: vehicleData})
//   }


//   return (
//     <SafeAreaView style={styles.container}>
//       <TouchableOpacity onPress={() => navigation.goBack()}>
//         <View style={styles.backRow}>
//           <Ionicons name="chevron-back" size={20} color={Gold} />
//           <Text style={styles.backText}>Back</Text>
//         </View>
//       </TouchableOpacity>
      
//       <Text style={styles.headerText}>Vehicle Details</Text>
      
//       <ScrollView showsVerticalScrollIndicator={false}>
//         <Text style={styles.labelText}>Brand</Text>
//         <TextInput
//           style={styles.input}
//           value={vehicleData.brand}
//           onChangeText={text => handleFormData('brand', text)}
//           placeholder="Enter vehicle brand"
//           placeholderTextColor={Gray}
//         />
        
//         <Text style={styles.labelText}>Model</Text>
//         <TextInput
//           style={styles.input}
//           value={vehicleData.model}
//           onChangeText={text => handleFormData('model', text)}
//           placeholder="Enter vehicle model"
//           placeholderTextColor={Gray}
//         />
        
//         <Text style={styles.labelText}>Year</Text>
//         <TextInput
//           style={styles.input}
//           value={vehicleData.year > 0 ? vehicleData.year.toString() : ''}
//           onChangeText={text => handleFormData('year', text)}
//           keyboardType="numeric"
//           placeholder="Enter manufacturing year"
//           placeholderTextColor={Gray}
//         />
        
//         <Text style={styles.labelText}>Color</Text>
//         <TextInput
//           style={styles.input}
//           value={vehicleData.color}
//           onChangeText={text => handleFormData('color', text)}
//           placeholder="Enter vehicle color"
//           placeholderTextColor={Gray}
//         />
        
//         <Text style={styles.labelText}>License Plate</Text>
//         <TextInput
//           style={styles.input}
//           value={vehicleData.licensePlate}
//           onChangeText={text => handleFormData('licensePlate', text)}
//           placeholder="Enter license plate number"
//           placeholderTextColor={Gray}
//         />
        
//         <Text style={styles.labelText}>Vehicle Type</Text>
//         <TextInput
//           style={styles.input}
//           value={vehicleData.vehicleType}
//           onChangeText={text => handleFormData('vehicleType', text)}
//           placeholder="Enter vehicle type (sedan, SUV, etc.)"
//           placeholderTextColor={Gray}
//         />
        
//         <Text style={styles.labelText}>Vehicle Image</Text>
//         <TouchableOpacity 
//           style={styles.imageUploadButton}
//           onPress={() => handleImageUpload('vehicleImage')}
//           activeOpacity={0.7}
//         >
//           {vehicleData.vehicleImage ? (
//             <Image 
//               source={{ uri: vehicleData.vehicleImage }} 
//               style={styles.previewImage} 
//               resizeMode="contain"
//             />
//           ) : (
//             <Text style={styles.uploadButtonText}>Upload Image</Text>
//           )}
//         </TouchableOpacity>
        
//         <Text style={styles.labelText}>Number Plate Image</Text>
//         <TouchableOpacity 
//           style={styles.imageUploadButton}
//           onPress={() => handleImageUpload('numberPlateImage')}
//           activeOpacity={0.7}
//         >
//           {vehicleData.numberPlateImage ? (
//             <Image 
//               source={{ uri: vehicleData.numberPlateImage }} 
//               style={styles.previewImage} 
//               resizeMode="contain"
//             />
//           ) : (
//             <Text style={styles.uploadButtonText}>Upload Image</Text>
//           )}
//         </TouchableOpacity>
        
//         <TouchableOpacity
//           style={styles.submitButton}
//           onPress={handleSubmit}
//           activeOpacity={0.7}
//         >
//           <Text style={styles.submitButtonText}>Submit</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </SafeAreaView>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: Black,
//     flex: 1,
//     paddingTop: 30,
//     paddingHorizontal: 20,
//   },
//   backRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   backText: {
//     color: Gold,
//     fontSize: 16,
//   },
//   headerText: {
//     color: Gold,
//     fontWeight: '500',
//     fontSize: 24,
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   labelText: {
//     color: LightGold,
//     marginTop: 15,
//     fontSize: 15,
//   },
//   input: {
//     borderColor: White,
//     borderWidth: 1,
//     marginTop: 10,
//     paddingHorizontal: 20,
//     height: 50,
//     borderRadius: 8,
//     color: White,
//   },
//   imageUploadButton: {
//     borderColor: White,
//     borderWidth: 1,
//     borderStyle: 'dashed',
//     marginTop: 10,
//     height: 100,
//     borderRadius: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//     overflow: 'hidden',
//   },
//   uploadButtonText: {
//     color: Gray,
//   },
//   previewImage: {
//     width: '100%',
//     height: '100%',
//   },
//   submitButton: {
//     backgroundColor: Gold,
//     height: 50,
//     borderRadius: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 30,
//     marginBottom: 30,
//   },
//   submitButtonText: {
//     color: White,
//     fontWeight: '500',
//     fontSize: 16,
//   }
// })






import React, { useState, useEffect } from 'react'
import { 
  SafeAreaView, 
  StyleSheet, 
  Text, 
  TextInput, 
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
} from 'react-native-image-picker'
import { useAuthStore } from '../../store/authStore'
import { useMutation } from '@tanstack/react-query'
import { vehicleDetailsApi } from '../../constants/Api'

// Define TypeScript interface for vehicle data
interface VehicleDataType {
  brand: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  vehicleType: string;
  vehicleImage: string | null;
  numberPlateImage: string | null;
}

export default function VehicleDetails() {
  const USER = useAuthStore(state => state.user) 
  const navigation: any = useNavigation()
  const [vehicleData, setVehicleData] = useState<VehicleDataType>({
    brand: '',
    model: '',
    year: 0,
    color: '',
    licensePlate: '',
    vehicleType: 'car', // Default to 'car'
    vehicleImage: null,
    numberPlateImage: null
  })

  // vehicle detail mutation
  const VehicleDetailsMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FormData }) =>
      vehicleDetailsApi(id, payload),
    onSuccess: (response) => {
      console.log('vehicle details mutation success', response);
      // Alert.alert('Success', 'Vehicle details saved successfully', [
      //   { text: 'OK', onPress: () => navigation.navigate('Main') }
      // ]);
      navigation.navigate('vehicle-documents')
    },
    onError: (error) => {
      console.log('vehicle details mutation error', error);
      Alert.alert('Error', 'Failed to save vehicle details. Please try again.');
    }
  });

  // Check permissions when component mounts
  useEffect(() => {
    checkPermissions();
  }, []);


    const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const result = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        
        // if (!result) {
        //   // Permission not granted yet, show an explanation
        //   Alert.alert(
        //     'Storage Permission Required',
        //     'This app needs access to your storage to upload vehicle images. Please grant permission when prompted.',
        //     [
        //       { text: 'OK', onPress: () => console.log('OK Pressed') }
        //     ]
        //   );
        // }
      } catch (err) {
        console.warn(err);
      }
    }
  };

//   const requestStoragePermission = async () => {
//     if (Platform.OS === 'android') {
//       try {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
//           {
//             title: "Storage Permission Required",
//             message: "This app needs access to your storage to upload vehicle images",
//             buttonNeutral: "Ask Me Later",
//             buttonNegative: "Cancel",
//             buttonPositive: "Grant Permission"
//           }
//         );
        
//         if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//           console.log("Storage permission granted");
//           return true;
//         } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
//           // User selected "Never ask again", direct them to settings
//           Alert.alert(
//             'Permission Required',
//             'Storage permission is required to upload images. Please enable it in app settings.',
//             [
//               { text: 'Cancel', style: 'cancel' },
//               { text: 'Open Settings', onPress: openSettings }
//             ]
//           );
//           return false;
//         } else {
//           console.log("Storage permission denied");
//           return false;
//         }
//       } catch (err) {
//         console.warn(err);
//         return false;
//       }
//     }
    
//     // For iOS, we don't need to explicitly request permission for photo library
//     return true;
//   };

const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        let permission;
  
        if (Platform.Version >= 33) {
          // Android 13 and above
          permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
        } else {
          // Below Android 13
          permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
        }
  
        const hasPermission = await PermissionsAndroid.check(permission);
  
        if (!hasPermission) {
          const granted = await PermissionsAndroid.request(permission, {
            title: 'Storage Permission Required',
            message: 'This app needs access to your storage to upload vehicle images',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'Grant Permission',
          });
  
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Storage permission granted');
            return true;
          } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            // Alert.alert(
            //   'Permission Required',
            //   'Storage permission is required to upload images. Please enable it in app settings.',
            //   [
            //     { text: 'Cancel', style: 'cancel' },
            //     { text: 'Open Settings', onPress: openSettings },
            //   ]
            // );
            return false;
          } else {
            console.log('Storage permission denied');
            return false;
          }
        }
  
        return true;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
  
    // For iOS, permissions are handled differently
    return true;
  };

  const openSettings = () => {
    Linking.openSettings().catch(() => {
      Alert.alert('Unable to open settings');
    });
  };


//   const checkPermissions = async () => {
//     if (Platform.OS === 'android') {
//       try {
//         const result = await PermissionsAndroid.check(
//           PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
//         );
        
//         if (!result) {
//           // Permission not granted yet, show an explanation
//           Alert.alert(
//             'Storage Permission Required',
//             'This app needs access to your storage to upload vehicle images. Please grant permission when prompted.',
//             [
//               { text: 'OK', onPress: () => console.log('OK Pressed') }
//             ]
//           );
//         }
//       } catch (err) {
//         console.warn(err);
//       }
//     }
//   };

//   const requestStoragePermission = async () => {
//     if (Platform.OS === 'android') {
//       try {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
//           {
//             title: "Storage Permission Required",
//             message: "This app needs access to your storage to upload vehicle images",
//             buttonNeutral: "Ask Me Later",
//             buttonNegative: "Cancel",
//             buttonPositive: "Grant Permission"
//           }
//         );
        
//         if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//           console.log("Storage permission granted");
//           return true;
//         } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
//           // User selected "Never ask again", direct them to settings
//           Alert.alert(
//             'Permission Required',
//             'Storage permission is required to upload images. Please enable it in app settings.',
//             [
//               { text: 'Cancel', style: 'cancel' },
//               { text: 'Open Settings', onPress: openSettings }
//             ]
//           );
//           return false;
//         } else {
//           console.log("Storage permission denied");
//           return false;
//         }
//       } catch (err) {
//         console.warn(err);
//         return false;
//       }
//     }
    
//     // For iOS, we don't need to explicitly request permission for photo library
//     return true;
//   };

//   const openSettings = () => {
//     Linking.openSettings().catch(() => {
//       Alert.alert('Unable to open settings');
//     });
//   };

  const handleFormData = (field: string, value: string) => {
    if (field === 'year') {
      const yearValue = value === '' ? 0 : parseInt(value, 10);
      setVehicleData(prev => ({
        ...prev,
        [field]: yearValue,
      }));
    } else {
      setVehicleData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  }

  const handleImageUpload = async (type: 'vehicleImage' | 'numberPlateImage') => {
    // First check for permissions
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied', 
        'You need to grant storage permission to upload images',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Try Again', onPress: () => handleImageUpload(type) }
        ]
      );
      return;
    }

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
      console.log('Image picker result:', result);
      
      if (result.didCancel) {
        console.log('User cancelled image picker');
      } else if (result.errorCode) {
        console.log('Image picker error:', result.errorMessage);
        Alert.alert('Error', `Failed to pick image: ${result.errorMessage}`);
      } else if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.uri) {
          console.log(`Selected image URI: ${asset.uri}`);
          setVehicleData(prev => ({
            ...prev,
            [type]: asset.uri
          }));
        }
      }
    } catch (error) {
      console.error('Error in image picker:', error);
      Alert.alert('Error', 'Something went wrong when trying to pick an image');
    }
  };

  const handleSubmit = () => {
    // Validate required fields
    const requiredFields = ['brand', 'model', 'licensePlate', 'vehicleType']
    const missingFields = requiredFields.filter(field => !vehicleData[field as keyof VehicleDataType])
    
    if (missingFields.length > 0) {
      Alert.alert('Missing Information', `Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }
    
    if (!vehicleData.vehicleImage || !vehicleData.numberPlateImage) {
      Alert.alert('Missing Images', 'Please upload both vehicle and number plate images')
      return
    }
    
    // Create FormData for API submission
    const formData = new FormData();
    
    // Append text fields
    formData.append('brand', vehicleData.brand);
    formData.append('model', vehicleData.model);
    
    if (vehicleData.year > 0) {
      formData.append('year', vehicleData.year.toString());
    }
    
    if (vehicleData.color) {
      formData.append('color', vehicleData.color);
    }
    
    formData.append('licensePlate', vehicleData.licensePlate);
    formData.append('vehicleType', vehicleData.vehicleType);
    
    // Append vehicle image
    if (vehicleData.vehicleImage) {
      const vehicleImageName = vehicleData.vehicleImage.split('/').pop() || 'vehicle.jpg';
      const vehicleImageType = vehicleImageName.endsWith('.png') ? 'image/png' : 'image/jpeg';
      
      // @ts-ignore - TypeScript doesn't recognize the FormData append with file object
      formData.append('vehicleImage', {
        uri: Platform.OS === 'android' ? vehicleData.vehicleImage : vehicleData.vehicleImage.replace('file://', ''),
        type: vehicleImageType,
        name: vehicleImageName,
      });
    }
    
    // Append number plate image
    if (vehicleData.numberPlateImage) {
      const plateImageName = vehicleData.numberPlateImage.split('/').pop() || 'plate.jpg';
      const plateImageType = plateImageName.endsWith('.png') ? 'image/png' : 'image/jpeg';
      
      // @ts-ignore - TypeScript doesn't recognize the FormData append with file object
      formData.append('numberPlateImage', {
        uri: Platform.OS === 'android' ? vehicleData.numberPlateImage : vehicleData.numberPlateImage.replace('file://', ''),
        type: plateImageType,
        name: plateImageName,
      });
    }
    
    console.log('Vehicle data:', vehicleData);
    console.log('USER ID:', USER?.id);
    
    // Call the mutation with the FormData
    if (USER?.id) {
      VehicleDetailsMutation.mutateAsync({id: USER.id, payload: formData});
    } else {
      Alert.alert('Error', 'User ID not found. Please log in again.');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <View style={styles.backRow}>
          <Ionicons name="chevron-back" size={20} color={Gold} />
          <Text style={styles.backText}>Back</Text>
        </View>
      </TouchableOpacity>
      
      <Text style={styles.headerText}>Vehicle Details</Text>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.labelText}>Brand <Text style={styles.requiredField}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={vehicleData.brand}
          onChangeText={text => handleFormData('brand', text)}
          placeholder="Enter vehicle brand"
          placeholderTextColor={Gray}
        />
        
        <Text style={styles.labelText}>Model <Text style={styles.requiredField}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={vehicleData.model}
          onChangeText={text => handleFormData('model', text)}
          placeholder="Enter vehicle model"
          placeholderTextColor={Gray}
        />
        
        <Text style={styles.labelText}>Year</Text>
        <TextInput
          style={styles.input}
          value={vehicleData.year > 0 ? vehicleData.year.toString() : ''}
          onChangeText={text => handleFormData('year', text)}
          keyboardType="numeric"
          placeholder="Enter manufacturing year"
          placeholderTextColor={Gray}
        />
        
        <Text style={styles.labelText}>Color</Text>
        <TextInput
          style={styles.input}
          value={vehicleData.color}
          onChangeText={text => handleFormData('color', text)}
          placeholder="Enter vehicle color"
          placeholderTextColor={Gray}
        />
        
        <Text style={styles.labelText}>License Plate <Text style={styles.requiredField}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={vehicleData.licensePlate}
          onChangeText={text => handleFormData('licensePlate', text)}
          placeholder="Enter license plate number"
          placeholderTextColor={Gray}
        />
        
        <Text style={styles.labelText}>Vehicle Type <Text style={styles.requiredField}>*</Text></Text>
        <View style={styles.pickerContainer}>
          <TouchableOpacity 
            style={[
              styles.typeButton, 
              vehicleData.vehicleType === 'car' && styles.selectedTypeButton
            ]}
            onPress={() => handleFormData('vehicleType', 'car')}
          >
            <Text style={[
              styles.typeButtonText,
              vehicleData.vehicleType === 'car' && styles.selectedTypeText
            ]}>Car</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.typeButton, 
              vehicleData.vehicleType === 'bike' && styles.selectedTypeButton
            ]}
            onPress={() => handleFormData('vehicleType', 'bike')}
          >
            <Text style={[
              styles.typeButtonText,
              vehicleData.vehicleType === 'bike' && styles.selectedTypeText
            ]}>Bike</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.labelText}>Vehicle Image <Text style={styles.requiredField}>*</Text></Text>
        <TouchableOpacity 
          style={styles.imageUploadButton}
          onPress={() => handleImageUpload('vehicleImage')}
          activeOpacity={0.7}
        >
          {vehicleData.vehicleImage ? (
            <Image 
              source={{ uri: vehicleData.vehicleImage }} 
              style={styles.previewImage} 
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.uploadButtonText}>Upload Image</Text>
          )}
        </TouchableOpacity>
        
        <Text style={styles.labelText}>Number Plate Image <Text style={styles.requiredField}>*</Text></Text>
        <TouchableOpacity 
          style={styles.imageUploadButton}
          onPress={() => handleImageUpload('numberPlateImage')}
          activeOpacity={0.7}
        >
          {vehicleData.numberPlateImage ? (
            <Image 
              source={{ uri: vehicleData.numberPlateImage }} 
              style={styles.previewImage} 
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.uploadButtonText}>Upload Image</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Black,
    flex: 1,
    paddingTop: 30,
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
    marginBottom: 10,
  },
  labelText: {
    color: LightGold,
    marginTop: 15,
    fontSize: 15,
  },
  input: {
    borderColor: White,
    borderWidth: 1,
    marginTop: 10,
    paddingHorizontal: 20,
    height: 50,
    borderRadius: 8,
    color: White,
  },
  imageUploadButton: {
    borderColor: White,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 10,
    height: 100,
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
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  typeButton: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: White,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  selectedTypeButton: {
    backgroundColor: Gold,
    borderColor: Gold,
  },
  typeButtonText: {
    color: White,
  },
  selectedTypeText: {
    color: Black,
    fontWeight: 'bold',
  },
  requiredField: {
    color: Gold,
  }
})