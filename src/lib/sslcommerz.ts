export const SSLCommerz = {
    init: async (paymentData: {
        total_amount: number;
        currency: string;
        tran_id: string;
        success_url: string;
        fail_url: string;
        cancel_url: string;
        ipn_url?: string;
        cus_name: string;
        cus_email: string;
        cus_add1: string;
        cus_city: string;
        cus_postcode: string;
        cus_country: string;
        cus_phone: string;
        shipping_method: string;
        product_name: string;
        product_category: string;
        product_profile: string;
    }) => {
        const store_id = process.env.SSLC_STORE_ID;
        const store_passwd = process.env.SSLC_STORE_PASSWORD;
        const base_url = process.env.SSLC_BASE_URL || 'https://sandbox.sslcommerz.com';

        if (!store_id || !store_passwd) {
            throw new Error('SSLCommerz credentials missing in environment variables');
        }

        const data = {
            store_id,
            store_passwd,
            ...paymentData,
        };

        const params = new URLSearchParams();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });

        try {
            const response = await fetch(`${base_url}/gwprocess/v4/api.php`, {
                method: 'POST',
                body: params,
                cache: 'no-store'
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('SSLCommerz Init Error:', error);
            throw error;
        }
    },

    validate: async (val_id: string) => {
        const store_id = process.env.SSLC_STORE_ID;
        const store_passwd = process.env.SSLC_STORE_PASSWORD;
        const base_url = process.env.SSLC_BASE_URL || 'https://sandbox.sslcommerz.com';

        const params = new URLSearchParams({
            val_id,
            store_id: store_id!,
            store_passwd: store_passwd!,
            format: 'json',
        });

        try {
            const response = await fetch(`${base_url}/validator/api/validationserverAPI.php?${params.toString()}`, {
                method: 'GET',
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('SSLCommerz Validate Error:', error);
            throw error;
        }
    }
};
