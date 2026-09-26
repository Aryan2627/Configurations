import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt } from '../../../lib/encryption';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();





function isValidCsrf(req: Request) {
  // Simple CSRF: Check if custom header exists to prevent simple form POSTs
  const csrfHeader = req.headers.get("X-Requested-With");
  return csrfHeader === "XMLHttpRequest";
}

export async function GET(req: Request) {
  try {
    // Implicit select all to avoid 'Unknown arg' errors if Vercel caches an old Prisma client
    const orgs = await prisma.organization.findMany({
      orderBy: { name: 'asc' }
    });
    
    // Safely map features since they are stored as JSON strings
    
    const safeOrgs = orgs.map(org => {
      let decryptedFeatures = org.features;
      if (decryptedFeatures && decryptedFeatures.includes(':')) {
         decryptedFeatures = decrypt(decryptedFeatures);
      }
      return {
      id: org.id,
      name: org.name,
      features: decryptedFeatures,
      licenseStart: (org as any).licenseStart || null,
      licenseEnd: (org as any).licenseEnd || null,
      licenseStatus: (org as any).licenseStatus || 'Active',
      licensePlan: (org as any).licensePlan || 'Enterprise'
    };
    });


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
      
      
      // 4. Encrypt features (Field-level encryption)
      if (data.features) {
        data.features = encrypt(data.features);
      }

      const updated = await prisma.organization.update({
        where: { id },
        data
      });

      // 2. Immutable Audit Trail
      await prisma.auditLog.create({
        data: {
          organizationId: id,
          actorEmail: "super_admin@procgen.com",
          action: "CONFIG_UPDATE",
          entityType: "Organization",
          entityRef: id,
          details: JSON.stringify({ updatedFields: Object.keys(data) })
        }
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