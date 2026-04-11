import { TouchableOpacity, View } from "react-native";
import { Text } from "../../../Components";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { useAppTheme } from "../../../hooks/useAppTheme";


interface RiderOptionProps {
    label: string;
    subLabel: string;
    icon: string;
    isSelected: boolean;
    onPress: () => void;
    onDelete?: () => void; // Optional delete action
}

const RiderOption: React.FC<RiderOptionProps> = ({
    label,
    subLabel,
    icon,
    isSelected,
    onPress,
    onDelete
}) => {
    const { colors, isDark } = useAppTheme();
    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 16,
                paddingHorizontal: 15,
                borderRadius: 12,
                marginBottom: 10,
                backgroundColor: isSelected ? (isDark ? 'rgba(96, 165, 250, 0.15)' : '#F3F4F6') : colors.card,
                borderWidth: 1,
                borderColor: isSelected ? (isDark ? colors.primary : colors.button) : colors.border,
            }}
        >
            <View style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: isSelected ? (isDark ? colors.primary : colors.button) : colors.iconBox,
                justifyContent: 'center', alignItems: 'center', marginRight: 12
            }}>
                <MaterialCommunityIcons name={icon} size={22} color={isSelected ? "#FFF" : colors.secondaryText} />
            </View>

            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: isSelected ? '700' : '500', color: colors.text }}>
                    {label}
                </Text>
                <Text style={{ color: colors.secondaryText, fontSize: 12 }}>{subLabel}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {onDelete && (
                    <TouchableOpacity
                        onPress={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        style={{ padding: 8, marginRight: 4 }}
                    >
                        <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                )}
                <MaterialCommunityIcons
                    name={isSelected ? "radiobox-marked" : "radiobox-blank"}
                    size={22}
                    color={isSelected ? (isDark ? colors.primary : colors.button) : colors.border}
                />
            </View>
        </TouchableOpacity>
    );
};

export default RiderOption