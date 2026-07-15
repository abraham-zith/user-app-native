import { View } from "react-native";
import { Text } from "../../../../Components";
import { Styles } from "../../../../lib/styles";
import Activity from "../../ActivityScreen";

export default function ActivityScreen({ navigation }: any) {
    return (
        <View style={[Styles.flex]}>
            <Activity navigation={navigation} />
        </View>

    )
}
