const prisma = require("../config/prisma");
const { analyzeProblem } = require("../services/ollama");
const { findMatches } = require("../services/matching");

const PROBLEM_KEYS = new Set(["problem", "query", "q", "description", "text", "message"]);

function readField(source, names) {
  if (!source || typeof source !== "object") return undefined;
  for (const [key, value] of Object.entries(source)) {
    if (names.has(key.toLowerCase())) return value;
  }
  return undefined;
}

function readProblem(req) {
  if (typeof req.body === "string") return req.body.trim();
  const value = readField(req.body, PROBLEM_KEYS) ?? readField(req.query, PROBLEM_KEYS);
  return typeof value === "string" ? value.trim() : "";
}

const discover = async (req, res, next) => {
  try {
    const problem = readProblem(req);
    const radiusKm = Number(readField(req.body, new Set(["radiuskm"])) ?? req.query.radiusKm ?? 25);

    if (problem.length < 8 || problem.length > 1000) {
      return res.status(400).json({
        success: false,
        message: problem
          ? "Describe the problem in 8 to 1000 characters."
          : "Send the problem as JSON, for example {\"problem\":\"I need my house cleaned\",\"radiusKm\":25,\"latitude\":38.25,\"longitude\":128.56}.",
      });
    }

    if (!Number.isFinite(radiusKm) || radiusKm < 1 || radiusKm > 200) {
      return res.status(400).json({
        success: false,
        message: "Radius must be between 1 and 200 kilometers.",
      });
    }

    let latitude = Number(readField(req.body, new Set(["latitude", "lat"])) ?? req.query.latitude ?? req.query.lat);
    let longitude = Number(readField(req.body, new Set(["longitude", "lng", "lon"])) ?? req.query.longitude ?? req.query.lng ?? req.query.lon);

    if (req.user) {
      latitude = req.user.latitude;
      longitude = req.user.longitude;
    }

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({
        success: false,
        message: "A location is required before providers can be matched.",
      });
    }

    const analysis = await analyzeProblem(problem);
    await prisma.llmQuery.create({ data: {} });
    const { geo, results } = await findMatches({
      analysis,
      latitude,
      longitude,
      radiusKm,
    });

    return res.status(200).json({
      success: true,
      data: {
        analysis,
        radiusKm,
        geo,
        results,
      },
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }
    if (error.code === "P1001" || error.code === "P2021") {
      return res.status(503).json({
        success: false,
        message: "The database is not ready.",
      });
    }
    return next(error);
  }
};

const reverseGeocode = async (req, res, next) => {
  try {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      return res.status(400).json({ success: false, message: "Latitude is invalid." });
    }
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      return res.status(400).json({ success: false, message: "Longitude is invalid." });
    }

    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", String(latitude));
    url.searchParams.set("lon", String(longitude));
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");

    const response = await fetch(url, {
      headers: {
        "User-Agent": "LocalConnect/1.0 (university project)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        message: "Could not look up that location.",
      });
    }

    const payload = await response.json();
    const address = payload.address || {};
    const city =
      address.city || address.town || address.village || address.municipality || address.county || "";
    const country = address.country || "";
    const countryCode = typeof address.country_code === "string" ? address.country_code.toUpperCase() : "";

    if (!city || !country || !countryCode) {
      return res.status(404).json({
        success: false,
        message: "That point does not map to a city.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        location: `${city}, ${country}`,
        city,
        country,
        countryCode,
        latitude,
        longitude,
      },
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: "The location service did not respond. Check your internet connection and try again.",
    });
  }
};

module.exports = {
  discover,
  reverseGeocode,
};
