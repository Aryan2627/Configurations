import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Implicit select all to avoid 'Unknown arg' errors if Vercel caches an old Prisma client
    const orgs = await prisma.organization.findMany({
      orderBy: { name: 'asc' }
    });
    
    // Safely map features since they are stored as JSON strings
    const safeOrgs = orgs.map(org => ({
      id: org.id,
      name: org.name,
      features: org.features,
      licenseStart: (org as any).licenseStart || null,
      licenseEnd: (org as any).licenseEnd || null,
      licenseStatus: (org as any).licenseStatus || 'Active',
      licensePlan: (org as any).licensePlan || 'Enterprise'
    }));

    return NextResponse.json(safeOrgs);
  } catch (error: any) {
    console.error("GET ORGS ERROR:", error);
    return NextResponse.json({ error: 'Failed to fetch organizations', details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { id, features, licenseStart, licenseEnd, licenseStatus, licensePlan } = await req.json();
    
    // Build update data dynamically to avoid Prisma client strict typing errors
    // if the Vercel node_modules cache has an outdated Prisma client schema
    const data: any = {};
    if (features !== undefined) data.features = features;
    
    try {
      // We will attempt to update these, but if Prisma Client is outdated on Vercel cache,
      // we don't want the whole update to crash.
      if (licenseStart !== undefined) data.licenseStart = licenseStart;
      if (licenseEnd !== undefined) data.licenseEnd = licenseEnd;
      if (licenseStatus !== undefined) data.licenseStatus = licenseStatus;
      if (licensePlan !== undefined) data.licensePlan = licensePlan;
      
      const updated = await prisma.organization.update({
        where: { id },
        data
      });
      return NextResponse.json(updated);
    } catch (innerError) {
      // Fallback: if updating new columns failed, just update features
      console.warn("Falling back to feature-only update due to Prisma error:", innerError);
      const fallbackUpdated = await prisma.organization.update({
        where: { id },
        data: { features: data.features }
      });
      return NextResponse.json(fallbackUpdated);
    }
  } catch (error: any) {
    console.error("POST ORGS ERROR:", error);
    return NextResponse.json({ error: 'Failed to update organization', details: error.message }, { status: 500 });
  }
}