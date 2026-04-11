import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StatusBar,
    Platform,
    LayoutAnimation,
    UIManager,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../../../../../constant/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hS, mS, vS } from '../../../../../lib/responsive';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../../redux/store';
import {
    markAsRead,
    clearAll,
    removeNotification,
    Notification
} from '../../../../../redux/notificationSlice';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import { BookedTripScreen_Nav } from '../../../../../Navigations/navigations';
import { useAppTheme } from "../../../../../hooks/useAppTheme";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const NotificationScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();
    const notifications = useSelector((state: RootState) => state.notifications.notifications);
    const { colors: appColors, isDark } = useAppTheme();

    const getIcon = (type: string, isDarkTheme: boolean) => {
        switch (type) {
            case 'RIDE_STARTED':
            case 'TRIP_UPDATE':
            case 'ride': return { name: 'bike', color: '#34C759', bg: isDarkTheme ? 'rgba(52, 199, 89, 0.15)' : '#E8F5E9' };
            case 'BOOKING_CONFIRMED':
            case 'DRIVER_ASSIGNED': return { name: 'check-circle-outline', color: '#007AFF', bg: isDarkTheme ? 'rgba(0, 122, 255, 0.15)' : '#EBF5FF' };
            case 'PROMO_CODE':
            case 'promo': return { name: 'ticket-percent', color: '#F9CA24', bg: isDarkTheme ? 'rgba(249, 202, 36, 0.15)' : '#FFF9E6' };
            case 'PAYMENT_SUCCESS':
            case 'wallet': return { name: 'wallet', color: '#34C759', bg: isDarkTheme ? 'rgba(52, 199, 89, 0.15)' : '#E8F5E9' };
            case 'BOOKING_CANCELLED': return { name: 'close-circle-outline', color: '#FF3B30', bg: isDarkTheme ? 'rgba(255, 59, 48, 0.15)' : '#FFF1F0' };
            default: return { name: 'bell-outline', color: '#8E8E93', bg: isDarkTheme ? 'rgba(142, 142, 147, 0.15)' : '#F2F2F7' };
        }
    };

    const handleNotificationPress = (item: Notification) => {
        dispatch(markAsRead(item.id));

        // Route based on notification data if available
        if (item.data?.tripId) {
            navigation.navigate(BookedTripScreen_Nav, { trip_id: item.data.tripId });
        }
    };

    const handleClearAll = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        dispatch(clearAll());
    };

    const handleRemove = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        dispatch(removeNotification(id));
    };

    const renderItem = ({ item }: { item: Notification }) => {
        const iconDetails = getIcon(item.type, isDark);
        const timeAgo = moment(item.time).fromNow();

        return (
            <TouchableOpacity
                style={[styles.notificationCard, { backgroundColor: appColors.card }, !item.read && [styles.unreadCard, { backgroundColor: appColors.card, borderLeftColor: colors.button }]]}
                activeOpacity={0.8}
                onPress={() => handleNotificationPress(item)}
            >
                <View style={[styles.iconBox, { backgroundColor: iconDetails.bg }]}>
                    <MaterialCommunityIcons name={iconDetails.name} size={mS(24)} color={iconDetails.color} />
                </View>

                <View style={styles.content}>
                    <View style={styles.row}>
                        <Text style={[styles.title, !item.read && styles.unreadText, { color: appColors.text }]} numberOfLines={1}>
                            {item.title}
                        </Text>
                        <Text style={[styles.time, { color: appColors.secondaryText }]}>{timeAgo}</Text>
                    </View>
                    <Text style={[styles.message, { color: appColors.secondaryText }]} numberOfLines={2}>{item.message}</Text>
                </View>

                <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleRemove(item.id)}
                >
                    <MaterialCommunityIcons name="close" size={mS(16)} color={appColors.secondaryText} />
                </TouchableOpacity>

                {!item.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: appColors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />

            <View style={[styles.header, { paddingTop: insets.top, backgroundColor: appColors.background, borderBottomColor: appColors.border }]}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <MaterialCommunityIcons name="chevron-left" size={mS(30)} color={appColors.text} />
                    </TouchableOpacity>
                    <View>
                        <Text style={[styles.headerTitle, { color: appColors.text }]}>Notifications</Text>
                        {notifications.length > 0 && (
                            <Text style={[styles.headerSubtitle, { color: appColors.secondaryText }]}>{notifications.length} notifications</Text>
                        )}
                    </View>
                    {notifications.length > 0 ? (
                        <TouchableOpacity onPress={handleClearAll} style={[styles.clearBtn, {
                            backgroundColor: isDark ? 'rgba(56, 189, 248, 0.1)' : '#EFF6FF',
                            borderColor: isDark ? 'rgba(56, 189, 248, 0.3)' : '#DBEAFE',
                        }]}>
                            <Text style={[styles.markReadText, {
                                color: isDark ? '#38BDF8' : colors.button,
                            }]}>Clear All</Text>
                        </TouchableOpacity>
                    ) : <View style={{ width: hS(60) }} />}
                </View>
            </View>

            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={[styles.listPadding, { paddingBottom: insets.bottom + vS(20) }]}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIconContainer, { backgroundColor: appColors.iconBox }]}>
                            <MaterialCommunityIcons name="bell-off-outline" size={mS(70)} color={appColors.secondaryText} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: appColors.text }]}>All caught up!</Text>
                        <Text style={[styles.emptySub, { color: appColors.secondaryText }]}>We'll notify you when something important arrives.</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FBFBFB',
    },
    header: {
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingBottom: vS(10),
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: hS(10),
        height: vS(60),
    },
    backBtn: {
        width: hS(40),
        height: hS(40),
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: mS(20),
        fontWeight: '700',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: mS(12),
        color: '#8E8E93',
        textAlign: 'center',
        fontWeight: '500',
    },
    clearBtn: {
        paddingHorizontal: hS(12),
        paddingVertical: vS(6),
        borderWidth: 1,
        borderRadius: mS(20),
    },
    markReadText: {
        fontSize: mS(13),
        fontWeight: '600',

    },
    listPadding: {
        paddingHorizontal: hS(16),
        paddingVertical: vS(20),
    },
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        padding: mS(16),
        marginBottom: vS(12),
        borderRadius: mS(20),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        position: 'relative',
        overflow: 'hidden',
    },
    unreadCard: {
        backgroundColor: '#FFFFFF',
        borderLeftWidth: 4,
        borderLeftColor: colors.button,
    },
    iconBox: {
        width: hS(54),
        height: hS(54),
        borderRadius: mS(18),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: hS(16),
    },
    content: {
        flex: 1,
        marginRight: hS(10),
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: vS(4),
    },
    title: {
        fontSize: mS(16),
        fontWeight: '600',
        color: '#1A1A1A',
        flex: 1,
    },
    unreadText: {
        fontWeight: '700',
    },
    message: {
        fontSize: mS(14),
        color: '#666',
        lineHeight: vS(20),
    },
    time: {
        fontSize: mS(11),
        color: '#999',
        fontWeight: '500',
    },
    unreadDot: {
        position: 'absolute',
        top: vS(16),
        right: hS(16),
        width: mS(8),
        height: mS(8),
        borderRadius: mS(4),
        backgroundColor: colors.button,
    },
    deleteBtn: {
        padding: mS(4),
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: vS(120),
        paddingHorizontal: hS(40),
    },
    emptyIconContainer: {
        width: hS(140),
        height: hS(140),
        borderRadius: hS(70),
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: vS(24),
    },
    emptyTitle: {
        fontSize: mS(22),
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: vS(8),
    },
    emptySub: {
        fontSize: mS(15),
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: vS(22),
    }
});

export default NotificationScreen;