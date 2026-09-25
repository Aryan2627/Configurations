import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const orgs = await prisma.organization.findMany({
      select: { id: true, name: true, features: true, licenseStart: true, licenseEnd: true, licenseStatus: true, licensePlan: true },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(orgs);
  } catch (error: any) {
    console.error("GET ORGS ERROR:", error);
    return NextResponse.json({ error: 'Failed to fetch organizations', details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { id, features, licenseStart, licenseEnd, licenseStatus, licensePlan } = await req.json();
    const data: any = {};
    if (features !== undefined) data.features = features;
    if (licenseStart !== undefined) data.licenseStart = licenseStart;
    if (licenseEnd !== undefined) data.licenseEnd = licenseEnd;
    if (licenseStatus !== undefined) data.licenseStatus = licenseStatus;
    if (licensePlan !== undefined) data.licensePlan = licensePlan;
    
    const updated = await prisma.organization.update({
      where: { id },
      data
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("POST ORGS ERROR:", error);
    return NextResponse.json({ error: 'Failed to update organization', details: error.message }, { status: 500 });
  }
}