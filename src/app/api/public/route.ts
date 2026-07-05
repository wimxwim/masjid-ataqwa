import { NextResponse } from "next/server";
import {
  getDefaultMosque,
  getDashboardStats,
  getFundTypeBreakdown,
  getFeaturedPrograms,
  getPublicTransactions,
  getPublicActivityFeed,
  getPublicTestimonials,
  getBummStats,
} from "@/lib/actions/public";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const mosque = await getDefaultMosque();
    if (!mosque) return NextResponse.json({ error: "No active mosque" }, { status: 404 });

    const [stats, fundBreakdown, featuredPrograms, transactions, activityFeed, testimonials, bummStats] = await Promise.all([
      getDashboardStats(mosque.id),
      getFundTypeBreakdown(mosque.id),
      getFeaturedPrograms(mosque.id),
      getPublicTransactions(mosque.id),
      getPublicActivityFeed(mosque.id),
      getPublicTestimonials(mosque.id),
      getBummStats(mosque.id),
    ]);

    return NextResponse.json({
      mosque: { name: mosque.name, config: mosque.config },
      stats,
      fundBreakdown,
      featuredPrograms,
      transactions,
      activityFeed,
      testimonials,
      bummStats,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
