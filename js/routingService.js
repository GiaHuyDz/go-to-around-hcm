const PHOTON_URL = "https://photon.komoot.io/api/";
const OSRM_URL = "https://router.project-osrm.org/route/v1/driving/";
const HO_CHI_MINH_CITY_BOUNDS = "106.2,10.2,107.2,11.5";
const HO_CHI_MINH_CITY_CENTER = { latitude: 10.7769, longitude: 106.7009 };
const REQUEST_TIMEOUT_MS = 12000;
const MAX_ROUTE_WAYPOINTS = 10;

const geocodeCache = new Map();

function normalizeAddress(value) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("vi");
}

function getPlaceCoordinates(place) {
  return (
    Number.isFinite(place.latitude) &&
    Number.isFinite(place.longitude) &&
    place.latitude >= -90 &&
    place.latitude <= 90 &&
    place.longitude >= -180 &&
    place.longitude <= 180
  );
}

function getPhotonLabel(properties) {
  return [
    properties.name,
    properties.street,
    properties.housenumber,
    properties.district,
    properties.county,
    properties.city,
    properties.state,
  ]
    .filter((part, index, parts) => typeof part === "string" && part.trim() && parts.indexOf(part) === index)
    .join(", ");
}

async function fetchJson(url, serviceName) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`${serviceName} phản hồi HTTP ${response.status}.`);
    }
    return await response.json();
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`Yêu cầu đến ${serviceName} quá thời gian chờ. Vui lòng thử lại.`);
    }
    if (error instanceof TypeError) {
      throw new Error(`Không kết nối được ${serviceName}. Hãy kiểm tra mạng rồi thử lại.`);
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function resolveAddress(value, places) {
  const query = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  if (query.length < 3) {
    throw new Error("Hãy nhập địa chỉ có ít nhất 3 ký tự.");
  }

  const normalizedQuery = normalizeAddress(query);
  const exactPlace = places.find(
    (place) =>
      getPlaceCoordinates(place) &&
      [place.name, place.address]
        .filter((candidate) => typeof candidate === "string")
        .some((candidate) => normalizeAddress(candidate) === normalizedQuery),
  );
  if (exactPlace) {
    return {
      id: exactPlace.id,
      name: exactPlace.name,
      latitude: exactPlace.latitude,
      longitude: exactPlace.longitude,
      coordinateSourceUrl: exactPlace.coordinateSourceUrl,
    };
  }

  const cached = geocodeCache.get(normalizedQuery);
  if (cached) {
    return cached;
  }

  const url = new URL(PHOTON_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "5");
  url.searchParams.set("bbox", HO_CHI_MINH_CITY_BOUNDS);
  url.searchParams.set("lat", String(HO_CHI_MINH_CITY_CENTER.latitude));
  url.searchParams.set("lon", String(HO_CHI_MINH_CITY_CENTER.longitude));

  const response = await fetchJson(url, "dịch vụ tìm địa chỉ Photon");
  const features = Array.isArray(response?.features) ? response.features : [];
  const result = features.find((feature) => {
    const coordinates = feature?.geometry?.coordinates;
    const countryCode = feature?.properties?.countrycode;
    return (
      Array.isArray(coordinates) &&
      Number.isFinite(coordinates[0]) &&
      Number.isFinite(coordinates[1]) &&
      coordinates[0] >= 106.2 &&
      coordinates[0] <= 107.2 &&
      coordinates[1] >= 10.2 &&
      coordinates[1] <= 11.5 &&
      (!countryCode || countryCode.toLocaleLowerCase("en") === "vn")
    );
  });

  if (!result) {
    throw new Error("Không tìm thấy địa chỉ phù hợp trong khu vực TP. Hồ Chí Minh. Hãy thử nhập địa chỉ cụ thể hơn.");
  }

  const [longitude, latitude] = result.geometry.coordinates;
  const resolved = {
    id: `address-${normalizedQuery}`,
    name: getPhotonLabel(result.properties ?? {}) || query,
    latitude,
    longitude,
    coordinateSourceUrl: "https://photon.komoot.io/",
  };
  if (geocodeCache.size >= 20) {
    geocodeCache.delete(geocodeCache.keys().next().value);
  }
  geocodeCache.set(normalizedQuery, resolved);
  return resolved;
}

export async function fetchRoadRoute(stops) {
  if (
    !Array.isArray(stops) ||
    stops.length < 2 ||
    stops.length > MAX_ROUTE_WAYPOINTS ||
    stops.some((stop) => !stop || !getPlaceCoordinates(stop))
  ) {
    throw new Error("Lộ trình cần từ 2 đến 10 điểm có tọa độ hợp lệ.");
  }

  const coordinates = stops
    .map((stop) => `${stop.longitude},${stop.latitude}`)
    .join(";");
  const url = `${OSRM_URL}${coordinates}?overview=full&geometries=geojson&steps=false`;
  const response = await fetchJson(url, "dịch vụ định tuyến OSRM");
  const route = response?.routes?.[0];
  const geometry = route?.geometry?.coordinates;

  if (response?.code !== "Ok" || !Array.isArray(geometry) || geometry.length < 2) {
    throw new Error("Không tìm được đường đi phù hợp giữa các điểm đã chọn.");
  }
  if (
    !Number.isFinite(route.distance) ||
    route.distance < 0 ||
    !Number.isFinite(route.duration) ||
    route.duration < 0 ||
    geometry.some(
      (coordinate) =>
        !Array.isArray(coordinate) ||
        !Number.isFinite(coordinate[0]) ||
        !Number.isFinite(coordinate[1]) ||
        coordinate[0] < -180 ||
        coordinate[0] > 180 ||
        coordinate[1] < -90 ||
        coordinate[1] > 90,
    )
  ) {
    throw new Error("Dịch vụ định tuyến trả về dữ liệu không hợp lệ.");
  }

  return {
    coordinates: geometry,
    distanceKm: route.distance / 1000,
    durationMinutes: Math.max(1, Math.round(route.duration / 60)),
  };
}
