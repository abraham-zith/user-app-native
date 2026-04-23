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
import { useGetAvailableCouponsQuery } from '../../service/couponApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const { width } = Dimensions.get('window');

const OFFERS = [
  {
    id: '1',
    title: 'First Ride Discount',
    description: 'Get 50% discount on your first ride with VDrive.',
    code: 'WELCOME50',
    discount: '50%',
    expiry: 'Valid until 30 Apr 2026',
    icon: 'ticket-percent-outline',
    tag: 'NEW USER',
  },
  {
    id: '2',
    title: 'Summer Sale',
    description: 'Flat ₹100 off on any outstation trips.',
    code: 'SUMMERFLAT',
    discount: '₹100',
    expiry: 'Valid until 15 May 2026',
    icon: 'weather-sunny',
    tag: 'OUTSTATION',
  },
  {
    id: '3',
    title: 'Weekend Special',
    description: '20% off on weekend city rides.',
    code: 'WEEKEND20',
    discount: '20%',
    expiry: 'Valid until 28 Apr 2026',
    icon: 'calendar-star',
    tag: 'WEEKEND',
  },
  {
    id: '4',
    title: 'Referral Bonus',
    description: 'Refer a friend and get ₹50 off on your next trip.',
    code: 'REFER50',
    discount: '₹50',
    expiry: 'No Expiry',
    icon: 'account-group-outline',
    tag: 'REFERRAL',
  },
];

const OfferCard = ({ item, index, isDark, colors }: any) => {
  const handleCopyCode = () => {
    Clipboard.setString(item.code);
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

  const { data: availableCoupons, isLoading: isFetching } = useGetAvailableCouponsQuery(userId || localuser?.id, {
    skip: !visible,
  });
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <FlatList
        data={OFFERS}
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
          <OfferCard item={item} index={index} isDark={isDark} colors={colors} />
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
