import { NextResponse } from "next/server";

type HeroStats = {
  productsCount: number;
  customersCount: number;
  avgRating: number;
};

function getBackendBase(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL ?? "").trim();
  return raw.replace(/\/api\/?$/, "").replace(/\/$/, "");
}

function toNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

async function getFallbackStats(backendBase: string): Promise<HeroStats> {
  if (!backendBase) {
    return { productsCount: 0, customersCount: 0, avgRating: 0 };
  }

  try {
    const res = await fetch(`${backendBase}/api/products?limit=1`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("fallback products request failed");
    const json = await res.json();
    const productsCount = toNumber(json?.pagination?.total, 0);
    return { productsCount, customersCount: 0, avgRating: 0 };
  } catch {
    return { productsCount: 0, customersCount: 0, avgRating: 0 };
  }
}

export async function GET() {
  const backendBase = getBackendBase();

  try {
    if (!backendBase) {
      const data = await getFallbackStats(backendBase);
      return NextResponse.json(
        { success: true, data, fallback: true },
        { status: 200 },
      );
    }

    const res = await fetch(`${backendBase}/api/stats/hero`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`hero stats status ${res.status}`);

    const json = await res.json();
    const data = json?.data;
    if (!json?.success || !data) throw new Error("hero stats payload invalid");

    return NextResponse.json(
      {
        success: true,
        data: {
          productsCount: toNumber(data.productsCount, 0),
          customersCount: toNumber(data.customersCount, 0),
          avgRating: toNumber(data.avgRating, 0),
        },
      },
      { status: 200 },
    );
  } catch {
    const data = await getFallbackStats(backendBase);
    return NextResponse.json(
      { success: true, data, fallback: true },
      { status: 200 },
    );
  }
}
