import prisma from "./../prisma"

export const connectToDatabase = async () => {
    try {
        await prisma.$connect()
    } catch (error) {
        console.error(error)
        throw new Error("Unable to connect to database")
    }
}

export const generateCustomerId = async () => {
    const MAX_RETRIES = 3;
    for (let i = 0; i < MAX_RETRIES; i++) {
        const newCustomerId = Math.floor(100000 + Math.random() * 900000).toString();
        const existingCustomer = await prisma.customer.findUnique({
            where: { customerId: newCustomerId },
        });
        if (!existingCustomer) return newCustomerId;
    }
    throw new Error("Failed to generate a unique customer ID");
};