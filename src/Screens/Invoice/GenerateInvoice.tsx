// import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { Alert, PermissionsAndroid, Platform } from "react-native";
import { getInvoiceHTML } from './invoiceTemplate';
import FileViewer from "react-native-file-viewer";
import RNFS from "react-native-fs";
import { sendInvoiceEmailApi } from "./sendInvoiceEmail";
import formatDate from "../../Components/FormatDate";
import { useNavigation } from "@react-navigation/native";
import { RootState } from '../../redux/store';
import { useDispatch, useSelector } from "react-redux";

interface SendInvoicePayload {
    recipient: string;
    filename: string;
    base64_data: string;
    invoiceId: string;
}

interface GeneratorProps {
    action: string;
    navigation: any;
    setIsLoading: (isLoading: boolean) => void;
    rideData?: object;
    localuser?: any;
}

// --- Constants ---

const generateInvoicePDF = async (
    navigation: any,
    action: string,
    setIsLoading: (isLoading: boolean) => void,
    rideData: any,
    localuser?: any
) => {
    // const navigation = useNavigation<any>();
    // const localuser = useSelector((state: RootState) => state?.userSlice?.user);
    setIsLoading(true);
    if (Platform.OS === 'android' && Platform.Version < 33) {
        await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
    }
    const RNHTMLtoPDF = require("react-native-html-to-pdf");
    const RECIPIENT_EMAIL = localuser.email || 'priyuuunicorn002@gmail.com';
    const INVOICE_ID = 'INV-4567';
    const date = formatDate(rideData.scheduled_start_time);
    const data = {
        invoiceId: rideData.trip_code,
        date: date,
        total: rideData.total_fare,
        pickupaddress: rideData.pickup_address || "73. Park Avenue, Velachery Rd, Sarathy Nagar, Velachery, Chennai, Tamil Nadu,600042, India",
        dropaddress: rideData.drop_address || "1545, 15th St, Kuberan Nagar, Madipakkam, Chennai, Tamil Nadu 600091, India",
        invoiceNum: "2526TN0038040094",
        gst: "33AAHCR1710J1ZN",
        vehiclenum: "TN58BF0392",
        captainname: rideData.driver_details.full_name,
        username: rideData.is_for_self ? localuser.full_name : rideData.passenger_details.name,
        RideCharge: rideData.base_fare,
        Allowance: rideData.driver_allowance,

    }
    const logoBase64 = await RNFS.readFileAssets('logo.png', 'base64');
    const mapimageBase64 = await RNFS.readFileAssets('invoicemap.png', 'base64');
    const html = getInvoiceHTML(data, logoBase64, mapimageBase64);
    let options = {
        html,
        fileName: `Invoice_${data.invoiceId}`,
        base64: true
    };

    let file;
    try {

        try {
            // 4. Generate PDF
            // Note: The method is usually generatePDF or convert, depending on the exact library wrapper
            file = await RNHTMLtoPDF.generatePDF(options);

            if (!file || (!file.filePath && !file.base64)) {
                throw new Error("PDF generation failed to return file data.");
            }

        } catch (error) {
            // console.error("RNHTMLtoPDF generation error:", error);
            Alert.alert("PDF Error", "Failed to generate the PDF file.");
            return;
        }

        if (action === 'email') {
            // --- ACTION: SEND VIA EMAIL ---
            if (!file.base64) {
                Alert.alert("Error", "Base64 data is missing, cannot email.");
                return;
            }

            const payload: SendInvoicePayload = {
                recipient: RECIPIENT_EMAIL,
                filename: `${options.fileName}.pdf`, // Use the configured file name
                base64_data: file.base64,
                invoiceId: data.invoiceId,
            };

            try {
                // Send Base64 data to the backend API
                const message = await sendInvoiceEmailApi(payload);
                Alert.alert('Success', message);
            } catch (error) {
                Alert.alert('Email Failed', (error as Error).message);
            }

        }
        if (action === 'display') {

            if (file.base64) {
                // If you navigate with Base64, you don't need the file path.
                navigation.navigate("PDFViewerScreen", { base64: file.base64 });
            } else if (file.filePath) {
                // Fallback or secondary navigation method
                navigation.navigate("PDFViewerScreen", { filePath: file.filePath });
            } else {
                Alert.alert("Navigation Error", "Could not get file content for viewing.");
            }
        }
    }
    catch (error) {
        // console.error("Critical error in generateInvoicePDF:", error);
        Alert.alert("Process Error", `An error occurred: ${(error as Error).message}`);
        Alert.alert("Process Error", `An error occurred while generating PDF`);
    } finally {
        setIsLoading(false);
    }


};


export default generateInvoicePDF;