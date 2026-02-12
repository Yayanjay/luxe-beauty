import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Seeding database...');

  // Admin user
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@luxebeauty.com' },
    update: {},
    create: {
      email: 'admin@luxebeauty.com',
      name: 'Admin',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  // Brand settings
  const settings = [
    { key: 'site_name', value: 'Luxe Beauty' },
    { key: 'site_tagline', value: 'Your beauty, elevated.' },
    { key: 'contact_email', value: 'hello@luxebeauty.com' },
    { key: 'currency', value: 'IDR' },
  ];

  for (const setting of settings) {
    await prisma.brandSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: { key: setting.key, value: setting.value },
    });
  }

  // Categories
  const skincare = await prisma.category.upsert({
    where: { slug: 'skincare' },
    update: {},
    create: { name: 'Skincare', slug: 'skincare' },
  });

  const makeup = await prisma.category.upsert({
    where: { slug: 'makeup' },
    update: {},
    create: { name: 'Makeup', slug: 'makeup' },
  });

  await prisma.category.upsert({
    where: { slug: 'moisturizers' },
    update: {},
    create: { name: 'Moisturizers', slug: 'moisturizers', parentId: skincare.id },
  });

  await prisma.category.upsert({
    where: { slug: 'serums' },
    update: {},
    create: { name: 'Serums', slug: 'serums', parentId: skincare.id },
  });

  await prisma.category.upsert({
    where: { slug: 'foundation' },
    update: {},
    create: { name: 'Foundation', slug: 'foundation', parentId: makeup.id },
  });

  // Sample product
  const product = await prisma.product.upsert({
    where: { slug: 'hydra-glow-serum' },
    update: {},
    create: {
      name: 'Hydra Glow Serum',
      slug: 'hydra-glow-serum',
      description: 'Deeply hydrating serum with hyaluronic acid for a dewy glow.',
      categoryId: skincare.id,
      isActive: true,
    },
  });

  await prisma.productVariant.upsert({
    where: { sku: 'HGS-30ML' },
    update: {},
    create: {
      productId: product.id,
      sku: 'HGS-30ML',
      price: 299000,
      compareAtPrice: 350000,
      stock: 50,
      attributes: { size: '30ml' },
    },
  });

  await prisma.productVariant.upsert({
    where: { sku: 'HGS-50ML' },
    update: {},
    create: {
      productId: product.id,
      sku: 'HGS-50ML',
      price: 459000,
      compareAtPrice: 520000,
      stock: 30,
      attributes: { size: '50ml' },
    },
  });

  // Banner
  await prisma.banner.upsert({
    where: { id: 'banner-1' },
    update: {},
    create: {
      id: 'banner-1',
      title: 'New Arrivals — Glow Season',
      image: 'https://placehold.co/1440x600',
      link: '/category/skincare',
      position: 0,
      isActive: true,
    },
  });

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
