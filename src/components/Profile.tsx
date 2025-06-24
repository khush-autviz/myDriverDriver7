import { View, Text, Image, TouchableOpacity, TextInput, Platform, ActivityIndicator, ScrollView, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Black, Gold, Gray, White } from '../constants/Color'
import { useAuthStore } from '../store/authStore'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useMutation, useQuery } from '@tanstack/react-query'
import { editProfile, getProfile } from '../constants/Api'
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import { ShowToast } from '../lib/Toast'

export default function Profile() {
  const [buttonDisabled, setbuttonDisabled] = useState(true)
  const { user, setUser, token } = useAuthStore()
  const navigation: any = useNavigation()

  // fetches driver info
  const {data: DriverDetails, refetch } = useQuery({
    queryKey: ['driver-details'],
    queryFn: getProfile,
    // staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  })

  const [data, setdata] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    // profilePhoto: DriverDetails?.data?.documents?.profilePhoto?.image ,
  })

  // handle data
  const handledata = (field: string, value: any) => {
    setbuttonDisabled(false)
    setdata(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle image selection
  const handleImageUpload = async () => {
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
          handledata('profilePhoto', asset.uri);
        }
      }
    } catch (error) {
      console.error('Error in image picker:', error);
    }
  };

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: editProfile,
    onSuccess: (response) => {
      console.log('profile update success', response);
      setUser({...user, ...response?.data})
      setbuttonDisabled(true)
      ShowToast('Profile updated successfully', { type: 'success' });
      refetch()
    },
    onError: (error: any) => {
      console.log('profile update error', error);
      ShowToast(error?.response?.data?.message || 'Failed to update profile', { type: 'error' });
    }
  })

  // handles update
  const handleUpdate = () => {
    if (data.email.trim() === '' || data.firstName.trim() === '' || data.lastName.trim() === '') {
      return
    }

    const formData = new FormData()

    // formData.append('driverId', user?.id)
    formData.append('firstName', data.firstName)
    formData.append('lastName', data.lastName)
    formData.append('email', data.email)

    // Append profile photo if available
    // if (data.profilePhoto) {
    //   const photoName = data.profilePhoto.split('/').pop() || 'profile.jpg';
    //   const photoType = photoName.endsWith('.png') ? 'image/png' : 'image/jpeg';
      
    // //   // @ts-ignore - TypeScript doesn't recognize the FormData append with file object
    //   formData.append('profilePhoto', {
    //     uri: Platform.OS === 'android' ? data.profilePhoto : data.profilePhoto.replace('file://', ''),
    //     type: photoType,
    //     name: photoName,
    //   });
    // }
    
    updateProfileMutation.mutateAsync(formData)
  }

  useEffect(() => {
    if (DriverDetails) {
      console.log(DriverDetails);
      
      setdata({
        firstName: DriverDetails?.data?.firstName,
        lastName: DriverDetails?.data?.lastName,
        email: DriverDetails?.data?.email,
        // profilePhoto: DriverDetails?.data?.documents?.profilePhoto?.image,
      })
    }
  }, [DriverDetails]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Gold} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Profile Card */}
        {/* <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileIconContainer}>
              <Ionicons name="person" size={28} color={Gold} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileTitle}>Personal Information</Text>
              <Text style={styles.profileSubtitle}>Update your profile details</Text>
            </View>
          </View>
        </View> */}

        {/* Form Sections */}
        <View style={styles.formContainer}>
          {/* Personal Details Section */}
          <View style={styles.section}>
            {/* <Text style={styles.sectionTitle}>Personal Details</Text> */}
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.input}
                keyboardType="name-phone-pad"
                placeholder="Enter your first name"
                placeholderTextColor={Gray}
                value={data.firstName}
                onChangeText={text => handledata('firstName', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.input}
                keyboardType="name-phone-pad"
                placeholder="Enter your last name"
                placeholderTextColor={Gray}
                value={data.lastName}
                onChangeText={text => handledata('lastName', text)}
              />
            </View>
          </View>

          {/* Contact Details Section */}
          <View style={styles.section}>
            {/* <Text style={styles.sectionTitle}>Contact Information</Text> */}
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={data.email}
                keyboardType="email-address"
                placeholder="Enter your email"
                placeholderTextColor={Gray}
                onChangeText={text => handledata('email', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                keyboardType="phone-pad"
                placeholder="Enter your mobile number"
                placeholderTextColor={Gray}
                value={user?.phone}
                editable={false}
              />
              <Text style={styles.disabledNote}>Phone number cannot be changed</Text>
            </View>
          </View>

          {/* Update Button */}
          <TouchableOpacity
            style={[
              styles.updateButton,
              buttonDisabled && styles.updateButtonDisabled
            ]}
            disabled={buttonDisabled || updateProfileMutation.isPending}
            onPress={handleUpdate}
          >
            {updateProfileMutation.isPending ? (
              <ActivityIndicator size="small" color={Black} />
            ) : (
              <Text style={styles.updateButtonText}>Update Profile</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
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
  headerTitle: {
    color: Gold,
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 16,
  },
  headerSpacer: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.06)',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 20,
    marginVertical: 16,
    shadowColor: Gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    marginTop: 10,
  },
  profileInfo: {
    flex: 1,
  },
  profileTitle: {
    color: White,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileSubtitle: {
    color: Gray,
    fontSize: 13,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 20,
  },
  section: {
    // marginBottom: 16,
  },
  sectionTitle: {
    color: White,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: Gray,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: White,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  disabledInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
    color: Gray,
  },
  disabledNote: {
    color: Gray,
    fontSize: 12,
    marginTop: 6,
    fontStyle: 'italic',
  },
  updateButton: {
    backgroundColor: Gold,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: Gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  updateButtonDisabled: {
    // opacity: 0.5,
  },
  updateButtonText: {
    color: Black,
    fontSize: 16,
    fontWeight: '700',
  },
})