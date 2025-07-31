import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
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
  const [otp, setOtp] = useState('');
  const navigation: any = useNavigation();
  const SETUSER = useAuthStore(state => state.setUser);
  const SETTOKEN = useAuthStore(state => state.setToken);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

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

  // Handle OTP input change
  const handleOtpChange = (text: string) => {
    // Only allow numbers and limit to 4 digits
    const numericValue = text.replace(/[^0-9]/g, '').slice(0, 4);
    setOtp(numericValue);
  };

  // verify otp mutation
  const verifyOtpMutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: (response) => {
      console.log('verify otp success', response);
      SETUSER(response?.data?.user)
      SETTOKEN({access_token: response.data.access_token, refresh_token: response.data.refresh_token})

      if (!response.data.user.registrationComplete) {
        // navigation.navigate('Signup', {mobileNumber})
        navigation.reset({
          index: 0,
          routes: [{ name: 'Signup', params: {mobileNumber} }],
        })
      }
      else if (response.data.user.accountStatus === 'VehiclePending') {
        // navigation.navigate('vehicle-details', {mobileNumber})
        navigation.reset({
          index: 0,
          routes: [{ name: 'vehicle-details', params: {mobileNumber} }],
        })
      }
      else if (response.data.user.accountStatus === 'DocumentsPending') {
        // navigation.navigate('vehicle-documents', {mobileNumber})
        navigation.reset({
          index: 0,
          routes: [{ name: 'vehicle-documents', params: {mobileNumber} }],
        })
      }
      else if (response.data.user.accountStatus === 'ApprovalPending') {
        // navigation.navigate('approval-screen', {mobileNumber})
        navigation.reset({
          index: 0,
          routes: [{ name: 'approval-screen', params: {mobileNumber} }],
        })
      }
      else{
        // navigation.navigate('Main')
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        })
      }
      
    },
    onError: (error: any) => {
      console.log('verify otp error', error); 
      ShowToast(error?.response?.data?.message || 'Failed to verify OTP', { type: 'error' });
    },
  });



  const handleVerify = async () => {
    if (otp.length != 4) {
      return null;
    }

    console.log(mobileNumber, otp);
    
    verifyOtpMutation.mutateAsync({
      phone: mobileNumber,
      otp: otp,
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1, backgroundColor: Black}}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Black} />
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.replace('Signin')}
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
              We've sent a 4-digit code to {formatPhoneNumber(mobileNumber)}
            </Text>
          </View>

          <View style={styles.otpInputContainer}>
            <TextInput
              style={styles.otpInput}
              value={otp}
              onChangeText={handleOtpChange}
              placeholder="Enter OTP"
              placeholderTextColor="#666"
              keyboardType="number-pad"
              maxLength={4}
              autoFocus={true}
              selectionColor={Gold}
              textAlignVertical="center"
            />
            {/* {otp.length > 0 && (
              <Text style={styles.otpCounter}>{otp.length}/4</Text>
            )} */}
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
          // (verifyOtpMutation.isPending || otp.length !== 4) && styles.verifyButtonDisabled
        ]} 
        onPress={handleVerify}
        disabled={otp.length !== 4 || verifyOtpMutation.isPending}
      >
        
          <Text style={[
            styles.verifyText,
            (otp.length !== 4) && styles.verifyTextDisabled
          ]}>
            {verifyOtpMutation.isPending ? <ActivityIndicator size="small" color={Black} /> : 'Verify OTP'}
          </Text>
        
      </TouchableOpacity>
    </SafeAreaView>
    </KeyboardAvoidingView>
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
    marginTop: 20,
  },
  logo: {
    height: 80,
    width: width * 0.6,
    marginBottom: 10,
  },
  headerContainer: {
    alignItems: 'center',
    // marginBottom: 30,
  },
  header: {
    color: LightGold,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
  },
  subText: {
    color: Gray,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 35,
    maxWidth: '80%',
  },
  phoneText: {
    color: White,
    fontSize: 18,
    fontWeight: '600',
  },
  otpInputContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  otpInput: {
    width: '80%',
    height: 60,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: White,
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 20,
    letterSpacing: 4,
    textAlignVertical: 'center',
  },
  otpCounter: {
    color: Gold,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
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
  verifyButtonDisabled: {
    backgroundColor: 'rgba(212, 175, 55, 0.5)',
  },
  verifyText: {
    color: Black,
    fontWeight: '700',
    fontSize: 16,
  },
  verifyTextDisabled: {
    color: DarkGray,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: White,
    marginHorizontal: 2,
  },
});