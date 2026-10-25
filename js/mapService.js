import { CATEGORY_LABELS } from "./searchService.js";

const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>';

function hasMappableCoordinates(place) {
  return (
    Number.isFinite(place.latitude) &&
    Number.isFinite(place.longitude) &&
    typeof place.coordinateSourceUrl === "string"
  );
}

function createPopupContent(place) {
  const content = document.createElement("div");
  const title = document.createElement("strong");
  title.className = "map-popup-title";
  title.textContent = place.name;

  const category = document.createElement("p");
  category.className = "map-popup-category";
  category.textContent = CATEGORY_LABELS[place.category] ?? "Địa điểm";
  content.append(title, category);

  if (place.address) {
    const address = document.createElement("p");
    address.className = "map-popup-category";
    address.textContent = place.address;
    content.append(address);
  }

  const source = document.createElement("a");
  source.className = "map-popup-source";
  source.href = place.coordinateSourceUrl;
  source.target = "_blank";
  source.rel = "noreferrer";
  source.textContent = "Nguồn tọa độ";
  content.append(source);
  return content;
}

function geolocationErrorMessage(error) {
  if (error.code === 1) {
    return "Bạn đã từ chối quyền định vị. Hãy bật quyền vị trí trong cài đặt trình duyệt rồi thử lại.";
  }
  if (error.code === 2) {
    return "Trình duyệt hiện không xác định được vị trí của bạn.";
  }
  if (error.code === 3) {
    return "Yêu cầu định vị đã hết thời gian. Vui lòng thử lại.";
  }
  return "Không thể lấy vị trí của bạn.";
}

function createIllustrativeRouteCoordinates(stopPlaces) {
  const coordinates = [];

  for (let index = 0; index < stopPlaces.length - 1; index += 1) {
    const start = stopPlaces[index];
    const end = stopPlaces[index + 1];
    const averageLatitude = (start.latitude + end.latitude) / 2;
    const metersPerLongitudeDegree = 111320 * Math.cos((averageLatitude * Math.PI) / 180);
    const deltaX = (end.longitude - start.longitude) * metersPerLongitudeDegree;
    const deltaY = (end.latitude - start.latitude) * 110540;
    const distance = Math.hypot(deltaX, deltaY);
    const bendCount = distance < 180 ? 0 : Math.min(4, Math.max(1, Math.floor(distance / 900)));
    const pairKey = [start.id, end.id].sort().join(":");
    const seed = [...pairKey].reduce((value, character) => value + character.charCodeAt(0), 0);
    const side = seed % 2 === 0 ? 1 : -1;

    if (index === 0) {
      coordinates.push([start.latitude, start.longitude]);
    }

    for (let bend = 1; bend <= bendCount; bend += 1) {
      const progress = bend / (bendCount + 1);
      const alternatingSide = bend % 2 === 0 ? -side : side;
      const offset = alternatingSide * Math.min(120, Math.max(25, distance * 0.045));
      const x = deltaX * progress - (deltaY / distance) * offset;
      const y = deltaY * progress + (deltaX / distance) * offset;
      coordinates.push([
        start.latitude + y / 110540,
        start.longitude + x / metersPerLongitudeDegree,
      ]);
    }

    coordinates.push([end.latitude, end.longitude]);
  }

  return coordinates;
}

