import {
  View,
  StyleSheet,
  TextStyle,
  ViewStyle,
  TouchableOpacity,
  Modal,
  ListRenderItem,
  Text,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import React, {
  ReactComponentElement,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Styles } from '../lib/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';
import Input from './Input';
import { DownArrowIcon } from '../assets/svg';
import fonts from '../constant/fonts';

type DropDownDataType = {
  label: string;
  value: string;
  [x: string]: any;
};

interface DropDownProps {
  data: DropDownDataType[];
  value?: string;
  label?: string;
  labelStyle?: TextStyle | TextStyle[];
  placeHolde?: string;
  containerStyle?: ViewStyle | ViewStyle[];
  error?: string;
  renderItem?: any;
  renderTrigger?: (selectedItem: DropDownDataType | undefined) => React.ReactElement;
  onSelect?: (value: string) => void;
  searchBar?: boolean;
  border?: boolean;
  disabled?: boolean;
}
const DropDown: React.FC<DropDownProps> = ({
  data,
  label,
  labelStyle,
  placeHolde,
  containerStyle,
  value,
  onSelect = () => { },
  renderItem,
  renderTrigger,
  error,
  searchBar = true,
  border = true,
  disabled = false,
}) => {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [modal, setModal] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [filteredData, setFilteredData] = useState<DropDownDataType[]>(data);

  const searchAction = useCallback(
    (text: string) => {
      setSearch(text);
      let filteredItem = data.filter(item =>
        Object.values(item).some(val =>
          val.toLowerCase().includes(text.toLowerCase()),
        ),
      );
      setFilteredData(filteredItem);
    },
    [data],
  );

  useEffect(() => {
    if (modal) {
      setFilteredData(data);
    }
  }, [data, modal]);

  const _renderItem = useCallback(
    ({ item, index }: { item: DropDownDataType; index: number }) => {
      return (
        <TouchableOpacity
          key={index}
          onPress={() => {
            onSelect(item.value);
            setModal(false);
            setSearch('');
          }}
          style={[
            Styles.p4,
            Styles.br2,
            {
              backgroundColor: colors.background,
            },
          ]}>
          {renderItem ? (
            renderItem({ item, index })
          ) : (
            <Text
              style={[
                value === item?.value ? fonts.bold : fonts.regular,
                {
                  color: value === item?.value ? colors.primary : colors.text,
                },
              ]}>
              {item.label}
            </Text>
          )}
        </TouchableOpacity>
      );
    },
    [
      value,
      colors.card,
      colors.background,
      colors.primary,
      colors.text,
      fonts.bold,
      fonts.regular,
      onSelect,
    ],
  );
  return (
    <View style={containerStyle}>
      {label ? (
        <Text
          style={[
            fonts.medium,
            Styles.mb2,
            { color: colors.primary },
            labelStyle,
          ]}>
          {label}
        </Text>
      ) : null}
      <TouchableOpacity
        disabled={disabled}
        onPress={() => setModal(true)}
        style={!renderTrigger && [
          Styles.flexRow,
          border ? Styles.bw1 : null,
          Styles.br2,
          Styles.px2,
          Styles.alignItemsCenter,
          styles.container,
          { borderColor: colors.searchBorder, height: 55 },
        ]}
      >
        {renderTrigger ? (
          renderTrigger(data.find(x => x.value === value))
        ) : (
          <>
            <Text
              ellipsizeMode="tail"
              numberOfLines={1}
              style={[
                Styles.flex,
                Styles.pl2,
                {
                  color: value ? colors.border : colors.card,
                },
              ]}>
              {value
                ? data.find(x => x.value === value)?.label
                : label
                  ? `Select ${label}`
                  : placeHolde
                    ? placeHolde
                    : ''}
            </Text>
            {disabled ? null : <DownArrowIcon />}
          </>
        )}
      </TouchableOpacity>
      {error ? (
        <Text style={[fonts.regular, Styles.mt2, { color: colors.error }]}>
          {error}
        </Text>
      ) : null}
      <Modal statusBarTranslucent navigationBarTranslucent visible={modal}
        animationType="slide"
        transparent
        presentationStyle="overFullScreen"
        onRequestClose={() => {
          setModal(false);
          setSearch('');
        }}>
        <TouchableWithoutFeedback
          onPress={() => {
            setModal(false);
            setSearch('');
          }}>
          <View style={[Styles.flex, { backgroundColor: colors.modalOverlay || (isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)') }]}>
            {/* <TouchableWithoutFeedback
              onPress={() => setModal(false)}
              style={[Styles.flex]}
            /> */}
            <View
              style={[
                styles.flatList,
                Styles.mtAuto,
                Styles.px4,
                Styles.pt4,
                {
                  backgroundColor: colors.background,
                  marginBottom: insets.bottom,
                },
              ]}>
              <View
                style={[
                  Styles.mb4,
                  Styles.alignItemsCenter,
                  Styles.justifyContentCenter,
                  Styles.flexRow,
                  Styles.hrLine,
                  { borderColor: colors.border },
                ]}>
                <Text
                  style={[
                    fonts.medium,
                    Styles.mb2,
                    { color: colors.primary },
                    labelStyle,
                  ]}>
                  {label ? `Select ${label}` : 'Select Item'}
                </Text>
                {/* <Ionicons
                name="close"
                size={24}
                color={colors.primary}
                style={styles.close}
                onPress={() => setModal(false)}
              /> */}
              </View>
              {searchBar ? (
                <Input
                  value={search}
                  onChangeText={(text: string) => searchAction(text)}
                  placeholder="Search"
                  placeholderTextColor={colors.lightTextColor}
                  // LeadingAccessory={
                  //   <Ionicons name="search" color={colors.primary} size={24} />
                  // }
                  containerStyle={Styles.mb4}
                />
              ) : null}
              <FlatList
                data={filteredData}
                renderItem={_renderItem}
                keyExtractor={(_, index) => `${index}`}
                style={[Styles.flex]}
                contentContainerStyle={[Styles.flexGrow]}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 44,
  },
  flatList: {
    height: 500,
  },
  close: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
  },
});

export default React.memo(DropDown);
