import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { Product } from './entities/product.entity';
import { Review } from './entities/review.entity';
import {
  Raffle,
  RaffleType,
  RaffleStatus,
  UserLevel,
} from './entities/raffle.entity';
import bcrypt from 'bcrypt';

async function seed() {
  try {
    // Initialize data source
    await AppDataSource.initialize();
    console.log('Database connected!');

    const userRepository = AppDataSource.getRepository(User);
    const productRepository = AppDataSource.getRepository(Product);
    const reviewRepository = AppDataSource.getRepository(Review);
    const raffleRepository = AppDataSource.getRepository(Raffle);

    // Clear existing data (optional - comment out if you want to keep existing data)
    // Must clear in order: child tables first, then parent tables (due to foreign keys)
    console.log('Clearing existing data...');
    await reviewRepository.createQueryBuilder().delete().from(Review).execute();
    await productRepository
      .createQueryBuilder()
      .delete()
      .from(Product)
      .execute();
    await userRepository.createQueryBuilder().delete().from(User).execute();

    // Create Users
    console.log('Creating users...');
    const passwordHash = await bcrypt.hash('password123', 10);
    const users = [
      userRepository.create({
        email: 'john.doe@example.com',
        passwordHash,
        passwordChangedAt: new Date(),
        roles: [UserRole.CUSTOMER],
        status: UserStatus.ACTIVE,
      }),
      userRepository.create({
        email: 'jane.smith@example.com',
        passwordHash,
        passwordChangedAt: new Date(),
        roles: [UserRole.CUSTOMER],
        status: UserStatus.ACTIVE,
      }),
      userRepository.create({
        email: 'mike.wilson@example.com',
        passwordHash,
        passwordChangedAt: new Date(),
        roles: [UserRole.CUSTOMER],
        status: UserStatus.ACTIVE,
      }),
      userRepository.create({
        email: 'sarah.jones@example.com',
        passwordHash,
        passwordChangedAt: new Date(),
        roles: [UserRole.CUSTOMER],
        status: UserStatus.ACTIVE,
      }),
      userRepository.create({
        email: 'admin@brandbazaar.com',
        passwordHash,
        passwordChangedAt: new Date(),
        roles: [UserRole.ADMIN],
        status: UserStatus.ACTIVE,
      }),
    ];
    const savedUsers = await userRepository.save(users);
    console.log(`Created ${savedUsers.length} users`);

    // Create Products
    console.log('Creating products...');
    const products: Product[] = [
      productRepository.create({
        name: 'Nike Air Max 270',
        shortDescription:
          'Iconic running shoe with responsive cushioning and modern design.',
        description:
          'The Nike Air Max 270 combines the classic Air Max heritage with contemporary style. Features a full-length Air unit for maximum cushioning, breathable mesh upper, and durable rubber outsole. Perfect for both running and casual wear. The shoe offers excellent support and comfort throughout the day.',
        price: 150.0,
        salePrice: 119.99,
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
          'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800',
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
        ],
        category: 'Running Shoes',
        tags: ['nike', 'running', 'sneakers', 'athletic', 'air-max'],
        specifications: {
          Brand: 'Nike',
          Model: 'Air Max 270',
          Color: 'Black/White',
          Size: 'US 8-12',
          Material: 'Mesh Upper, Rubber Sole',
          Weight: '320g',
          Technology: 'Air Max Cushioning',
        },
        stock: 25,
        shippingInfo:
          'Free shipping on orders over $100. Ships within 1-2 business days.',
        estimatedDeliveryDays: 3,
        averageRating: 4.5,
        totalReviews: 12,
      }),
      productRepository.create({
        name: 'Adidas Ultraboost 22',
        shortDescription:
          'Premium running shoes with Boost technology for ultimate energy return.',
        description:
          'Experience the ultimate running shoe with Adidas Ultraboost 22. Features the revolutionary Boost midsole that provides exceptional energy return and cushioning. The Primeknit upper offers a sock-like fit with maximum breathability. Designed for serious runners who demand performance and style.',
        price: 180.0,
        salePrice: null,
        images: [
          'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
          'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800',
        ],
        category: 'Running Shoes',
        tags: ['adidas', 'running', 'boost', 'performance', 'athletic'],
        specifications: {
          Brand: 'Adidas',
          Model: 'Ultraboost 22',
          Color: 'Core Black/White',
          Size: 'US 7-13',
          Material: 'Primeknit Upper, Continental Rubber',
          Weight: '310g',
          Technology: 'Boost Midsole',
        },
        stock: 18,
        shippingInfo:
          'Express shipping available. Standard shipping 2-3 business days.',
        estimatedDeliveryDays: 4,
        averageRating: 4.8,
        totalReviews: 8,
      }),
      productRepository.create({
        name: 'Jordan 1 Retro High OG',
        shortDescription:
          'Classic basketball-inspired sneaker with timeless design.',
        description:
          'The iconic Air Jordan 1 Retro High OG brings back the legendary design that started it all. Featuring premium leather upper, Air-Sole unit for cushioning, and classic color blocking. A must-have for sneaker enthusiasts and basketball fans. Perfect for both on-court performance and streetwear style.',
        price: 170.0,
        salePrice: 149.99,
        images: [
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        ],
        category: 'Basketball Shoes',
        tags: ['jordan', 'nike', 'basketball', 'retro', 'collectible'],
        specifications: {
          Brand: 'Nike',
          Model: 'Air Jordan 1 Retro High OG',
          Color: 'Bred (Black/Red)',
          Size: 'US 7-14',
          Material: 'Leather Upper, Rubber Sole',
          Weight: '400g',
          Technology: 'Air-Sole Unit',
        },
        stock: 12,
        shippingInfo:
          'Limited stock. Ships within 1 business day. Signature required.',
        estimatedDeliveryDays: 2,
        averageRating: 4.7,
        totalReviews: 15,
      }),
      productRepository.create({
        name: 'New Balance 990v5',
        shortDescription:
          'Premium running shoe with superior comfort and durability.',
        description:
          'The New Balance 990v5 is crafted with premium materials and advanced cushioning technology. Features ENCAP midsole for superior stability and comfort, pigskin/mesh upper for durability, and blown rubber outsole for flexibility. Made in the USA with domestic and imported materials.',
        price: 185.0,
        salePrice: null,
        images: [
          'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
          'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800',
        ],
        category: 'Running Shoes',
        tags: ['new-balance', 'running', 'premium', 'comfort', 'made-in-usa'],
        specifications: {
          Brand: 'New Balance',
          Model: '990v5',
          Color: 'Grey',
          Size: 'US 8-12',
          Material: 'Pigskin/Mesh Upper, ENCAP Midsole',
          Weight: '340g',
          Technology: 'ENCAP Cushioning',
        },
        stock: 20,
        shippingInfo: 'Free shipping. Ships within 2-3 business days.',
        estimatedDeliveryDays: 5,
        averageRating: 4.3,
        totalReviews: 6,
      }),
      productRepository.create({
        name: 'Converse Chuck Taylor All Star',
        shortDescription:
          'The classic canvas sneaker that never goes out of style.',
        description:
          'Since 1923, the Chuck Taylor All Star has been a staple of casual footwear. Made with durable canvas upper, rubber toe cap for protection, and vulcanized rubber outsole. Available in a wide range of colors and sizes. Perfect for everyday wear, casual outings, and expressing your personal style.',
        price: 55.0,
        salePrice: 45.99,
        images: [
          'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800',
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
        ],
        category: 'Casual Shoes',
        tags: ['converse', 'casual', 'canvas', 'classic', 'vintage'],
        specifications: {
          Brand: 'Converse',
          Model: 'Chuck Taylor All Star',
          Color: 'Black',
          Size: 'US 5-14',
          Material: 'Canvas Upper, Rubber Sole',
          Weight: '250g',
          Technology: 'Vulcanized Rubber',
        },
        stock: 50,
        shippingInfo: 'Fast and free shipping on all orders.',
        estimatedDeliveryDays: 3,
        averageRating: 4.6,
        totalReviews: 20,
      }),
      productRepository.create({
        name: 'Vans Old Skool',
        shortDescription:
          'Iconic skate shoe with timeless design and skate heritage.',
        description:
          'The Vans Old Skool is the first Vans shoe to feature the iconic side stripe. Built with suede and canvas upper, padded collar for comfort, and waffle outsole for grip. A favorite among skaters, musicians, and streetwear enthusiasts worldwide. Perfect for skateboarding and everyday style.',
        price: 65.0,
        salePrice: null,
        images: [
          'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
        ],
        category: 'Skate Shoes',
        tags: ['vans', 'skate', 'casual', 'classic', 'streetwear'],
        specifications: {
          Brand: 'Vans',
          Model: 'Old Skool',
          Color: 'Black/White',
          Size: 'US 6-13',
          Material: 'Suede/Canvas Upper, Rubber Sole',
          Weight: '280g',
          Technology: 'Waffle Outsole',
        },
        stock: 35,
        shippingInfo: 'Standard shipping included. Express options available.',
        estimatedDeliveryDays: 4,
        averageRating: 4.4,
        totalReviews: 10,
      }),
      productRepository.create({
        name: 'Air Force 1 Low',
        shortDescription:
          'The basketball legend reimagined for everyday style.',
        description:
          'Born on the hardwood and built for the streets, the Air Force 1 Low continues to be a favorite. Features premium leather upper, Air-Sole unit for cushioning, and pivot points for traction. The clean, classic design works with any outfit, making it one of the most versatile sneakers ever created.',
        price: 90.0,
        salePrice: 79.99,
        images: [
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        ],
        category: 'Basketball Shoes',
        tags: ['nike', 'basketball', 'classic', 'versatile', 'streetwear'],
        specifications: {
          Brand: 'Nike',
          Model: 'Air Force 1 Low',
          Color: 'White',
          Size: 'US 7-15',
          Material: 'Leather Upper, Rubber Sole',
          Weight: '380g',
          Technology: 'Air-Sole Unit',
        },
        stock: 40,
        shippingInfo: 'Free shipping. Ships within 1-2 business days.',
        estimatedDeliveryDays: 3,
        averageRating: 4.5,
        totalReviews: 18,
      }),
      productRepository.create({
        name: 'Yeezy Boost 350 V2',
        shortDescription: 'Ultra-comfortable sneaker with distinctive design.',
        description:
          "The Yeezy Boost 350 V2 combines Kanye West's design vision with Adidas Boost technology. Features Primeknit upper for a comfortable, sock-like fit, Boost midsole for maximum energy return, and distinctive side stripe design. A highly sought-after sneaker that combines comfort, style, and exclusivity.",
        price: 220.0,
        salePrice: null,
        images: [
          'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
          'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
        ],
        category: 'Lifestyle',
        tags: ['adidas', 'yeezy', 'lifestyle', 'boost', 'limited'],
        specifications: {
          Brand: 'Adidas',
          Model: 'Yeezy Boost 350 V2',
          Color: 'Zebra',
          Size: 'US 7-13',
          Material: 'Primeknit Upper, Boost Midsole',
          Weight: '300g',
          Technology: 'Boost Technology',
        },
        stock: 5,
        shippingInfo:
          'Limited edition. Signature required. Ships within 1 business day.',
        estimatedDeliveryDays: 2,
        averageRating: 4.9,
        totalReviews: 5,
      }),
      productRepository.create({
        name: 'Nike Custom 3D Sneaker',
        shortDescription:
          'Fully customizable 3D sneaker with interactive design experience.',
        description:
          'Experience the future of sneaker shopping with our interactive 3D customizable Nike sneaker. Customize colors, textures, and stickers in real-time. See your design come to life with our advanced 3D viewer. Perfect for those who want a unique, personalized sneaker experience.',
        price: 200.0,
        salePrice: 179.99,
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
        ],
        category: 'Lifestyle',
        tags: ['nike', '3d-model', 'customizable', 'interactive', 'lifestyle'],
        specifications: {
          Brand: 'Nike',
          Model: 'Custom 3D Sneaker',
          Color: 'Customizable',
          Size: 'US 7-13',
          Material: 'Premium Materials',
          Weight: '350g',
          Technology: '3D Customization Technology',
        },
        stock: 15,
        shippingInfo:
          'Custom orders take 5-7 business days. Free shipping on orders over $100.',
        estimatedDeliveryDays: 7,
        averageRating: 4.8,
        totalReviews: 10,
      }),
    ];

    // Note: `images` and `tags` are `simple-array` columns in TypeORM.
    // TypeORM will serialize string[] automatically, so we keep them as arrays here.

    const savedProducts = await productRepository.save(products);
    console.log(`Created ${savedProducts.length} products`);

    // Create Reviews
    console.log('Creating reviews...');
    const reviews: Review[] = [];

    // Reviews for Product 1 (Nike Air Max 270)
    reviews.push(
      reviewRepository.create({
        productId: savedProducts[0].id,
        userId: savedUsers[0].id,
        rating: 5,
        comment:
          'Amazing shoes! Very comfortable and stylish. Great for both running and casual wear.',
      }),
      reviewRepository.create({
        productId: savedProducts[0].id,
        userId: savedUsers[1].id,
        rating: 4,
        comment: 'Good quality, runs a bit small. Recommend sizing up.',
      }),
      reviewRepository.create({
        productId: savedProducts[0].id,
        userId: savedUsers[2].id,
        rating: 5,
        comment: 'Love these! The cushioning is excellent and they look great.',
      }),
      reviewRepository.create({
        productId: savedProducts[0].id,
        userId: savedUsers[3].id,
        rating: 4,
        comment: 'Solid purchase. Comfortable but a bit pricey.',
      }),
      reviewRepository.create({
        productId: savedProducts[0].id,
        userId: savedUsers[0].id,
        rating: 4,
        comment: 'Great for daily wear. Good grip on various surfaces.',
      }),
      reviewRepository.create({
        productId: savedProducts[0].id,
        userId: savedUsers[1].id,
        rating: 5,
        comment: 'Perfect fit and amazing comfort. Highly recommend!',
      }),
    );

    // Reviews for Product 2 (Adidas Ultraboost 22)
    reviews.push(
      reviewRepository.create({
        productId: savedProducts[1].id,
        userId: savedUsers[0].id,
        rating: 5,
        comment:
          "Best running shoes I've ever owned. The boost technology is incredible!",
      }),
      reviewRepository.create({
        productId: savedProducts[1].id,
        userId: savedUsers[2].id,
        rating: 5,
        comment: 'Super comfortable and responsive. Great for long runs.',
      }),
      reviewRepository.create({
        productId: savedProducts[1].id,
        userId: savedUsers[3].id,
        rating: 4,
        comment:
          'Excellent quality but expensive. Worth it if you run regularly.',
      }),
      reviewRepository.create({
        productId: savedProducts[1].id,
        userId: savedUsers[1].id,
        rating: 5,
        comment: 'Love the Primeknit upper. Very breathable and flexible.',
      }),
      reviewRepository.create({
        productId: savedProducts[1].id,
        userId: savedUsers[0].id,
        rating: 4,
        comment: 'Great shoes, good arch support. Slightly narrow fit.',
      }),
      reviewRepository.create(
        reviewRepository.create({
          productId: savedProducts[1].id,
          userId: savedUsers[2].id,
          rating: 5,
          comment:
            'Perfect for marathon training. Highly durable and comfortable.',
        }),
      ),
      reviewRepository.create({
        productId: savedProducts[1].id,
        userId: savedUsers[3].id,
        rating: 5,
        comment: 'Amazing cushioning. My feet feel great even after long runs.',
      }),
      reviewRepository.create({
        productId: savedProducts[1].id,
        userId: savedUsers[0].id,
        rating: 4,
        comment: 'Great overall, but the price point is quite high.',
      }),
    );

    // Reviews for Product 3 (Jordan 1)
    reviews.push(
      reviewRepository.create({
        productId: savedProducts[2].id,
        userId: savedUsers[0].id,
        rating: 5,
        comment:
          'Classic design, perfect for any sneaker collection. Great quality!',
      }),
      reviewRepository.create({
        productId: savedProducts[2].id,
        userId: savedUsers[1].id,
        rating: 5,
        comment: 'Iconic sneakers. Love the retro look and comfortable fit.',
      }),
      reviewRepository.create({
        productId: savedProducts[2].id,
        userId: savedUsers[2].id,
        rating: 4,
        comment: 'Beautiful shoes, true to size. Leather quality is excellent.',
      }),
      reviewRepository.create({
        productId: savedProducts[2].id,
        userId: savedUsers[3].id,
        rating: 5,
        comment: 'Must-have for any sneakerhead. Timeless design.',
      }),
      reviewRepository.create({
        productId: savedProducts[2].id,
        userId: savedUsers[0].id,
        rating: 4,
        comment:
          'Great shoes, very comfortable. Slightly stiff at first but breaks in nicely.',
      }),
      reviewRepository.create({
        productId: savedProducts[2].id,
        userId: savedUsers[1].id,
        rating: 5,
        comment:
          'Perfect for both basketball and streetwear. Highly recommend!',
      }),
      reviewRepository.create({
        productId: savedProducts[2].id,
        userId: savedUsers[2].id,
        rating: 5,
        comment: 'The best Jordan 1 colorway! Excellent craftsmanship.',
      }),
      reviewRepository.create({
        productId: savedProducts[2].id,
        userId: savedUsers[3].id,
        rating: 4,
        comment: 'Love the design. Good for casual wear but can be pricey.',
      }),
    );

    // Reviews for Product 4 (New Balance 990v5)
    reviews.push(
      reviewRepository.create({
        productId: savedProducts[3].id,
        userId: savedUsers[0].id,
        rating: 4,
        comment: 'Very comfortable and well-made. Great for everyday use.',
      }),
      reviewRepository.create({
        productId: savedProducts[3].id,
        userId: savedUsers[1].id,
        rating: 5,
        comment: 'Premium quality. Worth every penny. Made in USA is a plus!',
      }),
      reviewRepository.create({
        productId: savedProducts[3].id,
        userId: savedUsers[2].id,
        rating: 4,
        comment: 'Good support and cushioning. Durable construction.',
      }),
      reviewRepository.create({
        productId: savedProducts[3].id,
        userId: savedUsers[3].id,
        rating: 4,
        comment: 'Comfortable but quite expensive. Good quality though.',
      }),
      reviewRepository.create({
        productId: savedProducts[3].id,
        userId: savedUsers[0].id,
        rating: 5,
        comment: 'Excellent running shoes. Great arch support.',
      }),
      reviewRepository.create({
        productId: savedProducts[3].id,
        userId: savedUsers[1].id,
        rating: 4,
        comment: 'Solid shoe, good for long walks. Slightly heavy.',
      }),
    );

    // Reviews for Product 5 (Converse)
    reviews.push(
      reviewRepository.create({
        productId: savedProducts[4].id,
        userId: savedUsers[0].id,
        rating: 5,
        comment: 'Classic and comfortable. Goes with everything. Great value!',
      }),
      reviewRepository.create({
        productId: savedProducts[4].id,
        userId: savedUsers[1].id,
        rating: 4,
        comment: 'Love the style. Comfortable but not great for long walks.',
      }),
      reviewRepository.create({
        productId: savedProducts[4].id,
        userId: savedUsers[2].id,
        rating: 5,
        comment: 'Timeless design. Perfect for casual everyday wear.',
      }),
      reviewRepository.create({
        productId: savedProducts[4].id,
        userId: savedUsers[3].id,
        rating: 4,
        comment: 'Good quality for the price. Runs slightly large.',
      }),
      reviewRepository.create({
        productId: savedProducts[4].id,
        userId: savedUsers[0].id,
        rating: 5,
        comment: 'Affordable and stylish. A staple in my wardrobe.',
      }),
      reviewRepository.create({
        productId: savedProducts[4].id,
        userId: savedUsers[1].id,
        rating: 5,
        comment: 'Perfect casual shoe. Durable and comfortable.',
      }),
      reviewRepository.create({
        productId: savedProducts[4].id,
        userId: savedUsers[2].id,
        rating: 4,
        comment: 'Great for the price. Classic look never goes out of style.',
      }),
      reviewRepository.create({
        productId: savedProducts[4].id,
        userId: savedUsers[3].id,
        rating: 5,
        comment: 'Love these! Multiple colors would be great.',
      }),
      reviewRepository.create({
        productId: savedProducts[4].id,
        userId: savedUsers[0].id,
        rating: 4,
        comment: 'Good everyday shoe. Comfortable and versatile.',
      }),
      reviewRepository.create({
        productId: savedProducts[4].id,
        userId: savedUsers[1].id,
        rating: 5,
        comment: 'Best casual sneakers. Highly recommend for everyone.',
      }),
    );

    // Reviews for Product 6 (Vans)
    reviews.push(
      reviewRepository.create({
        productId: savedProducts[5].id,
        userId: savedUsers[0].id,
        rating: 5,
        comment: 'Perfect skate shoes. Great grip and durability.',
      }),
      reviewRepository.create({
        productId: savedProducts[5].id,
        userId: savedUsers[1].id,
        rating: 4,
        comment: 'Comfortable and stylish. Good for casual wear too.',
      }),
      reviewRepository.create({
        productId: savedProducts[5].id,
        userId: savedUsers[2].id,
        rating: 5,
        comment: 'Iconic design. Love the classic black and white.',
      }),
      reviewRepository.create({
        productId: savedProducts[5].id,
        userId: savedUsers[3].id,
        rating: 4,
        comment: 'Great quality. Good value for money.',
      }),
      reviewRepository.create({
        productId: savedProducts[5].id,
        userId: savedUsers[0].id,
        rating: 4,
        comment: 'Solid skate shoe. Durable sole and good board feel.',
      }),
    );

    // Reviews for Product 7 (Air Force 1)
    reviews.push(
      reviewRepository.create({
        productId: savedProducts[6].id,
        userId: savedUsers[0].id,
        rating: 5,
        comment: 'Classic design, goes with everything. Great quality leather.',
      }),
      reviewRepository.create({
        productId: savedProducts[6].id,
        userId: savedUsers[1].id,
        rating: 5,
        comment: 'Must-have sneakers. Comfortable and versatile.',
      }),
      reviewRepository.create({
        productId: savedProducts[6].id,
        userId: savedUsers[2].id,
        rating: 4,
        comment: 'Great shoes, true to size. Slight break-in period needed.',
      }),
      reviewRepository.create({
        productId: savedProducts[6].id,
        userId: savedUsers[3].id,
        rating: 5,
        comment: 'Love the clean white look. Easy to style.',
      }),
      reviewRepository.create({
        productId: savedProducts[6].id,
        userId: savedUsers[0].id,
        rating: 4,
        comment:
          'Good quality, comfortable. Gets dirty easily but cleans well.',
      }),
      reviewRepository.create({
        productId: savedProducts[6].id,
        userId: savedUsers[1].id,
        rating: 5,
        comment: 'Perfect everyday sneakers. Highly recommend!',
      }),
    );

    // Reviews for Product 8 (Yeezy)
    reviews.push(
      reviewRepository.create({
        productId: savedProducts[7].id,
        userId: savedUsers[0].id,
        rating: 5,
        comment:
          "Incredible comfort! Best sneakers I've ever worn. Worth every penny.",
      }),
      reviewRepository.create({
        productId: savedProducts[7].id,
        userId: savedUsers[1].id,
        rating: 5,
        comment: 'Amazing design and comfort. Boost technology is next level.',
      }),
      reviewRepository.create({
        productId: savedProducts[7].id,
        userId: savedUsers[2].id,
        rating: 5,
        comment: 'Highly sought after for a reason. Incredible quality.',
      }),
      reviewRepository.create({
        productId: savedProducts[7].id,
        userId: savedUsers[3].id,
        rating: 4,
        comment: 'Very comfortable but expensive. Unique design though.',
      }),
      reviewRepository.create({
        productId: savedProducts[7].id,
        userId: savedUsers[0].id,
        rating: 5,
        comment:
          'Perfect fit and unmatched comfort. Premium quality throughout.',
      }),
    );

    reviews.push(
      reviewRepository.create({
        productId: savedProducts[8].id,
        userId: savedUsers[0].id,
        rating: 5,
        comment:
          'Amazing 3D customization experience! Being able to see my design in real-time was incredible.',
      }),
      reviewRepository.create({
        productId: savedProducts[8].id,
        userId: savedUsers[1].id,
        rating: 5,
        comment:
          'The interactive 3D viewer is a game-changer. Love customizing every detail!',
      }),
      reviewRepository.create({
        productId: savedProducts[8].id,
        userId: savedUsers[2].id,
        rating: 4,
        comment:
          'Great concept and execution. The customization options are extensive.',
      }),
      reviewRepository.create({
        productId: savedProducts[8].id,
        userId: savedUsers[3].id,
        rating: 5,
        comment:
          'Best shopping experience ever! The 3D model looks exactly like the real product.',
      }),
      reviewRepository.create({
        productId: savedProducts[8].id,
        userId: savedUsers[0].id,
        rating: 5,
        comment:
          'Perfect for creating unique designs. Quality matches the customization preview.',
      }),
      reviewRepository.create({
        productId: savedProducts[8].id,
        userId: savedUsers[1].id,
        rating: 4,
        comment:
          'Love the interactive features. Would like to see more color options.',
      }),
      reviewRepository.create({
        productId: savedProducts[8].id,
        userId: savedUsers[2].id,
        rating: 5,
        comment:
          'The 3D viewer helped me make the perfect design. Highly recommend!',
      }),
      reviewRepository.create({
        productId: savedProducts[8].id,
        userId: savedUsers[3].id,
        rating: 5,
        comment:
          'Incredible technology. Being able to customize in 3D before ordering is amazing.',
      }),
      reviewRepository.create({
        productId: savedProducts[8].id,
        userId: savedUsers[0].id,
        rating: 4,
        comment:
          'Great product and customization experience. Delivery took a bit longer but worth it.',
      }),
      reviewRepository.create({
        productId: savedProducts[8].id,
        userId: savedUsers[1].id,
        rating: 5,
        comment:
          'The future of sneaker shopping! The 3D model is incredibly detailed and accurate.',
      }),
    );

    const savedReviews = await reviewRepository.save(reviews);
    console.log(`Created ${savedReviews.length} reviews`);

    console.log('Creating raffles...');
    const raffles = [
      raffleRepository.create({
        type: RaffleType.SNEAKER,
        name: 'Nike Air Jordan 1 Retro High OG',
        description:
          'Classic silhouette with premium leather construction. Limited release.',
        imageUrl:
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
        entryPrice: 180.0,
        xpReward: 500,
        requiredLevel: UserLevel.HOBBYIST,
        releaseDate: new Date('2026-02-29T17:00:00.000Z'),
        status: RaffleStatus.ACTIVE,
        productId: savedProducts[2].id,
      }),
      raffleRepository.create({
        type: RaffleType.SNEAKER,
        name: 'Adidas Yeezy Boost 350 V2',
        description:
          'Ultra-comfortable primeknit upper with responsive Boost midsole.',
        imageUrl:
          'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
        entryPrice: 220.0,
        xpReward: 750,
        requiredLevel: UserLevel.ENTHUSIAST,
        releaseDate: new Date('2026-03-15T15:00:00.000Z'),
        status: RaffleStatus.ACTIVE,
        productId: savedProducts[7].id,
      }),
      raffleRepository.create({
        type: RaffleType.SNEAKER,
        name: 'Nike Dunk Low Retro',
        description:
          'Timeless design meets modern comfort. Perfect for everyday wear.',
        imageUrl:
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        entryPrice: 120.0,
        xpReward: 500,
        requiredLevel: UserLevel.HOBBYIST,
        releaseDate: new Date('2026-03-28T20:00:00.000Z'),
        status: RaffleStatus.ACTIVE,
      }),
      raffleRepository.create({
        type: RaffleType.SNEAKER,
        name: 'Nike Air Max 97 Silver Bullet',
        description: 'A retro icon with futuristic design.',
        imageUrl:
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
        entryPrice: 190.0,
        xpReward: 600,
        requiredLevel: UserLevel.HOBBYIST,
        releaseDate: new Date('2025-10-05T16:00:00.000Z'),
        status: RaffleStatus.ENDED,
      }),
      raffleRepository.create({
        type: RaffleType.SNEAKER,
        name: 'Nike Air Force 1 Low Supreme',
        description:
          'Premium collaboration with Supreme. Highly sought after release.',
        imageUrl:
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
        entryPrice: 250.0,
        xpReward: 1000,
        requiredLevel: UserLevel.SNEAKERHEAD,
        releaseDate: new Date('2026-04-10T12:00:00.000Z'),
        status: RaffleStatus.UPCOMING,
      }),
      raffleRepository.create({
        type: RaffleType.EVENT,
        name: 'Sneakerhead Meetup',
        description:
          'Connect with fellow collectors, trade stories, and discover rare finds.',
        imageUrl:
          'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80',
        entryPrice: 15.0,
        xpReward: 500,
        requiredLevel: UserLevel.HOBBYIST,
        eventDate: new Date('2026-03-01T18:00:00.000Z'),
        location: 'Brooklyn Warehouse 212',
        capacity: 120,
        status: RaffleStatus.ACTIVE,
      }),
      raffleRepository.create({
        type: RaffleType.EVENT,
        name: 'DJ Party & Sneaker Showcase',
        description:
          'Night of music, exclusive drops, and streetwear culture celebration.',
        imageUrl:
          'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=80',
        entryPrice: 40.0,
        xpReward: 750,
        requiredLevel: UserLevel.ENTHUSIAST,
        eventDate: new Date('2026-03-20T18:00:00.000Z'),
        location: 'Kadıköy Ferry Terminal',
        capacity: 300,
        status: RaffleStatus.ACTIVE,
      }),
      raffleRepository.create({
        type: RaffleType.EVENT,
        name: 'Exclusive Collector Breakfast',
        description:
          'Premium event for Sneakerhead level members. Rare finds and networking.',
        imageUrl:
          'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1600&q=80',
        entryPrice: 75.0,
        xpReward: 1200,
        requiredLevel: UserLevel.SNEAKERHEAD,
        eventDate: new Date('2026-04-15T09:00:00.000Z'),
        location: 'Manhattan Rooftop',
        capacity: 50,
        status: RaffleStatus.UPCOMING,
      }),
    ];

    const savedRaffles = await raffleRepository.save(raffles);
    console.log(`Created ${savedRaffles.length} raffles`);

    console.log('\n✅ Database seeded successfully!');
    console.log(`\nCreated:`);
    console.log(`- ${savedUsers.length} users`);
    console.log(`- ${savedProducts.length} products`);
    console.log(`- ${savedReviews.length} reviews`);
    console.log(`- ${savedRaffles.length} raffles`);
    console.log('\n📧 Test user credentials:');
    console.log('Email: john.doe@example.com (or any other user)');
    console.log('Password: password123');
    console.log('\n🔗 You can now access products at:');
    savedProducts.forEach((product, index) => {
      console.log(
        `  Product ${index + 1}: http://localhost:3000/products/${product.id}`,
      );
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
    console.log('\nDatabase connection closed.');
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log('Seed completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
