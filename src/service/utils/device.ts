import DeviceInfo from 'react-native-device-info';

export const getDeviceId = async () => await DeviceInfo.getUniqueId();
