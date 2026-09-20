import { Linking } from 'react-native';

export interface UPIPaymentParams {
  payeeUpiId: string;
  payeeName: string;
  amount: number;
  currency?: string;
  transactionNote?: string;
}

/**
 * Builds the standard NPCI UPI Intent URI.
 */
export function buildUPIUri({
  payeeUpiId,
  payeeName,
  amount,
  currency = 'INR',
  transactionNote = 'TTMM Settlement',
}: UPIPaymentParams): string {
  const encodedName = encodeURIComponent(payeeName);
  const encodedNote = encodeURIComponent(transactionNote);
  const formattedAmount = amount.toFixed(2);

  return `upi://pay?pa=${payeeUpiId}&pn=${encodedName}&am=${formattedAmount}&cu=${currency}&tn=${encodedNote}`;
}

/**
 * Launches the device UPI app (Google Pay, PhonePe, Paytm, etc.) via deep linking.
 */
export async function launchUPIPayment(params: UPIPaymentParams): Promise<boolean> {
  const uri = buildUPIUri(params);
  try {
    const supported = await Linking.canOpenURL(uri);
    if (supported) {
      await Linking.openURL(uri);
      return true;
    } else {
      console.warn('No UPI application found on device to handle URI:', uri);
      return false;
    }
  } catch (error) {
    console.error('Failed to trigger UPI deep link:', error);
    return false;
  }
}
