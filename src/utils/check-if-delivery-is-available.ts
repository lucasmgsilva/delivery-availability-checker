import { api } from "@/services/api";
import { Store, env } from "@/env";

const productId = env.PRODUCT_ID
const postalCode = env.POSTAL_CODE

export async function checkIfDeliveryIsAvailable(): Promise<{ isAvailable: boolean}> {
    let isAvailable = false

    switch (env.STORE_NAME) {
        case Store.ELECTROLUX: {
            const response = await api.post('https://loja.electrolux.com.br/api/checkout/pub/orderForms/simulation?sc=1', {
                "items": [
                    {
                        "id": Number(productId),
                        "quantity": 1,
                        "seller": "1"
                    }
                ],
                "postalCode": postalCode,
                "country": "BRA"
            })

            isAvailable = response.data?.items?.[0]?.availability === 'available'
        }
        case Store.FASTSHOP: {
            const response = await api.get(`https://apigw.fastshop.com.br/shipping/v0/shippings/product?sku=${productId}&zipCode=${postalCode}&primePlanId=&price=1529`)

            isAvailable = response.data?.errorCode === null
        }
    }

    return { isAvailable }
}