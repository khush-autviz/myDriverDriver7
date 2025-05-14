import { View, Text, Image, TouchableOpacity, TextInput } from 'react-native'
import React from 'react'
import { Black, Gold, Gray, White } from '../constants/Color'

export default function Profile() {
  return (
    <View style={{paddingHorizontal: 20, flex: 1, backgroundColor: Black}}>
      <Text style={{color: White, marginTop: 30, fontSize: 18, fontWeight: '500', textAlign: 'center'}}>Edit Profile</Text>
      <View style={{display: 'flex', alignItems: 'center', marginTop: 40}}>
      {/* <Image source={require('../assets/images/user.png')} /> */}
      </View>
      <Text style={{color: White, fontSize: 20, textAlign: 'center', marginTop: 15, fontWeight: '500'}}>John Cena</Text>
        <Text style={{color: Gray, marginTop: 20, fontSize: 15}}>Name</Text>
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
                value='John Cena'
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
                value='John@gmail.com'
                keyboardType="phone-pad"
                placeholder="Enter your email"
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
                }}
                keyboardType="phone-pad"
                placeholder="9884893939"
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
                }}>
                <Text style={{color: White, fontWeight: '500'}}>Update</Text>
              </TouchableOpacity>
    </View>
  )
}