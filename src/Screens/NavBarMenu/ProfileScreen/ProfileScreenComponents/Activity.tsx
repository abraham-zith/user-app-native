import { View } from "react-native";
import { Text } from "../../../../Components";
import { Styles } from "../../../../lib/styles";
import Activity from "../../ActivityScreen";

export default function ActivityScreen() {
    return (
        <View style={[Styles.flex]}>
            <Activity />
        </View>

    )
}
