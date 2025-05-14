// import React, {useRef, useState} from 'react';
// import {
//   View,
//   Text,
//   SafeAreaView,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
// } from 'react-native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import {useNavigation, useRoute} from '@react-navigation/native';
// import {Black, Gold, Gray, LightGold, White} from '../../constants/Color';
// import axios from 'axios';
// import Logo from '../../assets/logo/mainLogo.svg';
// import { useMutation } from '@tanstack/react-query';
// import { verifyOtp } from '../../constants/Api';
// import { useAuthStore } from '../../store/authStore';

// export default function OtpScreen() {
//   const route = useRoute();
//   const {mobileNumber}: any = route.params;
//   const [otp, setOtp] = useState(['', '', '', '']);
//   const navigation: any = useNavigation();
//   const SETUSER = useAuthStore(state => state.setUser)

//   const inputRefs = [
//     useRef<TextInput>(null),
//     useRef<TextInput>(null),
//     useRef<TextInput>(null),
//     useRef<TextInput>(null),
//   ];

//   const backspacePressed = useRef(false);

//   const handleKeyPress = (e: any, index: number) => {
//     backspacePressed.current = e.nativeEvent.key === 'Backspace';
//   };

//   const handleInputChange = (text: string, index: number) => {
//     const newOtp = [...otp];

//     if (backspacePressed.current) {
//       if (otp[index] !== '') {
//         newOtp[index] = '';
//         setOtp(newOtp);
//       } else if (index > 0) {
//         newOtp[index - 1] = '';
//         setOtp(newOtp);
//         inputRefs[index - 1].current?.focus();
//       }
//     } else {
//       newOtp[index] = text;
//       setOtp(newOtp);
//       if (text && index < inputRefs.length - 1) {
//         inputRefs[index + 1].current?.focus();
//       }
//     }

//     backspacePressed.current = false;
//   };

//   // verify otp mutation
//   const verifyOtpMutation = useMutation({
//     mutationFn: verifyOtp,
//     onSuccess: (response) => {
//       console.log('verify otp success', response);
//       // if (response.data.user.registrationComplete) {
//       //   SETUSER(response?.data?.data?.user)
//       //   navigation.navigate('Main')
//       // } else {
//         navigation.navigate('Signup', {mobileNumber})
//       // }
//     },
//     onError: (error) => {
//       console.log('veriify otp error', error); 
//     },
//   })

//   const handleVerify = async () => {
//     if (otp.join('').length != 4) {
//       return null;
//     }

//     console.log(mobileNumber, otp.join(''));
    

//     verifyOtpMutation.mutateAsync({
//       phone: mobileNumber,
//       otp: otp.join(''),
//     })

//     // try {
//     //   const response = await axios.post(
//     //     'http://localhost:3000/auth/verifyOtp',
//     //     {
//     //       otp: otp.join(''),
//     //       phone: mobileNumber,
//     //     },
//     //   );
//     //   console.log("verify otp success", response);

//     //   if(response.data.data.access_token) {
//     //     navigation.navigate('Main')
//     //   }
      
//     // } catch (error) {
//     //   console.log("veriify otp error", error); 
//     // }
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={{flex: 1}}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//         <View style={styles.backRow}>
//           <Ionicons name="chevron-back" size={20} color={White} />
//           <Text style={styles.backText}> Back</Text>
//         </View>
//         </TouchableOpacity>

//         <Logo height={100} style={{marginTop: 15}} />

//         <View style={styles.content}>
//           <Text style={styles.header}>Phone Verification</Text>
//           <Text style={styles.subText}>Enter your OTP code</Text>

//           <View style={styles.container}>
//             {otp.map((digit, index) => (
//               <TextInput
//                 key={index}
//                 ref={inputRefs[index]}
//                 style={[styles.otpBox, digit !== '' && styles.filledBox]}
//                 keyboardType="number-pad"
//                 maxLength={1}
//                 value={digit}
//                 onKeyPress={e => handleKeyPress(e, index)}
//                 onChangeText={text => handleInputChange(text, index)}
//                 autoFocus={index === 0}
//               />
//             ))}
//           </View>

//           <View style={styles.resendContainer}>
//             <Text style={styles.resendText}>Already have an account? </Text>
//             <TouchableOpacity>
//               <Text style={styles.resendLink}>Resend again</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>

//       {/* Sticky button at the bottom */}
//       {/* <TouchableOpacity style={styles.verifyButton} onPress={() => navigation.navigate('Main')}> */}
//       <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
//         <Text style={styles.verifyText}>Verify</Text>
//       </TouchableOpacity>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: Black,
//     paddingHorizontal: 10,
//     paddingTop: 20,
//   },
//   backRow: {
//     flexDirection: 'row',
//   },
//   backText: {
//     color: White,
//   },
//   content: {
//     alignItems: 'center',
//     marginTop: 35,
//   },
//   header: {
//     color: White,
//     fontSize: 25,
//     fontWeight: '500',
//   },
//   subText: {
//     color: Gray,
//     marginTop: 10,
//   },
//   container: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: 300,
//     marginTop: 35,
//   },
//   otpBox: {
//     width: 50,
//     height: 50,
//     borderWidth: 1,
//     borderColor: '#000',
//     textAlign: 'center',
//     fontSize: 20,
//     margin: 5,
//     borderRadius: 8,
//     backgroundColor: White,
//   },
//   filledBox: {
//     backgroundColor: LightGold,
//     fontWeight: '500',
//   },
//   resendContainer: {
//     flexDirection: 'row',
//     marginTop: 20,
//   },
//   resendText: {
//     color: White,
//     fontWeight: '400',
//     fontSize: 16,
//   },
//   resendLink: {
//     color: Gold,
//     fontWeight: '400',
//     fontSize: 16,
//   },
//   verifyButton: {
//     backgroundColor: Gold,
//     paddingVertical: 15,
//     borderRadius: 8,
//     marginHorizontal: 10,
//     marginBottom: 35,
//   },

