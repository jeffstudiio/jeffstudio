import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    let info = await db.contactInfo.findFirst();
    if (!info) {
      // Create default contact info
      info = await db.contactInfo.create({
        data: {
          titleFa: '\u0628\u06cc\u0627\u06cc\u06cc\u062f \u0686\u06cc\u0632\u06cc \u0628\u0633\u0627\u0632\u06cc\u0645',
          titleEn: "Let's Build Something",
          descFa: '\u0628\u0631\u0627\u06cc \u067e\u0631\u0648\u0698\u0647\u200c\u0647\u0627\u06cc \u0645\u0639\u0645\u0627\u0631\u06cc\u060c \u0637\u0631\u0627\u062d\u06cc \u062f\u0627\u062e\u0644\u06cc\u060c \u0631\u0646\u062f\u0631 \u06cc\u0627 \u0637\u0631\u0627\u062d\u06cc \u0645\u0628\u0644\u0627\u0646 \u2014 \u0627\u06cc\u0631\u0627\u0646\u06cc \u06cc\u0627 \u0628\u06cc\u0646\u200c\u0627\u0644\u0645\u0644\u0644\u06cc\u060c \u0628\u0627 \u0645\u0646 \u062f\u0631 \u0627\u0631\u062a\u0628\u0627\u0637 \u0628\u0627\u0634\u06cc\u062f.',
          descEn: 'For architecture, interior design, 3D visualization, or furniture design projects \u2014 local or international, get in touch.',
          addressFa: '\u0645\u0634\u0647\u062f\u060c \u0627\u06cc\u0631\u0627\u0646',
          addressEn: 'Mashhad, Iran',
          phone: '+98 915 902 6785',
          email: 'mostafa.jafari313@gmail.com',
          whatsapp: '',
          telegram: '',
          socialsJson: JSON.stringify([
            { type: 'instagram', labelFa: '\u0627\u06cc\u0646\u0633\u062a\u0627\u06af\u0631\u0627\u0645 \u0634\u062e\u0635\u06cc', labelEn: 'Instagram (Personal)', value: '@_mostafa.jafari_', href: 'https://www.instagram.com/_mostafa.jafari_' },
            { type: 'instagram', labelFa: '\u0627\u06cc\u0646\u0633\u062a\u0627\u06af\u0631\u0627\u0645 \u0627\u0633\u062a\u0648\u062f\u06cc\u0648', labelEn: 'Instagram (Studio)', value: '@_jeffstudio_', href: 'https://www.instagram.com/_jeffstudio_' },
            { type: 'pinterest', labelFa: '\u067e\u06cc\u0646\u062a\u0631\u0633\u062a', labelEn: 'Pinterest', value: 'jeffstudiio', href: 'https://www.pinterest.com/jeffstudiio' },
            { type: 'behance', labelFa: '\u0628\u06cc\u0647\u0646\u0633', labelEn: 'Behance', value: 'mostafajafari313', href: 'https://www.behance.net/mostafajafari313' },
            { type: 'linkedin', labelFa: '\u0644\u06cc\u0646\u06a9\u062f\u06cc\u0646', labelEn: 'LinkedIn', value: 'Mostafa Jafari', href: 'https://www.linkedin.com/in/-mostafa-jafari-/' },
          ]),
        },
      });
    }
    return NextResponse.json(info);
  } catch (error) {
    console.error('Error fetching contact info:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    let info = await db.contactInfo.findFirst();
    if (info) {
      info = await db.contactInfo.update({
        where: { id: info.id },
        data: body,
      });
    } else {
      info = await db.contactInfo.create({ data: body });
    }
    return NextResponse.json(info);
  } catch (error) {
    console.error('Error updating contact info:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
