import { View, Text, TouchableOpacity, StyleSheet, FlatList, Platform, Image } from 'react-native'
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cancelRide, completeRide, driverArrived, driverWaiting, rideDetails, startRide, verifyRideOtp } from '../constants/Api';
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons'
import { Black, DarkGray, Gold, Gray, LightGold, maroon, White } from '../constants/Color';
import MapView, { Marker } from 'react-native-maps';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useLocation } from '../context/LocationProvider';
import Modal from 'react-native-modal'
import { useAuthStore } from '../store/authStore';
import MapViewDirections from 'react-native-maps-directions';
import { ShowToast } from '../lib/Toast';
import { Loader } from '../lib/Loader';
import { useSocket } from '../context/SocketContext';

export default function TripDetails() {
    const navigation: any = useNavigation()
    const [mode, setmode] = useState('')
    const [modalVisible, setmodalVisible] = useState(false)
    const [otp, setotp] = useState('')
//    const [rideInfo, setRideInfo] = useState<any>(null)
    const bottomSheetRef = useRef<BottomSheet>(null);
    const { location, startTracking, stopTracking } = useLocation()
    // const { currentRide, fetchRideDetails} = useRide()
    const { user: USER, rideId, setRideId } = useAuthStore()
    // const queryClient = useQueryClient()
    const socket = useSocket()

    const snapPoints = useMemo(() => ['25%', '50%'], []);

    const cancelReasons = [
        'Rider not at pickup location',
        'Rider not responding',
        'Vehicle issue or breakdown',
        'Personal emergency',
        'Rider asked to cancel the trip',
    ];

    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
    }, []);

    const {data: rideInfo} = useQuery({
        queryKey: ['ride-details', rideId],
        queryFn: () => rideDetails(rideId),
        enabled: !!rideId,
    })

    console.log(rideInfo, 'ride info');

    // driver arrived mutation
    const driverArrivedMutation = useMutation({
        mutationFn: driverArrived,
        onSuccess: (response) => {
            console.log('driver arrived success', response);
            setmode('arrived')
        },
        onError: (error) => {
            console.log('driver arrived error', error);
            ShowToast(error?.message, {type: 'error'})
        }
    })

    // ride otp verfication mutation
    const verifyRideOtpMutation = useMutation({
        mutationFn: ({ id, payload }: { id: any, payload: any }) => verifyRideOtp(id, payload),
        onSuccess: (response) => {
            console.log('ride otp verification success', response);
            setmode('otp_verified')
        },
        onError: (error) => {
            console.log('ride otp verification error', error);
            ShowToast(error?.message, {type: 'error'})
        }
    })


    // complete ride mutation
    const completeRideMutation = useMutation({
        mutationFn: completeRide,
        onSuccess: (response) => {
            console.log('complete ride success', response);
            navigation.navigate('Main')
        },
        onError: (error) => {
            console.log('complete ride error', error);
            ShowToast(error?.message, {type: 'error'})
        }
    })

    // cancel ride mutation
    const cancelRideMutation = useMutation({
        mutationFn: ({ id, payload }: { id: any, payload: any }) => cancelRide(id, payload),
        onSuccess: (response) => {
            console.log('cancel ride success', response);
            navigation.navigate('Main')
        },
        onError: (error) => {
            console.log('cancel ride error', error);
        }
    })


    useEffect(() => {
        if (rideInfo) {
            setmode(rideInfo?.data?.ride?.status)
        }
    }, [rideInfo])

    //ride cancel socket
    socket?.on('rideCancelled', (data: any) => {
        console.log('ride cancel socket', data);
        setRideId(null)     
        navigation.navigate('Main')
        ShowToast('Ride cancelled by user', {type: 'error'})   
    })

    console.log(location, 'location');
    

    return (
        <GestureHandlerRootView style={styles.container}>

        {(cancelRideMutation.isPending || driverArrivedMutation.isPending || verifyRideOtpMutation.isPending || completeRideMutation.isPending) &&  <Loader />}

            {/* Cancel Ride Modal */}
            <Modal
                isVisible={modalVisible}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                backdropOpacity={0.7}
                onBackdropPress={() => setmodalVisible(false)}
                style={styles.modal}
                statusBarTranslucent
                useNativeDriver
                hideModalContentWhileAnimating
            >
                <View style={styles.modalContainer}>
                    {/* Modal Header */}
                    <View style={styles.modalHeader}>
                        {/* <View style={styles.modalIndicator} /> */}
                        <Text style={styles.modalTitle}>Cancel Ride</Text>
                    </View>

                    {/* Modal Content */}
                    <View style={styles.modalContent}>
                        <Text style={styles.modalDescription}>
                            Please select a reason for cancellation:
                        </Text>

                        <FlatList
                            data={cancelReasons}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.reasonButton}
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        cancelRideMutation.mutate({
                                            id: rideId,
                                            payload: { reason: item }
                                        });
                                    }}
                                >
                                    <Text style={styles.reasonText}>{item}</Text>
                                    <Ionicons name="chevron-forward" size={20} color={Gold} />
                                </TouchableOpacity>
                            )}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.reasonsList}
                        />
                    </View>

                    {/* Modal Footer */}
                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            activeOpacity={0.8}
                            onPress={() => setmodalVisible(false)}
                        >
                            <Text style={styles.cancelButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>


            <MapView
                style={styles.map}
                showsCompass={false}
                initialRegion={{
                    latitude: location?.latitude,
                    longitude: location?.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                {mode === 'accepted' && (
                    <>
                <Marker coordinate={{ latitude: location?.latitude, longitude: location?.longitude }} ></Marker>
                <Marker coordinate={{ latitude: rideInfo?.data?.ride?.pickupLocation?.coordinates[0], longitude: rideInfo?.data?.ride?.pickupLocation?.coordinates[1] }} >
                    <Image source={require('../assets/logo/push-pin.png')} style={{ width: 40, height: 40}} />
                </Marker>

                <MapViewDirections
                    origin={{latitude: location?.latitude, longitude: location?.longitude}}
                    destination={{latitude: rideInfo?.data?.ride?.pickupLocation?.coordinates[0], longitude: rideInfo?.data?.ride?.pickupLocation?.coordinates[1]}}
                    apikey='AIzaSyBcKgyA7urR7gHyen79h40UlkvTJJoKc9I'
                    strokeColor={Gold}
                    strokeWidth={4}
                />
                </>
                )}
                {mode !== 'accepted' && (
                    <>
                    <Marker coordinate={{ latitude: rideInfo?.data?.ride?.pickupLocation?.coordinates[0], longitude: rideInfo?.data?.ride?.pickupLocation?.coordinates[1] }} />
                    <Marker coordinate={{ latitude: rideInfo?.data?.ride?.destination?.coordinates[0], longitude: rideInfo?.data?.ride?.destination?.coordinates[1] }} >
                        <Image source={require('../assets/logo/push-pin.png')} style={{ width: 40, height: 40}} />
                    </Marker>
                    <MapViewDirections
                    origin={{latitude: rideInfo?.data?.ride?.pickupLocation?.coordinates[0], longitude: rideInfo?.data?.ride?.pickupLocation?.coordinates[1]}}
                    destination={{latitude: rideInfo?.data?.ride?.destination?.coordinates[0], longitude: rideInfo?.data?.ride?.destination?.coordinates[1]}}
                    apikey='AIzaSyBcKgyA7urR7gHyen79h40UlkvTJJoKc9I'
                    strokeColor={Gold}
                    strokeWidth={4}
                />
                    </>
                )}

            </MapView>


            <BottomSheet
                ref={bottomSheetRef}
                index={1} // start hidden
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                handleIndicatorStyle={{ backgroundColor: Gold }}
                backgroundStyle={{ backgroundColor: Black }}>
                <BottomSheetView style={styles.contentContainer}>
                    {mode === 'accepted' && (
                        <>
                            {/* Trip Details Card */}
                            <View style={styles.tripDetailsCard}>
                                {/* Pickup Location */}
                                <View style={styles.locationRow}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="location" size={20} color="green" />
                                    </View>
                                    <View>
                                        <Text style={styles.locationSubtitle}>{rideInfo?.data?.ride?.pickupLocation?.address}</Text>
                                    </View>
                                </View>

                                {/* Destination Location */}
                                <View style={styles.locationRow}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="location" size={20} color="red" />
                                    </View>
                                    <View>
                                        {/* <Text style={styles.locationTitle}>FZ5</Text> */}
                                        <Text style={styles.locationSubtitle}>{rideInfo?.data?.ride?.destination?.address}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Fare Details */}
                            <View style={styles.fareContainer}>
                                <Text style={styles.fareLabel}>Total</Text>
                                <Text style={styles.fareAmount}>${rideInfo?.data?.ride?.fare.toFixed(2)}</Text>
                            </View>

                            {/* <View style={styles.divider} /> */}

                            {/* Action Buttons */}
                            <TouchableOpacity
                                style={styles.primaryButton}
                                activeOpacity={0.8}
                                onPress={() => driverArrivedMutation.mutateAsync(rideId)}
                            >
                                <Text style={styles.buttonText}>Arrived</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.cancelButton}
                                activeOpacity={0.8}
                                onPress={() => setmodalVisible(!modalVisible)}
                            >
                                <Text style={styles.buttonText}>Cancel Ride</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {mode === 'arrived' && (
                        <>
                            {/* OTP Verification Section */}
                            <View style={styles.otpContainer}>
                                <TextInput
                                    style={styles.otpInput}
                                    placeholder="Enter OTP"
                                    placeholderTextColor={Gray}
                                    keyboardType="number-pad"
                                    maxLength={4}
                                    value={otp}
                                    onChangeText={text => setotp(text)}
                                />
                                <TouchableOpacity
                                    style={styles.verifyButton}
                                    activeOpacity={0.8}
                                    onPress={() => verifyRideOtpMutation.mutateAsync({
                                        id: rideId,
                                        payload: { otp }
                                    })}
                                >
                                    <Text style={styles.verifyButtonText}>Verify</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Trip Details Card */}
                            <View style={styles.tripDetailsCard}>
                                {/* Pickup Location */}
                                <View style={styles.locationRow}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="location" size={20} color="green" />
                                    </View>
                                    <View>
                                        {/* <Text style={styles.locationTitle}>FZ5</Text> */}
                                        <Text style={styles.locationSubtitle}>{rideInfo?.data?.ride?.pickupLocation?.address}</Text>
                                    </View>
                                </View>

                                {/* Destination Location */}
                                <View style={styles.locationRow}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="location" size={20} color="red" />
                                    </View>
                                    <View>
                                        {/* <Text style={styles.locationTitle}>FZ5</Text> */}
                                        <Text style={styles.locationSubtitle}>{rideInfo?.data?.ride?.destination?.address}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Cancel Ride Button */}
                            <TouchableOpacity
                                style={styles.cancelRideButton}
                                activeOpacity={0.8}
                                onPress={() => setmodalVisible(!modalVisible)}
                            >
                                <Text style={styles.cancelRideButtonText}>Cancel Ride</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {mode === 'otp_verified' && (
                        <>
                            {/* Trip Details Card */}
                            <View style={styles.tripDetailsCard}>
                                {/* Pickup Location */}
                                <View style={styles.locationRow}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="location" size={20} color="green" />
                                    </View>
                                    <View>
                                        {/* <Text style={styles.locationTitle}>FZ5</Text> */}
                                        <Text style={styles.locationSubtitle}>{rideInfo?.data?.ride?.pickupLocation?.address}</Text>
                                    </View>
                                </View>

                                {/* Destination Location */}
                                <View style={styles.locationRow}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="location" size={20} color="red" />
                                    </View>
                                    <View>
                                        {/* <Text style={styles.locationTitle}>FZ5</Text> */}
                                        <Text style={styles.locationSubtitle}>{rideInfo?.data?.ride?.destination?.address}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Trip Status Information */}
                            <View style={styles.tripStatusContainer}>
                                <View style={styles.statusItem}>
                                    <Ionicons name="time-outline" size={20} color={Gold} />
                                    <Text style={styles.statusText}>Trip in progress</Text>
                                </View>
                            </View>

                            {/* Complete Trip Button */}
                            <TouchableOpacity
                                style={styles.completeButton}
                                activeOpacity={0.8}
                                onPress={() => completeRideMutation.mutateAsync(rideId)}
                            >
                                <Ionicons name="checkmark-circle" size={20} color={White} style={styles.buttonIcon} />
                                <Text style={styles.buttonText}>Complete Trip</Text>
                            </TouchableOpacity>
                        </>
                    )}

                </BottomSheetView>
            </BottomSheet>
        </GestureHandlerRootView>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: 'grey',
    },
    contentContainer: {
        flex: 1,
        padding: 20,
        // alignItems: 'start',
        backgroundColor: Black,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },

    // Modal Styles
    modal: {
        margin: 0,
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: Black,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: Platform.OS === 'ios' ? 34 : 24, // Extra padding for iOS devices with home indicator
        overflow: 'hidden',
    },
    modalHeader: {
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    modalIndicator: {
        width: 40,
        height: 5,
        backgroundColor: Gray,
        borderRadius: 3,
        marginBottom: 12,
    },
    modalTitle: {
        color: Gold,
        fontSize: 18,
        fontWeight: '700',
    },
    modalContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    modalDescription: {
        color: White,
        fontSize: 14,
        marginBottom: 16,
        opacity: 0.9,
    },
    reasonsList: {
        paddingBottom: 8,
    },
    reasonButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
    },
    reasonText: {
        color: White,
        fontSize: 16,
        fontWeight: '500',
    },
    modalFooter: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    cancelButton: {
        backgroundColor: maroon,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 10
    },
    cancelButtonText: {
        color: White,
        fontSize: 16,
        fontWeight: '700',
    },


    // OTP Section Styles
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
    },
    otpInput: {
        borderColor: Gold,
        borderWidth: 2,
        borderRadius: 10,
        paddingHorizontal: 15,
        height: 50,
        width: '60%',
        color: White,
        fontSize: 16,
    },
    verifyButton: {
        backgroundColor: Gold,
        borderRadius: 10,
        padding: 12,
        width: '35%',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: Gold,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    verifyButtonText: {
        color: White,
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },

    // Trip Details Card Styles
    tripDetailsCard: {
        borderColor: Gold,
        borderWidth: 2,
        padding: 8,
        marginTop: 10,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    locationTitle: {
        color: Gold,
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    locationSubtitle: {
        color: LightGold,
        fontSize: 12,
        // flexWrap: 'wrap',
        width: '50%',
        // marginRight: 10,
    },

    // Cancel Button Styles
    cancelRideButton: {
        backgroundColor: maroon,
        borderRadius: 10,
        padding: 15,
        marginTop: 20,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    cancelRideButtonText: {
        color: White,
        fontSize: 16,
        fontWeight: '700',
    },


    // Fare Details Styles
    fareContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        paddingHorizontal: 5,
        marginBottom: 10
    },
    fareLabel: {
        color: Gold,
        fontSize: 18,
        fontWeight: '700',
    },
    fareAmount: {
        color: Gold,
        fontSize: 18,
        fontWeight: '700',
    },
    divider: {
        borderBottomColor: Gold,
        borderBottomWidth: 3,
        borderRadius: 10,
        marginTop: 10,
        marginBottom: 10,
    },

    // Button Styles
    primaryButton: {
        backgroundColor: Gold,
        borderRadius: 10,
        padding: 15,
        marginTop: 10,
        alignItems: 'center',
        elevation: 3,
        shadowColor: Gold,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    buttonText: {
        color: White,
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },


    // Trip Status Styles
    tripStatusContainer: {
        marginTop: 20,
        marginBottom: 10,
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
    },
    statusText: {
        color: White,
        fontSize: 14,
        marginLeft: 10,
        fontWeight: '500',
    },

    // Complete Button Style
    completeButton: {
        backgroundColor: Gold,
        borderRadius: 10,
        padding: 15,
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: Gold,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    buttonIcon: {
        marginRight: 8,
    },
});