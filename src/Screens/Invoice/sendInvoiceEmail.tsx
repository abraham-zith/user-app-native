import { storage } from "../../service/utils/storage";
import Config from "react-native-config";

interface SendInvoicePayload {
    recipient: string;
    filename: string;
    base64_data: string; // The Base64 string of the generated PDF
    invoiceId: string;   // Identifier for the backend to use in the email subject
}


// const BASE_URL = "http://10.0.2.2:1234/api";
// const BASE_URL = "http://192.168.29.104:1234/api";
const BASE_URL = `${Config.DEV_BACKEND_URL}/api`;
// const BASE_URL = "https://noncruciformly-unsupplicated-rosalinda.ngrok-free.dev/api";
const INVOICE_API_URL = `${BASE_URL}/invoices/send`;

/**
 * Sends the generated PDF's Base64 content to the backend for emailing via Nodemailer.
 * * @param payload The structured data containing recipient, filename, and the Base64 string.
 * @returns A promise resolving to the success message from the backend.
 * @throws An error with a descriptive message if the API call fails or input is invalid.
 */
export const sendInvoiceEmailApi = async (payload: SendInvoicePayload): Promise<string> => {

    // --- Basic Input Validation ---
    if (!payload.base64_data || !payload.recipient || !payload.filename) {
        throw new Error('API Payload Error: Missing recipient, filename, or Base64 data.');
    }

    try {
        const token = await storage.getAccessToken();
        const response = await fetch(INVOICE_API_URL, {
            method: 'POST',
            // Crucial: Set content type to JSON
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                // Add Authorization header here if needed (e.g., 'Bearer ' + userToken)
            },
            // Convert the JavaScript object to a JSON string for transmission
            // Base64 strings are large, so this body might be several megabytes
            body: JSON.stringify(payload),
        });

        // Attempt to parse JSON from the response body
        const responseData = await response.json();

        if (response.ok) {
            return responseData.message || 'Invoice email queued successfully.';
        } else {
            const errorMessage = responseData.message || responseData.error || 'Unknown server error.';
            throw new Error(`Server Error (${response.status}): ${errorMessage}`);
        }

    } catch (error) {
        let message = 'Could not reach the invoice server. Check network connection.';

        if (error instanceof Error) {
            message = `API Request Failed: ${error.message}`;
        }
        throw new Error(message);
    }
};