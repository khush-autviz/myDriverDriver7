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

