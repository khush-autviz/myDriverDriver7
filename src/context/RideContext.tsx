import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { rideDetails } from '../constants/Api';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';

// Define TypeScript interfaces for ride data based on actual API response
interface LocationCoordinates {
  address: string;
  coordinates: [number, number]; // [longitude, latitude]
}

interface RideData {
  _id: string;
  customer: string; // Customer ID
  driver: string; // Driver ID
  pickupLocation: LocationCoordinates;
  destination: LocationCoordinates;
  vehicle: string; // Vehicle ID
  status: 'searchingDriver' | 'driverAssigned' | 'driverArrived' | 'rideStarted' | 'rideCompleted' | 'rideCancelled';
  fare: number;
  distance: number;
  createdAt: string;
  updatedAt: string;
  // Optional fields that might be added later
  otp?: string;
  estimatedArrival?: string;
  actualArrival?: string;
  startTime?: string;
  endTime?: string;
  cancellationReason?: string;
  duration?: number;
}

// API Response structure
interface RideApiResponse {
  success: boolean;
  data: {
    ride: RideData;
  };
}

interface RideContextType {
  // State
  currentRide: RideData | null;

  // Actions
  fetchRideDetails: (rideId: string) => Promise<void>;
  updateRideData: (rideData: Partial<RideData>) => void;
  setCurrentRide: (ride: RideData | null) => void;
  clearRide: () => void;
  refreshRide: () => Promise<void>;
}

const RideContext = createContext<RideContextType | undefined>(undefined);

interface RideProviderProps {
  children: ReactNode;
}

export const RideProvider: React.FC<RideProviderProps> = ({ children }) => {
  const [currentRide, setCurrentRide] = useState<RideData | null>(null);
    const {token} = useAuthStore()
    console.log("ride context token", token);
    
 
    const getRideDetails = async (ride: string) => {
        try {
          const response = await axios.get(`https://t1wfswdh-3000.inc1.devtunnels.ms/ride/driver/${ride}`, {
            headers: {
              Authorization: `Bearer ${token?.access_token}`, // Make sure token is accessible
            }
          });
      
          console.log("ride details token", token?.access_token);
          
          console.log('Ride details success:', response.data.data.ride);
      setCurrentRide(response.data.data.ride)
          return response.data;
          
        } catch (error: any) {
          console.log('Ride details error:', error?.response?.data || error.message);
        }
      };
      
  

  // Fetch ride details from API
  const fetchRideDetails = useCallback(async (rideId: any) => {
    if (!rideId) {
      console.log('RideContext: Ride ID is required');
      return;
    }

    console.log('RideContext: Fetching ride details for ID:', rideId);

    getRideDetails(rideId)
    
  }, []);

  // Update specific fields of current ride data
  const updateRideData = useCallback((rideData: Partial<RideData>) => {
    console.log('RideContext: Updating ride data:', rideData);
    setCurrentRide(prevRide => {
      if (!prevRide) return null;
      return { ...prevRide, ...rideData };
    });
  }, []);

  // Set the current ride directly
  const setCurrentRideData = useCallback((ride: RideData | null) => {
    console.log('RideContext: Setting current ride:', ride);
    setCurrentRide(ride);
  }, []);

  // Clear current ride data
  const clearRide = useCallback(() => {
    console.log('RideContext: Clearing current ride');
    setCurrentRide(null);
  }, []);

  // Refresh current ride data
  const refreshRide = useCallback(async () => {
    if (currentRide?._id) {
      await fetchRideDetails(currentRide._id);
    }
  }, [currentRide?._id, fetchRideDetails]);

  const contextValue: RideContextType = {
    // State
    currentRide,

    // Actions
    fetchRideDetails,
    updateRideData,
    setCurrentRide: setCurrentRideData,
    clearRide,
    refreshRide,
  };

  return (
    <RideContext.Provider value={contextValue}>
      {children}
    </RideContext.Provider>
  );
};

// Custom hook for using the ride context
export const useRide = (): RideContextType => {
  const context = useContext(RideContext);
  if (!context) {
    throw new Error('useRide must be used within a RideProvider');
  }
  return context;
};

// Helper functions for working with ride data
export const getRideHelpers = {
  // Extract latitude and longitude from coordinates array
  getLatLng: (coordinates: [number, number]) => ({
    latitude: coordinates[1],  // coordinates[1] is latitude
    longitude: coordinates[0], // coordinates[0] is longitude
  }),

  // Get pickup coordinates as lat/lng object
  getPickupLatLng: (ride: RideData) => ({
    latitude: ride.pickupLocation.coordinates[1],
    longitude: ride.pickupLocation.coordinates[0],
  }),

  // Get destination coordinates as lat/lng object
  getDestinationLatLng: (ride: RideData) => ({
    latitude: ride.destination.coordinates[1],
    longitude: ride.destination.coordinates[0],
  }),

  // Check if ride is active (not completed or cancelled)
  isRideActive: (status: RideData['status']) =>
    !['rideCompleted', 'rideCancelled'].includes(status),

  // Get human-readable status
  getStatusText: (status: RideData['status']) => {
    const statusMap = {
      searchingDriver: 'Searching for Driver',
      driverAssigned: 'Driver Assigned',
      driverArrived: 'Driver Arrived',
      rideStarted: 'Ride in Progress',
      rideCompleted: 'Ride Completed',
      rideCancelled: 'Ride Cancelled',
    };
    return statusMap[status] || status;
  },
};

// Export types for use in other components
export type { RideData, LocationCoordinates, RideContextType, RideApiResponse };