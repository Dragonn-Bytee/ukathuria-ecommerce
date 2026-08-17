import Product from '../models/Product.js';
import User from '../models/User.js';
import { sampleUsers, sampleProducts } from './seedData.js';

export async function autoSeedDatabase(options = {}) {
  const { force = false } = options;
  try {
    console.log('Running MongoDB database catalog sync...');

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
      console.log('Force reset requested. Clearing existing products...');
      await Product.deleteMany({});
    }

    // 3. Upsert products with createdBy linked to admin user
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
    console.log(`Database catalog sync complete. Inserted: ${insertedCount}, Total in DB: ${totalProducts}`);
    return { seeded: true, count: totalProducts, inserted: insertedCount };
  } catch (error) {
    console.error('Error syncing/seeding database:', error);
    return { seeded: false, error: error.message };
  }
}

export default autoSeedDatabase;
