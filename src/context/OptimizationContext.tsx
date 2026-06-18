import React, { createContext, useContext, useEffect, useState } from 'react';
import DeviceInfo from 'react-native-device-info';
import { AppState, AppStateStatus } from 'react-native';

export type DeviceProfile = 'High-End' | 'Mid-Range' | 'Low-End';

interface DeviceState {
  profile: DeviceProfile;
  batteryLevel: number;
  isPowerSaveMode: boolean;
  batteryStatus: 'Critical' | 'Low' | 'Normal' | 'Good';
}

interface OptimizationContextType {
  deviceState: DeviceState;
  isLowEnd: boolean;
  shouldThrottle: boolean;
}

const OptimizationContext = createContext<OptimizationContextType | undefined>(undefined);

export const OptimizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deviceState, setDeviceState] = useState<DeviceState>({
    profile: 'Mid-Range',
    batteryLevel: 1,
    isPowerSaveMode: false,
    batteryStatus: 'Good',
  });

  const classifyDevice = async () => {
    try {
      const totalMemory = await DeviceInfo.getTotalMemory();
      const memoryInGB = totalMemory / (1024 * 1024 * 1024);
      
      let profile: DeviceProfile = 'Mid-Range';
      if (memoryInGB > 4) profile = 'High-End';
      else if (memoryInGB < 2) profile = 'Low-End';
      
      return profile;
    } catch (error) {
      console.error('Failed to classify device:', error);
      return 'Mid-Range';
    }
  };

  const updateBatteryState = async () => {
    try {
      const [level, powerState] = await Promise.all([
        DeviceInfo.getBatteryLevel(),
        DeviceInfo.getPowerState(),
      ]);

      const powerSave = powerState.lowPowerMode ?? false;

      let status: DeviceState['batteryStatus'] = 'Good';
      if (level < 0.15) status = 'Critical';
      else if (level < 0.3) status = 'Low';
      else if (level < 0.7) status = 'Normal';

      setDeviceState(prev => ({
        ...prev,
        batteryLevel: level,
        isPowerSaveMode: powerSave,
        batteryStatus: status,
      }));
    } catch (error) {
      console.error('Failed to update battery state:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      const profile = await classifyDevice();
      setDeviceState(prev => ({ ...prev, profile }));
      await updateBatteryState();
    };

    init();

    // Note: Some versions of react-native-device-info use listeners, others might require manual polling
    // Adding basic listeners for battery level and power mode changes if supported
    
    const appStateListener = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        updateBatteryState();
      }
    });

    // Poll battery state every 60 seconds as a fallback
    const batteryInterval = setInterval(updateBatteryState, 60000);

    return () => {
      appStateListener.remove();
      clearInterval(batteryInterval);
    };
  }, []);

  const isLowEnd = deviceState.profile === 'Low-End';
  const shouldThrottle = isLowEnd || deviceState.isPowerSaveMode || deviceState.batteryStatus === 'Critical';

  return (
    <OptimizationContext.Provider value={{ deviceState, isLowEnd, shouldThrottle }}>
      {children}
    </OptimizationContext.Provider>
  );
};

export const useOptimization = () => {
  const context = useContext(OptimizationContext);
  if (context === undefined) {
    throw new Error('useOptimization must be used within an OptimizationProvider');
  }
  return context;
};
