
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
  Image,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Black, Gold, Gray, LightGold, White, DarkGray} from '../../constants/Color';
import { useMutation } from '@tanstack/react-query';
import { verifyOtp } from '../../constants/Api';
import { useAuthStore } from '../../store/authStore';
import { ShowToast } from '../../lib/Toast';

const {width} = Dimensions.get('window');

export default function OtpScreen() {
  const route = useRoute();
  const {mobileNumber}: any = route.params ?? '';
  const [otp, setOtp] = useState(['', '', '', '']);
  const navigation: any = useNavigation();
  const SETUSER = useAuthStore(state => state.setUser);
  const SETTOKEN = useAuthStore(state => state.setToken);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  // Timer for resend functionality
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Handle paste functionality
  const handlePaste = (text: string, startIndex: number) => {
    // Only use digits from pasted text
    const digits = text.replace(/\D/g, '').split('').slice(0, 4);
    
    const newOtp = [...otp];
    digits.forEach((digit, idx) => {
      if (startIndex + idx < 4) {
        newOtp[startIndex + idx] = digit;
      }
    });
    
    setOtp(newOtp);
    
    // Focus on appropriate input after paste
    if (startIndex + digits.length < 4) {
      inputRefs[startIndex + digits.length].current?.focus();
    } else {
      inputRefs[3].current?.focus();
    }
  };

  // Handle key press events
  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    const key = e.nativeEvent.key;
    
    // Handle backspace
    if (key === 'Backspace') {
      // If current input is empty and we're not at the first input, move to previous input
      if (otp[index] === '' && index > 0) {
        // Move to previous input
        inputRefs[index - 1].current?.focus();
        
        // Clear the previous input
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
      SETUSER(response?.data?.user)
      SETTOKEN({access_token: response.data.access_token, refresh_token: response.data.refresh_token})

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
      else{
        navigation.navigate('Main')
      }
      // else {
      //   navigation.navigate('Signup', {mobileNumber})
      // }
      // SETUSER(response?.data?.user)
      // SETTOKEN({access_token: response.data.access_token, refresh_token: response.data.refresh_token})
    },
    onError: (error) => {
      console.log('verify otp error', error); 
      ShowToast(error?.message || 'Failed to verify OTP', { type: 'error' });
    },
  });

  // Resend OTP mutation
  const resendOtpMutation = useMutation({
    mutationFn: (data: any) => {
      // Replace with your actual resend OTP API call
      return Promise.resolve({ success: true });
    },
    onSuccess: () => {
      setTimer(30);
      setCanResend(false);
    }
  });

  const handleResendOtp = () => {
    if (canResend) {
      resendOtpMutation.mutate({ phone: mobileNumber });
    }
  };

  const handleVerify = async () => {
    if (otp.join('').length != 4) {
      return null;
    }

    console.log(mobileNumber, otp.join(''));
    
    verifyOtpMutation.mutateAsync({
      phone: mobileNumber,
      otp: otp.join(''),
    });
  };

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    // Basic formatting - you can customize this based on your needs
    if (phone.length > 6) {
      return `${phone.slice(0, -6)} ${phone.slice(-6, -3)} ${phone.slice(-3)}`;
    }
    return phone;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Black} />
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backRow}>
            <Ionicons name="chevron-back" size={20} color={White} />
            <Text style={styles.backText}>Back</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.content}>
          <Image 
            source={require('../../assets/logo/mainLogo.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />

          <View style={styles.headerContainer}>
            <Text style={styles.header}>Verification Code</Text>
            <Text style={styles.subText}>
              We've sent a 4-digit code to
            </Text>
            <Text style={styles.phoneText}>{formatPhoneNumber(mobileNumber)}</Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={inputRefs[index]}
                style={[
                  styles.otpBox, 
                  digit !== '' && styles.filledBox,
                  index === 0 && styles.firstBox,
                  index === 3 && styles.lastBox
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onKeyPress={e => handleKeyPress(e, index)}
                onChangeText={text => {
                  // Check if text length > 1, which likely means it was pasted
                  if (text.length > 1) {
                    handlePaste(text, index);
                  } else {
                    handleInputChange(text, index);
                  }
                }}
                onSelectionChange={(e) => handleSelectionChange(e, index)}
                autoFocus={index === 0}
                selectTextOnFocus={true}
                caretHidden={false}
              />
            ))}
          </View>
          
          {/* <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive code? </Text>
            <TouchableOpacity 
              onPress={handleResendOtp}
              disabled={!canResend}
            >
              <Text style={[
                styles.resendLink,
                !canResend && styles.resendLinkDisabled
              ]}>
                {canResend ? 'Resend' : `Resend in ${timer}s`}
              </Text>
            </TouchableOpacity>
          </View> */}
        </View>
      </View>

      <TouchableOpacity 
        style={[
          styles.verifyButton, 
          // otp.join('').length !== 4 && styles.verifyButtonDisabled
        ]} 
        onPress={handleVerify}
        disabled={otp.join('').length !== 4 || verifyOtpMutation.isPending}
      >
        {verifyOtpMutation.isPending ? (
          <ActivityIndicator size="small" color={Black} />
        ) : (
          <Text style={styles.verifyText}>Verify</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Black,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  backButton: {
    marginTop: 10,
    // marginBottom: 10,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: White,
    fontSize: 16,
    marginLeft: 4,
  },
  content: {
    alignItems: 'center',
    // marginTop: 10,
  },
  logo: {
    height: 70,
    width: width * 0.5,
    marginBottom: 30,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  header: {
    color: LightGold,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  subText: {
    color: Gray,
    fontSize: 16,
    textAlign: 'center',
    // marginBottom: 8,
  },
  phoneText: {
    color: White,
    fontSize: 18,
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  otpBox: {
    width: 65,
    height: 65,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    borderRadius: 12,
    backgroundColor: 'rgba(53, 56, 63, 0.8)',
    color: White,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  firstBox: {
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  lastBox: {
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  filledBox: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: Gold,
    color: Gold,
  },
  resendContainer: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  resendText: {
    color: Gray,
    fontSize: 16,
  },
  resendLink: {
    color: Gold,
    fontWeight: '600',
    fontSize: 16,
  },
  resendLinkDisabled: {
    color: DarkGray,
  },
  verifyButton: {
    backgroundColor: Gold,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 35,
    shadowColor: Gold,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  // verifyButtonDisabled: {
  //   backgroundColor: 'rgba(212, 175, 55, 0.5)',
  // },
  verifyText: {
    color: Black,
    fontWeight: '700',
    fontSize: 16,
  },
});