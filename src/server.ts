import axios from 'axios'
import { Telegraf } from 'telegraf'
import { env } from './env'

const bot = new Telegraf(env.BOT_TOKEN)
const chatId = env.CHAT_ID

const api = axios.create()

const productId = env.PRODUCT_ID
const postalCode = env.POSTAL_CODE
const productUrl = env.PRODUCT_URL

let previousIsAvailable: boolean | null = null
let availableCount = 0

function showLog(message: string) {
    const dateTime = new Date().toLocaleString()
    console.log(dateTime, message)
}

async function checkDeliveryAvailability() {
    try {
        const response = await api.post('https://loja.electrolux.com.br/api/checkout/pub/orderForms/simulation?sc=1', {
            "items": [
                {
                    "id": productId,
                    "quantity": 1,
                    "seller": "1"
                }
            ],
            "postalCode": postalCode,
            "country": "BRA"
        })

        const isAvailable = response.data?.items?.[0]?.availability === 'available'

        showLog(isAvailable ? '🚚 Entrega Disponível' : `😢 Entrega Indisponível`)

        if (previousIsAvailable === null || (previousIsAvailable !== isAvailable)) {
            if (isAvailable) {
                availableCount++

                await bot.telegram.sendMessage(chatId, `🚚 Corra! O produto está disponível para entrega no seu endereço!`)
                if (productUrl) await bot.telegram.sendMessage(chatId, `🔗 Link: ${productUrl}`)
            } else {
                await bot.telegram.sendMessage(chatId, `😢 O produto não está mais disponível para entrega no seu endereço.`)
            }

            showLog('🤖 Mensagem enviada no Telegram.')
        }

        previousIsAvailable = isAvailable

        await new Promise(resolve => setTimeout(resolve, 10000))
    } catch (error) {
        console.error(error)
    }
}

async function main() {
    while (true) {
        await checkDeliveryAvailability()
    }
}

main()