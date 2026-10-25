const PANORAMAS_URL = new URL("../data/panoramas.json", import.meta.url);

function isHttpsUrl(value) {
  if (typeof value !== "string") {
    return false;
  }

  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isValidPlaceId(value) {
  return typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

export async function loadPanoramas() {
  const response = await fetch(PANORAMAS_URL);

  if (!response.ok) {
    throw new Error(`Không thể tải dữ liệu panorama (HTTP ${response.status}).`);
  }

  const panoramas = await response.json();
  if (!Array.isArray(panoramas)) {
    throw new Error("Tệp dữ liệu panorama không đúng định dạng danh sách.");
  }

  const ids = new Set();
  for (const [index, panorama] of panoramas.entries()) {
    if (
      !panorama ||
      typeof panorama !== "object" ||
      typeof panorama.id !== "string" ||
      !(panorama.placeId === null || isValidPlaceId(panorama.placeId)) ||
      typeof panorama.title !== "string" ||
      !panorama.title.trim() ||
      typeof panorama.description !== "string" ||
      !panorama.description.trim() ||
      panorama.type !== "equirectangular" ||
      !isHttpsUrl(panorama.imageUrl) ||
      !isHttpsUrl(panorama.sourceUrl) ||
      !isHttpsUrl(panorama.licenseUrl) ||
      typeof panorama.licenseName !== "string" ||
      !panorama.licenseName.trim() ||
      typeof panorama.creator !== "string" ||
      !panorama.creator.trim() ||
      !isHttpsUrl(panorama.creatorUrl) ||
      !Number.isFinite(panorama.latitude) ||
      !Number.isFinite(panorama.longitude) ||
      panorama.latitude < -90 ||
      panorama.latitude > 90 ||
      panorama.longitude < -180 ||
      panorama.longitude > 180 ||
      typeof panorama.capturedAt !== "string" ||
      !Number.isFinite(Date.parse(panorama.capturedAt)) ||
      !Number.isInteger(panorama.width) ||
      !Number.isInteger(panorama.height) ||
      panorama.width <= 0 ||
      panorama.height <= 0 ||
      panorama.width !== panorama.height * 2
    ) {
      throw new Error(`Bản ghi panorama thứ ${index + 1} thiếu dữ liệu hợp lệ.`);
    }
    if (ids.has(panorama.id)) {
      throw new Error(`Mã panorama "${panorama.id}" bị trùng trong tệp dữ liệu.`);
    }
    ids.add(panorama.id);
  }

  return panoramas;
}
