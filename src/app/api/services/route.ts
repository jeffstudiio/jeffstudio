import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const services = await db.service.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { titleFa, titleEn, descFa, descEn, priceFa, priceEn, iconSvg, featuresFa, featuresEn, noteFa, noteEn, order } = body;

    if (!titleFa || !titleEn || !descFa || !descEn) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const service = await db.service.create({
      data: {
        titleFa,
        titleEn,
        descFa,
        descEn,
        priceFa: priceFa || '',
        priceEn: priceEn || '',
        iconSvg: iconSvg || '',
        featuresFa: featuresFa || '',
        featuresEn: featuresEn || '',
        noteFa: noteFa || '',
        noteEn: noteEn || '',
        order: order ?? 0,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const service = await db.service.update({
      where: { id },
      data: {
        titleFa: data.titleFa,
        titleEn: data.titleEn,
        descFa: data.descFa,
        descEn: data.descEn,
        priceFa: data.priceFa,
        priceEn: data.priceEn,
        iconSvg: data.iconSvg,
        featuresFa: data.featuresFa,
        featuresEn: data.featuresEn,
        noteFa: data.noteFa,
        noteEn: data.noteEn,
        order: data.order,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    await db.service.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}