import { View, Text, TouchableOpacity, ScrollView, TextInput, FlatList, StyleSheet, Image, Alert, Platform, PermissionsAndroid, Linking } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Black, White, Gold, Gray, LightGold, maroon } from '../constants/Color'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker'
import { useMutation, useQuery } from '@tanstack/react-query'
import { addFellowDriver, getFellowDrivers, deleteFellowDriver } from '../constants/Api'
import { ShowToast } from '../lib/Toast'
import { Loader } from '../lib/Loader'

interface FellowDriver {
  id: string;
  name: string;
  gender: string;
  mobileNumber: string;
  profilePhoto: string;

    licenseNumber: string;
  approvalStatus: string;

}

export default function FellowDrivers() {
  const navigation: any = useNavigation();
  const [activeTab, setActiveTab] = useState<'info' | 'add'>('info');
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
    // Enhanced options for image picker with better compression
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      selectionLimit: 1,
      quality: 0.8, // Reduce quality to help with file size
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
          // ✅ VALIDATE IMAGE SIZE using multiple methods for accuracy
          const maxSizeInBytes = 1 * 1024 * 1024; // 1MB limit
          
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
          
          const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
          console.log(`File size: ${fileSizeInMB}MB (${fileSizeInBytes} bytes)`);
          
          // 🚫 REJECT IF TOO LARGE
          if (fileSizeInBytes > maxSizeInBytes) {
            ShowToast(`Image too large! Please select an image smaller than 1MB. Current size: ${fileSizeInMB}MB`, { 
              type: 'error' 
            });
            return;
          }
          
          // ✅ IMAGE SIZE IS ACCEPTABLE
          console.log(`✅ ${type} size valid: ${fileSizeInMB}MB`);
          
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

  const addNewDriver = () => {
    // Validate required fields
    if (!newDriver.name || !newDriver.gender || !newDriver.mobileNumber || !newDriver.licenseNumber) {
      ShowToast('Please fill in all required fields', { type: 'warning' });
      return;
    }

    // Validate mobile number format
    const mobileRegex = /^\+?[1-9]\d{1,14}$/;
    if (!mobileRegex.test(newDriver.mobileNumber)) {
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
    formData.append('mobileNumber', newDriver.mobileNumber);
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
          onPress={() => setActiveTab('add')}
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
          <View style={styles.addFormContainer}>

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

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter mobile number"
                placeholderTextColor={Gray}
                value={newDriver.mobileNumber}
                onChangeText={(text) => setNewDriver({...newDriver, mobileNumber: text})}
                keyboardType="phone-pad"
              />
            </View>

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
              disabled={!newDriver.name || !newDriver.gender || !newDriver.mobileNumber || !newDriver.licenseNumber || !newDriver.profilePhoto || !newDriver.drivingLicenseFront || !newDriver.drivingLicenseBack || addFellowDriverMutation.isPending}
            >
             
                
                  <Text style={styles.addButtonText}>{addFellowDriverMutation.isPending ? (
                    <Loader />
                  ) : (
                    'Add Driver'
                  )}</Text>
         
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
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
    paddingVertical: 18,
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
});