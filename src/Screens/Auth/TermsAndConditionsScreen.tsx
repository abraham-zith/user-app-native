import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { hS, vS, mS } from '../../lib/responsive';

const TermsAndConditionsScreen: React.FC<any> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors: appColors } = useAppTheme();

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: appColors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={mS(24)} color={appColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: appColors.text }]}>Terms & Conditions</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.dummyText, { color: appColors.text }]}>
          1. Introduction
          Welcome to T2Drive. These Terms and Conditions govern your use of our application.

          2. User Agreement
          By accessing and using our application, you agree to be bound by these terms. If you do not agree to all the terms and conditions, then you may not access the application.

          3. Privacy Policy
          Your use of the application is also subject to our Privacy Policy, which is incorporated into these terms by reference.

          4. User Responsibilities
          You are responsible for your use of the application and for any consequences thereof. You must use the application in compliance with all applicable laws and regulations.

          5. Modifications
          We reserve the right to modify these terms at any time. We will notify you of any changes by posting the new terms on this page.

          6. Termination
          We may terminate or suspend your access to the application immediately, without prior notice or liability, for any reason whatsoever.

          (This is a dummy Terms & Conditions page)
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

export default TermsAndConditionsScreen;
