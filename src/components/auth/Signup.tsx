// import React, {useState} from 'react';
// import {
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import {Black, Gold, Gray, White} from '../../constants/Color';
// import {useNavigation, useRoute} from '@react-navigation/native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import axios from 'axios';
// import Logo from '../../assets/logo/mainLogo.svg'
// import { useAuthStore } from '../../store/authStore';
// import { useMutation } from '@tanstack/react-query';
// import { authSignup } from '../../constants/Api';

// export default function Signup() {
//   const SETUSER = useAuthStore(state => state.setUser)
//   const SETTOKEN = useAuthStore(state => state.setToken)
//   const route = useRoute();
//   const {mobileNumber}: any = route.params;
//   const [formData, setformData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: mobileNumber,
//   });
//   const navigation: any = useNavigation();

//   const handleFormData = (field: string, value: string) => {
//     setformData(prev => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   // register mutation
//   const registerMutation = useMutation({
//     mutationFn: authSignup,
//     onSuccess: (response) => {
//       console.log("register mutation success", response);
//       SETUSER(response?.data?.user)
//       SETTOKEN({access_token: response.data.access_token, refresh_token: response.data.refresh_token})
//       navigation.navigate('Main')
//     },
//     onError: (error: any) => {
//       console.log("register mutation error", error);
//     }
//   })

//   const handleSignup = async () => {
//     const {firstName, lastName, email} = formData;
//     if (
//       firstName.trim() === '' ||
//       lastName.trim() === '' ||
//       email.trim() === ''
//     ) {
//       return null;
//     }

//     registerMutation.mutateAsync(formData)

//     // try {
//     //   const response = await axios.post(
//     //     'http://localhost:3000/auth/register',
//     //     formData,
//     //   );
//     //   console.log('register succss', response);
//     //   if (response.data.data.userId) {
//     //     navigation.navigate('OtpScreen', 
//     //       // {phone}
//     //     );
//     //   }
//     // } catch (error) {
//     //   console.log('register error', error);
//     // }
//   };

//   return (
//     <SafeAreaView
//       style={{
//         backgroundColor: Black,
//         flex: 1,
//         paddingTop: 30,
//         paddingHorizontal: 20,
//       }}>
//       <TouchableOpacity onPress={() => navigation.goBack()}>
//         <View style={styles.backRow}>
//           <Ionicons name="chevron-back" size={20} color={White} />
//           <Text style={styles.backText}> Back</Text>
//         </View>
//       </TouchableOpacity>
//       <Logo height={100} width={300} style={{marginTop: 30}} />
//       <Text
//         style={{color: White, fontWeight: '500', fontSize: 24, marginTop: 30}}>
//         Sign Up
//       </Text>
//       <Text style={{color: Gray, marginTop: 20, fontSize: 15}}>First Name</Text>
//       <TextInput
//         style={{
//           borderColor: White,
//           borderWidth: 1,
//           marginTop: 10,
//           paddingHorizontal: 20,
//           height: 50,
//           borderRadius: 8,
//           color: Gray,
//         }}
//         value={formData.firstName}
//         onChangeText={text => handleFormData('firstName', text)}
//         keyboardType="name-phone-pad"
//         placeholder="Enter your first name"
//       />
//       <Text style={{color: Gray, marginTop: 10, fontSize: 15}}>Last Name</Text>
//       <TextInput
//         style={{
//           borderColor: White,
//           borderWidth: 1,
//           marginTop: 10,
//           paddingHorizontal: 20,
//           height: 50,
//           borderRadius: 8,
//           color: Gray,
//         }}
//         value={formData.lastName}
//         onChangeText={text => handleFormData('lastName', text)}
//         keyboardType="name-phone-pad"
//         placeholder="Enter your last name"
//       />
//       <Text style={{color: Gray, marginTop: 10, fontSize: 15}}>Email</Text>

//       <TextInput
//         style={{
//           borderColor: White,
//           borderWidth: 1,
//           marginTop: 10,
//           paddingHorizontal: 20,
//           height: 50,
//           borderRadius: 8,
//           color: Gray,
//         }}
//         value={formData.email}
//         onChangeText={text => handleFormData('email', text)}
//         keyboardType="email-address"
//         placeholder="Enter your email"
//       />
//       {/* <Text style={{color: Gray, marginTop: 10, fontSize: 15}}>
//         Mobile Number
//       </Text>
//       <TextInput
//         style={{
//           borderColor: White,
//           borderWidth: 1,
//           marginTop: 10,
//           paddingHorizontal: 20,
//           height: 50,
//           borderRadius: 8,
//         }}
//         keyboardType="phone-pad"
//         placeholder="Enter your mobile number"
//       /> */}
//       <TouchableOpacity
//         style={{
//           backgroundColor: Gold,
//           height: 50,
//           borderRadius: 8,
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           marginTop: 30,
//         }}
//         onPress={handleSignup}>
//         <Text style={{color: White, fontWeight: '500'}}>Sign Up</Text>
//       </TouchableOpacity>
//       <View style={styles.lineContainer}>
//         <View style={styles.line} />
//         {/* <Text style={styles.text}>or</Text> */}
//         <View style={styles.line} />
//       </View>
//       {/* <View
//         style={{
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           flexDirection: 'row',
//           marginTop: 20,
//         }}>
//         <Text style={{color: White, fontWeight: '500', fontSize: 16}}>
//           Already have an account?{' '}
//         </Text>
//         <TouchableOpacity onPress={() => navigation.navigate('Signin')}>
//           <Text style={{color: Gold, fontWeight: '500', fontSize: 16}}>
//             Sign In
//           </Text>
//         </TouchableOpacity>
//       </View> */}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   lineContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   line: {
//     flex: 1,
//     height: 1,
//     backgroundColor: '#ccc',
//   },
//   text: {
//     marginHorizontal: 10,
//     fontSize: 14,
//     color: '#999',
//   },
//   backRow: {
//     flexDirection: 'row',
//   },
//   backText: {
//     color: White,
//   },
// });



