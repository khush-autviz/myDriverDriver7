import { View, Text, Image, TouchableOpacity, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Black, Gold, Gray, White } from '../constants/Color'
import { useAuthStore } from '../store/authStore'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { editProfile } from '../constants/Api'
import { useMutation } from '@tanstack/react-query'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function Profile() {
  const [buttonDisabled, setbuttonDisabled] = useState(true)
  const {user: USER, setUser: SETUSER} = useAuthStore()
  
  const [data, setdata] = useState({
    firstName: USER?.firstName,
    lastName: USER?.lastName,
    email: USER?.email,
    profilePhoto: USER?.profilePhoto ?? null,
  })

  // handle data
  const handledata = (field: string, value: any) => {
    setbuttonDisabled(false)
    setdata(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const editProfileMutation = useMutation({
    mutationFn: editProfile,
    onSuccess: (response) => {
      console.log('edit profile success', response);
      SETUSER({...USER, ...response?.data})
    },
    onError: (error) => {
      console.log('edit profile error', error);
    }
  })

  // handles update
  const handleUpdate = () => {

    if (data.email.trim() === '' || data.firstName.trim() === '' || data.lastName.trim() === '' ) {
      return
    }

   const formData = new FormData()

   formData.append('driverId', USER?.id)
   formData.append('firstName', data.firstName)
   formData.append('lastName', data.lastName)
   formData.append('email', data.email)

   if (data.profilePhoto) {
    formData.append('profilePhoto', {
      uri: data.profilePhoto,
      type: 'image/jpeg', // Adjust this based on your image type
      name: 'profile.jpg',
    });
  }
   

   editProfileMutation.mutateAsync(formData)

   
  }

  const logAsyncStorage = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const items = await AsyncStorage.multiGet(keys);
      console.log('AsyncStorage contents:');
      items.forEach(([key, value]) => {
        console.log(`${key}: ${value}`);
      });
    } catch (error) {
      console.error('Error reading AsyncStorage:', error);
    }
  };

  useEffect(() => {
    logAsyncStorage
  }, [])
  

  return (
    <SafeAreaView style={{paddingHorizontal: 20, flex: 1, backgroundColor: Black}}>
      {/* <Ioni */}
      <Text style={{color: White, marginTop: 30, fontSize: 18, fontWeight: '500'}}>Profile</Text>
      <View style={{display: 'flex', alignItems: 'center', marginTop: 40}}>
      <Image source={require('../assets/images/user.png')} />
      </View>
      <Text style={{color: White, fontSize: 20, textAlign: 'center', marginTop: 15, fontWeight: '500'}}>{USER?.firstName + " " + USER?.lastName}</Text>
        <Text style={{color: Gray, marginTop: 20, fontSize: 15}}>First Name</Text>
              <TextInput
                style={{
                  borderColor: White,
                  borderWidth: 1,
                  marginTop: 10,
                  paddingHorizontal: 20,
                  height: 50,
                  borderRadius: 8,
                  color: White
                }}
                keyboardType="name-phone-pad"
                placeholder="Enter your name"
                value={data?.firstName}
                onChangeText={text => handledata('firstName', text)}
              />
        <Text style={{color: Gray, marginTop: 20, fontSize: 15}}>Last Name</Text>
              <TextInput
                style={{
                  borderColor: White,
                  borderWidth: 1,
                  marginTop: 10,
                  paddingHorizontal: 20,
                  height: 50,
                  borderRadius: 8,
                  color: White
                }}
                keyboardType="name-phone-pad"
                placeholder="Enter your name"
                value={data?.lastName}
                onChangeText={text => handledata('lastName', text)}
              />
              <Text style={{color: Gray, marginTop: 10, fontSize: 15}}>Email</Text>
        
              <TextInput
                style={{
                  borderColor: White,
                  borderWidth: 1,
                  marginTop: 10,
                  paddingHorizontal: 20,
                  height: 50,
                  borderRadius: 8,
                  color: White
                }}
                value={data?.email}
                keyboardType="email-address"
                placeholder="Enter your email"
                onChangeText={text => handledata('email', text)}
              />
              <Text style={{color: Gray, marginTop: 10, fontSize: 15}}>Mobile Number</Text>
        
              <TextInput
                style={{
                  borderColor: White,
                  borderWidth: 1,
                  marginTop: 10,
                  paddingHorizontal: 20,
                  height: 50,
                  borderRadius: 8,
                  color: White
                }}
                keyboardType="phone-pad"
                placeholder="Enter your mobile number"
                value={USER?.phone}
                editable={false}
              />
              <TouchableOpacity
                style={{
                  backgroundColor: Gold,
                  height: 50,
                  borderRadius: 8,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 30,
                }}
                disabled={buttonDisabled}
                onPress={handleUpdate}
              >
                <Text style={{color: White, fontWeight: '500'}}>Update</Text>
              </TouchableOpacity>
    </SafeAreaView>
  )
}