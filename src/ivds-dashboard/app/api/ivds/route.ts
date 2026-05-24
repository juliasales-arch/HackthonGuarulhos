import { NextResponse } from 'next/server';
import { getSummaryStats, getVisibleTerritories, territories, type UserRole } from '@/lib/ivds-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roleParam = searchParams.get('role');
  const role = (roleParam === 'admin' || roleParam === 'cras' || roleParam === 'operator' ? roleParam : 'admin') as UserRole;
  const scopedTerritories = getVisibleTerritories(role, territories);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    role,
    summary: getSummaryStats(scopedTerritories),
    territories: scopedTerritories
  });
}