import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {Black, Gold, Gray, White} from '../../constants/Color';
import {useNavigation, useRoute} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import Logo from '../../assets/logo/mainLogo.svg'
import { useAuthStore } from '../../store/authStore';
import { useMutation } from '@tanstack/react-query';
import { authSignup } from '../../constants/Api';

export default function Signup() {
  const SETUSER = useAuthStore(state => state.setUser)
  const SETTOKEN = useAuthStore(state => state.setToken)
  const route = useRoute();
  const {mobileNumber}: any = route.params;
  const [formData, setformData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: mobileNumber,
  });
  const navigation: any = useNavigation();

  const handleFormData = (field: string, value: string) => {
    setformData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // register mutation
  const registerMutation = useMutation({
    mutationFn: authSignup,
    onSuccess: (response) => {
      console.log("register mutation success", response);
      SETUSER(response?.data?.user)
      SETTOKEN({access_token: response.data.access_token, refresh_token: response.data.refresh_token})
      navigation.navigate('vehicle-details')
    },
    onError: (error: any) => {
      console.log("register mutation error", error);
    }
  })

  const handleSignup = async () => {
    const {firstName, lastName, email} = formData;
    if (
      firstName.trim() === '' ||
      lastName.trim() === '' ||
      email.trim() === ''
    ) {
      return null;
    }

    registerMutation.mutateAsync(formData)

    // try {
    //   const response = await axios.post(
    //     'http://localhost:3000/auth/register',
    //     formData,
    //   );
    //   console.log('register succss', response);
    //   if (response.data.data.userId) {
    //     navigation.navigate('OtpScreen', 
    //       // {phone}
    //     );
    //   }
    // } catch (error) {
    //   console.log('register error', error);
    // }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <ScrollView style={{ flex: 1, backgroundColor: Black }}>
        <SafeAreaView
          style={{
            backgroundColor: Black,
            flex: 1,
            paddingTop: 30,
            paddingHorizontal: 20,
            paddingBottom: 30,
          }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <View style={styles.backRow}>
              <Ionicons name="chevron-back" size={20} color={White} />
              <Text style={styles.backText}> Back</Text>
            </View>
          </TouchableOpacity>
          <Logo height={100} width={300} style={{marginTop: 30}} />
          <Text
            style={{color: White, fontWeight: '500', fontSize: 24, marginTop: 30}}>
            Sign Up
          </Text>
          <Text style={{color: Gray, marginTop: 20, fontSize: 15}}>First Name</Text>
          <TextInput
            style={{
              borderColor: White,
              borderWidth: 1,
              marginTop: 10,
              paddingHorizontal: 20,
              height: 50,
              borderRadius: 8,
              color: Gray,
            }}
            value={formData.firstName}
            onChangeText={text => handleFormData('firstName', text)}
            keyboardType="name-phone-pad"
            placeholder="Enter your first name"
            placeholderTextColor={Gray}
          />
          <Text style={{color: Gray, marginTop: 10, fontSize: 15}}>Last Name</Text>
          <TextInput
            style={{
              borderColor: White,
              borderWidth: 1,
              marginTop: 10,
              paddingHorizontal: 20,
              height: 50,
              borderRadius: 8,
              color: Gray,
            }}
            value={formData.lastName}
            onChangeText={text => handleFormData('lastName', text)}
            keyboardType="name-phone-pad"
            placeholder="Enter your last name"
            placeholderTextColor={Gray}
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
              color: Gray,
            }}
            value={formData.email}
            onChangeText={text => handleFormData('email', text)}
            keyboardType="email-address"
            placeholder="Enter your email"
            placeholderTextColor={Gray}
          />
          {/* <Text style={{color: Gray, marginTop: 10, fontSize: 15}}>
            Mobile Number
          </Text>
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
            placeholder="Enter your mobile number"
          /> */}
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
            onPress={handleSignup}>
            <Text style={{color: White, fontWeight: '500'}}>Sign Up</Text>
          </TouchableOpacity>
          {/* <View style={styles.lineContainer}>
            <View style={styles.line} />
            <Text style={styles.text}>or</Text>
            <View style={styles.line} />
          </View> */}
          {/* <View
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
              marginTop: 20,
            }}>
            <Text style={{color: White, fontWeight: '500', fontSize: 16}}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signin')}>
              <Text style={{color: Gold, fontWeight: '500', fontSize: 16}}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View> */}
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
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
  backRow: {
    flexDirection: 'row',
  },
  backText: {
    color: White,
  },
});