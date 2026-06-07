import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';

const NetworkStatusIndicator = () => {
    const netInfo = useNetInfo();
    const insets = useSafeAreaInsets();
    const { colors } = useAppTheme();
    const [translateY] = React.useState(new Animated.Value(-100));

    React.useEffect(() => {
        if (netInfo.isConnected === false) {
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                speed: 12,
            }).start();
        } else {
            Animated.timing(translateY, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [netInfo.isConnected]);

    // Don't render anything initially to avoid brief flashes
    if (netInfo.isConnected === null) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY }],
                    top: insets.top,
                    backgroundColor: '#EF4444', // Red-500 for offline
                },
            ]}
        >
            <Text style={styles.text}>No Internet Connection</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    text: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default NetworkStatusIndicator;
