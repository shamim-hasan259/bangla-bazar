import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting database fix...')

    const fields = ['vatMethod', 'website', 'featured']

    for (const field of fields) {
        console.log(`Fixing field: ${field}`)

        // Fix false -> "false"
        const resFalse = await (prisma as any).$runCommandRaw({
            update: 'Product',
            updates: [
                {
                    q: { [field]: false },
                    u: { $set: { [field]: "false" } },
                    multi: true
                }
            ]
        })
        console.log(`Updated boolean false to "false" for ${field}:`, resFalse)

        // Fix true -> "true"
        const resTrue = await (prisma as any).$runCommandRaw({
            update: 'Product',
            updates: [
                {
                    q: { [field]: true },
                    u: { $set: { [field]: "true" } },
                    multi: true
                }
            ]
        })
        console.log(`Updated boolean true to "true" for ${field}:`, resTrue)

        // Fix null -> "false" (optional, but keep it consistent with defaults)
        const resNull = await (prisma as any).$runCommandRaw({
            update: 'Product',
            updates: [
                {
                    q: { [field]: null },
                    u: { $set: { [field]: "false" } },
                    multi: true
                }
            ]
        })
        console.log(`Updated null to "false" for ${field}:`, resNull)

        // Also check for missing fields and set them to "false"
        const resMissing = await (prisma as any).$runCommandRaw({
            update: 'Product',
            updates: [
                {
                    q: { [field]: { $exists: false } },
                    u: { $set: { [field]: "false" } },
                    multi: true
                }
            ]
        })
        console.log(`Set default "false" for missing ${field}:`, resMissing)
    }

    console.log('Database fix completed.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
