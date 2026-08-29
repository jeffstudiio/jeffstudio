import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    let info = await db.aboutInfo.findFirst();
    if (!info) {
      info = await db.aboutInfo.create({
        data: {
          profilePhoto: '',
          bioFa: 'معمار و طراح با بیش از ۸ سال تجربه در زمینه طراحی معماری، طراحی داخلی، بصری‌سازی سه‌بعدی و طراحی مبلمان. ترکیب دانش آکادمیک با تجربه حرفه‌ای برای خلق فضاهایی که هم زیبا و هم کاربردی هستند.\nتخصص من در استفاده از نرم‌افزارهای پیشرفته مانند 3ds Max، V-Ray، Lumion و ابزارهای هوش مصنوعی برای خلق رندرهای واقع‌گرایانه و طراحی‌های نوآورانه است. هر پروژه با دقت و وسواس خاصی انجام می‌شود تا بهترین نتیجه حاصل گردد.',
          bioEn: 'Architect and designer with over 8 years of experience in architectural design, interior design, 3D visualization, and furniture design. Combining academic knowledge with professional expertise to create spaces that are both beautiful and functional.\nMy expertise lies in using advanced software such as 3ds Max, V-Ray, Lumion, and AI tools to create photorealistic renders and innovative designs. Each project is executed with meticulous attention to detail to achieve the best possible result.',
          subtitleFa: 'معمار · طراح داخلی · هنرمند بصری‌سازی',
          subtitleEn: 'Architect · Interior Designer · 3D Visualization Artist',
          skillsJson: JSON.stringify([
            { nameFa: 'AutoCAD', nameEn: 'AutoCAD', level: 95 },
            { nameFa: '3ds Max', nameEn: '3ds Max', level: 90 },
            { nameFa: 'V-Ray / Corona', nameEn: 'V-Ray / Corona', level: 92 },
            { nameFa: 'Lumion', nameEn: 'Lumion', level: 85 },
            { nameFa: 'Revit', nameEn: 'Revit', level: 80 },
            { nameFa: 'Photoshop', nameEn: 'Photoshop', level: 88 },
            { nameFa: 'Midjourney / AI', nameEn: 'Midjourney / AI', level: 90 },
            { nameFa: 'SketchUp', nameEn: 'SketchUp', level: 85 },
          ]),
          statsJson: JSON.stringify([
            { num: '8+', labelFa: 'سال تجربه', labelEn: 'Years Experience' },
            { num: '120+', labelFa: 'پروژه موفق', labelEn: 'Successful Projects' },
            { num: '50+', labelFa: 'کارفرما', labelEn: 'Clients' },
            { num: '15+', labelFa: 'جایزه و افتخار', labelEn: 'Awards' },
          ]),
          experienceJson: JSON.stringify([
            { titleFa: 'معمار و طراح ارشد', titleEn: 'Senior Architect & Designer', orgFa: 'جف استودیو', orgEn: 'JEFF studio', type: 'current' },
            { titleFa: 'ناظر کل، اداره‌کل نوسازی مدارس خراسان رضوی', titleEn: 'Supervisor General — Renovation of Schools, Khorasan Razavi', orgFa: 'سازمان نوسازی مدارس', orgEn: 'School Renovation Organization', type: 'previous' },
            { titleFa: 'طراح معماری، دفتر معماری آفتاب', titleEn: 'Architectural Designer — Aftab Office Architecture', orgFa: 'دفتر معماری آفتاب', orgEn: 'Aftab Office Architecture', type: 'previous' },
          ]),
          educationJson: JSON.stringify([
            { titleFa: 'کارشناسی ارشد معماری', titleEn: 'Master of Architecture' },
            { titleFa: 'کارشناسی معماری', titleEn: 'Bachelor of Architecture' },
          ]),
        },
      });
    }
    return NextResponse.json(info);
  } catch (error) {
    console.error('GET /api/about error:', error);
    return NextResponse.json({ error: 'Failed to load about data' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    let info = await db.aboutInfo.findFirst();
    if (!info) {
      info = await db.aboutInfo.create({ data: body });
    } else {
      info = await db.aboutInfo.update({ where: { id: info.id }, data: body });
    }
    return NextResponse.json(info);
  } catch (error) {
    console.error('PUT /api/about error:', error);
    return NextResponse.json({ error: 'Failed to update about data' }, { status: 500 });
  }
}
