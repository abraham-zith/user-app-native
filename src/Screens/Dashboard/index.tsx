import { TouchableOpacity, View } from 'react-native';
import React from 'react';
import { Styles } from '../../lib/styles';
import {
  Car,
  CarPng,
  // Distance, 
  // Earnings, 
  Settings
} from '../../assets/svg';
import { Text } from '../../Components';
import { useTheme } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const DashBoardScreen = () => {
  const { colors, fonts } = useTheme();
  const user: any = useSelector((state: RootState) => state.userSlice.user);
  return (
    <View style={[Styles.flex, { backgroundColor: colors.card }]}>
      <View style={[Styles.alignItemsCenter, Styles.justifyContentFlexEnd]}>
        <Car />
      </View>
      <View
        style={[
          Styles.shadow,
          Styles.bw1,
          Styles.flexGrow,
          Styles.btlr4,
          Styles.p6,
          Styles.btrr4,
          Styles.g4,
          { backgroundColor: colors.background },
        ]}>
        <View style={[Styles.flexRow, Styles.alignItemsCenter, Styles.g2]}>
          <View>
            <Text
              style={[
                Styles.fs24,
                Styles.mb2,
                fonts.bold,
                Styles.capitalize,
                { color: colors.primary },
              ]}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text numberOfLines={2} style={[{ color: colors.primary }]}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </Text>
          </View>
          <TouchableOpacity
            style={[Styles.circleIcon, { backgroundColor: colors.card }]}>
            <Settings width={20} height={20} />
          </TouchableOpacity>
        </View>

        <View style={[Styles.g2]}>
          <Text style={[Styles.fs18, fonts.bold, { color: colors.primary }]}>
            Overview
          </Text>
          <View
            style={[
              Styles.flexRow,
              Styles.alignItemsCenter,
              Styles.justifyContentSpaceBetween,
            ]}>
            <View style={[Styles.card1]}>
              {/* <Earnings /> */}
              <Text style={[Styles.fs12]}>Today Earnings</Text>
              <Text style={[Styles.fs18, fonts.medium]}>$400</Text>
            </View>
            <View style={[Styles.card1]}>
              <CarPng />
              <Text style={[Styles.fs12]}>Total Rides</Text>
              <Text style={[Styles.fs18, fonts.medium]}>24</Text>
            </View>
            <View style={[Styles.card1]}>
              {/* <Distance /> */}
              <Text style={[Styles.fs12]}>Total km</Text>
              <Text style={[Styles.fs18, fonts.medium]}>50km</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default DashBoardScreen;
