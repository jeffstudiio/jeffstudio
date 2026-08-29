const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
async function seed() {
  const count = await db.category.count();
  if (count > 0) { console.log('Already has ' + count + ' categories'); process.exit(0); }

  await db.category.createMany({
    data: [
      { slug: 'architecture', titleFa: 'مجسمه سازی معماری', titleEn: 'Architectural Visualization', order: 0 },
      { slug: 'interior', titleFa: 'طراحی داخلی', titleEn: 'Interior Design', order: 1 },
      { slug: 'branding', titleFa: 'برندینگ', titleEn: 'Branding', order: 2 },
    ]
  });

  await db.service.createMany({
    data: [
      {
        titleFa: 'مجسمه سازی سه بعدی', titleEn: '3D Modeling',
        descFa: 'ساخت مدل های سه بعدی حرفه ای', descEn: 'Professional 3D modeling',
        priceFa: 'تماس بگیرید', priceEn: 'Contact us',
        iconSvg: 'Box',
        featuresFa: '["مدل سازی دقیق","رندر فتورئالستیک","انیمیشن"]',
        featuresEn: '["Precise modeling","Photorealistic render","Animation"]',
        order: 0
      },
    ]
  });

  await db.siteSetting.createMany({
    data: [
      { key: 'site_title_fa', value: 'جف استودیو' },
      { key: 'site_title_en', value: 'JEFF Studio' },
    ]
  });

  console.log('Seed completed!');
}
seed().catch(console.error).finally(() => db.$disconnect());
