import Product from '../models/Product.js';
import User from '../models/User.js';
import { sampleUsers, sampleProducts } from './seedData.js';

export async function autoSeedDatabase(options = {}) {
  const { force = false } = options;
  try {
    const existingCount = await Product.countDocuments();
    if (existingCount > 0 && !force) {
      console.log(`Database already has ${existingCount} products. Skipping auto-seed.`);
      return { seeded: false, count: existingCount };
    }

    console.log('Seeding MongoDB database with initial catalog...');

    // 1. Ensure Admin and Demo users exist
    let adminUser = await User.findOne({ email: 'admin@ecommerce.com' });
    if (!adminUser) {
      for (const u of sampleUsers) {
        const exists = await User.findOne({ email: u.email });
        if (!exists) {
          const newUser = new User(u);
          await newUser.save();
          if (u.role === 'admin') adminUser = newUser;
        }
      }
    }

    if (!adminUser) {
      adminUser = await User.findOne({ role: 'admin' });
    }

    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@ecommerce.com',
        password: 'AdminPassword123!',
        role: 'admin',
        isActive: true,
        emailVerified: true
      });
    }

    // 2. Clear products if force mode is requested
    if (force) {
      await Product.deleteMany({});
    }

    // 3. Insert products with createdBy linked to admin user
    let insertedCount = 0;
    for (const item of sampleProducts) {
      const exists = await Product.findOne({ sku: item.sku });
      if (!exists) {
        const product = new Product({
          ...item,
          createdBy: adminUser._id
        });
        await product.save();
        insertedCount++;
      }
    }

    const totalProducts = await Product.countDocuments();
    console.log(`Successfully seeded database. Total products: ${totalProducts}`);
    return { seeded: true, count: totalProducts, inserted: insertedCount };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { seeded: false, error: error.message };
  }
}

export default autoSeedDatabase;
