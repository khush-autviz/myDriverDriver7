import Foundation
import CoreLocation
import React

@objc(BackgroundLocationModule)
class BackgroundLocationModule: RCTEventEmitter, CLLocationManagerDelegate {
    
    private var locationManager: CLLocationManager?
    private var isTracking = false
    private var hasListeners = false
    
    override init() {
        super.init()
        setupLocationManager()
    }
    
    override func supportedEvents() -> [String]! {
        return ["BackgroundLocationUpdate"]
    }
    
    override func startObserving() {
        hasListeners = true
    }
    
    override func stopObserving() {
        hasListeners = false
    }
    
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    private func setupLocationManager() {
        locationManager = CLLocationManager()
        locationManager?.delegate = self
        locationManager?.desiredAccuracy = kCLLocationAccuracyBest
        locationManager?.distanceFilter = 0 // Update even if driver hasn't moved
        
        // Request permissions
        locationManager?.requestWhenInUseAuthorization()
        locationManager?.requestAlwaysAuthorization()
    }
    
    @objc
    func startBackgroundLocation(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        
        print("🚀 Starting iOS background location tracking...")
        
        guard let locationManager = locationManager else {
            reject("LOCATION_MANAGER_ERROR", "Location manager not initialized", nil)
            return
        }
        
        // Check authorization status
        let authStatus = locationManager.authorizationStatus
        guard authStatus == .authorizedAlways || authStatus == .authorizedWhenInUse else {
            reject("PERMISSION_DENIED", "Location permission not granted", nil)
            return
        }
        
        if isTracking {
            print("📍 Background location tracking already running")
            resolve("Already tracking")
            return
        }
        
        // Configure for background location
        locationManager.allowsBackgroundLocationUpdates = true
        locationManager.pausesLocationUpdatesAutomatically = false
        
        // Start location updates
        locationManager.startUpdatingLocation()
        
        // Start significant location changes for background
        locationManager.startMonitoringSignificantLocationChanges()
        
        isTracking = true
        print("✅ iOS background location tracking started successfully")
        resolve("Background location tracking started")
    }
    
    @objc
    func stopBackgroundLocation() {
        print("🛑 Stopping iOS background location tracking...")
        
        guard let locationManager = locationManager else {
            return
        }
        
        locationManager.stopUpdatingLocation()
        locationManager.stopMonitoringSignificantLocationChanges()
        locationManager.allowsBackgroundLocationUpdates = false
        
        isTracking = false
        print("✅ iOS background location tracking stopped successfully")
    }
    
    @objc
    func isBackgroundLocationRunning(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        resolve(isTracking)
    }
    
    // MARK: - CLLocationManagerDelegate
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last, hasListeners else { return }
        
        print("📍 iOS location update: \(location.coordinate.latitude), \(location.coordinate.longitude)")
        
        let locationData: [String: Any] = [
            "latitude": location.coordinate.latitude,
            "longitude": location.coordinate.longitude,
            "accuracy": location.horizontalAccuracy,
            "altitude": location.altitude,
            "speed": location.speed >= 0 ? location.speed : 0,
            "heading": location.course >= 0 ? location.course : 0,
            "timestamp": location.timestamp.timeIntervalSince1970 * 1000
        ]
        
        sendEvent(withName: "BackgroundLocationUpdate", body: locationData)
        print("📤 iOS location update sent to React Native")
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("❌ iOS location manager error: \(error.localizedDescription)")
    }
    
    func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        print("📍 iOS location authorization status changed: \(status.rawValue)")
        
        switch status {
        case .authorizedAlways, .authorizedWhenInUse:
            print("✅ iOS location permission granted")
        case .denied, .restricted:
            print("❌ iOS location permission denied")
            if isTracking {
                stopBackgroundLocation()
            }
        case .notDetermined:
            print("⏳ iOS location permission not determined")
            locationManager?.requestAlwaysAuthorization()
        @unknown default:
            print("❓ iOS unknown location authorization status")
        }
    }
}
