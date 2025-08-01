import { View, Text, TouchableOpacity, StyleSheet, FlatList, Platform, Image } from 'react-native'
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cancelRide, completeRide, driverArrived, driverWaiting, rideDetails, startRide, verifyRideOtp } from '../constants/Api';
import { GestureHandlerRootView, ScrollView, TextInput } from 'react-native-gesture-handler';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
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
    const [customerVehiclePlateNumber, setCustomerVehiclePlateNumber] = useState('')
    //    const [rideInfo, setRideInfo] = useState<any>(null)
    const bottomSheetRef = useRef<BottomSheet>(null);
    const mapRef = useRef<MapView | null>(null);
    const { location, startTracking, stopTracking } = useLocation()
    // const { currentRide, fetchRideDetails} = useRide()
    const { user: USER, rideId, setRideId } = useAuthStore()
    // const queryClient = useQueryClient()
    const socket = useSocket()

    // NEW: Add screen focus state to prevent continuous operations when not visible
    const [isScreenFocused, setIsScreenFocused] = useState(false);

    const snapPoints = useMemo(() => ['25%', '50%'], []);

    const cancelReasons = [
        'Customer not at pickup location',
        'Customer not responding',
        'Vehicle issue or breakdown',
        'Personal emergency',
        'Unsafe or blocked pickup location',    
    ];

    const handleSheetChanges = useCallback((index: number) => {
        // COMMENTED: Prevents logging when screen not focused
        // console.log('handleSheetChanges', index);
        if (isScreenFocused) {
            console.log('handleSheetChanges', index);
        }
    }, [isScreenFocused]); // Added isScreenFocused dependency

    // NEW: Track when screen is focused/blurred to prevent unnecessary operations
    useFocusEffect(
        useCallback(() => {
            console.log('🔍 TripDetails screen focused');
            setIsScreenFocused(true);

            return () => {
                console.log('🔍 TripDetails screen blurred');
                setIsScreenFocused(false);
            };
        }, [])
    );

    // FIXED: Only run query when screen is focused to prevent continuous API calls
    const { data: rideInfo } = useQuery({
        queryKey: ['ride-details', rideId],
        queryFn: () => rideDetails(rideId),
        enabled: !!rideId && isScreenFocused, // FIXED: Added screen focus condition
        refetchOnWindowFocus: false, // FIXED: Prevent unnecessary refetches
    })

    // COMMENTED: Problematic continuous logging
    // console.log(rideInfo, 'ride info');

    // NEW: Only log when screen is focused
    useEffect(() => {
        if (isScreenFocused && rideInfo) {
            console.log(rideInfo, 'ride info');
        }
    }, [rideInfo, isScreenFocused]);

    // driver arrived mutation
    const driverArrivedMutation = useMutation({
        mutationFn: driverArrived,
        onSuccess: (response) => {
            console.log('driver arrived success', response);
            setmode('arrived')
        },
        onError: (error: any) => {
            console.log('driver arrived error', error);
            ShowToast(error?.response?.data?.message, { type: 'error' })
        }
    })

    // ride otp verfication mutation
    const verifyRideOtpMutation = useMutation({
        mutationFn: ({ id, payload }: { id: any, payload: any }) => verifyRideOtp(id, payload),
        onSuccess: (response) => {
            console.log('ride otp verification success', response);
            setmode('otp_verified')
        },
        onError: (error: any) => {
            console.log('ride otp verification error', error);
            ShowToast(error?.response?.data?.message, { type: 'error' })
        }
    })


    // complete ride mutation
    const completeRideMutation = useMutation({
        mutationFn: completeRide,
        onSuccess: (response) => {
            console.log('complete ride success', response);
            setRideId(null)
            // navigation.navigate('Main')
            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            })
        },
        onError: (error: any) => {
            console.log('complete ride error', error);
            ShowToast(error?.response?.data?.message, { type: 'error' })
        }
    })

    // cancel ride mutation
    const cancelRideMutation = useMutation({
        mutationFn: ({ id, payload }: { id: any, payload: any }) => cancelRide(id, payload),
        onSuccess: (response) => {
            console.log('cancel ride success', response);
            navigation.navigate('Main')
        },
        onError: (error: any) => {
            console.log('cancel ride error', error);
            ShowToast(error?.response?.data?.message, { type: 'error' })
        }
    })

    // COMMENTED: Problematic continuous logging
    // console.log(mode, 'mode');

    // NEW: Only log mode when screen is focused
    useEffect(() => {
        if (isScreenFocused) {
            console.log(mode, 'mode');
        }
    }, [mode, isScreenFocused]);

    // FIXED: Only update mode when screen is focused
    useEffect(() => {
        if (rideInfo && isScreenFocused) { // FIXED: Added screen focus condition
            setmode(rideInfo?.data?.ride?.status)
        }
    }, [rideInfo, isScreenFocused]) // FIXED: Added isScreenFocused dependency

    //ride cancel socket
    const handleRideCancel = useCallback((data: any) => {
        // FIXED: Only handle if screen is focused
        if (isScreenFocused) {
            console.log('ride cancel socket', data);
            setRideId(null)
            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            })
            ShowToast('Ride cancelled by user', { type: 'error' })
        }
    }, [isScreenFocused, navigation, setRideId]) // FIXED: Added proper dependencies

    // FIXED: Socket listeners with proper cleanup and focus condition
    useEffect(() => {
        if (isScreenFocused && socket) { // FIXED: Only attach when screen focused
            socket.on('rideCancelled', handleRideCancel)
            console.log('🔌 Socket listener attached for rideCancelled');

            return () => {
                socket.off('rideCancelled', handleRideCancel)
                console.log('🔌 Socket listener removed for rideCancelled');
            }
        }
    }, [socket, handleRideCancel, isScreenFocused]) // FIXED: Added proper dependencies

    // COMMENTED: Problematic continuous logging
    // console.log(location, 'location');

    // NEW: Only log location when screen is focused
    useEffect(() => {
        if (isScreenFocused && location) {
            console.log(location, 'location');
        }
    }, [location, isScreenFocused]);

    const recenter = () => {
        if (mapRef.current && location?.latitude && location?.longitude) {
            mapRef.current.animateToRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 1000);
        }
    };

    return (
        <GestureHandlerRootView style={styles.container}>

            {(cancelRideMutation.isPending || driverArrivedMutation.isPending || verifyRideOtpMutation.isPending || completeRideMutation.isPending) && <Loader />}

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


            {location?.latitude && location?.longitude && (
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        provider='google'
                        showsCompass={false}
                        initialRegion={{
                            latitude: location?.latitude,
                            longitude: location?.longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                        ref={mapRef}
                    >
                        {rideInfo?.data?.ride?.pickupLocation?.coordinates && location?.latitude && location?.longitude && mode === 'accepted' && (
                            <>
                                <Marker coordinate={{ latitude: location?.latitude, longitude: location?.longitude }} ></Marker>
                                <Marker coordinate={{ latitude: rideInfo?.data?.ride?.pickupLocation?.coordinates[0], longitude: rideInfo?.data?.ride?.pickupLocation?.coordinates[1] }} >
                                    <Image source={require('../assets/logo/push-pin.png')} style={{ width: 40, height: 40 }} />
                                </Marker>

                                <MapViewDirections
                                    origin={{ latitude: location?.latitude, longitude: location?.longitude }}
                                    destination={{ latitude: rideInfo?.data?.ride?.pickupLocation?.coordinates[0], longitude: rideInfo?.data?.ride?.pickupLocation?.coordinates[1] }}
                                    apikey='AIzaSyDGQZ-LNDI4iv5CyqdU3BX5dl9PaEpOfrQ'
                                    strokeColor={Gold}
                                    strokeWidth={4}
                                />
                            </>
                        )}
                        {rideInfo?.data?.ride?.pickupLocation?.coordinates && location?.latitude && location?.longitude && mode !== 'accepted' && (
                            <>
                                <Marker coordinate={{ latitude: rideInfo?.data?.ride?.pickupLocation?.coordinates[0], longitude: rideInfo?.data?.ride?.pickupLocation?.coordinates[1] }} />
                                <Marker coordinate={{ latitude: rideInfo?.data?.ride?.destination?.coordinates[0], longitude: rideInfo?.data?.ride?.destination?.coordinates[1] }} >
                                    <Image source={require('../assets/logo/push-pin.png')} style={{ width: 40, height: 40 }} />
                                </Marker>
                                <MapViewDirections
                                    origin={{ latitude: rideInfo?.data?.ride?.pickupLocation?.coordinates[0], longitude: rideInfo?.data?.ride?.pickupLocation?.coordinates[1] }}
                                    destination={{ latitude: rideInfo?.data?.ride?.destination?.coordinates[0], longitude: rideInfo?.data?.ride?.destination?.coordinates[1] }}
                                    apikey='AIzaSyDGQZ-LNDI4iv5CyqdU3BX5dl9PaEpOfrQ'
                                    strokeColor={Gold}
                                    strokeWidth={4}
                                />
                            </>
                        )}

                    </MapView>
                    <TouchableOpacity
                        style={styles.recenterButton}
                        onPress={recenter}
                    >
                        <Ionicons name="locate" size={24} color={Gold} />
                    </TouchableOpacity>
                </View>
            )}


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
                            <View style={{ flex: 1 }}>
                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={{ paddingBottom: 20 }}
                                >
                                    {/* Header Section */}
                                    {/* <View style={styles.headerSection}>
                                <View style={styles.statusBadge}>
                                    <Ionicons name="checkmark-circle" size={16} color={Black} />
                                    <Text style={styles.statusBadgeText}>RIDE ACCEPTED</Text>
                                </View>
                                <Text style={styles.rideIdText}>Ride ID: {rideId?.slice(-8)}</Text>
                            </View> */}

                                    {/* Trip Route Card */}
                                    <View style={styles.routeCard}>
                                        {/* <View style={styles.routeHeader}>
                                    <Ionicons name="navigate" size={20} color={Gold} />
                                    <Text style={styles.routeHeaderText}>Trip Route</Text>
                                </View> */}

                                        {/* Pickup Location */}
                                        <View style={styles.locationRow}>
                                            {/* <View style={styles.locationDot}> */}
                                            {/* <View style={styles.pickupDot} /> */}
                                            {/* </View> */}
                                            <View style={styles.locationContent}>
                                                <Text style={styles.locationLabel}>PICKUP</Text>
                                                <Text style={styles.locationAddress}>{rideInfo?.data?.ride?.pickupLocation?.address}</Text>
                                            </View>
                                        </View>

                                        {/* Route Line */}
                                        <View style={styles.routeLine} />

                                        {/* Destination Location */}
                                        <View style={styles.locationRow}>
                                            {/* <View style={styles.locationDot}> */}
                                            {/* <View style={styles.destinationDot} /> */}
                                            {/* </View> */}
                                            <View style={styles.locationContent}>
                                                <Text style={styles.locationLabel}>DESTINATION</Text>
                                                <Text style={styles.locationAddress}>{rideInfo?.data?.ride?.destination?.address}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Fare & Distance Card */}
                                    <View style={styles.fareCard}>
                                        <View style={styles.fareRow}>
                                            <View style={styles.fareItem}>
                                                <Ionicons name="cash" size={18} color={Gold} />
                                                {/* <Text style={styles.fareLabel}>Total Fare</Text> */}
                                                <Text style={styles.fareAmount}>R{rideInfo?.data?.ride?.fare.toFixed(2)}</Text>
                                            </View>
                                            <View style={styles.fareDivider} />
                                            <View style={styles.fareItem}>
                                                <Ionicons name="speedometer" size={18} color={Gold} />
                                                {/* <Text style={styles.fareLabel}>Distance</Text> */}
                                                <Text style={styles.fareAmount}>{rideInfo?.data?.ride?.distance.toFixed(1)} km</Text>
                                            </View>
                                        </View>
                                    </View>
                                    </ScrollView>

                                    {/* Action Buttons */}
                                    <View style={styles.actionButtonsContainer}>
                                        <TouchableOpacity
                                            style={styles.arrivedButton}
                                            activeOpacity={0.8}
                                            onPress={() => driverArrivedMutation.mutateAsync(rideId)}
                                        >
                                            {/* <Ionicons name="location" size={20} color={Black} style={styles.buttonIcon} /> */}
                                            <Text style={styles.arrivedButtonText}>Arrived</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.cancelRideButton}
                                            activeOpacity={0.8}
                                            onPress={() => setmodalVisible(!modalVisible)}
                                        >
                                            {/* <Ionicons name="close-circle" size={20} color={White} style={styles.buttonIcon} /> */}
                                            <Text style={styles.cancelRideButtonText}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                {/* </ScrollView> */}
                            </View>
                        </>
                    )}

                    {mode === 'arrived' && (
                        <View style={{ flex: 1 }}>
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 20 }}
                            >
                                {/* Header Section */}
                                {/* <View style={styles.headerSection}>
                                <View style={styles.statusBadge}>
                                    <Ionicons name="location" size={16} color={Black} />
                                    <Text style={styles.statusBadgeText}>ARRIVED AT PICKUP</Text>
                                </View>
                                <Text style={styles.rideIdText}>Waiting for customer</Text>
                            </View> */}

                                {/* OTP Verification Card */}
                                <View style={styles.otpCard}>
                                    {/* <View style={styles.otpHeader}>
                                    <Ionicons name="keypad" size={24} color={Gold} />
                                    <Text style={styles.otpHeaderText}>Verify OTP to Start Ride</Text>
                                </View> */}
                                    {/* <Text style={styles.otpSubtext}>Ask the customer for their 4-digit OTP</Text> */}

                                    <View style={styles.otpInputContainer}>
                                        <TextInput
                                            style={styles.otpInput}
                                            placeholder="Enter 4-digit OTP"
                                            placeholderTextColor={Gray}
                                            keyboardType="number-pad"
                                            maxLength={4}
                                            value={otp}
                                            onChangeText={text => setotp(text)}
                                            textAlign="center"
                                        />
                                        <TouchableOpacity
                                            style={[styles.verifyButton, otp.length === 4 && customerVehiclePlateNumber.trim() ? styles.verifyButtonActive : null]}
                                            activeOpacity={0.8}
                                            disabled={otp.length !== 4 || !customerVehiclePlateNumber.trim()}
                                            onPress={() => verifyRideOtpMutation.mutateAsync({
                                                id: rideId,
                                                payload: { 
                                                    otp,
                                                    customerVehiclePlateNumber: customerVehiclePlateNumber.trim()
                                                }
                                            })}
                                        >
                                            {/* <Ionicons name="checkmark" size={20} color={otp.length === 4 ? Black : Gray} /> */}
                                            <Text style={[styles.verifyButtonText, otp.length === 4 && customerVehiclePlateNumber.trim() ? styles.verifyButtonTextActive : null]}>
                                                Verify
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                    
                                    <View style={styles.plateNumberContainer}>
                                        <View style={styles.plateNumberHeader}>
                                            <Ionicons name="car" size={18} color={Gold} />
                                            <Text style={styles.plateNumberLabel}>Customer Vehicle Plate</Text>
                                        </View>
                                        <TextInput
                                            style={styles.plateNumberInput}
                                            placeholder="Enter plate number"
                                            placeholderTextColor={Gray}
                                            value={customerVehiclePlateNumber}
                                            onChangeText={text => setCustomerVehiclePlateNumber(text.toUpperCase())}
                                            autoCapitalize="characters"
                                            // maxLength={10}
                                        />
                                    </View>
                                </View>

                                {/* Trip Summary Card */}

                                <View style={styles.summaryCard}>
                                    {/* Pickup Location */}
                                    <View style={styles.locationRow}>
                                        <View style={styles.locationContent}>
                                            <Text style={styles.locationLabel}>PICKUP</Text>
                                            <Text style={styles.locationAddress}>{rideInfo?.data?.ride?.pickupLocation?.address}</Text>
                                        </View>
                                    </View>

                                    {/* Destination Location */}
                                    <View style={styles.locationRow}>
                                        {/* <View style={styles.locationDot}> */}
                                        {/* <View style={styles.destinationDot} /> */}
                                        {/* </View> */}
                                        <View style={styles.locationContent}>
                                            <Text style={styles.locationLabel}>DESTINATION</Text>
                                            <Text style={styles.locationAddress}>{rideInfo?.data?.ride?.destination?.address}</Text>
                                        </View>
                                    </View>
                                    {/* <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Distance:</Text>
                                    <Text style={styles.summaryValue}>{rideInfo?.data?.ride?.distance.toFixed(1)} km</Text>
                                </View> */}
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>Fare:</Text>
                                        <Text style={styles.summaryValue}>R{rideInfo?.data?.ride?.fare.toFixed(2)}</Text>
                                    </View>

                                </View>
                            </ScrollView>
                            {/* Cancel Button */}
                            <TouchableOpacity
                                style={styles.cancelOnlyButton}
                                activeOpacity={0.8}
                                onPress={() => setmodalVisible(!modalVisible)}
                            >
                                {/* <Ionicons name="close-circle-outline" size={18} color={maroon} /> */}
                                <Text style={styles.cancelOnlyButtonText}>Cancel Ride</Text>
                            </TouchableOpacity>

                            {/* </View> */}
                            {/* </ScrollView> */}
                        </View>

                    )}

                    {mode === 'otp_verified' && (
                        <>
                            <View style={{ flex: 1 }}>
                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={{ paddingBottom: 20 }}
                                >
                                    {/* Header Section */}
                                    {/* <View style={styles.headerSection}>
                                <View style={styles.statusBadge}>
                                    <Ionicons name="car-sport" size={16} color={Black} />
                                    <Text style={styles.statusBadgeText}>TRIP IN PROGRESS</Text>
                                </View>
                                <Text style={styles.rideIdText}>Drive safely to destination</Text>
                            </View> */}

                                    {/* Live Trip Status */}
                                    <View style={styles.liveStatusCard}>
                                        <View style={styles.liveStatusHeader}>
                                            <View style={styles.pulsingDot} />
                                            <Text style={styles.liveStatusText}>LIVE TRIP</Text>
                                        </View>
                                        <View style={styles.tripMetrics}>
                                            <View style={styles.metricItem}>
                                                {/* <Ionicons name="time" size={18} color={Gold} /> */}
                                                <Text style={styles.metricLabel}>Duration:</Text>
                                                <Text style={styles.metricValue}>In Progress</Text>
                                            </View>
                                            <View style={styles.metricDivider} />
                                            <View style={styles.metricItem}>
                                                {/* <Ionicons name="speedometer" size={18} color={Gold} /> */}
                                                <Text style={styles.metricLabel}>Distance:</Text>
                                                <Text style={styles.metricValue}>{rideInfo?.data?.ride?.distance.toFixed(1)} km</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Customer Vehicle Info Card */}
                                    <View style={styles.customerVehicleCard}>
                                        <View style={styles.customerVehicleHeader}>
                                            <Ionicons name="car" size={20} color={Gold} />
                                            <Text style={styles.customerVehicleHeaderText}>Customer Vehicle</Text>
                                        </View>
                                        <View style={styles.plateNumberDisplay}>
                                            <Text style={styles.plateNumberText}>{customerVehiclePlateNumber}</Text>
                                        </View>
                                    </View>

                                    {/* Destination Card */}
                                    <View style={styles.destinationCard}>
                                        <View style={styles.destinationHeader}>
                                            <Ionicons name="flag" size={20} color={Gold} />
                                            <Text style={styles.destinationHeaderText}>Destination</Text>
                                        </View>
                                        <Text style={styles.destinationAddress}>{rideInfo?.data?.ride?.destination?.address}</Text>
                                        <View style={styles.destinationMeta}>
                                            <Text style={styles.destinationFare}>Total Fare: R{rideInfo?.data?.ride?.fare.toFixed(2)}</Text>
                                        </View>
                                    </View>
                                    </ScrollView>

                                    {/* Complete Trip Button */}
                                    <TouchableOpacity
                                        style={styles.completeButton}
                                        activeOpacity={0.8}
                                        onPress={() => completeRideMutation.mutateAsync(rideId)}
                                    >
                                        {/* <View style={styles.completeButtonContent}> */}
                                        {/* <Ionicons name="checkmark-circle" size={24} color={Black} /> */}
                                        {/* <View> */}
                                        <Text style={styles.completeButtonText}>Complete Trip</Text>
                                        {/* <Text style={styles.completeButtonSubtext}>Mark as arrived at destination</Text> */}
                                        {/* </View> */}
                                        {/* </View> */}
                                        {/* <Ionicons name="chevron-forward" size={20} color={Black} /> */}
                                    </TouchableOpacity>
                                {/* </ScrollView> */}
                            </View>
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
        // marginTop: 20,
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

    // New styles for the bottom sheet
    headerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    statusBadge: {
        backgroundColor: Gold,
        borderRadius: 10,
        padding: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusBadgeText: {
        color: Black,
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 5,
    },
    rideIdText: {
        color: Gold,
        fontSize: 14,
        fontWeight: '500',
    },
    routeCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    routeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    routeHeaderText: {
        color: Gold,
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 5,
    },
    locationDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Gold,
        marginRight: 10,
    },
    locationContent: {
        flexDirection: 'column',
    },
    locationLabel: {
        color: Gold,
        fontSize: 12,
        fontWeight: '700',
    },
    locationAddress: {
        color: LightGold,
        fontSize: 14,
    },
    routeLine: {
        borderBottomColor: Gold,
        borderBottomWidth: 1,
        marginVertical: 10,
    },
    fareCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    fareRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    fareItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    fareDivider: {
        width: 1,
        height: '100%',
        backgroundColor: Gold,
        marginHorizontal: 10,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // marginTop: 10,
    },
    arrivedButton: {
        backgroundColor: Gold,
        borderRadius: 10,
        padding: 15,
        // flexDirection: 'row',
        // alignItems: 'center',
        // justifyContent: 'center',
        elevation: 3,
        shadowColor: Gold,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    arrivedButtonText: {
        color: Black,
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 5,
    },
    otpCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingTop: 5,
        marginBottom: 10,
    },
    otpHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    otpHeaderText: {
        color: Gold,
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 5,
    },
    otpInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    otpSubtext: {
        color: Gold,
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 10,
    },
    summaryCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        flex: 1,
        height: '100%',
    },
    summaryTitle: {
        color: Gold,
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 5,
    },
    summaryLabel: {
        color: Gold,
        fontSize: 14,
        fontWeight: '500',
    },
    summaryValue: {
        color: LightGold,
        fontSize: 14,
        fontWeight: '700',
    },
    cancelOnlyButton: {
        backgroundColor: maroon,
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    cancelOnlyButtonText: {
        color: White,
        fontSize: 16,
        fontWeight: '700',
    },
    liveStatusCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    liveStatusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    liveStatusText: {
        color: Gold,
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 5,
    },
    tripMetrics: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    metricItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    metricDivider: {
        width: 1,
        height: '100%',
        backgroundColor: Gold,
        marginHorizontal: 10,
    },
    metricLabel: {
        color: Gold,
        fontSize: 12,
        fontWeight: '500',
    },
    metricValue: {
        color: LightGold,
        fontSize: 14,
        fontWeight: '700',
    },
    destinationCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    destinationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    destinationHeaderText: {
        color: Gold,
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 5,
    },
    destinationAddress: {
        color: LightGold,
        fontSize: 14,
    },
    destinationMeta: {
        marginTop: 10,
    },
    destinationFare: {
        color: Gold,
        fontSize: 14,
        fontWeight: '700',
    },
    completeButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    completeButtonText: {
        color: Black,
        fontSize: 16,
        fontWeight: '700',
    },
    completeButtonSubtext: {
        color: Gold,
        fontSize: 12,
        fontWeight: '500',
    },

    // Missing styles for the new UI elements
    pickupDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50', // Green for pickup
    },
    destinationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#F44336', // Red for destination
    },
    verifyButtonActive: {
        backgroundColor: Gold,
        elevation: 4,
    },
    verifyButtonTextActive: {
        color: Black,
        fontWeight: '700',
    },
    pulsingDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#4CAF50',
        // Add animation effect (can be enhanced with Animated API)
    },
    mapContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    recenterButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
    },
    plateNumberContainer: {
        marginTop: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    plateNumberHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    plateNumberLabel: {
        color: Gold,
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    plateNumberInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        color: White,
        fontSize: 16,
        fontWeight: '600',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        textAlign: 'center',
        letterSpacing: 1,
    },
    customerVehicleCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
    },
    customerVehicleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    customerVehicleHeaderText: {
        color: Gold,
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 8,
    },
    plateNumberDisplay: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    plateNumberText: {
        color: LightGold,
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 2,
    },
});