import { PrismaClient, AdminUserType, Status, SalesType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function cleanDatabase() {
    console.log('≡ƒº╣ Cleaning database...');

    const models = [
        'transaction',
        'transactions',
        'sales',
        'adjust',
        'damage',
        'grn',
        'tpn',
        'purchaseOrder',
        'order',
        'userLogs',
        'whishListQuery',
        'product',
        'category',
        'brand',
        'unit',
        'supplier',
        'paymentMethod',
        'customer',
        'seller',
        'store',
        'coupon',
        'accountsHead',
        'wareHouse',
        'orderProducts',
        'returnProducts',
    ];

    for (const model of models) {
        try {
            // @ts-ignore
            if (prisma[model]) {
                // @ts-ignore
                await prisma[model].deleteMany({});
            }
        } catch (e: any) {
            console.log(`ΓÜá∩╕Å  Could not clear model ${model}: ${e.message}`);
        }
    }

    await prisma.user.deleteMany({});
    console.log('Γ£¿ Database cleaned successfully');
}

async function main() {
    console.log('≡ƒî▒ Starting seed process...');

    await cleanDatabase();

    // ============================================
    // 1. CREATE ADMIN USER
    // ============================================
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.upsert({
        where: { username: 'admin' },
        update: { password: hashedPassword },
        create: {
            email: 'admin@banglamart.com',
            phone: '01700000000',
            name: 'System Administrator',
            username: 'admin',
            password: hashedPassword,
            type: AdminUserType.Admin,
            status: Status.Active,
        },
    });
    console.log('Γ£à Admin user created');

    // ============================================
    // 2. CREATE TEST CUSTOMER
    // ============================================
    const customerPassword = await bcrypt.hash('customer123', 10);
    const testCustomer = await prisma.customer.upsert({
        where: { phone: '01800000000' },
        update: { password: customerPassword },
        create: {
            name: 'Test Customer',
            phone: '01800000000',
            email: 'customer@banglamart.com',
            type: 'customer',
            password: customerPassword,
            customerId: 'CUST001',
            status: Status.Active,
        }
    });
    console.log('Γ£à Test customer created');

    // ============================================
    // 3. CREATE TEST SELLER
    // ============================================
    const sellerPassword = await bcrypt.hash('seller123', 10);
    const testSeller = await prisma.seller.upsert({
        where: { phone: '01900000000' },
        update: { password: sellerPassword },
        create: {
            name: 'Test Seller',
            phone: '01900000000',
            email: 'seller@banglamart.com',
            type: 'seller',
            password: sellerPassword,
            sellerId: 'SEL001',
            status: Status.Active,
        }
    });
    console.log('Γ£à Test seller created');

    
    // ============================================
    // 4. CREATE UNITS
    // ============================================
    const units = [
        { name: 'Piece', code: 'PCS', symbol: 'pcs', status: 'Active' },
        { name: 'Pair', code: 'PAIR', symbol: 'pair', status: 'Active' },
        { name: 'Set', code: 'SET', symbol: 'set', status: 'Active' },
        { name: 'Dozen', code: 'DOZ', symbol: 'doz', status: 'Active' },
    ];

    const seededUnits = await Promise.all(
        units.map(unit =>
            prisma.unit.upsert({
                where: { code: unit.code },
                update: {},
                create: unit,
            })
        )
        
    );
    console.log(`Γ£à ${seededUnits.length} units created`);

    // ============================================
    // 5. CREATE CLOTHING BRANDS
    // ============================================
    const brands = [
        { name: 'Nike', code: 'NIKE', status: 'Active' },
        { name: 'Adidas', code: 'ADIDAS', status: 'Active' },
        { name: 'Zara', code: 'ZARA', status: 'Active' },
        { name: 'H&M', code: 'HM', status: 'Active' },
        { name: 'Levi\'s', code: 'LEVIS', status: 'Active' },
        { name: 'Puma', code: 'PUMA', status: 'Active' },
        { name: 'Uniqlo', code: 'UNIQLO', status: 'Active' },
        { name: 'Gap', code: 'GAP', status: 'Active' },
        { name: 'Aarong', code: 'AARONG', status: 'Active' },
        { name: 'Yellow', code: 'YELLOW', status: 'Active' },
    ];

    const seededBrands = await Promise.all(
        brands.map(brand =>
            prisma.brand.upsert({
                where: { code: brand.code },
                update: {},
                create: brand,
            })
        )
    );
    console.log(`Γ£à ${seededBrands.length} brands created`);

    // ============================================
    // 6. CREATE CATEGORIES (FASHION FOCUSED)
    // ============================================
    const masterCategory = await prisma.category.upsert({
        where: { code: 'FASHION' },
        update: {},
        create: {
            name: 'Fashion & Clothing',
            code: 'FASHION',
            status: 'Active',
            description: 'All fashion and clothing items',
        },
    });

    const subCategories = [
        {
            name: 'Men\'s T-Shirts',
            code: 'MENS_TSHIRT',
            status: 'Active',
            photo: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400&h=400&fit=crop',
        },
        {
            name: 'Men\'s Shirts',
            code: 'MENS_SHIRT',
            status: 'Active',
            photo: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=400&h=400&fit=crop',
        },
        {
            name: 'Men\'s Jeans',
            code: 'MENS_JEANS',
            status: 'Active',
            photo: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=400&h=400&fit=crop',
        },
        {
            name: 'Women\'s Dresses',
            code: 'WOMENS_DRESS',
            status: 'Active',
            photo: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&h=400&fit=crop',
        },
        {
            name: 'Women\'s Tops',
            code: 'WOMENS_TOP',
            status: 'Active',
            photo: 'https://images.unsplash.com/photo-1564257577-d18f0c3c2f7a?q=80&w=400&h=400&fit=crop',
        },
        {
            name: 'Women\'s Jeans',
            code: 'WOMENS_JEANS',
            status: 'Active',
            photo: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=400&h=400&fit=crop',
        },
        {
            name: 'Men\'s Sneakers',
            code: 'MENS_SNEAKERS',
            status: 'Active',
            photo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&h=400&fit=crop',
        },
        {
            name: 'Women\'s Heels',
            code: 'WOMENS_HEELS',
            status: 'Active',
            photo: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&h=400&fit=crop',
        },
        {
            name: 'Accessories',
            code: 'ACCESSORIES',
            status: 'Active',
            photo: 'https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?q=80&w=400&h=400&fit=crop',
        },
        {
            name: 'Bags & Backpacks',
            code: 'BAGS',
            status: 'Active',
            photo: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400&h=400&fit=crop',
        },
    ];

    const seededSubCategories = await Promise.all(
        subCategories.map(cat =>
            prisma.category.upsert({
                where: { code: cat.code },
                update: { photo: cat.photo },
                create: {
                    ...cat,
                    parentId: masterCategory.id,
                },
            })
        )
    );
    console.log(`Γ£à ${1 + seededSubCategories.length} categories created`);

    // ============================================
    // 7. CREATE SUPPLIER
    // ============================================
    const supplier = await prisma.supplier.create({
        data: {
            name: 'Fashion Wholesale BD',
            phone: '01800111222',
            email: 'supplier@fashionbd.com',
            address: 'Gulshan-2, Dhaka-1212',
            company: 'Fashion Wholesale Limited',
            country: 'Bangladesh',
            description: 'Premium clothing supplier',
            designation: 'Authorized Distributor',
            status: Status.Active,
        }
    });
    console.log('Γ£à Supplier created');

    // ============================================
    // 8. CLOTHING PRODUCT DATA
    // ============================================
    const clothingProducts = [
        // Men's T-Shirts (10 items)
        {
            category: 'MENS_TSHIRT',
            items: [
                { name: 'Classic Cotton T-Shirt', price: 450, brand: 'UNIQLO', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab' },
                { name: 'Premium V-Neck Tee', price: 550, brand: 'HM', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a' },
                { name: 'Graphic Print T-Shirt', price: 650, brand: 'NIKE', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27' },
                { name: 'Polo Neck T-Shirt', price: 750, brand: 'PUMA', image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d' },
                { name: 'Striped Casual Tee', price: 500, brand: 'GAP', image: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34' },
                { name: 'Solid Color Round Neck', price: 480, brand: 'YELLOW', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990' },
                { name: 'Sports Performance Tee', price: 850, brand: 'ADIDAS', image: 'https://images.unsplash.com/photo-1627225924765-552d49cf47ad' },
                { name: 'Henley Neck T-Shirt', price: 620, brand: 'LEVIS', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820' },
                { name: 'Oversized Fit Tee', price: 700, brand: 'ZARA', image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68' },
                { name: 'Long Sleeve T-Shirt', price: 680, brand: 'AARONG', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7' },
            ]
        },
        // Men's Shirts (10 items)
        {
            category: 'MENS_SHIRT',
            items: [
                { name: 'Formal White Shirt', price: 1200, brand: 'ZARA', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf' },
                { name: 'Casual Denim Shirt', price: 1350, brand: 'LEVIS', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c' },
                { name: 'Checked Flannel Shirt', price: 1100, brand: 'HM', image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157' },
                { name: 'Slim Fit Oxford Shirt', price: 1450, brand: 'GAP', image: 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4' },
                { name: 'Linen Summer Shirt', price: 1250, brand: 'UNIQLO', image: 'https://images.unsplash.com/photo-1598032895397-b9c0c8b5c6d1' },
                { name: 'Striped Business Shirt', price: 1300, brand: 'AARONG', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35' },
                { name: 'Hawaiian Print Shirt', price: 980, brand: 'YELLOW', image: 'https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d' },
                { name: 'Chambray Work Shirt', price: 1180, brand: 'LEVIS', image: 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e' },
                { name: 'Poplin Dress Shirt', price: 1400, brand: 'ZARA', image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273' },
                { name: 'Corduroy Casual Shirt', price: 1280, brand: 'HM', image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633' },
            ]
        },
        // Men's Jeans (10 items)
        {
            category: 'MENS_JEANS',
            items: [
                { name: 'Classic Blue Jeans', price: 1800, brand: 'LEVIS', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d' },
                { name: 'Slim Fit Black Jeans', price: 1650, brand: 'ZARA', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80' },
                { name: 'Distressed Denim', price: 1950, brand: 'HM', image: 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0' },
                { name: 'Straight Leg Jeans', price: 1700, brand: 'GAP', image: 'https://images.unsplash.com/photo-1604176354204-9268737828e4' },
                { name: 'Skinny Fit Jeans', price: 1850, brand: 'NIKE', image: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb' },
                { name: 'Relaxed Fit Denim', price: 1600, brand: 'UNIQLO', image: 'https://images.unsplash.com/photo-1598522325074-042db73aa4e6' },
                { name: 'Dark Wash Jeans', price: 1750, brand: 'LEVIS', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246' },
                { name: 'Tapered Leg Jeans', price: 1680, brand: 'AARONG', image: 'https://images.unsplash.com/photo-1603217192634-61e5e4a9a0d4' },
                { name: 'Bootcut Jeans', price: 1720, brand: 'PUMA', image: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec' },
                { name: 'Cargo Style Jeans', price: 1900, brand: 'ADIDAS', image: 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c' },
            ]
        },
        // Women's Dresses (10 items)
        {
            category: 'WOMENS_DRESS',
            items: [
                { name: 'Floral Summer Dress', price: 2200, brand: 'ZARA', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8' },
                { name: 'Elegant Evening Gown', price: 3500, brand: 'HM', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae' },
                { name: 'Casual Midi Dress', price: 1850, brand: 'UNIQLO', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1' },
                { name: 'Maxi Boho Dress', price: 2400, brand: 'AARONG', image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03' },
                { name: 'Little Black Dress', price: 2800, brand: 'ZARA', image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956' },
                { name: 'Wrap Style Dress', price: 2100, brand: 'GAP', image: 'https://images.unsplash.com/photo-1612336307429-8a898d10e223' },
                { name: 'A-Line Cotton Dress', price: 1950, brand: 'YELLOW', image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446' },
                { name: 'Shirt Dress', price: 1780, brand: 'HM', image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f' },
                { name: 'Cocktail Party Dress', price: 3200, brand: 'ZARA', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae' },
                { name: 'Denim Dress', price: 1650, brand: 'LEVIS', image: 'https://images.unsplash.com/photo-1523359346063-d879354c0ea5' },
            ]
        },
        // Women's Tops (10 items)
        {
            category: 'WOMENS_TOP',
            items: [
                { name: 'Silk Blouse', price: 1450, brand: 'ZARA', image: 'https://images.unsplash.com/photo-1564257577-d18f0c3c2f7a' },
                { name: 'Casual Tank Top', price: 580, brand: 'HM', image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa' },
                { name: 'Crop Top', price: 650, brand: 'NIKE', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1' },
                { name: 'Off-Shoulder Top', price: 1200, brand: 'YELLOW', image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3' },
                { name: 'Peplum Top', price: 1350, brand: 'AARONG', image: 'https://images.unsplash.com/photo-1618932260643-eee4a2f652a6' },
                { name: 'Tunic Top', price: 1100, brand: 'UNIQLO', image: 'https://images.unsplash.com/photo-1624206112918-f140f087f9b5' },
                { name: 'Halter Neck Top', price: 980, brand: 'GAP', image: 'https://images.unsplash.com/photo-1554568218-0f1715e72254' },
                { name: 'Sleeveless Top', price: 750, brand: 'HM', image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03' },
                { name: 'Embroidered Top', price: 1550, brand: 'ZARA', image: 'https://images.unsplash.com/photo-1578932750294-f5075e85f44a' },
                { name: 'Striped T-Shirt', price: 680, brand: 'PUMA', image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68' },
            ]
        },
        // Women's Jeans (8 items)
        {
            category: 'WOMENS_JEANS',
            items: [
                { name: 'High-Waist Skinny Jeans', price: 1950, brand: 'LEVIS', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246' },
                { name: 'Mom Fit Jeans', price: 1850, brand: 'ZARA', image: 'https://images.unsplash.com/photo-1582418702059-97ebafb35d09' },
                { name: 'Boyfriend Jeans', price: 1750, brand: 'HM', image: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec' },
                { name: 'Flare Leg Jeans', price: 1900, brand: 'GAP', image: 'https://images.unsplash.com/photo-1603217192634-61e5e4a9a0d4' },
                { name: 'Ripped Jeans', price: 2100, brand: 'LEVIS', image: 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0' },
                { name: 'Straight Cut Jeans', price: 1680, brand: 'UNIQLO', image: 'https://images.unsplash.com/photo-1598522325074-042db73aa4e6' },
                { name: 'Cropped Jeans', price: 1580, brand: 'YELLOW', image: 'https://images.unsplash.com/photo-1604176354204-9268737828e4' },
                { name: 'Wide Leg Jeans', price: 2050, brand: 'AARONG', image: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb' },
            ]
        },
        // Men's Sneakers (10 items)
        {
            category: 'MENS_SNEAKERS',
            items: [
                { name: 'Air Max Running Shoes', price: 4500, brand: 'NIKE', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff' },
                { name: 'Classic White Sneakers', price: 3200, brand: 'ADIDAS', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772' },
                { name: 'High-Top Basketball Shoes', price: 5200, brand: 'NIKE', image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77' },
                { name: 'Casual Canvas Shoes', price: 1800, brand: 'PUMA', image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86' },
                { name: 'Leather Sneakers', price: 3800, brand: 'ADIDAS', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a' },
                { name: 'Slip-On Sneakers', price: 2400, brand: 'UNIQLO', image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77' },
                { name: 'Trail Running Shoes', price: 4200, brand: 'NIKE', image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa' },
                { name: 'Retro Style Sneakers', price: 3500, brand: 'PUMA', image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb' },
                { name: 'Low-Top Sneakers', price: 2900, brand: 'ADIDAS', image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3' },
                { name: 'Chunky Sneakers', price: 3600, brand: 'NIKE', image: 'https://images.unsplash.com/photo-1605408499391-6368c628ef42' },
            ]
        },
        // Women's Heels (8 items)
        {
            category: 'WOMENS_HEELS',
            items: [
                { name: 'Classic Black Pumps', price: 2800, brand: 'ZARA', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2' },
                { name: 'Stiletto Heels', price: 3200, brand: 'HM', image: 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95' },
                { name: 'Block Heel Sandals', price: 2400, brand: 'AARONG', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2' },
                { name: 'Ankle Strap Heels', price: 2950, brand: 'ZARA', image: 'https://images.unsplash.com/photo-1596702062351-8c2c14d1fdd0' },
                { name: 'Wedge Heels', price: 2600, brand: 'YELLOW', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2' },
                { name: 'Peep-Toe Heels', price: 2750, brand: 'HM', image: 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95' },
                { name: 'Platform Heels', price: 3100, brand: 'ZARA', image: 'https://images.unsplash.com/photo-1596702062351-8c2c14d1fdd0' },
                { name: 'Kitten Heels', price: 2200, brand: 'GAP', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2' },
            ]
        },
        // Accessories (10 items)
        {
            category: 'ACCESSORIES',
            items: [
                { name: 'Leather Belt', price: 850, brand: 'LEVIS', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62' },
                { name: 'Sunglasses', price: 1200, brand: 'NIKE', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083' },
                { name: 'Wrist Watch', price: 3500, brand: 'ADIDAS', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30' },
                { name: 'Leather Wallet', price: 1100, brand: 'AARONG', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93' },
                { name: 'Baseball Cap', price: 650, brand: 'NIKE', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b' },
                { name: 'Scarf', price: 580, brand: 'ZARA', image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9' },
                { name: 'Tie', price: 750, brand: 'HM', image: 'https://images.unsplash.com/photo-1589756823695-278bc8356aa0' },
                { name: 'Gloves', price: 480, brand: 'UNIQLO', image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9' },
                { name: 'Beanie Hat', price: 420, brand: 'PUMA', image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9' },
                { name: 'Socks Pack (3 pairs)', price: 350, brand: 'ADIDAS', image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82' },
            ]
        },
        // Bags & Backpacks (10 items)
        {
            category: 'BAGS',
            items: [
                { name: 'Leather Backpack', price: 3200, brand: 'AARONG', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62' },
                { name: 'Sports Gym Bag', price: 1850, brand: 'NIKE', image: 'https://images.unsplash.com/photo-1547949003-9792a18a2601' },
                { name: 'Laptop Backpack', price: 2400, brand: 'ADIDAS', image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3' },
                { name: 'Tote Bag', price: 1200, brand: 'ZARA', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7' },
                { name: 'Messenger Bag', price: 1950, brand: 'LEVIS', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa' },
                { name: 'Travel Duffel Bag', price: 2800, brand: 'PUMA', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62' },
                { name: 'Crossbody Bag', price: 1450, brand: 'HM', image: 'https://images.unsplash.com/photo-1590739225017-e3e89f6f057f' },
                { name: 'Clutch Bag', price: 980, brand: 'YELLOW', image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d' },
                { name: 'Hiking Backpack', price: 3500, brand: 'NIKE', image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3' },
                { name: 'School Backpack', price: 1650, brand: 'UNIQLO', image: 'https://images.unsplash.com/photo-1577733966973-d680bffd2e80' },
            ]
        },
    ];

    // ============================================
    // 9. SEED PRODUCTS
    // ============================================
    console.log('≡ƒÜÇ Seeding clothing products...');
    let totalProducts = 0;

    for (const categoryGroup of clothingProducts) {
        const subCategory = seededSubCategories.find(cat => cat.code === categoryGroup.category);
        if (!subCategory) {
            console.error(`Γ¥î Category not found: ${categoryGroup.category}`);
            continue;
        }

        for (const item of categoryGroup.items) {
            const brand = seededBrands.find(b => b.code === item.brand);
            const unit = seededUnits[0]; // Default to 'Piece'

            const mrp = Math.round(item.price * 1.25); // 25% markup
            const tp = Math.round(item.price * 0.85); // 15% discount from price
            const stock = Math.floor(Math.random() * 150) + 50; // 50-200 stock

            await prisma.product.create({
                data: {
                    name: item.name,
                    slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    description: `Premium quality ${item.name.toLowerCase()} from ${brand?.name}. Made with high-quality materials for comfort and durability. Perfect for everyday wear.`,
                    specification: `Material: Premium Cotton/Polyester blend\nFit: Regular/Slim\nCare: Machine washable\nOrigin: Imported/Local`,
                    masterCategoryId: masterCategory.id,
                    categoryId: subCategory.id,
                    articleCode: `${subCategory.code}-${Math.floor(1000 + Math.random() * 9000)}`,
                    brandId: brand?.id,
                    unitId: unit.id,
                    supplierId: supplier.id,
                    photo: [`${item.image}?q=80&w=800&auto=format&fit=crop`],
                    price: item.price,
                    mrp: mrp,
                    tp: tp,
                    ean: `EAN-${Math.floor(100000000 + Math.random() * 900000000)}`,
                    stock: stock,
                    availableQty: stock,
                    openingQty: stock,
                    status: Status.Active,
                    salesType: Math.random() > 0.7 ? SalesType.Offer : SalesType.Standerd,
                    featured: Math.random() > 0.8 ? 'true' : 'false',
                    website: 'true',
                    vat: 5,
                    vatMethod: 'false',
                }
            });
            totalProducts++;
        }
    }

    console.log(`Γ£à ${totalProducts} clothing products seeded successfully!`);
    console.log('Γ£¿ Seed process completed!');
    console.log('\n≡ƒôè Summary:');
    console.log(`   - Admin User: admin / admin123`);
    console.log(`   - Test Customer: 01800000000 / customer123`);
    console.log(`   - Test Seller: 01900000000 / seller123`);
    console.log(`   - Units: ${seededUnits.length}`);
    console.log(`   - Brands: ${seededBrands.length}`);
    console.log(`   - Categories: ${1 + seededSubCategories.length}`);
    console.log(`   - Products: ${totalProducts}`);
}

main()
    .catch((e) => {
        console.error('Γ¥î Error during seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