export function initializeMap({ container, places, onPlaceSelected, onTileError }) {
  if (!window.L) {
    throw new Error("Không tải được thư viện Leaflet. Kiểm tra kết nối rồi tải lại trang.");
  }

  const mappablePlaces = places.filter(hasMappableCoordinates);
  if (mappablePlaces.length === 0) {
    throw new Error("Chưa có địa điểm nào có tọa độ kèm nguồn để hiển thị trên bản đồ.");
  }

  const map = window.L.map(container, {
    scrollWheelZoom: false,
    zoomControl: true,
    preferCanvas: true,
  });
  const tileLayer = window.L.tileLayer(TILE_URL, {
    attribution: TILE_ATTRIBUTION,
    maxZoom: 19,
  }).addTo(map);
  const markers = new Map();
  const userLocationLayer = window.L.layerGroup().addTo(map);
  const routeLayer = window.L.layerGroup().addTo(map);
  let hasReportedTileError = false;
  let currentRouteBounds = null;

  tileLayer.on("tileerror", () => {
    if (hasReportedTileError) {
      return;
    }
    hasReportedTileError = true;
    onTileError(new Error("Không tải được một số ô bản đồ. Hãy kiểm tra kết nối mạng và thử lại."));
  });

  for (const place of mappablePlaces) {
    const marker = window.L.marker([place.latitude, place.longitude], {
      title: place.name,
      alt: `Vị trí ${place.name}`,
    })
      .bindPopup(createPopupContent(place))
      .on("click", () => onPlaceSelected(place.id));
    markers.set(place.id, marker);
    marker.addTo(map);
  }

  const allMarkerBounds = window.L.latLngBounds(
    mappablePlaces.map((place) => [place.latitude, place.longitude]),
  );
  let hasInitialFit = false;

  function fitBounds(bounds) {
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    hasInitialFit = true;
  }

  if (container.clientWidth > 0 && container.clientHeight > 0) {
    fitBounds(allMarkerBounds);
  }

  function fitVisiblePlaces() {
    const visibleMarkers = [...markers.values()].filter((marker) => map.hasLayer(marker));
    if (visibleMarkers.length === 0) {
      return false;
    }
    const bounds = window.L.featureGroup(visibleMarkers).getBounds();
    fitBounds(bounds);
    return true;
  }

  function setVisiblePlaces(ids) {
    const visibleIds = new Set(ids);
    for (const [id, marker] of markers) {
      const shouldBeVisible = visibleIds.has(id);
      const isVisible = map.hasLayer(marker);
      if (shouldBeVisible && !isVisible) {
        marker.addTo(map);
      } else if (!shouldBeVisible && isVisible) {
        marker.removeFrom(map);
      }
    }
  }

  function focusPlace(id) {
    const marker = markers.get(id);
    if (!marker || !map.hasLayer(marker)) {
      return false;
    }

    map.setView(marker.getLatLng(), Math.max(map.getZoom(), 15), {
      animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
    marker.openPopup();
    return true;
  }

  function locateUser() {
    if (!navigator.geolocation) {
      return Promise.reject(new Error("Trình duyệt này không hỗ trợ định vị."));
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          userLocationLayer.clearLayers();
          window.L.circleMarker([latitude, longitude], {
            radius: 8,
            color: "#ffffff",
            weight: 3,
            fillColor: "#1a73e8",
            fillOpacity: 1,
          })
            .bindPopup("Vị trí hiện tại của bạn")
            .addTo(userLocationLayer);
          map.setView([latitude, longitude], 15);
          resolve();
        },
        (error) => reject(new Error(geolocationErrorMessage(error))),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    });
  }

  function showRoute(stopPlaces) {
    if (stopPlaces.length < 2) {
      throw new Error("Lộ trình minh họa cần ít nhất hai điểm dừng.");
    }

    routeLayer.clearLayers();
    const coordinates = createIllustrativeRouteCoordinates(stopPlaces);
    window.L.polyline(coordinates, {
      color: "#ffffff",
      weight: 10,
      opacity: 0.95,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(routeLayer);
    window.L.polyline(coordinates, {
      color: "#1a73e8",
      weight: 5,
      opacity: 1,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(routeLayer);

    stopPlaces.forEach((place, index) => {
      const stopLabel =
        index === 0 ? `A · ${place.name}` :
          index === stopPlaces.length - 1 ? `B · ${place.name}` :
            `${index + 1}. ${place.name}`;
      const tooltip = document.createElement("span");
      tooltip.textContent = stopLabel;
      window.L.circleMarker([place.latitude, place.longitude], {
        radius: 8,
        color: "#ffffff",
        weight: 2,
        fillColor: index === 0 ? "#188038" : index === stopPlaces.length - 1 ? "#d93025" : "#1a73e8",
        fillOpacity: 1,
      })
        .bindTooltip(tooltip, { direction: "top", offset: [0, -7] })
        .addTo(routeLayer);
    });

    currentRouteBounds = window.L.latLngBounds(coordinates);
    map.fitBounds(currentRouteBounds, { padding: [60, 60], maxZoom: 15 });
  }

  function showRoadRoute(routeCoordinates, stops) {
    if (
      !Array.isArray(routeCoordinates) ||
      routeCoordinates.length < 2 ||
      !Array.isArray(stops) ||
      stops.length < 2
    ) {
      throw new Error("Dữ liệu tuyến đường không hợp lệ.");
    }

    routeLayer.clearLayers();
    const coordinates = routeCoordinates.map(([longitude, latitude]) => [latitude, longitude]);
    window.L.polyline(coordinates, {
      color: "#ffffff",
      weight: 10,
      opacity: 0.95,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(routeLayer);
    window.L.polyline(coordinates, {
      color: "#1a73e8",
      weight: 5,
      opacity: 1,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(routeLayer);

    stops.forEach((place, index) => {
      const stopLabel =
        index === 0 ? `A · ${place.name}` :
          index === stops.length - 1 ? `B · ${place.name}` :
            `${index + 1}. ${place.name}`;
      const tooltip = document.createElement("span");
      tooltip.textContent = stopLabel;
      window.L.circleMarker([place.latitude, place.longitude], {
        radius: 8,
        color: "#ffffff",
        weight: 2,
        fillColor: index === 0 ? "#188038" : index === stops.length - 1 ? "#d93025" : "#1a73e8",
        fillOpacity: 1,
      })
        .bindTooltip(tooltip, { direction: "top", offset: [0, -7] })
        .addTo(routeLayer);
    });

    currentRouteBounds = window.L.latLngBounds(coordinates);
    map.fitBounds(currentRouteBounds, { padding: [60, 60], maxZoom: 15 });
  }

  function clearRoute() {
    routeLayer.clearLayers();
    currentRouteBounds = null;
  }

  return {
    clearRoute,
    fitVisiblePlaces,
    focusPlace,
    invalidateSize: () => {
      map.invalidateSize({ pan: false });
      if (currentRouteBounds && container.clientWidth > 0 && container.clientHeight > 0) {
        map.fitBounds(currentRouteBounds, { padding: [60, 60], maxZoom: 15 });
      } else if (!hasInitialFit && container.clientWidth > 0 && container.clientHeight > 0) {
        fitVisiblePlaces();
      }
    },
    locateUser,
    showRoute,
    showRoadRoute,
    setVisiblePlaces,
  };
}
