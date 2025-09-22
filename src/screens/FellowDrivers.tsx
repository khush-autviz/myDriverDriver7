import { View, Text, TouchableOpacity, ScrollView, TextInput, FlatList, StyleSheet, Image, Alert, Platform, PermissionsAndroid, Linking, Modal, Dimensions } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Black, White, Gold, Gray, LightGold, maroon } from '../constants/Color'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker'
import { useMutation, useQuery } from '@tanstack/react-query'
import { addFellowDriver, getFellowDrivers, deleteFellowDriver, lookUpFellowDriver, linkExistingDriver } from '../constants/Api'
import { ShowToast } from '../lib/Toast'
import { Loader } from '../lib/Loader'
import PhoneInput from 'react-native-phone-number-input'


interface FellowDriver {
  id: string;
  name: string;
  gender: string;
  mobileNumber: string;
  profilePhoto: string;

    licenseNumber: string;
  approvalStatus: string;

}

const { width } = Dimensions.get('window');

export default function FellowDrivers() {
  const navigation: any = useNavigation();
  const [activeTab, setActiveTab] = useState<'info' | 'add'>('info');
  const [addStep, setAddStep] = useState<'phone' | 'details'>('phone');
  const [showModal, setShowModal] = useState(false);
  const [lookupResult, setLookupResult] = useState<any>(null);
  const phoneInput = useRef<PhoneInput>(null);
  
  // Phone number states
  const [phoneValue, setPhoneValue] = useState('');
  const [formattedPhone, setFormattedPhone] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  
  // Fetch fellow drivers
  const { data: fellowDriversData, isLoading: isLoadingDrivers, refetch: refetchDrivers } = useQuery({
    queryKey: ['fellowDrivers'],
    queryFn: getFellowDrivers,
  });

  console.log(fellowDriversData, 'fellowDriversData');

  const [fellowDrivers, setFellowDrivers] = useState<FellowDriver[]>([]);
  const [deletingDriverId, setDeletingDriverId] = useState<string | null>(null);

  // Add fellow driver mutation
  const addFellowDriverMutation = useMutation({
    mutationFn: (data: FormData) => addFellowDriver(data),
    onSuccess: (response) => {
      console.log('Fellow driver added successfully:', response);
      ShowToast('Fellow driver added successfully', { type: 'success' });
      setNewDriver({ 
        name: '', 
        gender: '', 
        mobileNumber: '', 
        licenseNumber: '', 
        profilePhoto: '', 
        drivingLicenseFront: '', 
        drivingLicenseBack: '' 
      });
      setAddStep('phone');
      setPhoneValue('');
      setFormattedPhone('');
      refetchDrivers(); // Refresh the list
      setActiveTab('info'); // Switch to info tab
    },
    onError: (error: any) => {
      console.log('Error adding fellow driver:', error);
      ShowToast(error?.response?.data?.message || 'failed to add fellow driver. Try with smaller image size less than 100kb', { type: 'error' });
    }
  });

  // Delete fellow driver mutation
  const deleteFellowDriverMutation = useMutation({
    mutationFn: (fellowDriverId: string) => deleteFellowDriver(fellowDriverId),
    onSuccess: (response) => {
      console.log('Fellow driver deleted successfully:', response);
      ShowToast('Fellow driver deleted successfully', { type: 'success' });
      setDeletingDriverId(null); // Clear loading state
      refetchDrivers(); // Refresh the list
    },
    onError: (error: any) => {
      console.log('Error deleting fellow driver:', error);
      ShowToast(error?.response?.data?.message || error?.message || 'Failed to delete fellow driver', { type: 'error' });
      setDeletingDriverId(null); // Clear loading state on error
    }
  });

  // Lookup fellow driver mutation
  const lookupFellowDriverMutation = useMutation({
    mutationFn: (data: { mobileNumber: string }) => lookUpFellowDriver(data),
    onSuccess: (response) => {
      console.log('Lookup successful:', response);
      setLookupResult(response.data);
      console.log(phoneValue, 'phoneValue');
      // setShowModal(true);
      if (!response.data.fellowDriver) {
        setAddStep('details');
      } else {
        setShowModal(true);
      }
    },
    onError: (error: any) => {
      console.log('Lookup error:', error);
      if (error?.response?.status === 404) {
        // Driver not found, proceed to add new driver
        setAddStep('details');
      } else {
        ShowToast(error?.response?.data?.message || 'Failed to lookup driver', { type: 'error' });
      }
    }
  });

  // Link existing driver mutation
  const linkExistingDriverMutation = useMutation({
    mutationFn: (data: { mobileNumber: string }) => linkExistingDriver(data),
    onSuccess: (response) => {
      console.log('Driver linked successfully:', response);
      ShowToast('Fellow driver added successfully', { type: 'success' });
      setShowModal(false);
      setAddStep('phone');
      setPhoneValue('');
      setFormattedPhone('');
      refetchDrivers(); // Refresh the list
      setActiveTab('info'); // Switch to info tab
    },
    onError: (error: any) => {
      console.log('Error linking driver:', error);
      ShowToast(error?.response?.data?.message || 'Failed to add fellow driver', { type: 'error' });
    }
  });

  // Update local state when API data is available
  useEffect(() => {
    if (fellowDriversData?.data?.fellowDrivers) {
      setFellowDrivers(fellowDriversData.data.fellowDrivers);
    }
  }, [fellowDriversData]);

  const [newDriver, setNewDriver] = useState({
    name: '',
    gender: '',
    mobileNumber: '',
    licenseNumber: '',
    profilePhoto: '',
    drivingLicenseFront: '',
    drivingLicenseBack: ''
  });

  // Check permissions when component mounts
  useEffect(() => {
    checkPermissions();
  }, []);

  // Reset add step when component mounts
  useEffect(() => {
    if (activeTab === 'add') {
      setAddStep('phone');
      setPhoneValue('');
      setFormattedPhone('');
      setIsPhoneValid(true);
    }
  }, [activeTab]);

  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const result = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
      } catch (err) {
        console.warn(err);
      }
    }
  };

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
            message: 'This app needs access to your storage to upload images',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'Grant Permission',
          });
  
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Storage permission granted');
            return true;
          } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
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

  const handleImageUpload = async (type: 'profilePhoto' | 'drivingLicenseFront' | 'drivingLicenseBack') => {


    // Enhanced compression options (BIGGEST IMPACT)
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 1200,        // Reduced from 2000 (36% smaller)
      maxWidth: 1200,         // Reduced from 2000 (36% smaller)
      selectionLimit: 1,
      quality: 0.3,           // Reduced from 0.8 (50% more compression)
    };

    try {
      console.log('Launching image library...');
      
      // Simple direct call without complex wrapping
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
          const maxSizeInBytes = 20 * 1024; // 120KB instead of 1MB (85% reduction)
          
          console.log(`Selected ${type} URI: ${asset.uri}`);
          
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
              ShowToast(`${type === 'profilePhoto' ? 'Profile photo' : type === 'drivingLicenseFront' ? 'License front' : 'License back'} selected (size validation not available)`, { 
                type: 'warning' 
              });
              
              setNewDriver(prev => ({
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
          console.log(`✅ ${type} size valid: ${fileSizeInKB}KB`);
          // ShowToast(`${type === 'profilePhoto' ? 'Profile photo' : type === 'drivingLicenseFront' ? 'License front' : 'License back'} selected (${fileSizeInKB}KB)`, { 
          //   type: 'success' 
          // });
          
          setNewDriver(prev => ({
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

  const handleDeleteDriver = (driverId: string, driverName: string) => {
    console.log(driverId, driverName, 'driverId, driverName');
    Alert.alert(
      'Delete Fellow Driver',
      `Are you sure you want to delete ${driverName}? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDeletingDriverId(driverId); // Set loading state for specific driver
            deleteFellowDriverMutation.mutate(driverId);
          },
        },
      ]
    );
  };

  // Handle phone lookup
  const handlePhoneLookup = async () => {
    if (phoneValue.trim() === '') {
      setIsPhoneValid(false);
      return;
    }

    const isValidNumber = phoneInput.current?.isValidNumber(phoneValue);
    if (!isValidNumber) {
      setIsPhoneValid(false);
      return;
    }

    setIsPhoneValid(true);
    lookupFellowDriverMutation.mutate({ mobileNumber: formattedPhone });
  };

  // Handle modal actions
  const handleAddExistingDriver = () => {
    setShowModal(false);
    linkExistingDriverMutation.mutate({ mobileNumber: formattedPhone });
  };

  const handleAddNewDriver = () => {
    setShowModal(false);
    setAddStep('details');
    // Set the phone number in the newDriver state
    setNewDriver(prev => ({
      ...prev,
      mobileNumber: formattedPhone
    }));
  };

  // Enhanced addNewDriver function with network check
  const addNewDriver = async () => {

    // Validate required fields
    if (!newDriver.name || !newDriver.gender || !phoneValue || !newDriver.licenseNumber) {
      ShowToast('Please fill in all required fields', { type: 'warning' });
      return;
    }

    // Validate mobile number format
    const mobileRegex = /^\+?[1-9]\d{1,14}$/;
    if (!mobileRegex.test(phoneValue)) {
      ShowToast('Please enter a valid mobile number', { type: 'warning' });
      return;
    }

    // Validate required images
    if (!newDriver.profilePhoto || !newDriver.drivingLicenseFront || !newDriver.drivingLicenseBack) {
      ShowToast('Please upload all required images', { type: 'warning' });
      return;
    }

    // Create FormData for API submission
    const formData = new FormData();
    
    // Append text fields
    formData.append('name', newDriver.name);
    formData.append('gender', newDriver.gender);
    formData.append('mobileNumber', phoneValue);
    formData.append('licenseNumber', newDriver.licenseNumber);
    
    // Append profile photo
    if (newDriver.profilePhoto) {
      const profilePhotoName = newDriver.profilePhoto.split('/').pop() || 'profile.jpg';
      const profilePhotoType = profilePhotoName.endsWith('.png') ? 'image/png' : 'image/jpeg';
      
      // @ts-ignore - TypeScript doesn't recognize the FormData append with file object
      formData.append('profilePhoto', {
        uri: Platform.OS === 'android' ? newDriver.profilePhoto : newDriver.profilePhoto.replace('file://', ''),
        type: profilePhotoType,
        name: profilePhotoName,
      });
    }
    
    // Append driving license front
    if (newDriver.drivingLicenseFront) {
      const licenseFrontName = newDriver.drivingLicenseFront.split('/').pop() || 'license_front.jpg';
      const licenseFrontType = licenseFrontName.endsWith('.png') ? 'image/png' : 'image/jpeg';
      
      // @ts-ignore - TypeScript doesn't recognize the FormData append with file object
      formData.append('drivingLicenseFront', {
        uri: Platform.OS === 'android' ? newDriver.drivingLicenseFront : newDriver.drivingLicenseFront.replace('file://', ''),
        type: licenseFrontType,
        name: licenseFrontName,
      });
    }
    
    // Append driving license back
    if (newDriver.drivingLicenseBack) {
      const licenseBackName = newDriver.drivingLicenseBack.split('/').pop() || 'license_back.jpg';
      const licenseBackType = licenseBackName.endsWith('.png') ? 'image/png' : 'image/jpeg';
      
      // @ts-ignore - TypeScript doesn't recognize the FormData append with file object
      formData.append('drivingLicenseBack', {
        uri: Platform.OS === 'android' ? newDriver.drivingLicenseBack : newDriver.drivingLicenseBack.replace('file://', ''),
        type: licenseBackType,
        name: licenseBackName,
      });
    }
    
    console.log('Submitting fellow driver data:', formData);
    
    // Call the mutation with the FormData
    addFellowDriverMutation.mutate(formData);
  };

  const renderDriverCard = ({ item }: { item: FellowDriver }) => (
    <View style={styles.driverCard}>
      <View style={styles.driverHeader}>
        <View style={styles.driverAvatar}>
          {item.profilePhoto ? (
            <Image 
              source={{ uri: `https://api.mydriversa.co.za/${item.profilePhoto}` }} 
              style={styles.avatarImage} 
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person" size={24} color={Gold} />
          )}
        </View>
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{item.name}</Text>
          <Text style={styles.driverPhone}>{item.mobileNumber}</Text>
          
        </View>
        <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              item.approvalStatus === 'approved' && styles.statusApproved,
              item.approvalStatus === 'pending' && styles.statusPending,
              item.approvalStatus === 'rejected' && styles.statusRejected,
            ]}>
              <Text style={[
                styles.statusText,
                item.approvalStatus === 'approved' && styles.statusTextApproved,
                item.approvalStatus === 'pending' && styles.statusTextPending,
                item.approvalStatus === 'rejected' && styles.statusTextRejected,
              ]}>
                {item.approvalStatus.charAt(0).toUpperCase() + item.approvalStatus.slice(1)}
              </Text>
            </View>
          </View>
      </View>
      <View style={styles.vehicleInfo}>
        <View >
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
          <Ionicons name="person" size={16} color={Gray} />
          <Text style={styles.vehicleText}>{item.gender.charAt(0).toUpperCase() + item.gender.slice(1)}</Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
          <Ionicons name="card" size={16} color={Gray} />
          <Text style={styles.vehicleText}>{item?.licenseNumber}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={{
            flexDirection: 'row', 
            alignItems: 'center', 
            gap: 2, 
            marginTop: 10, 
            justifyContent: 'flex-end',
            opacity: deletingDriverId === item.id ? 0.6 : 1
          }}
          onPress={() => handleDeleteDriver(item.id, item.name)}
          disabled={deletingDriverId === item.id}
        >
          {deletingDriverId === item.id ? (
            <Loader />
          ) : (
            <>
              <Ionicons name="trash" size={16} color={maroon} />
              <Text style={[styles.vehicleText, {color: maroon, fontSize: 16, fontWeight: '600'}]}>Delete</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Gold} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Fellow Drivers</Text>
          <View style={styles.headerSpacer} />
        </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'info' && styles.activeTab]}
          onPress={() => setActiveTab('info')}
        >
          <Ionicons 
            name="people" 
            size={20} 
            color={activeTab === 'info' ? Black : Gray} 
          />
          <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>
            Driver Info
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'add' && styles.activeTab]}
          onPress={() => {
            setActiveTab('add');
            setAddStep('phone');
            setPhoneValue('');
            setFormattedPhone('');
            setIsPhoneValid(true);
          }}
        >
          <Ionicons 
            name="add-circle" 
            size={20} 
            color={activeTab === 'add' ? Black : Gray} 
          />
          <Text style={[styles.tabText, activeTab === 'add' && styles.activeTabText]}>
            Add Driver
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'info' ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={24} color={Gold} />
              <Text style={styles.statNumber}>{fellowDrivers.length}</Text>
              <Text style={styles.statLabel}>Total Drivers</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color={Gold} />
              <Text style={styles.statNumber}>{fellowDrivers.length}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
          </View> */}

          {/* <Text style={styles.sectionTitle}>Driver List</Text> */}
          {isLoadingDrivers ? (
            <View style={styles.loadingContainer}>
              <Loader />
            </View>
          ) : fellowDrivers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={Gray} />
              <Text style={styles.emptyText}>No fellow drivers found</Text>
              <Text style={styles.emptySubtext}>Add your first fellow driver to get started</Text>
            </View>
          ) : (
            <FlatList
              data={fellowDrivers}
              renderItem={renderDriverCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </ScrollView>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {addStep === 'phone' ? (
            <View style={styles.addFormContainer}>
              <Text style={styles.formTitle}>Add Fellow Driver</Text>
              <Text style={styles.formSubtitle}>Enter the driver's phone number to check if they already exist</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <View style={styles.phoneInputWrapper}>
                  {/* @ts-ignore */}
                  <PhoneInput
                    ref={phoneInput}
                    defaultValue={phoneValue}
                    defaultCode="ZA"
                    layout="first"
                    disableArrowIcon={true}
                    onChangeText={(text) => {
                      setPhoneValue(text);
                      setIsPhoneValid(true);
                    }}
                    onChangeFormattedText={(text) => {
                      setFormattedPhone(text);
                    }}
                    containerStyle={[
                      styles.phoneInputContainer,
                      !isPhoneValid && styles.phoneInputError
                    ]}
                    textContainerStyle={styles.phoneInputTextContainer}
                    textInputStyle={styles.phoneInputText}
                    codeTextStyle={styles.phoneInputCodeText}
                    flagButtonStyle={styles.flagButtonStyle}
                    countryPickerButtonStyle={styles.countryPickerButtonStyle}
                    countryPickerProps={{
                      withFilter: true,
                      theme: {
                        backgroundColor: '#1a1a1a',
                        onBackgroundTextColor: '#ffffff',
                      },
                    }}
                  />
                  {!isPhoneValid && (
                    <View style={styles.errorContainer}>
                      <Ionicons name="alert-circle-outline" size={16} color="#FF6B6B" />
                      <Text style={styles.errorText}>Please enter a valid phone number</Text>
                    </View>
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={styles.addButton}
                onPress={handlePhoneLookup}
                disabled={lookupFellowDriverMutation.isPending}
              >
                <Text style={styles.addButtonText}>
                  {lookupFellowDriverMutation.isPending ? (
                    <Loader />
                  ) : (
                    'Check Driver'
                  )}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.addFormContainer}>
              <View style={styles.stepHeader}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setAddStep('phone')}
                >
                  <Ionicons name="arrow-back" size={20} color={Gold} />
                </TouchableOpacity>
                <Text style={styles.stepTitle}>Driver Details</Text>
                <View style={styles.stepSpacer} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter driver's full name"
                  placeholderTextColor={Gray}
                  value={newDriver.name}
                  onChangeText={(text) => setNewDriver({...newDriver, name: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Gender *</Text>
                <View style={styles.genderContainer}>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      newDriver.gender === 'male' && styles.genderButtonActive
                    ]}
                    onPress={() => setNewDriver({...newDriver, gender: 'male'})}
                  >
                    <Text style={[
                      styles.genderButtonText,
                      newDriver.gender === 'male' && styles.genderButtonTextActive
                    ]}>Male</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      newDriver.gender === 'female' && styles.genderButtonActive
                    ]}
                    onPress={() => setNewDriver({...newDriver, gender: 'female'})}
                  >
                    <Text style={[
                      styles.genderButtonText,
                      newDriver.gender === 'female' && styles.genderButtonTextActive
                    ]}>Female</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mobile Number *</Text>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  placeholder="Phone number from previous step"
                  placeholderTextColor={Gray}
                  value={newDriver.mobileNumber}
                  editable={false}
                />
              </View> */}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>License Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter driving license number"
                placeholderTextColor={Gray}
                value={newDriver.licenseNumber}
                onChangeText={(text) => setNewDriver({...newDriver, licenseNumber: text.toUpperCase()})}
                autoCapitalize="characters"
              />
            </View>

            <Text style={styles.labelText}>Profile Photo <Text style={styles.requiredField}>*</Text></Text>
            <TouchableOpacity 
              style={styles.imageUploadButton}
              onPress={() => {
                try {
                  handleImageUpload('profilePhoto');
                } catch (error) {
                  console.error('Error in image upload button:', error);
                  ShowToast('Failed to open image picker', { type: 'error' });
                }
              }}
              activeOpacity={0.7}
            >
              {newDriver.profilePhoto ? (
                <Image 
                  source={{ uri: newDriver.profilePhoto }} 
                  style={styles.previewImage} 
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.uploadButtonText}>Upload Image</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.labelText}>Driving License <Text style={styles.requiredField}>*</Text></Text>
            {/* <Text style={styles.labelText}>Driving License <Text style={styles.requiredField}>*</Text></Text> */}
            <TouchableOpacity 
              style={styles.imageUploadButton}
              onPress={() => {
                try {
                  handleImageUpload('drivingLicenseFront');
                } catch (error) {
                  console.error('Error in image upload button:', error);
                  ShowToast('Failed to open image picker', { type: 'error' });
                }
              }}
              activeOpacity={0.7}
            >
              {newDriver.drivingLicenseFront ? (
                <Image 
                  source={{ uri: newDriver.drivingLicenseFront }} 
                  style={styles.previewImage} 
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.uploadButtonText}>Upload Image</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.labelText}>Criminal Record Check<Text style={styles.requiredField}>*</Text></Text>
            <TouchableOpacity 
              style={styles.imageUploadButton}
              onPress={() => {
                try {
                  handleImageUpload('drivingLicenseBack');
                } catch (error) {
                  console.error('Error in image upload button:', error);
                  ShowToast('Failed to open image picker', { type: 'error' });
                }
              }}
              activeOpacity={0.7}
            >
              {newDriver.drivingLicenseBack ? (
                <Image 
                  source={{ uri: newDriver.drivingLicenseBack }} 
                  style={styles.previewImage} 
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.uploadButtonText}>Upload Image</Text>
              )}
            </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.addButton,
                ]}
                onPress={addNewDriver}
                // disabled={!newDriver.name || !newDriver.gender || !newDriver.licenseNumber || !phoneValue || !newDriver.profilePhoto || !newDriver.drivingLicenseFront || !newDriver.drivingLicenseBack || addFellowDriverMutation.isPending}
              >
                <Text style={styles.addButtonText}>{addFellowDriverMutation.isPending ? (
                  <Loader />
                ) : (
                  'Add Driver'
                )}</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* Modal for existing driver confirmation */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Ionicons name="person-circle" size={48} color={Gold} />
              <Text style={styles.modalTitle}>Driver Found</Text>
              <Text style={styles.modalSubtitle}>
                A driver with this phone number already exists. Would you like to add them as a fellow driver?
              </Text>
            </View>
            
            {lookupResult && (
              <View style={styles.driverInfoCard}>
                <Text style={styles.driverInfoName}>{lookupResult.fellowDriver.name}</Text>
                <Text style={styles.driverInfoPhone}>{lookupResult.fellowDriver.mobileNumber}</Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleAddExistingDriver}
                disabled={linkExistingDriverMutation.isPending}
              >
                <Text style={styles.modalButtonTextPrimary}>
                  {linkExistingDriverMutation.isPending ? (
                    <Loader />
                  ) : (
                    'Add Driver'
                  )}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.addNewDriverButton}
              onPress={handleAddNewDriver}
            >
              <Text style={styles.addNewDriverText}>Add as New Driver Instead</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: {
    flex: 1,
  },
  headerTitle: {
    color: Gold,
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 16,
  },
  headerSubtitle: {
    color: Gray,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row' as const,
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: Gold,
  },
  tabText: {
    color: Gray,
    fontSize: 14,
    fontWeight: '600' as const,
    marginLeft: 8,
  },
  activeTabText: {
    color: Black,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row' as const,
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center' as const,
  },
  statNumber: {
    color: Gold,
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginTop: 8,
  },
  statLabel: {
    color: Gray,
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    color: White,
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 15,
  },
  driverCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  driverHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    color: White,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  driverPhone: {
    color: Gray,
    fontSize: 14,
    marginTop: 2,
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  vehicleInfo: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  vehicleItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  vehicleText: {
    color: Gray,
    fontSize: 14,
    marginLeft: 6,
  },
  addFormContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  formTitle: {
    color: White,
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginBottom: 5,
  },
  formSubtitle: {
    color: Gray,
    fontSize: 14,
    marginBottom: 25,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: Gold,
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: White,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  addButton: {
    backgroundColor: Gold,
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 20,
    shadowColor: Gold,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowOpacity: 0,
    elevation: 0,
  },
  addButtonText: {
    color: Black,
    fontSize: 18,
    fontWeight: '700' as const,
    marginLeft: 10,
  },
  genderContainer: {
    flexDirection: 'row' as const,
    gap: 10,
  },
  genderButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center' as const,
  },
  genderButtonActive: {
    backgroundColor: Gold,
    borderColor: Gold,
  },
  genderButtonText: {
    color: Gray,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  genderButtonTextActive: {
    color: Black,
  },
  labelText: {
    color: LightGold,
    marginTop: 15,
    fontSize: 15,
  },
  requiredField: {
    color: Gold,
  },
  imageUploadButton: {
    borderColor: White,
    borderWidth: 1,
    marginTop: 10,
    height: 100,
    borderRadius: 8,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    overflow: 'hidden' as const,
  },
  uploadButtonText: {
    color: Gray,
  },

  previewImage: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 40,
  },
  emptyContainer: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 40,
  },
  emptyText: {
    color: Gray,
    fontSize: 16,
    fontWeight: '600' as const,
    marginTop: 16,
  },
  emptySubtext: {
    color: Gray,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center' as const,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  statusContainer: {
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start' as const,
  },
  statusApproved: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  statusPending: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
  },
  statusRejected: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  statusTextApproved: {
    color: '#4CAF50',
  },
  statusTextPending: {
    color: '#FFC107',
  },
  statusTextRejected: {
    color: '#F44336',
  },
  rejectionContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  rejectionText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
  },
  // Phone input styles
  phoneInputWrapper: {
    marginBottom: 24,
  },
  phoneInputContainer: {
    width: '100%',
    backgroundColor: 'rgba(53, 56, 63, 0.8)',
    borderRadius: 12,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  phoneInputError: {
    borderColor: '#FF6B6B',
    borderWidth: 1,
  },
  phoneInputTextContainer: {
    backgroundColor: 'transparent',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.1)',
    height: 56,
    paddingVertical: 0,
  },
  phoneInputText: {
    color: White,
    height: 56,
    padding: 0,
    fontSize: 16,
  },
  phoneInputCodeText: {
    color: Gray,
    marginTop: 0,
    padding: 0,
    fontSize: 16,
  },
  flagButtonStyle: {
    height: 56,
  },
  countryPickerButtonStyle: {
    height: 56,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginLeft: 6,
  },
  // Step header styles
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepTitle: {
    color: White,
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  stepSpacer: {
    width: 40,
  },
  // Disabled input style
  disabledInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: Gray,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: White,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
  },
  modalSubtitle: {
    color: Gray,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  driverInfoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  driverInfoName: {
    color: White,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  driverInfoPhone: {
    color: Gold,
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: Gold,
  },
  modalButtonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalButtonTextPrimary: {
    color: Black,
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextSecondary: {
    color: White,
    fontSize: 16,
    fontWeight: '600',
  },
  addNewDriverButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  addNewDriverText: {
    color: Gold,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});