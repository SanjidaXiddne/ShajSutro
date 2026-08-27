"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Seed premium demo products for ShajSutro (Only 3 Categories: Mens, Womens, Kids)
 * Run with: npx ts-node src/seed/createDemoProducts.ts
 */
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const dns_1 = __importDefault(require("dns"));
const Category_1 = __importDefault(require("../models/Category"));
const Product_1 = __importDefault(require("../models/Product"));
// Set fallback DNS servers to resolve MongoDB SRV lookup issues
try {
    dns_1.default.setServers(["8.8.8.8", "1.1.1.1"]);
}
catch (error) {
    console.warn("⚠️ Warning: Failed to set custom DNS servers:", error);
}
dotenv_1.default.config();
const CATEGORIES = [
    {
        name: "Mens",
        slug: "mens",
        description: "Exclusive traditional and fusion wear for men, highlighting royal Panjabis, linen kurtas, and designer sherwanis.",
        image: "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=600",
    },
    {
        name: "Womens",
        slug: "womens",
        description: "Elegant and sophisticated luxury clothing for women, including silk Salwar Kameez, Jamdani sarees, and resort kaftans.",
        image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600",
    },
    {
        name: "Kids",
        slug: "kids",
        description: "Festive and comfortable outfits for boys and girls, crafted with organic cotton and soft traditional silk.",
        image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=600",
    },
];
const PRODUCTS_DRAFT = [
    // ─── WOMENS PRODUCTS ──────────────────────────────────────────────────────────
    {
        catSlug: "womens",
        name: "Varanasi Silk Salwar Suite",
        slug: "varanasi-silk-salwar-suite",
        description: "Handcrafted pure Banarasi silk three-piece suite, woven with gold zari embroidery and a premium organza dupatta.",
        price: 6800,
        originalPrice: 8500,
        images: [
            "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800",
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800",
        ],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Crimson Gold", "Royal Emerald", "Midnight Violet"],
        badge: "Best Seller",
        rating: 4.9,
        reviews: 24,
        inStock: true,
        isFeatured: true,
        stock: 15,
        tags: ["silk", "salwar kameez", "embroidered", "womens"],
    },
    {
        catSlug: "womens",
        name: "Elixir Georgette Anarkali Gown",
        slug: "elixir-georgette-anarkali-gown",
        description: "A breathtaking flared floor-length Anarkali gown in premium georgette, embellished with handmade pearls and stone highlights.",
        price: 9200,
        originalPrice: 11000,
        images: [
            "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800",
        ],
        sizes: ["M", "L", "XL"],
        colors: ["Pastel Lavender", "Peach Rose", "Pastel Mint"],
        badge: "New",
        rating: 4.8,
        reviews: 16,
        inStock: true,
        isFeatured: true,
        stock: 8,
        tags: ["anarkali", "gown", "pearls", "womens"],
    },
    {
        catSlug: "womens",
        name: "Exclusive Pure Muslin Jamdani",
        slug: "exclusive-pure-muslin-jamdani",
        description: "Authentic hand-loom Dhakai Jamdani saree, crafted in 100% fine cotton muslin thread count for a lightweight, floating wear.",
        price: 24000,
        originalPrice: 28000,
        images: [
            "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=800",
        ],
        sizes: ["Regular (5.5m)"],
        colors: ["Midnight Black & Gold", "Classic White & Red"],
        badge: "Best Seller",
        rating: 5.0,
        reviews: 31,
        inStock: true,
        isFeatured: true,
        stock: 3,
        tags: ["saree", "jamdani", "muslin", "womens"],
    },
    {
        catSlug: "womens",
        name: "Minimalist Ivory Linen Suite",
        slug: "minimalist-ivory-linen-suite",
        description: "Breathable pure organic linen three-piece suite with fine lace borders. Clean, simple luxury for daytime elegance.",
        price: 4500,
        originalPrice: 4500,
        images: [
            "https://images.unsplash.com/photo-1605763240000-7e93b172d754?q=80&w=800",
        ],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Classic Ivory", "Earth Sage", "Desert Oat"],
        rating: 4.7,
        reviews: 9,
        inStock: true,
        isFeatured: false,
        stock: 20,
        tags: ["linen", "minimalist", "ivory", "womens"],
    },
    {
        catSlug: "womens",
        name: "Gilded Katan Silk Saree",
        slug: "gilded-katan-silk-saree",
        description: "Royal Katan silk saree woven in Mirpur. Complete with heavy golden zari works and solid border blocks.",
        price: 15500,
        originalPrice: 18000,
        images: [
            "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800",
        ],
        sizes: ["Regular (5.5m)"],
        colors: ["Magenta Gold", "Scarlet Zari", "Emerald Teal"],
        badge: "New",
        rating: 4.8,
        reviews: 11,
        inStock: true,
        isFeatured: true,
        stock: 7,
        tags: ["saree", "katan", "silk", "womens"],
    },
    {
        catSlug: "womens",
        name: "Classic Crimson Chiffon Saree",
        slug: "classic-crimson-chiffon-saree",
        description: "Pure Italian georgette-chiffon saree, featuring delicate hand-stitched borders and a complimentary matching silk blouse piece.",
        price: 7800,
        originalPrice: 9500,
        images: [
            "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=800",
        ],
        sizes: ["Regular (5.5m)"],
        colors: ["Crimson Red", "Jet Black", "Hot Pink"],
        badge: "Sale",
        rating: 4.6,
        reviews: 19,
        inStock: true,
        isFeatured: false,
        stock: 14,
        tags: ["saree", "chiffon", "georgette", "womens"],
    },
    {
        catSlug: "womens",
        name: "Bohemian Chiffon Resort Kaftan",
        slug: "bohemian-chiffon-resort-kaftan",
        description: "Flowing georgette-chiffon kaftan featuring exclusive hand-drawn floral block prints and metallic golden fringe outlines.",
        price: 5800,
        originalPrice: 7200,
        images: [
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800",
        ],
        sizes: ["Free Size (M-XXL)"],
        colors: ["Azure Sky", "Sunset Coral", "Jade Garden"],
        badge: "New",
        rating: 4.9,
        reviews: 14,
        inStock: true,
        isFeatured: true,
        stock: 12,
        tags: ["kaftan", "resort", "womens", "chiffon"],
    },
    {
        catSlug: "womens",
        name: "Pearl-Embellished Evening Tunic",
        slug: "pearl-embellished-evening-tunic",
        description: "Sophisticated silk-blend evening tunic, featuring neat neck pleats and hand-stitched real river pearls along the cuffs.",
        price: 4900,
        originalPrice: 4900,
        images: [
            "https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?q=80&w=800",
        ],
        sizes: ["S", "M", "L"],
        colors: ["Midnight Blue", "Crimson Rose", "Ivory Cream"],
        rating: 4.8,
        reviews: 11,
        inStock: true,
        isFeatured: true,
        stock: 9,
        tags: ["tunic", "evening wear", "pearls", "womens"],
    },
    {
        catSlug: "womens",
        name: "Premium Satin Silk Hijab",
        slug: "premium-satin-silk-hijab",
        description: "Extremely luxurious and smooth satin silk hijab with a delicate matte backing to keep it perfectly styled all day.",
        price: 1800,
        originalPrice: 2200,
        images: [
            "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=800",
        ],
        sizes: ["One Size"],
        colors: ["Champagne Gold", "Blush Pink", "Soft Taupe", "Pearl Ivory"],
        badge: "Best Seller",
        rating: 4.9,
        reviews: 45,
        inStock: true,
        isFeatured: false,
        stock: 40,
        tags: ["hijab", "satin", "silk", "womens"],
    },
    // ─── MENS PRODUCTS ────────────────────────────────────────────────────────────
    {
        catSlug: "mens",
        name: "Imperial Embroidered Silk Panjabi",
        slug: "imperial-embroidered-silk-panjabi",
        description: "Premium pure Adi silk Panjabi showcasing delicate hand-guided neck embroidery and branded metal buttons.",
        price: 5200,
        originalPrice: 6500,
        images: [
            "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=80&w=800",
        ],
        sizes: ["38", "40", "42", "44"],
        colors: ["Pearl White", "Royal Navy", "Imperial Emerald"],
        badge: "Best Seller",
        rating: 4.9,
        reviews: 42,
        inStock: true,
        isFeatured: true,
        stock: 30,
        tags: ["panjabi", "silk", "embroidery", "mens"],
    },
    {
        catSlug: "mens",
        name: "Pure Egyptian Cotton Kurta-Panjabi",
        slug: "pure-egyptian-cotton-kurta-panjabi",
        description: "Tailored from imported high-thread-count Egyptian cotton. Extremely soft texture, styled with minimalist metallic buttons.",
        price: 3800,
        originalPrice: 3800,
        images: [
            "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800",
        ],
        sizes: ["38", "40", "42", "44", "46"],
        colors: ["Deep Pitch Black", "Midnight Blue", "Classic White"],
        badge: "New",
        rating: 4.8,
        reviews: 17,
        inStock: true,
        isFeatured: true,
        stock: 45,
        tags: ["panjabi", "egyptian cotton", "minimalist", "mens"],
    },
    {
        catSlug: "mens",
        name: "Semi-Formal Organic Linen Panjabi",
        slug: "semi-formal-organic-linen-panjabi",
        description: "Lightweight organic linen Panjabi with a modern banded collar and button cuffs. Perfect for casual summer evenings.",
        price: 3200,
        originalPrice: 4000,
        images: [
            "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800",
        ],
        sizes: ["38", "40", "42", "44"],
        colors: ["Steel Blue", "Olive Drab", "Desert Sand"],
        badge: "Sale",
        rating: 4.7,
        reviews: 21,
        inStock: true,
        isFeatured: false,
        stock: 22,
        tags: ["linen", "casual", "mens", "summer"],
    },
    {
        catSlug: "mens",
        name: "Royal Banarasi Silk Sherwani",
        slug: "royal-banarasi-silk-sherwani",
        description: "Exquisite wedding wear Sherwani in royal black Banarasi silk, embroidered with intricate copper-gold threads and matching churidar.",
        price: 18500,
        originalPrice: 22000,
        images: [
            "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?q=80&w=800",
        ],
        sizes: ["40", "42", "44"],
        colors: ["Imperial Black & Gold", "Noble Ivory & Copper"],
        badge: "New",
        rating: 5.0,
        reviews: 8,
        inStock: true,
        isFeatured: true,
        stock: 4,
        tags: ["sherwani", "banarasi", "wedding", "mens"],
    },
    {
        catSlug: "mens",
        name: "Designer Classic Linen Kurta",
        slug: "designer-classic-linen-kurta",
        description: "Minimalist casual traditional short kurta woven with pure breathable Irish linen, featuring smart button cuffs.",
        price: 2900,
        originalPrice: 3500,
        images: [
            "https://images.unsplash.com/photo-1615813967515-e1838c1c5116?q=80&w=800",
        ],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Sky Blue", "Olive Khaki", "Mustard Yellow"],
        badge: "Sale",
        rating: 4.6,
        reviews: 14,
        inStock: true,
        isFeatured: false,
        stock: 18,
        tags: ["kurta", "linen", "casual", "mens"],
    },
    // ─── KIDS PRODUCTS ────────────────────────────────────────────────────────────
    {
        catSlug: "kids",
        name: "Kids Imperial Silk Kurta Set",
        slug: "kids-imperial-silk-kurta-set",
        description: "Adorable two-piece traditional pajama-kurta set for boys, crafted in soft art-silk with subtle embroidery.",
        price: 2200,
        originalPrice: 2800,
        images: [
            "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=800",
        ],
        sizes: ["2-4 Yrs", "4-6 Yrs", "6-8 Yrs"],
        colors: ["Royal Blue", "Golden Mustard", "Festive Maroon"],
        badge: "Best Seller",
        rating: 4.9,
        reviews: 19,
        inStock: true,
        isFeatured: true,
        stock: 25,
        tags: ["kids", "kurta set", "boys", "festive"],
    },
    {
        catSlug: "kids",
        name: "Miniature Floral Lehenga Suite",
        slug: "miniature-floral-lehenga-suite",
        description: "A gorgeous three-piece traditional lehenga choli for young girls, featuring soft net dupatta and organic cotton lining.",
        price: 3800,
        originalPrice: 4500,
        images: [
            "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=800",
        ],
        sizes: ["4-6 Yrs", "6-8 Yrs", "8-10 Yrs"],
        colors: ["Baby Pink", "Sunny Yellow", "Minty Green"],
        badge: "New",
        rating: 4.8,
        reviews: 12,
        inStock: true,
        isFeatured: true,
        stock: 10,
        tags: ["kids", "lehenga", "girls", "traditional"],
    },
    {
        catSlug: "kids",
        name: "Kids Playful Linen Kurta",
        slug: "kids-playful-linen-kurta",
        description: "Ultra-soft and breathable linen kurta for everyday play and evening gatherings, styled with organic coconut buttons.",
        price: 1500,
        originalPrice: 1500,
        images: [
            "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800",
        ],
        sizes: ["2-4 Yrs", "4-6 Yrs", "6-8 Yrs", "8-10 Yrs"],
        colors: ["Sky Blue", "Pastel Orange", "Lemon Yellow"],
        rating: 4.7,
        reviews: 8,
        inStock: true,
        isFeatured: false,
        stock: 30,
        tags: ["kids", "linen", "kurta", "casual"],
    },
    {
        catSlug: "kids",
        name: "Kids Designer Velvet Sherwani",
        slug: "kids-designer-velvet-sherwani",
        description: "Miniature royal velvet sherwani with handcrafted gold buttons and dhoti trousers for special family celebrations.",
        price: 4800,
        originalPrice: 6000,
        images: [
            "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=800",
        ],
        sizes: ["4-6 Yrs", "6-8 Yrs", "8-10 Yrs"],
        colors: ["Emerald Green", "Royal Ruby"],
        badge: "New",
        rating: 5.0,
        reviews: 5,
        inStock: true,
        isFeatured: true,
        stock: 6,
        tags: ["kids", "sherwani", "boys", "velvet"],
    },
    {
        catSlug: "kids",
        name: "Floral Embroidered Festive Frock",
        slug: "floral-embroidered-festive-frock",
        description: "Comfortable organic cotton frock embellished with beautiful hand-embroidered floral motifs around the collar.",
        price: 1800,
        originalPrice: 2200,
        images: [
            "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=800",
        ],
        sizes: ["2-4 Yrs", "4-6 Yrs", "6-8 Yrs"],
        colors: ["Peach Cream", "Ivory Rose"],
        badge: "Sale",
        rating: 4.6,
        reviews: 15,
        inStock: true,
        isFeatured: false,
        stock: 20,
        tags: ["kids", "frock", "girls", "cotton"],
    },
];
async function main() {
    await mongoose_1.default.connect(process.env.MONGODB_URI, { dbName: "shajsutro" });
    console.log("Connected to MongoDB for product seeding...");
    // 1. Clean existing catalog collections
    await Product_1.default.deleteMany({});
    await Category_1.default.deleteMany({});
    console.log("✓ Existing products and categories cleared.");
    // 2. Create categories and cache their ID mappings
    const slugToIdMap = {};
    for (const catData of CATEGORIES) {
        const createdCat = await Category_1.default.create(catData);
        slugToIdMap[catData.slug] = createdCat._id.toString();
        console.log(`✓ Created Category: ${createdCat.name} (ID: ${createdCat._id})`);
    }
    // 3. Create products linked to category IDs
    let seededCount = 0;
    for (const pData of PRODUCTS_DRAFT) {
        const categoryId = slugToIdMap[pData.catSlug];
        if (!categoryId) {
            console.warn(`⚠ Skip product ${pData.name} - category slug '${pData.catSlug}' not found.`);
            continue;
        }
        const { catSlug, ...productDoc } = pData;
        const finalDoc = {
            ...productDoc,
            category: new mongoose_1.default.Types.ObjectId(categoryId),
        };
        await Product_1.default.create(finalDoc);
        seededCount++;
        console.log(`  ✓ Seeded Product [${seededCount}]: ${pData.name}`);
    }
    console.log(`\n🎉 Seeding completed successfully!`);
    console.log(`Total Categories seeded: ${CATEGORIES.length}`);
    console.log(`Total Products seeded  : ${seededCount}`);
    process.exit(0);
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=createDemoProducts.js.map