const PLACES_URL = new URL("../data/places.json", import.meta.url);

function hasValidImageMetadata(place) {
  if (place.image === null) {
    return true;
  }

  if (typeof place.image !== "string" || !place.image.trim()) {
    return false;
  }

  let isLocalImage = false;
  try {
    const imageUrl = new URL(place.image, window.location.href);
    isLocalImage =
      place.image.startsWith("./assets/images/") &&
      !place.image.includes("..") &&
      imageUrl.origin === window.location.origin;
  } catch {
    isLocalImage = false;
  }

  let isHttpsImage = false;
  try {
    isHttpsImage = new URL(place.image).protocol === "https:";
  } catch {
    isHttpsImage = false;
  }

  const isHttpsSource = (value) => {
    if (typeof value !== "string") {
      return false;
    }
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  };

  return (
    (isLocalImage || isHttpsImage) &&
    isHttpsSource(place.imageSource) &&
    isHttpsSource(place.imageLicenseUrl) &&
    typeof place.imageLicense === "string" &&
    Boolean(place.imageLicense.trim()) &&
    typeof place.imageCreator === "string" &&
    Boolean(place.imageCreator.trim()) &&
    typeof place.imageAlt === "string" &&
    Boolean(place.imageAlt.trim())
  );
}

export async function loadPlaces() {
  const response = await fetch(PLACES_URL);

  if (!response.ok) {
    throw new Error(`Không thể tải dữ liệu địa điểm (HTTP ${response.status}).`);
  }

  const places = await response.json();
  if (!Array.isArray(places)) {
    throw new Error("Tệp dữ liệu địa điểm không đúng định dạng danh sách.");
  }

  const ids = new Set();
  for (const [index, place] of places.entries()) {
    if (
      !place ||
      typeof place !== "object" ||
      typeof place.id !== "string" ||
      typeof place.name !== "string" ||
      typeof place.category !== "string" ||
      typeof place.visitorInfoVerified !== "boolean" ||
      !Array.isArray(place.tags) ||
      !hasValidImageMetadata(place)
    ) {
      throw new Error(`Bản ghi địa điểm thứ ${index + 1} thiếu trường dữ liệu bắt buộc.`);
    }
    if (ids.has(place.id)) {
      throw new Error(`Mã địa điểm "${place.id}" bị trùng trong tệp dữ liệu.`);
    }
    ids.add(place.id);
  }

  return places;
}
