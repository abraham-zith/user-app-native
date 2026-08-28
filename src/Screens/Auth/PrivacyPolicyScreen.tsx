import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { hS, vS, mS } from '../../lib/responsive';

const PrivacyPolicyScreen: React.FC<any> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors: appColors } = useAppTheme();

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: appColors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={mS(24)} color={appColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: appColors.text }]}>Privacy Policy</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.dummyText, { color: appColors.text }]}>
          1. Information We Collect
          We collect information you provide directly to us, such as when you create or modify your account.

          2. How We Use Information
          We use the information we collect to provide, maintain, and improve our services, as well as to develop new services.

          3. Sharing of Information
          We may share your information with third-party vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.

          4. Data Security
          We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access.

          5. Your Choices
          You may update or correct information about yourself at any time by logging into your account.

          (This is a dummy Privacy Policy page)
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: hS(20),
    paddingVertical: vS(15),
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    paddingRight: hS(15),
  },
  headerTitle: {
    fontSize: mS(18),
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: hS(20),
    paddingVertical: vS(20),
  },
  dummyText: {
    fontSize: mS(14),
    lineHeight: mS(24),
  },
});

export default PrivacyPolicyScreen;
