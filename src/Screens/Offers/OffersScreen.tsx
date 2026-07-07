import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  Alert,
  ToastAndroid,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeInDown,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { hS, vS, mS } from '../../lib/responsive';
import Clipboard from '@react-native-clipboard/clipboard';
import { useGetAvailableCouponsQuery, useSubscribeToCouponTopicMutation } from '../../service/couponApi';
import messaging from '@react-native-firebase/messaging';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const { width } = Dimensions.get('window');



const OfferCard = ({ item, index, isDark, colors, userId }: any) => {
  const [subscribeToCoupon] = useSubscribeToCouponTopicMutation();

  const isLimitReached = item.per_user_limit && item.user_usage_count >= item.per_user_limit;

  const handleCopyCode = async () => {
    if (isLimitReached) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('You have already used this coupon to its limit.', ToastAndroid.SHORT);
      } else {
        Alert.alert('Limit Reached', 'You have already used this coupon to its limit.');
      }
      return;
    }

    Clipboard.setString(item.code);

    try {
      const fcmToken = await messaging().getToken();
      if (userId && fcmToken) {
        await subscribeToCoupon({ userId, couponCode: item.code, fcmToken }).unwrap();
      }
    } catch (error) {
      console.log('Error subscribing to topic', error);
    }
    // You could add a toast here if available
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 150).springify().damping(12)}
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.card : '#FFFFFF',
          borderColor: isDark ? colors.border : '#E2E8F0',
          shadowColor: isDark ? '#000' : '#64748B',
          opacity: isLimitReached ? 0.6 : 1,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
          <MaterialCommunityIcons name={item.icon} size={mS(28)} color={colors.primary} />
        </View>
        <View style={[styles.tagContainer, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF' }]}>
          <Text style={[styles.tagText, { color: colors.primary }]}>{item.tag}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.discountText, { color: colors.primary }]}>{item.discount}</Text>
        </View>
        <Text style={[styles.description, { color: colors.lightTextColor }]}>{item.description}</Text>
        {item.per_user_limit ? (
          <Text style={[styles.usageText, { color: isLimitReached ? '#EF4444' : colors.secondaryText }]}>
            {item.user_usage_count || 0} out of {item.per_user_limit} used
          </Text>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.codeContainer}>
            <Text style={[styles.expiryText, { color: colors.secondaryText }]}>{item.expiry}</Text>
            <TouchableOpacity
              onPress={handleCopyCode}
              style={[styles.codeBox, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: colors.border }]}
            >
              <Text style={[styles.codeText, { color: colors.text }]}>{item.code}</Text>
              <MaterialCommunityIcons name="content-copy" size={mS(14)} color={colors.primary} style={{ marginLeft: hS(4) }} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Decorative Gradient-like elements */}
      <View style={[styles.circleDecorator, { backgroundColor: colors.primary, opacity: 0.05 }]} />
    </Animated.View>
  );
};

const OffersScreen: React.FC = () => {
  const { colors, isDark } = useAppTheme();
  const localuser = useSelector((state: RootState) => state.userSlice.user);
  const userId = localuser?.id;
  const visible = true;

  const { data: availableCoupons, isLoading: isFetching } = useGetAvailableCouponsQuery(undefined, {
    skip: !visible,
  });

  const mappedCoupons = React.useMemo(() => {
    if (!availableCoupons) return [];

    // Safely extract the array whether it's directly returned or wrapped in a data object
    const couponsArray = Array.isArray(availableCoupons)
      ? availableCoupons
      : (availableCoupons.data || availableCoupons.coupons || []);

    if (!Array.isArray(couponsArray)) return [];

    return couponsArray.map((coupon: any) => ({
      id: coupon.id || coupon._id || coupon.code || Math.random().toString(),
      title: coupon.discount_type === 'PERCENTAGE' ? 'Percentage Discount' : 'Flat Discount',
      description: `Min. ride amount: ₹${coupon.min_ride_amount || 0}. Enjoy your ride with T2Drive!`,
      code: coupon.code || '',
      discount: coupon.discount_type === 'PERCENTAGE' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`,
      expiry: coupon.valid_until ? `Valid until ${new Date(coupon.valid_until).toLocaleDateString()}` : 'No Expiry',
      icon: 'ticket-percent-outline',
      tag: 'PROMO',
      per_user_limit: coupon.per_user_limit,
      user_usage_count: coupon.user_usage_count,
    }));
  }, [availableCoupons]);
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <FlatList
        data={mappedCoupons}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={[styles.headerSubtitle, { color: colors.lightTextColor }]}>
              Exciting discounts and rewards just for you!
            </Text>
          </View>
        )}
        renderItem={({ item, index }) => (
          <OfferCard item={item} index={index} isDark={isDark} colors={colors} userId={userId} />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="ticket-outline" size={mS(80)} color={colors.secondaryText} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No offers available right now</Text>
            <Text style={[styles.emptySubText, { color: colors.lightTextColor }]}>Check back later for new promotions</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: hS(20),
    paddingBottom: vS(40),
  },
  header: {
    marginBottom: vS(20),
  },
  headerSubtitle: {
    fontSize: mS(14),
    fontWeight: '500',
    opacity: 0.8,
  },
  card: {
    borderRadius: mS(16),
    padding: mS(16),
    marginBottom: vS(20),
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vS(12),
  },
  iconContainer: {
    width: mS(50),
    height: mS(50),
    borderRadius: mS(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagContainer: {
    paddingHorizontal: hS(12),
    paddingVertical: vS(6),
    borderRadius: mS(20),
  },
  tagText: {
    fontSize: mS(10),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: vS(8),
  },
  title: {
    fontSize: mS(18),
    fontWeight: '700',
    flex: 1,
  },
  discountText: {
    fontSize: mS(20),
    fontWeight: '800',
    marginLeft: hS(10),
  },
  description: {
    fontSize: mS(13),
    lineHeight: mS(20),
    marginBottom: vS(8),
  },
  usageText: {
    fontSize: mS(12),
    fontWeight: '600',
    marginBottom: vS(16),
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: vS(16),
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expiryText: {
    fontSize: mS(11),
    fontWeight: '500',
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: hS(12),
    paddingVertical: vS(8),
    borderRadius: mS(8),
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  codeText: {
    fontSize: mS(13),
    fontWeight: '700',
    letterSpacing: 1,
  },
  circleDecorator: {
    position: 'absolute',
    right: -mS(30),
    top: -mS(30),
    width: mS(100),
    height: mS(100),
    borderRadius: mS(50),
  },
  emptyContainer: {
    flex: 1,
    height: vS(500),
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: mS(18),
    fontWeight: '700',
    marginTop: vS(20),
  },
  emptySubText: {
    fontSize: mS(14),
    marginTop: vS(8),
  },
});

export default OffersScreen;
