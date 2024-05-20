import { Telegraf } from 'telegraf'
import { env } from './env'
import { checkIfDeliveryIsAvailable } from './utils/check-if-delivery-is-available'

const bot = new Telegraf(env.BOT_TOKEN)
const chatId = env.CHAT_ID

const productUrl = env.PRODUCT_URL

let previousIsAvailable: boolean | null = null
let availableCount = 0

function showLog(message: string) {
    const dateTime = new Date().toLocaleString()
    console.log(dateTime, message)
}

export async function checkDeliveryAvailability() {
    try {
        const { isAvailable } = await checkIfDeliveryIsAvailable()

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
    } catch (error) {
        console.error(error)
    } finally {
        await new Promise(resolve => setTimeout(resolve, 10000))
    }
}

async function main() {
    while (true) {
        await checkDeliveryAvailability()
    }
}

main()