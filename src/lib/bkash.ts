
/**
 * bKash Payment Utility for BanglaMart
 * Handles Token Generation, Payment Creation, and Execution
 */

export const bKash = {
    /**
     * Generate an ID Token for bKash authentication
     */
    getToken: async () => {
        const BKASH_USERNAME = process.env.BKASH_USERNAME;
        const BKASH_PASSWORD = process.env.BKASH_PASSWORD;
        const BKASH_APP_KEY = process.env.BKASH_APP_KEY;
        const BKASH_APP_SECRET = process.env.BKASH_APP_SECRET;
        const BKASH_BASE_URL = process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';

        try {
            const response = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/token/grant`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'username': BKASH_USERNAME!,
                    'password': BKASH_PASSWORD!,
                },
                body: JSON.stringify({
                    app_key: BKASH_APP_KEY,
                    app_secret: BKASH_APP_SECRET,
                }),
                cache: 'no-store'
            });

            const result = await response.json();
            if (result.id_token) {
                return result.id_token;
            } else {
                console.error('bKash API Error Response:', result);
                throw new Error(result.errorMessage || result.statusMessage || 'Failed to get bKash token');
            }
        } catch (error: any) {
            console.error('bKash getToken Error:', error.message || error);
            throw error;
        }
    },

    /**
     * Create a bKash payment request
     * @param amount The payment amount
     * @param invoiceId The unique internal invoice ID
     */
    createPayment: async (amount: number, invoiceId: string, idToken: string) => {
        const BKASH_APP_KEY = process.env.BKASH_APP_KEY;
        const BKASH_BASE_URL = process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';

        try {
            const response = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': idToken,
                    'X-APP-Key': BKASH_APP_KEY!,
                },
                body: JSON.stringify({
                    mode: '0011', // Instant checkout
                    payerReference: invoiceId,
                    callbackURL: `${process.env.NEXTAUTH_URL}/api/payment/bkash/callback`,
                    amount: Math.round(amount).toString(),
                    currency: 'BDT',
                    intent: 'sale',
                    merchantInvoiceNumber: invoiceId,
                }),
                cache: 'no-store'
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('bKash createPayment Error:', error);
            throw error;
        }
    },

    /**
     * Execute a bKash payment after user confirmation
     * @param paymentID The ID returned by bKash create
     */
    executePayment: async (paymentID: string, idToken: string) => {
        const BKASH_APP_KEY = process.env.BKASH_APP_KEY;
        const BKASH_BASE_URL = process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';

        try {
            const response = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': idToken,
                    'X-APP-Key': BKASH_APP_KEY!,
                },
                body: JSON.stringify({
                    paymentID: paymentID,
                }),
                cache: 'no-store'
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('bKash executePayment Error:', error);
            throw error;
        }
    },

    /**
     * Query a bKash payment status
     */
    queryPayment: async (paymentID: string, idToken: string) => {
        const BKASH_APP_KEY = process.env.BKASH_APP_KEY;
        const BKASH_BASE_URL = process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';

        try {
            const response = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/payment/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': idToken,
                    'X-APP-Key': BKASH_APP_KEY!,
                },
                body: JSON.stringify({
                    paymentID: paymentID,
                }),
                cache: 'no-store'
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('bKash queryPayment Error:', error);
            throw error;
        }
    }
};

