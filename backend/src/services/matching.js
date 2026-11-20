const { Prisma } = require("@prisma/client");
const prisma = require("../config/prisma");

function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const MATCH_STOP_WORDS = new Set([
  "the", "and", "for", "with", "your", "service", "services", "professional", "local", "need", "help",
]);

function matchWords(text) {
  return String(text)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 3 && !MATCH_STOP_WORDS.has(word));
}

function textMatches(service, analysis) {
  const haystack = `${service.title} ${service.description} ${service.category}`.toLowerCase();
  const query = [analysis.category, analysis.requiredService, ...(analysis.keywords || [])].join(" ");
  if (haystack.includes(String(analysis.requiredService || "").toLowerCase())) return true;
  return matchWords(query).some((word) => haystack.includes(word));
}

function rankScore({ rating, updatedAt, distanceKm, radiusKm }) {
  const days = Math.max(0, (Date.now() - new Date(updatedAt).getTime()) / 86400000);
  const recency = Math.exp(-days / 45);
  const proximity = Math.max(0.05, 1 - distanceKm / radiusKm);
  const ratingFactor = rating == null ? 1 : rating;
  return ratingFactor * recency * proximity;
}

async function nearbyWithPostgis({ latitude, longitude, radiusMeters }) {
  return prisma.$queryRaw`
    SELECT id,
      ST_Distance(
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
      ) / 1000 AS "distanceKm"
    FROM "Service"
    WHERE "isActive" = true
      AND latitude IS NOT NULL
      AND longitude IS NOT NULL
      AND ST_DWithin(
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
        ${radiusMeters}
      )
  `;
}

async function findMatches({ analysis, latitude, longitude, radiusKm }) {
  let geo = "postgis";
  let distances;

  try {
    distances = await nearbyWithPostgis({
      latitude,
      longitude,
      radiusMeters: radiusKm * 1000,
    });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) && !/st_dwithin|postgis/i.test(String(error.message))) {
      throw error;
    }
    geo = "haversine";
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.max(0.2, Math.cos((latitude * Math.PI) / 180)));
    const rough = await prisma.service.findMany({
      where: {
        isActive: true,
        latitude: { gte: latitude - latDelta, lte: latitude + latDelta },
        longitude: { gte: longitude - lngDelta, lte: longitude + lngDelta },
      },
      select: { id: true, latitude: true, longitude: true },
    });
    distances = rough
      .map((service) => ({
        id: service.id,
        distanceKm: haversineKm(latitude, longitude, service.latitude, service.longitude),
      }))
      .filter((service) => service.distanceKm <= radiusKm);
  }

  if (distances.length === 0) {
    return { geo, results: [] };
  }

  const byId = new Map(distances.map((row) => [row.id, Number(row.distanceKm)]));
  const services = await prisma.service.findMany({
    where: {
      id: { in: [...byId.keys()] },
      isActive: true,
      provider: { isVerified: true, isSuspended: false },
    },
    include: {
      provider: {
        select: { id: true, name: true, city: true, country: true, location: true },
      },
    },
  });

  const results = services
    .filter((service) => textMatches(service, analysis))
    .map((service) => {
      const distanceKm = byId.get(service.id);
      const averageRating = null;
      const reviewCount = 0;
      return {
        id: service.id,
        title: service.title,
        description: service.description,
        category: service.category,
        price: service.price,
        currency: service.currency,
        location: service.location,
        distanceKm: Math.round(distanceKm * 10) / 10,
        averageRating,
        reviewCount,
        provider: service.provider,
        score: rankScore({
          rating: averageRating,
          updatedAt: service.updatedAt,
          distanceKm,
          radiusKm,
        }),
      };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ score, ...service }, index) => ({ ...service, rank: index + 1 }));

  return { geo, results };
}

module.exports = {
  findMatches,
};
