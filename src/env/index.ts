import 'dotenv/config'
import { z } from 'zod'

export enum Store {
    ELECTROLUX = 'ELECTROLUX',
    FASTSHOP = 'FASTSHOP'
}

const envSchema = z.object({
    BOT_TOKEN: z.string(),
    CHAT_ID: z.coerce.number(),
    STORE_NAME: z.nativeEnum(Store),
    PRODUCT_ID: z.string(),
    POSTAL_CODE: z.string().length(9),
    PRODUCT_URL: z.string().url().optional()
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
    console.error('❌ Variáveis de ambiente inválidas', _env.error.format())

    throw new Error('Variáveis de ambiente inválidas.')
}

export const env = _env.data