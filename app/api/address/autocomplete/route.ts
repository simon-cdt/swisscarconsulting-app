import { NextRequest, NextResponse } from "next/server";

// Centre approximatif de la Suisse, pour prioriser les résultats suisses
const SWITZERLAND_LAT = 46.8182;
const SWITZERLAND_LON = 8.2275;

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query || query.trim().length < 3) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const url = new URL("https://photon.komoot.io/api/");
    url.searchParams.set("q", query);
    url.searchParams.set("limit", "5");
    url.searchParams.set("lang", "fr");
    url.searchParams.set("lat", SWITZERLAND_LAT.toString());
    url.searchParams.set("lon", SWITZERLAND_LON.toString());

    const res = await fetch(url.toString());
    const data = await res.json();

    type PhotonFeature = {
      properties: {
        name?: string;
        housenumber?: string;
        street?: string;
        postcode?: string;
        city?: string;
        state?: string;
        country?: string;
      };
    };

    const suggestions = (data.features as PhotonFeature[])
      .filter((f) => f.properties.postcode && f.properties.city)
      .map((f) => {
        const street = f.properties.street || f.properties.name || "";
        const houseNumber = f.properties.housenumber || "";
        const fullAddress = `${street} ${houseNumber}`.trim();

        return {
          label: `${fullAddress}, ${f.properties.postcode} ${f.properties.city}`,
          address: fullAddress,
          postalCode: f.properties.postcode || "",
          city: f.properties.city || "",
          country: f.properties.country || "Suisse",
        };
      });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Erreur autocomplete adresse:", error);
    return NextResponse.json({ suggestions: [] });
  }
}
