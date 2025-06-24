import axios from '../lib/axios'

// signin
export const authSignin = async (data: any) => {
    const response = await axios.post('/driverAuth/login', data)
    return response.data
}

// verify otp
export const verifyOtp = async (data: any) => {
    const response = await axios.post('/driverAuth/verifyOTP', data)
    return response.data
}

//register
export const authSignup = async (data: any) => {
    const response = await axios.post('/driverAuth/register', data)
    return response.data
}

// vehicle details
export const vehicleDetailsApi = async (driverId: number, data: any) => {
    const response = await axios.put(`/driverAuth/drivers/${driverId}/vehicle-details`, data, {headers: {'Content-Type': 'multipart/form-data'}})
    return response.data
}

// vehicle documents
export const vehicleDocumentsApi = async (driverId: number, data: any) => {
    const response = await axios.put(`/driverAuth/drivers/${driverId}/upload-documents`, data, {headers: {'Content-Type': 'multipart/form-data'}})
    return response.data
}  

// get profile
export const getProfile = async () => {
    const response = await axios.get(`/driverAuth/driver/details`)
    return response.data
}

// edit profile
export const editProfile = async (data: any) => {
    const response = await axios.put(`/driverAuth/driver/edit-profile`, data, {headers: {'Content-Type': 'multipart/form-data'}})
    return response.data
}

// driver online
export const driverGoOnline = async (data: any) => {
    const response = await axios.post(`/driverAuth/go-online`, data)
    return response.data
}

// extra driver online 
export const extraDriverGoOnline = async (data: any) => {
    const response = await axios.post(`/driverAuth/go-online-with-extra`, data)
    return response.data
}

// driver offline
export const driverGoOffline = async (data: any) => {
    const response = await axios.post(`/driverAuth/go-offline`, data)
    return response.data
}

// ride accepted
export const rideAccepted = async (rideId: any) => {
    const response = await axios.put(`/ride-status/driver/accept/${rideId}`)
    return response.data
}

// driver arrived
export const driverArrived = async (rideId: any) => {
    const response = await axios.put(`/ride-status/driver/arrived/${rideId}`)
    return response.data
}

// driver waiting
export const driverWaiting = async (rideId: any) => {
    const response = await axios.put(`/ride-status/driver/waiting/${rideId}`)
    return response.data
}

// verify ride otp
export const verifyRideOtp = async (rideId: any, data: number) => {
    const response = await axios.put(`/ride-status/driver/verify-otp/${rideId}`, data)
    return response.data
}

// start ride
export const startRide = async (rideId: any) => {
    const response = await axios.put(`/ride-status/driver/start/${rideId}`)
    return response.data
}

// complete ride
export const completeRide = async (rideId: any) => {
    const response = await axios.put(`/ride-status/driver/complete/${rideId}`)
    return response.data
}

// cancel ride
export const cancelRide = async (rideId: any, data: any) => {
    const response = await axios.put(`/ride-status/driver/cancel/${rideId}`, data)
    return response.data
}

// ride details
export const rideDetails = async (rideId: any) => {
    console.log(rideId, 'ride details ride id');
    const response = await axios.get(`/ride/driver/${rideId}`)
    return response.data
}

// ride history
export const rideHistory = async () => {
    const response = await axios.get('/driverAuth/driverHistory')
    return response.data
}

// wallet balance
export const driverWalletBalance = async () => {
    const response = await axios.get('/driver/wallet/balance')
    return response.data
}

// wallet transactions
export const driverWalletTransactions = async () => {
    const response = await axios.get('/driver/wallet/transactions')
    return response.data
}

// create withdrawal request
export const createWithdrawalRequest = async (data: any) => {
    const response = await axios.post('/driver/wallet/withdrawal/request', data)
    return response.data
}

// withdrawal history
export const withdrawalHistory = async () => {
    const response = await axios.get('/driver/wallet/withdrawal/requests')
    return response.data
}