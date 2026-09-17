import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const orgs = await prisma.organization.findMany({
      select: { id: true, name: true, features: true },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(orgs);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { id, features } = await req.json();
    const updated = await prisma.organization.update({
      where: { id },
      data: { features }
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 });
  }
}