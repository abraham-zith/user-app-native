import { View } from "react-native";
import { Text } from "../../../../Components";
import { Styles } from "../../../../lib/styles";
import HelpScreen from "../../../HelpScreen";

export default function Help() {
    return (
        <View style={[Styles.flex]}>
            <HelpScreen />
        </View>
    )
}