//   verifyText: {
//     textAlign: 'center',
//     color: White,
//     fontWeight: '600',
//     fontSize: 16,
//   },
// });






import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Black, Gold, Gray, LightGold, White} from '../../constants/Color';
import Logo from '../../assets/logo/mainLogo.svg';
import { useMutation } from '@tanstack/react-query';
import { verifyOtp } from '../../constants/Api';
import { useAuthStore } from '../../store/authStore';

export default function OtpScreen() {
  const route = useRoute();
  const {mobileNumber}: any = route.params;
  const [otp, setOtp] = useState(['', '', '', '']);
  const navigation: any = useNavigation();
  const SETUSER = useAuthStore(state => state.setUser);

  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Handle key press events
  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    const key = e.nativeEvent.key;
    
    // Handle backspace
    if (key === 'Backspace') {
      // If current input is empty and we're not at the first input, move to previous input
      if (otp[index] === '' && index > 0) {
        // Move to previous input
        inputRefs[index - 1].current?.focus();
        
        // Clear the previous input (optional, depending on desired behavior)
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
      }
    }
  };

  // Handle input changes
  const handleInputChange = (text: string, index: number) => {
    // Only allow numbers
    if (!/^\d*$/.test(text)) {
      return;
    }
    
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    
    // If text is entered and not at last input, move to next input
    if (text && index < inputRefs.length - 1) {
      inputRefs[index + 1].current?.focus();
    }
  };

  // Handle text selection to detect cursor position
  const handleSelectionChange = (e: any, index: number) => {
    const { start, end } = e.nativeEvent.selection;
    
    // If cursor is at position 0 and backspace is pressed, we need to move to previous input
    if (start === 0 && end === 0 && index > 0 && otp[index] === '') {
      inputRefs[index - 1].current?.focus();
    }
  };

  // verify otp mutation
  const verifyOtpMutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: (response) => {
      console.log('verify otp success', response);
      if (!response.data.user.registrationComplete) {
        navigation.navigate('Signup', {mobileNumber})
      }
      else if (response.data.user.accountStatus === 'VehiclePending') {
        navigation.navigate('vehicle-details', {mobileNumber})
      }
      else if (response.data.user.accountStatus === 'DocumentsPending') {
        navigation.navigate('vehicle-documents', {mobileNumber})
      }
      else if (response.data.user.accountStatus === 'ApprovalPending') {
        navigation.navigate('approval-screen', {mobileNumber})
      }
      else if (response.data.user.accountStatus === 'active') {
        navigation.navigate('Main')
      }
    },
    onError: (error) => {
      console.log('verify otp error', error); 
    },
  })

  const handleVerify = async () => {
    if (otp.join('').length != 4) {
      return null;
    }

    console.log(mobileNumber, otp.join(''));
    
    verifyOtpMutation.mutateAsync({
      phone: mobileNumber,
      otp: otp.join(''),
    })
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{flex: 1}}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
        <View style={styles.backRow}>
          <Ionicons name="chevron-back" size={20} color={White} />
          <Text style={styles.backText}> Back</Text>
        </View>
        </TouchableOpacity>

        <Logo height={100} style={{marginTop: 15}} />

        <View style={styles.content}>
          <Text style={styles.header}>Phone Verification</Text>
          <Text style={styles.subText}>Enter your OTP code</Text>

          <View style={styles.container}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={inputRefs[index]}
                style={[styles.otpBox, digit !== '' && styles.filledBox]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onKeyPress={e => handleKeyPress(e, index)}
                onChangeText={text => handleInputChange(text, index)}
                onSelectionChange={(e) => handleSelectionChange(e, index)}
                autoFocus={index === 0}
                selectTextOnFocus={true}
                caretHidden={false}
              />
            ))}
          </View>

          {/* <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive code? </Text>
            <TouchableOpacity>
              <Text style={styles.resendLink}>Resend again</Text>
            </TouchableOpacity>
          </View> */}
        </View>
      </View>

      <TouchableOpacity 
        style={[
          styles.verifyButton, 
          otp.join('').length !== 4 && styles.disabledButton
        ]} 
        onPress={handleVerify}
        disabled={otp.join('').length !== 4}
      >
        <Text style={styles.verifyText}>
          {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Black,
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  backRow: {
    flexDirection: 'row',
  },
  backText: {
    color: White,
  },
  content: {
    alignItems: 'center',
    marginTop: 35,
  },
  header: {
    color: White,
    fontSize: 25,
    fontWeight: '500',
  },
  subText: {
    color: Gray,
    marginTop: 10,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 300,
    marginTop: 35,
  },
  otpBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#000',
    textAlign: 'center',
    fontSize: 20,
    margin: 5,
    borderRadius: 8,
    backgroundColor: White,
    color: Black,
  },
  filledBox: {
    backgroundColor: LightGold,
    fontWeight: '500',
  },
  resendContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  resendText: {
    color: White,
    fontWeight: '400',
    fontSize: 16,
  },
  resendLink: {
    color: Gold,
    fontWeight: '400',
    fontSize: 16,
  },
  verifyButton: {
    backgroundColor: Gold,
    paddingVertical: 15,
    borderRadius: 8,
    marginHorizontal: 10,
    marginBottom: 35,
  },
  disabledButton: {
    backgroundColor: Gold,
  },
  verifyText: {
    textAlign: 'center',
    color: White,
    fontWeight: '600',
    fontSize: 16,
  },
});
