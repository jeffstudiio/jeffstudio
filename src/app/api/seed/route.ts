import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers })
}

// POST seed the database with sample data
export async function POST() {
  try {
    // Delete all existing data (images first due to cascade)
    await db.projectImage.deleteMany()
    await db.project.deleteMany()
    await db.subCategory.deleteMany()
    await db.category.deleteMany()
    await db.siteSetting.deleteMany()
    await db.service.deleteMany()

    // ── Seed Categories, SubCategories, and Projects ──

    const categoriesData = [
      {
        slug: 'architecture-visualization',
        titleFa: 'معماری و تجسم',
        titleEn: 'Architecture & Visualization',
        descriptionFa: 'طراحی و تجسم پروژه‌های معماری شامل مسکونی، تجاری و عمومی',
        descriptionEn:
          'Design and visualization of architectural projects including residential, commercial, and public',
        coverImage:
          'https://placehold.co/1200x600/1D1817/F1E9E4?text=Architecture+%26+Visualization',
        order: 0,
        subcategories: [
          {
            slug: 'residential',
            titleFa: 'مسکونی',
            titleEn: 'Residential',
            order: 0,
            projects: [
              {
                slug: 'modern-villa-tehran',
                titleFa: 'ویلای مدرن تهران',
                titleEn: 'Modern Villa Tehran',
                descriptionFa:
                  'طراحی ویلای لوکس مدرن در شمال تهران با استفاده از متریال‌های طبیعی و فرم‌های هندسی مینیمال. این پروژه شامل فضاهای باز گسترده و اتصال عمیق با طبیعت است.',
                descriptionEn:
                  'Design of a modern luxury villa in northern Tehran using natural materials and minimal geometric forms. The project features extensive open spaces and a deep connection with nature.',
                clientFa: 'آقای محمدی',
                clientEn: 'Mr. Mohammadi',
                locationFa: 'تهران، فرمانیه',
                locationEn: 'Tehran, Farmanieh',
                year: '2024',
                order: 0,
                images: [
                  {
                    url: 'https://placehold.co/800x600/1D1817/F1E9E4?text=Villa+Exterior',
                    altFa: 'نمای بیرونی ویلای مدرن',
                    altEn: 'Modern Villa Exterior',
                    isCover: true,
                    order: 0,
                  },
                  {
                    url: 'https://placehold.co/800x600/1D1817/F1E9E4?text=Villa+Interior',
                    altFa: 'فضای داخلی ویلا',
                    altEn: 'Villa Interior Space',
                    isCover: false,
                    order: 1,
                  },
                  {
                    url: 'https://placehold.co/800x600/1D1817/F1E9E4?text=Villa+Garden',
                    altFa: 'حیاط و باغ ویلا',
                    altEn: 'Villa Garden',
                    isCover: false,
                    order: 2,
                  },
                ],
              },
              {
                slug: 'apartment-complex-shiraz',
                titleFa: 'مجتمع آپارتمانی شیراز',
                titleEn: 'Apartment Complex Shiraz',
                descriptionFa:
                  'طراحی مجتمع مسکونی ۱۲ واحدی در شیراز با الهام از معماری بومی و ترکیب با طراحی معاصر. فضاها با نورگیرهای طبیعی و حیاط‌های مرکزی سازماندهی شده‌اند.',
                descriptionEn:
                  'Design of a 12-unit residential complex in Shiraz inspired by vernacular architecture blended with contemporary design. Spaces are organized around natural light wells and central courtyards.',
                clientFa: 'شرکت عمران پارس',
                clientEn: 'Pars Development Co.',
                locationFa: 'شیراز، صدرا',
                locationEn: 'Shiraz, Sadra',
                year: '2023',
                order: 1,
                images: [
                  {
                    url: 'https://placehold.co/800x600/1D1817/F1E9E4?text=Apartment+Facade',
                    altFa: 'نمای مجتمع آپارتمانی',
                    altEn: 'Apartment Complex Facade',
                    isCover: true,
                    order: 0,
                  },
                  {
                    url: 'https://placehold.co/800x600/1D1817/F1E9E4?text=Apartment+Lobby',
                    altFa: 'لابی مجتمع',
                    altEn: 'Complex Lobby',
                    isCover: false,
                    order: 1,
                  },
                ],
              },
              {
                slug: 'townhouse-isfahan',
                titleFa: 'تاون‌هاوس اصفهان',
                titleEn: 'Townhouse Isfahan',
                descriptionFa:
                  'طراحی مجموعه‌ای از تاون‌هاوس‌های مدرن در اصفهان با فضای زندگی پایدار و استفاده از انرژی خورشیدی. هر واحد دارای تراس خصوصی و باغچه می‌باشد.',
                descriptionEn:
                  'Design of a modern townhouse development in Isfahan featuring sustainable living spaces and solar energy integration. Each unit includes a private terrace and garden.',
                clientFa: 'آژانس مسکن اصفهان',
                clientEn: 'Isfahan Housing Agency',
                locationFa: 'اصفهان، خمینی‌شهر',
                locationEn: 'Isfahan, Khomeinishahr',
                year: '2024',
                order: 2,
                images: [
                  {
                    url: 'https://placehold.co/800x600/1D1817/F1E9E4?text=Townhouse+Street',
                    altFa: 'نمای خیابانی تاون‌هاوس',
                    altEn: 'Townhouse Street View',
                    isCover: true,
                    order: 0,
                  },
                  {
                    url: 'https://placehold.co/800x600/1D1817/F1E9E4?text=Townhouse+Interior',
                    altFa: 'فضای داخلی تاون‌هاوس',
                    altEn: 'Townhouse Interior',
                    isCover: false,
                    order: 1,
                  },
                ],
              },
            ],
          },
          {
            slug: 'commercial',
            titleFa: 'تجاری',
            titleEn: 'Commercial',
            order: 1,
            projects: [
              {
                slug: 'office-tower-dubai',
                titleFa: 'برج اداری دبی',
                titleEn: 'Office Tower Dubai',
                descriptionFa:
                  'طراحی برج اداری ۳۰ طبقه در دبی با نمایی دینامیک و پوسته‌های فلزی متحرک. ساختمان با گواهی LEED طراحی شده و مصرف انرژی آن ۴۰٪ کمتر از استاندارد است.',
                descriptionEn:
                  'Design of a 30-story office tower in Dubai with a dynamic facade featuring movable metal panels. The building is LEED certified with 40% less energy consumption than standard.',
                clientFa: 'گروه املاک الخلیج',
                clientEn: 'Gulf Properties Group',
                locationFa: 'دبی، دبی مارینا',
                locationEn: 'Dubai, Dubai Marina',
                year: '2023',
                order: 0,
                images: [
                  {
                    url: 'https://placehold.co/800x600/1D1817/F1E9E4?text=Office+Tower',
                    altFa: 'برج اداری',
                    altEn: 'Office Tower',
                    isCover: true,
                    order: 0,
                  },
                  {
                    url: 'https://placehold.co/800x600/1D1817/F1E9E4?text=Tower+Lobby',
                    altFa: 'لابی برج',
                    altEn: 'Tower Lobby',
                    isCover: false,
                    order: 1,
                  },
                ],
              },
              {
                slug: 'shopping-mall-tabriz',
                titleFa: 'مرکز خرید تبریز',
                titleEn: 'Shopping Mall Tabriz',
                descriptionFa:
                  'طراحی مرکز خرید چند طبقه در تبریز با گالری‌های باز و نورگیرهای سقفی. فضای داخلی با الهام از بازارهای سنتی و معماری مدرن طراحی شده است.',
                descriptionEn:
                  'Design of a multi-story shopping mall in Tabriz with open galleries and skylights. The interior is inspired by traditional bazaars and modern architecture.',
                clientFa: 'سرمایه‌گذاری آذربایجان',
                clientEn: 'Azerbaijan Investment',
                locationFa: 'تبریز، خیابان ارک',
                locationEn: 'Tabriz, Ark Street',
                year: '2024',
                order: 1,
                images: [
                  {
                    url: 'https://placehold.co/800x600/1D1817/F1E9E4?text=Mall+Atrium',
                    altFa: 'آتریوم مرکز خرید',
                    altEn: 'Mall Atrium',
                    isCover: true,
                    order: 0,
                  },
                  {
                    url: 'https://placehold.co/800x600/1D1817/F1E9E4?text=Mall+Exterior',
                    altFa: 'نمای بیرونی مرکز خرید',
                    altEn: 'Mall Exterior',
                    isCover: false,
                    order: 1,
                  },
                ],
              },
            ],
          },
          {
            slug: 'public-buildings',
            titleFa: 'ساختمان‌های عمومی',
            titleEn: 'Public Buildings',
            order: 2,
            projects: [
              {
                slug: 'cultural-center-mashhad',
                titleFa: 'مرکز فرهنگی مشهد',
                titleEn: 'Cultural Center Mashhad',
                descriptionFa:
                  'طراحی مرکز فرهنگی و هنری با سالن‌های نمایش، گالری و کتابخانه. فرم ساختمان با الهام از فرش ایرانی و هندسه اسلامی طراحی شده است.',
                descriptionEn:
                  'Design of a cultural and arts center with theaters, galleries, and a library. The building form is inspired by Persian carpets and Islamic geometry.',
                clientFa: 'شهرداری مشهد',
                clientEn: 'Mashhad Municipality',
                locationFa: 'مشهد، بلوار وکیل‌آباد',
                locationEn: 'Mashhad, Vakilabad Blvd',
                year: '2023',
                order: 0,
                images: [
                  {
                    url: 'https://placehold.co/800x600/1D1817/F1E9E4?text=Cultural+Center',
                    altFa: 'مرکز فرهنگی',
                    altEn: 'Cultural Center',
                    isCover: true,
                    order: 0,
                  },
                  {
                    url: 'https://placehold.co/800x600/1D1817/F1E9E4?text=Gallery+Space',
                    altFa: 'فضای گالری',
                    altEn: 'Gallery Space',
                    isCover: false,
                    order: 1,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        slug: 'furniture-product-design',
        titleFa: 'مبلمان و طراحی محصول',
        titleEn: 'Furniture & Product Design',
        descriptionFa: 'طراحی مبلمان، نورپردازی و محصولات صنعتی با رویکرد نوآورانه',
        descriptionEn:
          'Design of furniture, lighting, and industrial products with an innovative approach',
        coverImage:
          'https://placehold.co/1200x600/1D1817/F1E9E4?text=Furniture+%26+Product+Design',
        order: 1,
        subcategories: [
          {
            slug: 'furniture',
            titleFa: 'مبلمان',
            titleEn: 'Furniture',
            order: 0,
            projects: [
              {
                slug: 'ziggurat-shelving',
                titleFa: 'قفسه زیگورات',
                titleEn: 'Ziggurat Shelving',
                descriptionFa:
                  'طراحی قفسه کتاب با الهام از معماری زیگورات باستانی. ساخته شده از چوب بلوط و فلز برنج با قابلیت مونتاژ ماژولار.',
                descriptionEn:
                  'Bookshelf design inspired by ancient ziggurat architecture. Made from oak wood and brass metal with modular assembly capability.',
                clientFa: 'پروژه شخصی',
                clientEn: 'Personal Project',
                locationFa: 'تهران',
                locationEn: 'Tehran',
                year: '2024',
                order: 0,
                images: [
                  {
                    url: 'https://placehold.co/800x600/1D1817/F1E9E4?text=Ziggurat+Shelf',
                    altFa: 'قفسه زیگورات',
                    altEn: 'Ziggurat Shelf',
                    isCover: true,
                    order: 0,
                  },
                  {
                    url: 'https://placehold.co/800x600/1D1817/F1E9E4?text=Shelf+Detail',
                    altFa: 'جزئیات قفسه',
                    altEn: 'Shelf Detail',
                    isCover: false,
                    order: 1,
                  },
                ],
              },
              {
                slug: 'kayan-lounge-chair',
                titleFa: 'مبل راحتی کیان',
                titleEn: 'Kayan Lounge Chair',
                descriptionFa:
                  'مبل راحتی با طراحی ارگونومیک و فرم خمیده. ساختار داخلی از چوب راش و روکش از چرم طبیعی ایتالیایی.',
                descriptionEn:
                  'Lounge chair with ergonomic design and curved form. Internal structure from beech wood and Italian natural leather upholstery.',
                clientFa: 'شرکت کیان دکور',
                clientEn: 'Kayan Decor Co.',
                locationFa: 'تهران',
                locationEn: 'Tehran',
                year: '2023',
                order: 1,
                images: [
                  {
                    url: 'https://placehold.co/800x600/1D1817/F1E9E4?text=Kayan+Chair',
                    altFa: 'مبل کیان',
                    altEn: 'Kayan Chair',
                    isCover: true,
                    order: 0,
                  },
                  {
                    url: 'https://placehold.co/800x600/1D1817/F1E9E4?text=Chair+Side',
                    altFa: 'نمای کناری مبل',
                    altEn: 'Chair Side View',
                    isCover: false,
                    order: 1,
                  },
                ],
              },
            ],
          },
          {
            slug: 'lighting',
            titleFa: 'نورپردازی',
            titleEn: 'Lighting',
            order: 1,
            projects: [
              {
                slug: 'qasida-pendant',
                titleFa: 'لوستر آویز قصیده',
                titleEn: 'Qasida Pendant Light',
                descriptionFa:
                  'لوستر آویز با فرم مینیمال ساخته شده از شیشه دمیده دست و ساختار برنجی. طراحی با الهام از شعر و خط فارسی.',
                descriptionEn:
                  'Pendant light with minimal form made from hand-blown glass and brass structure. Design inspired by Persian poetry and calligraphy.',
                clientFa: 'گالری نور',
                clientEn: 'Noor Gallery',
                locationFa: 'تهران',
                locationEn: 'Tehran',
                year: '2024',
                order: 0,
                images: [
                  {
                    url: 'https://placehold.co/800x600/1D1817/F1E9E4?text=Qasida+Light',
                    altFa: 'لوستر قصیده',
                    altEn: 'Qasida Light',
                    isCover: true,
                    order: 0,
                  },
                  {
                    url: 'https://placehold.co/800x600/1D1817/F1E9E4?text=Light+Detail',
                    altFa: 'جزئیات لوستر',
                    altEn: 'Light Detail',
                    isCover: false,
                    order: 1,
                  },
                ],
              },
            ],
          },
          {
            slug: 'product',
            titleFa: 'محصول صنعتی',
            titleEn: 'Industrial Product',
            order: 2,
            projects: [
              {
                slug: 'ceramic-vase-set',
                titleFa: 'ست گلدان سرامیکی',
                titleEn: 'Ceramic Vase Set',
                descriptionFa:
                  'طراحی ست گلدان سرامیکی با فرم‌های ارگانیک و سطوح متنی. هر قطعه دست‌ساز و منحصر به فرد است.',
                descriptionEn:
                  'Design of a ceramic vase set with organic forms and textured surfaces. Each piece is handmade and unique.',
                clientFa: 'برند زرین',
                clientEn: 'Zarrin Brand',
                locationFa: 'اصفهان',
                locationEn: 'Isfahan',
                year: '2023',
                order: 0,
                images: [
                  {
                    url: 'https://placehold.co/800x600/1D1817/F1E9E4?text=Ceramic+Vase',
                    altFa: 'گلدان سرامیکی',
                    altEn: 'Ceramic Vase',
                    isCover: true,
                    order: 0,
                  },
                  {
                    url: 'https://placehold.co/800x600/1D1817/F1E9E4?text=Vase+Set',
                    altFa: 'ست گلدان‌ها',
                    altEn: 'Vase Set',
                    isCover: false,
                    order: 1,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        slug: 'ai-architecture',
        titleFa: 'معماری هوش مصنوعی',
        titleEn: 'AI Architecture',
        descriptionFa:
          'بهره‌گیری از هوش مصنوعی در فرآیند طراحی معماری و تولید تصاویر مفهومی',
        descriptionEn:
          'Leveraging artificial intelligence in the architectural design process and conceptual image generation',
        coverImage:
          'https://placehold.co/1200x600/1D1817/F1E9E4?text=AI+Architecture',
        order: 2,
        subcategories: [
          {
            slug: 'concept-design',
            titleFa: 'طراحی مفهومی',
            titleEn: 'Concept Design',
            order: 0,
            projects: [
              {
                slug: 'neo-persian-palace',
                titleFa: 'کاخ نئوپارسی',
                titleEn: 'Neo-Persian Palace',
                descriptionFa:
                  'تصاویر مفهومی کاخ مدرن با تلفیق عناصر معماری ایرانی و فرم‌های آینده‌نگرانه. تولید شده با استفاده از هوش مصنوعی.',
                descriptionEn:
                  'Conceptual images of a modern palace blending Persian architectural elements with futuristic forms. Generated using artificial intelligence.',
                clientFa: 'پروژه تحقیقاتی',
                clientEn: 'Research Project',
                year: '2024',
                order: 0,
                images: [
                  {
                    url: 'https://placehold.co/800x600/1D1817/F1E9E4?text=Neo+Persian',
                    altFa: 'کاخ نئوپارسی',
                    altEn: 'Neo-Persian Palace',
                    isCover: true,
                    order: 0,
                  },
                  {
                    url: 'https://placehold.co/800x600/1D1817/F1E9E4?text=Palace+Interior',
                    altFa: 'داخل کاخ',
                    altEn: 'Palace Interior',
                    isCover: false,
                    order: 1,
                  },
                ],
              },
              {
                slug: 'floating-garden-tower',
                titleFa: 'برج باغ شناور',
                titleEn: 'Floating Garden Tower',
                descriptionFa:
                  'مفهوم برج مسکونی با باغ‌های معلق و سیستم‌های خودکفا. ایده‌پردازی با کمک ابزارهای هوش مصنوعی و بازنمایی بصری خلاقانه.',
                descriptionEn:
                  'Concept of a residential tower with hanging gardens and self-sufficient systems. Ideation assisted by AI tools with creative visual representation.',
                clientFa: 'پروژه آکادمیک',
                clientEn: 'Academic Project',
                year: '2024',
                order: 1,
                images: [
                  {
                    url: 'https://placehold.co/800x600/1D1817/F1E9E4?text=Floating+Tower',
                    altFa: 'برج شناور',
                    altEn: 'Floating Tower',
                    isCover: true,
                    order: 0,
                  },
                  {
                    url: 'https://placehold.co/800x600/1D1817/F1E9E4?text=Tower+Section',
                    altFa: 'برش برج',
                    altEn: 'Tower Section',
                    isCover: false,
                    order: 1,
                  },
                ],
              },
            ],
          },
          {
            slug: 'ai-visualization',
            titleFa: 'تجسم هوشمند',
            titleEn: 'AI Visualization',
            order: 1,
            projects: [
              {
                slug: 'parametric-mosque',
                titleFa: 'مسجد پارامتریک',
                titleEn: 'Parametric Mosque',
                descriptionFa:
                  'طراحی مسجد با استفاده از الگوریتم‌های پارامتریک و تجسم با هوش مصنوعی. گنبد با هندسه اسلامی به‌روز شده و نمای موزاییکی با الگوهای محاسباتی.',
                descriptionEn:
                  'Mosque design using parametric algorithms and AI visualization. The dome features updated Islamic geometry and the mosaic facade with computational patterns.',
                clientFa: 'پروژه مفهومی',
                clientEn: 'Conceptual Project',
                year: '2024',
                order: 0,
                images: [
                  {
                    url: 'https://placehold.co/800x600/1D1817/F1E9E4?text=Parametric+Mosque',
                    altFa: 'مسجد پارامتریک',
                    altEn: 'Parametric Mosque',
                    isCover: true,
                    order: 0,
                  },
                  {
                    url: 'https://placehold.co/800x600/1D1817/F1E9E4?text=Mosque+Detail',
                    altFa: 'جزئیات مسجد',
                    altEn: 'Mosque Detail',
                    isCover: false,
                    order: 1,
                  },
                  {
                    url: 'https://placehold.co/800x600/1D1817/F1E9E4?text=Mosque+Interior',
                    altFa: 'داخل مسجد',
                    altEn: 'Mosque Interior',
                    isCover: false,
                    order: 2,
                  },
                ],
              },
              {
                slug: 'biophilic-office',
                titleFa: 'دفتر کار بیوفیلیک',
                titleEn: 'Biophilic Office',
                descriptionFa:
                  'تجسم دفتر کار آینده با طراحی بیوفیلیک. تصاویر تولید شده با هوش مصنوعی نشان‌دهنده فضای کاری با گیاهان طبیعی، نور طبیعی و متریال‌های پایدار.',
                descriptionEn:
                  'Visualization of a future office with biophilic design. AI-generated images show a workspace with natural plants, natural light, and sustainable materials.',
                clientFa: 'پروژه تحقیقاتی',
                clientEn: 'Research Project',
                year: '2023',
                order: 1,
                images: [
                  {
                    url: 'https://placehold.co/800x600/1D1817/F1E9E4?text=Biophilic+Office',
                    altFa: 'دفتر بیوفیلیک',
                    altEn: 'Biophilic Office',
                    isCover: true,
                    order: 0,
                  },
                  {
                    url: 'https://placehold.co/800x600/1D1817/F1E9E4?text=Office+Lounge',
                    altFa: 'فضای استراحت',
                    altEn: 'Office Lounge',
                    isCover: false,
                    order: 1,
                  },
                ],
              },
            ],
          },
        ],
      },
    ]

    // Create categories with subcategories and projects
    for (const catData of categoriesData) {
      const { subcategories, ...categoryFields } = catData

      const category = await db.category.create({ data: categoryFields })

      for (const subData of subcategories) {
        const { projects, ...subFields } = subData

        const subcategory = await db.subCategory.create({
          data: { ...subFields, categoryId: category.id },
        })

        for (const projData of projects) {
          const { images, ...projectFields } = projData

          await db.project.create({
            data: {
              ...projectFields,
              categoryId: category.id,
              subcategoryId: subcategory.id,
              status: 'published',
              images: {
                create: images,
              },
            },
          })
        }
      }
    }

    // Seed default site settings
    const defaultSettings = [
      { key: 'siteTitleFa', value: 'پورتفولیو معماری' },
      { key: 'siteTitleEn', value: 'Architecture Portfolio' },
      { key: 'siteDescriptionFa', value: 'نمایشگاه آثار معماری، طراحی مبلمان و پروژه‌های هوش مصنوعی' },
      { key: 'siteDescriptionEn', value: 'Gallery of architectural works, furniture design, and AI projects' },
      { key: 'contactEmail', value: 'info@portfolio.ir' },
      { key: 'contactPhone', value: '+98 21 1234 5678' },
      { key: 'instagramUrl', value: 'https://instagram.com/architect' },
      { key: 'linkedinUrl', value: 'https://linkedin.com/in/architect' },
      { key: 'aboutTextFa', value: 'معمار و طراح با بیش از ۱۰ سال تجربه در طراحی معماری، مبلمان و بهره‌گیری از فناوری‌های نوین در طراحی.' },
      { key: 'aboutTextEn', value: 'Architect and designer with over 10 years of experience in architectural design, furniture design, and the use of modern technologies in design.' },
    ]

    await db.siteSetting.createMany({ data: defaultSettings })

    // Count created records
    const categoryCount = await db.category.count()
    const subcategoryCount = await db.subCategory.count()
    const projectCount = await db.project.count()
    const imageCount = await db.projectImage.count()
    const settingCount = await db.siteSetting.count()

    // ── Seed Services ──

    const servicesData = [
      {
        titleFa: 'طراحی معماری',
        titleEn: 'Architectural Design',
        descFa: 'طراحی پلان، نما، سایت‌پلان و فاز ۱ و ۲ پروژه‌های مسکونی، تجاری و عمومی با رعایت استانداردهای بین‌المللی و اصول معماری معاصر.',
        descEn: 'Complete architectural design including floor plans, elevations, site plans, and Phase 1 & 2 documents for residential, commercial, and public projects following international standards.',
        priceFa: 'از ۵۰,۰۰۰,۰۰۰ تومان',
        priceEn: 'Starting from $800',
        iconSvg: "<svg viewBox='0 0 48 48' fill='none' stroke='currentColor' strokeWidth='1.5' className='w-full h-full'><rect x='6' y='20' width='16' height='22' rx='1' /><rect x='26' y='12' width='16' height='30' rx='1' /><path d='M6 20h16V10a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v10z' /><path d='M26 12h16V6a2 2 0 0 0-2-2h-12a2 2 0 0 0-2 2v6z' /><line x1='10' y1='26' x2='18' y2='26' /><line x1='10' y1='30' x2='18' y2='30' /><line x1='10' y1='34' x2='15' y2='34' /></svg>",
        featuresFa: 'پلان معماری\nنما و پلان سایت\nفاز ۱ و ۲\nمدل سه‌بعدی اولیه',
        featuresEn: 'Floor Plans\nElevations & Site Plan\nPhase 1 & 2\nPreliminary 3D Model',
        order: 0,
      },
      {
        titleFa: 'طراحی داخلی',
        titleEn: 'Interior Design',
        descFa: 'طراحی فضاهای داخلی شامل انتخاب متریال، رنگ‌بندی، مبلمان و دکوراسیون با رویکردی مدرن و کاربردی برای خلق فضاهای دلنشین.',
        descEn: 'Interior space design including material selection, color schemes, furniture and decor with a modern and functional approach to create inviting spaces.',
        priceFa: 'از ۳۰,۰۰۰,۰۰۰ تومان',
        priceEn: 'Starting from $500',
        iconSvg: "<svg viewBox='0 0 48 48' fill='none' stroke='currentColor' strokeWidth='1.5' className='w-full h-full'><rect x='8' y='8' width='32' height='32' rx='2' /><path d='M8 16h32' /><path d='M16 8v32' /><rect x='20' y='20' width='12' height='12' rx='1' /><circle cx='26' cy='26' r='3' /></svg>",
        featuresFa: 'مودبورد و کانسپت\nپلان چیدمان\nانتخاب متریال\nنقشه‌های اجرایی',
        featuresEn: 'Moodboard & Concept\nLayout Plan\nMaterial Selection\nConstruction Drawings',
        order: 1,
      },
      {
        titleFa: 'رندر سه‌بعدی و بصری‌سازی',
        titleEn: '3D Rendering & Visualization',
        descFa: 'تولید رندرهای فتو‌رئالیستیک با کیفیت بالا با استفاده از V-Ray، Corona و Lumion برای ارائه حرفه‌ای پروژه‌ها به کارفرما.',
        descEn: 'High-quality photorealistic rendering using V-Ray, Corona, and Lumion for professional project presentations to clients.',
        priceFa: 'از ۱۵,۰۰۰,۰۰۰ تومان',
        priceEn: 'Starting from $250',
        iconSvg: "<svg viewBox='0 0 48 48' fill='none' stroke='currentColor' strokeWidth='1.5' className='w-full h-full'><rect x='6' y='6' width='36' height='36' rx='2' /><circle cx='24' cy='24' r='8' /><path d='M24 16v-4M24 36v-4M16 24h-4M36 24h-4' /><path d='M18.3 18.3l-2.8-2.8M32.5 32.5l-2.8-2.8M18.3 29.7l-2.8 2.8M32.5 15.5l-2.8 2.8' /><circle cx='24' cy='24' r='3' /></svg>",
        featuresFa: 'رندر فتو‌رئالیستیک\nانیمیشن معماری\nویرچوال تور\nپست‌پروداکشن',
        featuresEn: 'Photorealistic Render\nArchitectural Animation\nVirtual Tour\nPost-Production',
        order: 2,
      },
      {
        titleFa: 'طراحی مبلمان و محصول',
        titleEn: 'Furniture & Product Design',
        descFa: 'طراحی صنعتی و مبلمان سفارشی از کانسپت تا فایل‌های قابل ساخت. مناسب برای پروژه‌های داخلی و برندهای مبلمان.',
        descEn: 'Industrial and custom furniture design from concept to manufacturing-ready files. Ideal for interior projects and furniture brands.',
        priceFa: 'از ۲۰,۰۰۰,۰۰۰ تومان',
        priceEn: 'Starting from $350',
        iconSvg: "<svg viewBox='0 0 48 48' fill='none' stroke='currentColor' strokeWidth='1.5' className='w-full h-full'><path d='M24 4L4 14v20l20 10 20-10V14L24 4z' /><path d='M4 14l20 10 20-10' /><path d='M24 44V24' /></svg>",
        featuresFa: 'اسکچ و کانسپت\nمدل‌سازی سه‌بعدی\nرندر محصول\nفایل اجرایی CNC',
        featuresEn: 'Sketch & Concept\n3D Modeling\nProduct Render\nCNC Production Files',
        order: 3,
      },
      {
        titleFa: 'معماری هوش مصنوعی',
        titleEn: 'AI Architecture',
        descFa: 'استفاده از ابزارهای هوش مصنوعی مثل Midjourney، Stable Diffusion و DALL·E برای ایده‌پردازی سریع و خلق کانسپت‌های بصری منحصر‌به‌فرد.',
        descEn: 'Leveraging AI tools like Midjourney, Stable Diffusion, and DALL·E for rapid ideation and creating unique visual concepts.',
        priceFa: 'از ۱۰,۰۰۰,۰۰۰ تومان',
        priceEn: 'Starting from $150',
        iconSvg: "<svg viewBox='0 0 48 48' fill='none' stroke='currentColor' strokeWidth='1.5' className='w-full h-full'><circle cx='24' cy='24' r='16' /><path d='M20 28c0-2.2 1.8-4 4-4' /><path d='M24 18v4l3 3' /><path d='M12 24c0-6.6 5.4-12 12-12' /><path d='M24 12c6.6 0 12 5.4 12 12' /><circle cx='36' cy='12' r='3' /><path d='M36 9V6M39 12h3M36 15v3M33 12h-3' /></svg>",
        featuresFa: 'ایده‌پردازی با AI\nکانسپت آرت\nایمج‌بوردینگ\nموشن AI',
        featuresEn: 'AI Ideation\nConcept Art\nImage Compositing\nAI Motion',
        order: 4,
      },
      {
        titleFa: 'مشاوره معماری',
        titleEn: 'Architecture Consultation',
        descFa: 'جلسات مشاوره تخصصی برای بررسی ایده‌ها، راهنمایی در انتخاب مصالح و سیستم‌های ساختمانی و ارائه راهکارهای بهینه.',
        descEn: 'Specialized consultation sessions to review ideas, guide material and building system selection, and provide optimized solutions.',
        priceFa: 'از ۵,۰۰۰,۰۰۰ تومان',
        priceEn: 'Starting from $80',
        iconSvg: "<svg viewBox='0 0 48 48' fill='none' stroke='currentColor' strokeWidth='1.5' className='w-full h-full'><rect x='8' y='6' width='32' height='36' rx='3' /><path d='M14 16h20' /><path d='M14 22h14' /><path d='M14 28h18' /><path d='M14 34h10' /><path d='M32 28l4 4 6-8' /></svg>",
        featuresFa: 'بررسی فنی پروژه\nراهنمایی مصالح\nارائه راهکار\nجلسه آنلاین/حضوری',
        featuresEn: 'Technical Review\nMaterial Guidance\nSolution Proposal\nOnline/In-Person Session',
        order: 5,
      },
    ];

    for (const s of servicesData) {
      await db.service.create({ data: s });
    }
    const serviceCount = servicesData.length;

    return NextResponse.json(
      {
        message: 'Database seeded successfully',
        data: {
          categories: categoryCount,
          subcategories: subcategoryCount,
          projects: projectCount,
          images: imageCount,
          settings: settingCount,
          services: serviceCount,
        },
      },
      { headers }
    )
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500, headers }
    )
  }
}
