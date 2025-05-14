import React, {useState} from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Black, Gold, Gray, White} from '../../constants/Color';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import Logo from '../../assets/logo/mainLogo.svg';
import { useMutation } from '@tanstack/react-query';
import { authSignin } from '../../constants/Api';

export default function Signin() {
  const navigation: any = useNavigation();
  const [number, setnumber] = useState('');
  const [mobileNumber, setmobileNumber] = useState('')

  // signin
  const authSiginMutation = useMutation({
    mutationFn: authSignin,
    onSuccess: (response) => {
      console.log('auth signin success', response);
      navigation.navigate('OtpScreen', {mobileNumber});
    },
    onError: (error) => {
      console.log('signin error', error);
    },
  })

  const handleSignin = async () => {
    if (number.trim() === '') {
      console.log('number is empty');
      return null;
    }

    const phone = `+91${number}`;   // india
      setmobileNumber(phone)
      console.log('phone', phone);


    // try {
    //   const phone = `+91${number}`;
    //   console.log('phone', phone);

    //   const response = await axios.post('http://localhost:3000/auth/signin', {
    //     phone,
    //   });

    //   console.log('signin success', response);

    //   if (response.data.data.existingUser == false) {
    //     navigation.navigate('Signup', {phone});
    //   } else {
    //     navigation.navigate('OtpScreen', {phone});
    //   }
    // } catch (error) {
    //   console.log('signin error', error);
    // }

    authSiginMutation.mutateAsync({phone})
  };

  return (
    <SafeAreaView
      style={{
        backgroundColor: Black,
        flex: 1,
        paddingTop: 70,
        paddingHorizontal: 20,
      }}>
      <Logo height={100} />
      <Text style={{color: White, fontWeight: '500', fontSize: 24, marginTop: 50}}>
        Sign In
      </Text>
      <TextInput
        style={{
          borderColor: White,
          borderWidth: 1,
          marginTop: 40,
          paddingHorizontal: 20,
          height: 50,
          borderRadius: 8,
          color: Gray,
        }}
        value={number}
        onChangeText={text => setnumber(text)}
        keyboardType="phone-pad"
        placeholder="Enter the Phone Number"
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
        onPress={handleSignin}>
        <Text style={{color: White, fontWeight: '500'}}>Sign In</Text>
      </TouchableOpacity>
      {/* <View style={styles.lineContainer}>
        <View style={styles.line} />
        <View style={styles.line} />
      </View>
      <View
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          marginTop: 20,
        }}>
        <Text style={{color: White, fontWeight: '500', fontSize: 16}}>
          Find your account{' '}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('OtpScreen')}>
          <Text style={{color: Gold, fontWeight: '500', fontSize: 16}}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </View> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  text: {
    marginHorizontal: 10,
    fontSize: 14,
    color: '#999',
  },
  image: {
    width: '100%',
    height: 250,
  },
});
