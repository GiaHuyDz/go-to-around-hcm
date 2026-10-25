import { estimateTransportLeg } from "./transportService.js";

const BUS_ROUTES_URL = new URL("../data/busRoutes.json", import.meta.url);
export async function loadBusRoutes() {
  const response = await fetch(BUS_ROUTES_URL);
  if (!response.ok) {
    throw new Error(`Không thể tải dữ liệu tuyến minh họa (HTTP ${response.status}).`);
  }

  const routes = await response.json();
  if (!Array.isArray(routes)) {
    throw new Error("Tệp tuyến minh họa không đúng định dạng danh sách.");
  }

  const ids = new Set();
  for (const [index, route] of routes.entries()) {
    if (
      !route ||
      typeof route.id !== "string" ||
      typeof route.fromPlaceId !== "string" ||
      typeof route.toPlaceId !== "string" ||
      route.fromPlaceId === route.toPlaceId ||
      !Array.isArray(route.stopPlaceIds) ||
      route.stopPlaceIds.length < 2 ||
      route.stopPlaceIds.some((id) => typeof id !== "string") ||
      new Set(route.stopPlaceIds).size !== route.stopPlaceIds.length ||
      route.stopPlaceIds[0] !== route.fromPlaceId ||
      route.stopPlaceIds.at(-1) !== route.toPlaceId ||
      typeof route.allowsReverse !== "boolean" ||
      !Number.isInteger(route.fareVnd) ||
      route.fareVnd < 0 ||
      !Number.isInteger(route.durationMinutes) ||
      route.durationMinutes <= 0 ||
      typeof route.simulationNote !== "string" ||
      route.simulationNote.trim().length === 0
    ) {
      throw new Error(`Dữ liệu tuyến thứ ${index + 1} không hợp lệ.`);
    }
    if (ids.has(route.id)) {
      throw new Error(`Mã dữ liệu tuyến "${route.id}" bị trùng.`);
    }
    ids.add(route.id);
  }

  return routes;
}

export function findDemoRoute(routes, fromPlaceId, toPlaceId, places, mode = "bus") {
  const placesById = new Map(places.map((place) => [place.id, place]));
  const fromPlace = placesById.get(fromPlaceId);
  const toPlace = placesById.get(toPlaceId);
  if (
    !fromPlace ||
    !toPlace ||
    fromPlaceId === toPlaceId ||
    !hasRouteCoordinates(fromPlace) ||
    !hasRouteCoordinates(toPlace)
  ) {
    return null;
  }

  if (mode !== "bus" && mode !== "motorbike") {
    throw new Error("Phương tiện di chuyển không hợp lệ.");
  }
  if (mode === "motorbike") {
    return createEstimatedRoute(fromPlace, toPlace, mode);
  }

  const match = routes.find((route) => {
    const isForward = route.fromPlaceId === fromPlaceId && route.toPlaceId === toPlaceId;
    const isReverse =
      route.allowsReverse &&
      route.fromPlaceId === toPlaceId &&
      route.toPlaceId === fromPlaceId;
    return isForward || isReverse;
  });

  if (!match) {
    return createEstimatedRoute(fromPlace, toPlace, mode);
  }

  const isReverse = match.fromPlaceId === toPlaceId;
  const stopPlaceIds = isReverse ? [...match.stopPlaceIds].reverse() : [...match.stopPlaceIds];
  const stopPlaces = stopPlaceIds.map((id) => placesById.get(id));
  if (
    stopPlaces.some(
      (place) => !place || !hasRouteCoordinates(place),
    )
  ) {
    return createEstimatedRoute(fromPlace, toPlace, mode);
  }

  return {
    route: { ...match, transportMode: "bus", isGenerated: false },
    stopPlaceIds,
    stopPlaces,
  };
}

function hasRouteCoordinates(place) {
  return (
    Number.isFinite(place.latitude) &&
    Number.isFinite(place.longitude) &&
    Boolean(place.coordinateSourceUrl)
  );
}

function getDistanceKm(fromPlace, toPlace) {
  const radians = (degrees) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(toPlace.latitude - fromPlace.latitude);
  const longitudeDelta = radians(toPlace.longitude - fromPlace.longitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(fromPlace.latitude)) *
      Math.cos(radians(toPlace.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function createEstimatedRoute(fromPlace, toPlace, mode) {
  const straightLineKm = getDistanceKm(fromPlace, toPlace);
  const estimate = estimateTransportLeg(straightLineKm, mode);
  const route = {
    id: `estimated-${fromPlace.id}-to-${toPlace.id}`,
    fromPlaceId: fromPlace.id,
    toPlaceId: toPlace.id,
    allowsReverse: false,
    fareVnd: estimate.fareVnd,
    durationMinutes: estimate.minutes,
    distanceKm: estimate.distanceKm,
    transportMode: mode,
    isGenerated: true,
    simulationNote:
      mode === "bus"
        ? "Tuyến, khoảng cách, thời gian và giá xe buýt được ước tính để minh họa từ tọa độ hai địa điểm; không phải tuyến hoặc giá vé thực tế. Đường vẽ không bám theo đường phố."
        : "Đường đi, khoảng cách, thời gian và chi phí xe máy được ước tính để tham khảo từ tọa độ; không phải chỉ dẫn giao thông hoặc chi phí thực tế.",
  };
  return {
    route,
    stopPlaceIds: [fromPlace.id, toPlace.id],
    stopPlaces: [fromPlace, toPlace],
  };
}
