import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Modal,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Clipboard from '@react-native-clipboard/clipboard';
import Share from 'react-native-share';
import { useAppTheme } from '../../../../hooks/useAppTheme';
import { hS, vS, mS } from '../../../../lib/responsive';
import colors from '../../../../constant/colors';

const ReferAndEarn = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors: appColors, isDark } = useAppTheme();
  const [referralCode] = useState('VDRIVE500'); // This would normally come from user data
  const [showCopyAlert, setShowCopyAlert] = useState(false);

  const steps = [
    { id: 1, title: 'Invite Friends', desc: 'Share your code with friends and family.', icon: 'account-plus-outline' },
    { id: 2, title: 'They Register', desc: 'They get ₹50 off on their first ride.', icon: 'card-account-details-outline' },
    { id: 3, title: 'You Earn', desc: 'You get ₹100 once they complete a ride.', icon: 'wallet-giftcard' },
  ];

  const handleCopyCode = () => {
    Clipboard.setString(referralCode);
    setShowCopyAlert(true);
  };

  const handleShare = async () => {
    try {
      await Share.open({
        title: 'Refer & Earn',
        message: `Join me on V-Drive and get ₹50 off your first ride! Use my referral code: ${referralCode}`,
        url: 'https://vdrive.com/download',
      });
    } catch (error) {
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: appColors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={appColors.card} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: appColors.card, borderBottomColor: appColors.border }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: appColors.iconBox }]}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={mS(24)} color={appColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: appColors.text }]}>Refer & Earn</Text>
        <View style={{ width: mS(40) }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="gift-outline" size={mS(50)} color="#FFFFFF" />
          </View>
          <Text style={[styles.heroTitle, { color: appColors.text }]}>Refer Friends & Earn Cash</Text>
          <Text style={[styles.heroDesc, { color: appColors.lightTextColor }]}>
            Spread the word about V-Drive and get rewarded for every friend who joins.
          </Text>
        </View>

        {/* Referral Code Card */}
        <View style={[styles.promoCard, { backgroundColor: appColors.card, borderColor: appColors.border }]}>
          <Text style={[styles.promoLabel, { color: appColors.lightTextColor }]}>Your Referral Code</Text>
          <TouchableOpacity
            style={[styles.codeRow, { backgroundColor: appColors.background }]}
            activeOpacity={0.8}
            onPress={handleCopyCode}
          >
            <Text style={[styles.codeText, { color: appColors.text }]}>{referralCode}</Text>
            <View style={[styles.copyBadge, isDark && { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
              <MaterialCommunityIcons name="content-copy" size={mS(16)} color={isDark ? '#60A5FA' : '#3B82F6'} />
              <Text style={[styles.copyText, isDark && { color: '#60A5FA' }]}>COPY</Text>
            </View>
          </TouchableOpacity>
          <Text style={[styles.tapTip, { color: appColors.lightTextColor }]}>Tap code to copy and share manually</Text>
        </View>

        {/* Sharing Options */}
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <MaterialCommunityIcons name="share-variant" size={mS(20)} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>Share Referral Link</Text>
        </TouchableOpacity>

        {/* Stats Section */}
        <View style={[styles.statsContainer, { backgroundColor: isDark ? appColors.card : '#1E293B', borderWidth: isDark ? 1 : 0, borderColor: appColors.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, isDark && { color: appColors.text }]}>12</Text>
            <Text style={[styles.statLabel, isDark && { color: appColors.lightTextColor }]}>Total Referrals</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, isDark && { color: appColors.text }]}>₹1,200</Text>
            <Text style={[styles.statLabel, isDark && { color: appColors.lightTextColor }]}>Total Earned</Text>
          </View>
        </View>

        {/* How it Works Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: appColors.text }]}>How it works</Text>
        </View>

        <View style={[styles.stepsContainer, { backgroundColor: appColors.card, borderColor: appColors.border }]}>
          {steps.map((step, index) => (
            <View key={step.id} style={styles.stepItem}>
              <View style={[styles.stepIconBox, { backgroundColor: appColors.iconBox }]}>
                <MaterialCommunityIcons name={step.icon} size={mS(24)} color={isDark ? appColors.text : colors.button} />
                <View style={[styles.stepNumberBadge, { backgroundColor: isDark ? appColors.text : '#1E293B', borderColor: appColors.card }]}>
                  <Text style={[styles.stepNumberText, isDark && { color: appColors.card }]}>{index + 1}</Text>
                </View>
              </View>
              <View style={styles.stepContentView}>
                <Text style={[styles.stepTitle, { color: appColors.text }]}>{step.title}</Text>
                <Text style={[styles.stepDesc, { color: appColors.lightTextColor }]}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Terms Link */}
        <TouchableOpacity style={styles.termsButton}>
          <Text style={[styles.termsText, { color: appColors.lightTextColor }]}>View Terms & Conditions</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Premium In-App Alert Modal */}
      <Modal statusBarTranslucent navigationBarTranslucent         visible={showCopyAlert}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.alertBox, { backgroundColor: appColors.card, borderColor: appColors.border }]}>
            <View style={[styles.alertIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <MaterialCommunityIcons name="check-circle" size={mS(36)} color="#10B981" />
            </View>
            <Text style={[styles.alertTitle, { color: appColors.text }]}>Copied!</Text>
            <Text style={[styles.alertDesc, { color: appColors.lightTextColor }]}>
              Referral code has been copied to your clipboard.
            </Text>
            <TouchableOpacity
              style={styles.alertButton}
              onPress={() => setShowCopyAlert(false)}
            >
              <Text style={styles.alertButtonText}>OK, Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: hS(16),
    paddingVertical: vS(16),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: mS(40),
    height: mS(40),
    borderRadius: mS(20),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: mS(18),
    fontWeight: '800',
    color: '#1E293B',
  },
  scrollContent: {
    padding: hS(20),
    paddingBottom: vS(40),
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: vS(32),
    marginTop: vS(10),
  },
  iconCircle: {
    width: mS(100),
    height: mS(100),
    borderRadius: mS(50),
    backgroundColor: colors.button,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vS(20),
    shadowColor: colors.button,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  heroTitle: {
    fontSize: mS(24),
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: vS(8),
  },
  heroDesc: {
    fontSize: mS(15),
    color: '#64748B',
    textAlign: 'center',
    lineHeight: vS(22),
    paddingHorizontal: hS(10),
  },
  promoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: mS(24),
    padding: hS(24),
    alignItems: 'center',
    marginBottom: vS(20),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  promoLabel: {
    fontSize: mS(14),
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: vS(16),
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: hS(20),
    paddingVertical: vS(12),
    borderRadius: mS(16),
  },
  codeText: {
    fontSize: mS(24),
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: 2,
    marginRight: hS(12),
  },
  copyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: hS(8),
    paddingVertical: vS(4),
    borderRadius: mS(8),
  },
  copyText: {
    fontSize: mS(10),
    fontWeight: '800',
    color: '#3B82F6',
    marginLeft: hS(4),
  },
  tapTip: {
    fontSize: mS(12),
    color: '#94A3B8',
    marginTop: vS(12),
    fontWeight: '500',
  },
  shareButton: {
    backgroundColor: colors.button,
    height: vS(56),
    borderRadius: mS(18),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vS(32),
    shadowColor: colors.button,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: mS(16),
    fontWeight: '800',
    marginLeft: hS(10),
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: mS(20),
    paddingVertical: vS(20),
    marginBottom: vS(32),
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: mS(20),
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: vS(4),
  },
  statLabel: {
    fontSize: mS(12),
    color: '#94A3B8',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#334155',
    alignSelf: 'center',
  },
  sectionHeader: {
    marginBottom: vS(16),
  },
  sectionTitle: {
    fontSize: mS(18),
    fontWeight: '800',
    color: '#1E293B',
  },
  stepsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: mS(24),
    padding: hS(20),
    marginBottom: vS(32),
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: vS(24),
  },
  stepIconBox: {
    width: mS(52),
    height: mS(52),
    borderRadius: mS(16),
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: hS(16),
  },
  stepNumberBadge: {
    position: 'absolute',
    top: -mS(5),
    right: -mS(5),
    width: mS(20),
    height: mS(20),
    borderRadius: mS(10),
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: mS(10),
    fontWeight: '800',
  },
  stepContentView: {
    flex: 1,
    paddingTop: vS(4),
  },
  stepTitle: {
    fontSize: mS(16),
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: vS(4),
  },
  stepDesc: {
    fontSize: mS(14),
    color: '#64748B',
    lineHeight: vS(20),
    fontWeight: '500',
  },
  termsButton: {
    alignItems: 'center',
    paddingVertical: vS(10),
  },
  termsText: {
    fontSize: mS(13),
    color: '#94A3B8',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: hS(24),
  },
  alertBox: {
    width: '100%',
    padding: hS(24),
    borderRadius: mS(24),
    alignItems: 'center',
    borderWidth: 1,
  },
  alertIconBox: {
    width: mS(64),
    height: mS(64),
    borderRadius: mS(32),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vS(16),
  },
  alertTitle: {
    fontSize: mS(22),
    fontWeight: '800',
    marginBottom: vS(8),
    textAlign: 'center',
  },
  alertDesc: {
    fontSize: mS(14),
    textAlign: 'center',
    marginBottom: vS(24),
    lineHeight: vS(20),
  },
  alertButton: {
    width: '100%',
    backgroundColor: colors.button,
    paddingVertical: vS(14),
    borderRadius: mS(16),
    alignItems: 'center',
  },
  alertButtonText: {
    color: '#FFFFFF',
    fontSize: mS(15),
    fontWeight: '800',
  },
});

export default ReferAndEarn;