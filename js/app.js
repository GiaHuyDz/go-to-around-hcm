import { loadPlaces } from "./dataService.js";
import { initializeMap } from "./mapService.js";
import { loadPanoramas } from "./panoramaService.js";
import { CATEGORY_LABELS, filterPlaces } from "./searchService.js";
import { generateDayItinerary, ITINERARY_GOALS } from "./itineraryService.js";
import { findDemoRoute, loadBusRoutes } from "./routeService.js";
import { fetchRoadRoute, resolveAddress } from "./routingService.js";

const elements = {
  searchForm: document.querySelector("#search-form"),
  searchInput: document.querySelector("#place-search"),
  clearSearch: document.querySelector("#clear-search"),
  resetFilters: document.querySelector("#reset-filters"),
  categoryFilters: document.querySelector("#category-filters"),
  openAdmin: document.querySelector("#open-admin"),
  adminDialog: document.querySelector("#admin-dialog"),
  closeAdmin: document.querySelector("#close-admin"),
  adminList: document.querySelector("#admin-list"),
  adminForm: document.querySelector("#admin-form"),
  adminId: document.querySelector("#admin-id"),
  adminName: document.querySelector("#admin-name"),
  adminCategory: document.querySelector("#admin-category"),
  adminStatus: document.querySelector("#admin-status"),
  adminAddress: document.querySelector("#admin-address"),
  adminLatitude: document.querySelector("#admin-latitude"),
  adminLongitude: document.querySelector("#admin-longitude"),
  adminCoordinateUrl: document.querySelector("#admin-coordinate-url"),
  adminTags: document.querySelector("#admin-tags"),
  adminNotes: document.querySelector("#admin-notes"),
  adminSave: document.querySelector("#admin-save"),
  adminDelete: document.querySelector("#admin-delete"),
  adminResetForm: document.querySelector("#admin-reset-form"),
  adminAddNew: document.querySelector("#admin-add-new"),
  adminRestoreDefault: document.querySelector("#admin-restore-default"),
  adminNotice: document.querySelector("#admin-notice"),
  favoritesList: document.querySelector("#favorites-list"),
  historyList: document.querySelector("#history-list"),
  reviewSelected: document.querySelector("#review-selected"),
  ratingStars: document.querySelector("#rating-stars"),
  resultCount: document.querySelector("#result-count"),
  placeList: document.querySelector("#place-list"),
  emptyState: document.querySelector("#empty-state"),
  emptyReset: document.querySelector("#empty-reset"),
  notice: document.querySelector("#app-notice"),
  sourceLink: document.querySelector("#source-link"),
  workspace: document.querySelector(".workspace"),
  viewTabs: document.querySelectorAll(".view-tab"),
  mapContainer: document.querySelector("#map"),
  mapNotice: document.querySelector("#map-notice"),
  fitMap: document.querySelector("#fit-map"),
  locateUser: document.querySelector("#locate-user"),
  mapRouteSummary: document.querySelector("#map-route-summary"),
  mapRouteLabel: document.querySelector("#map-route-label"),
  mapRouteStops: document.querySelector("#map-route-stops"),
  mapRouteMetrics: document.querySelector("#map-route-metrics"),
  mapRouteNote: document.querySelector("#map-route-note"),
  routeForm: document.querySelector("#route-form"),
  routeFrom: document.querySelector("#route-from"),
  routeTo: document.querySelector("#route-to"),
  routePlaceSuggestions: document.querySelector("#route-place-suggestions"),
  routeFind: document.querySelector("#find-route"),
  routeMode: document.querySelector("#route-mode"),
  swapRoute: document.querySelector("#swap-route"),
  clearRoute: document.querySelector("#clear-route"),
  routeNotice: document.querySelector("#route-notice"),
  routeResult: document.querySelector("#route-result"),
  routeResultTitle: document.querySelector("#route-result-title"),
  routeStops: document.querySelector("#route-stops"),
  routeMetrics: document.querySelector("#route-metrics"),
  routeResultNote: document.querySelector("#route-result-note"),
  itineraryForm: document.querySelector("#itinerary-form"),
  itineraryCategories: document.querySelector("#itinerary-categories"),
  itineraryBudget: document.querySelector("#itinerary-budget"),
  itineraryStartTime: document.querySelector("#itinerary-start-time"),
  itineraryEndTime: document.querySelector("#itinerary-end-time"),
  itineraryStart: document.querySelector("#itinerary-start"),
  itineraryPace: document.querySelector("#itinerary-pace"),
  itineraryMode: document.querySelector("#itinerary-mode"),
  itineraryNotice: document.querySelector("#itinerary-notice"),
  itineraryResult: document.querySelector("#itinerary-result"),
  itinerarySummary: document.querySelector("#itinerary-summary"),
  itineraryStops: document.querySelector("#itinerary-stops"),
  showItineraryMap: document.querySelector("#show-itinerary-map"),
  itineraryRouteStatus: document.querySelector("#itinerary-route-status"),
  openPanorama: document.querySelector("#open-panorama"),
  panoramaDialog: document.querySelector("#panorama-dialog"),
  closePanorama: document.querySelector("#close-panorama"),
  panoramaPicker: document.querySelector("#panorama-picker"),
  panoramaSelect: document.querySelector("#panorama-select"),
  panoramaViewer: document.querySelector("#panorama-viewer"),
  panoramaStatus: document.querySelector("#panorama-status"),
  panoramaTitle: document.querySelector("#panorama-title"),
  panoramaDescription: document.querySelector("#panorama-description"),
  panoramaAttribution: document.querySelector("#panorama-attribution"),
  placeImageDialog: document.querySelector("#place-image-dialog"),
  closePlaceImage: document.querySelector("#close-place-image"),
  placeImageTitle: document.querySelector("#place-image-title"),
  placeImagePreview: document.querySelector("#place-image-preview"),
  placeImageCaption: document.querySelector("#place-image-caption"),
  placeImageError: document.querySelector("#place-image-error"),
  placeImageSource: document.querySelector("#place-image-source"),
  placeDetailDialog: document.querySelector("#place-detail-dialog"),
  closePlaceDetail: document.querySelector("#close-place-detail"),
  placeDetailCategory: document.querySelector("#place-detail-category"),
  placeDetailTitle: document.querySelector("#place-detail-title"),
  placeDetailPhoto: document.querySelector("#place-detail-photo"),
  placeDetailPhotoOpen: document.querySelector("#place-detail-photo-open"),
  placeDetailPhotoImage: document.querySelector("#place-detail-photo-image"),
  placeDetailPhotoCaption: document.querySelector("#place-detail-photo-caption"),
  placeDetailDescription: document.querySelector("#place-detail-description"),
  placeDetailFacts: document.querySelector("#place-detail-facts"),
  placeDetailSourcesSection: document.querySelector("#place-detail-sources-section"),
  placeDetailSources: document.querySelector("#place-detail-sources"),
  placeDetailFavorite: document.querySelector("#place-detail-favorite"),
  placeReviewSummary: document.querySelector("#place-review-summary"),
  placeReviewForm: document.querySelector("#place-review-form"),
  placeReviewAuthor: document.querySelector("#place-review-author"),
  placeReviewStars: document.querySelector("#place-review-stars"),
  placeReviewText: document.querySelector("#place-review-text"),
  placeReviewStatus: document.querySelector("#place-review-status"),
  placeReviewList: document.querySelector("#place-review-list"),
  placeDetailPanorama: document.querySelector("#place-detail-panorama"),
  placeDetailImage: document.querySelector("#place-detail-image"),
  placeDetailMediaNote: document.querySelector("#place-detail-media-note"),
  placeDetailMap: document.querySelector("#place-detail-map"),
  placeDetailExternalMap: document.querySelector("#place-detail-external-map"),
};

const STORAGE_KEYS = {
  favorites: "gta-hcm-favorites",
  history: "gta-hcm-history",
  reviews: "gta-hcm-reviews",
  placeReviews: "gta-hcm-place-reviews",
  adminOverrides: "gta-hcm-admin-overrides",
  adminDeleted: "gta-hcm-admin-deleted",
};

const state = {
  basePlaces: [],
  places: [],
  query: "",
  category: "all",
  map: null,
  selectedPlaceId: null,
  favorites: [],
  history: [],
  reviews: {},
  placeReviews: [],
  reviewDraftScore: 0,
  adminOverrides: {},
  adminDeleted: [],
  busRoutes: [],
  panoramas: [],
  panoramaViewer: null,
  panoramaError: "",
  itinerary: null,
  itineraryRequest: null,
  routeRequestSequence: 0,
};

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

function getCategoryLabel(category) {
  return CATEGORY_LABELS[category] ?? "Địa điểm";
}

function createCategoryFilter(category, label, pressed) {
  const button = createElement("button", "filter-chip", label);
  button.type = "button";
  button.dataset.category = category;
  button.setAttribute("aria-pressed", String(pressed));
  return button;
}

function renderCategoryFilters() {
  const categories = [...new Set(state.places.map((place) => place.category))];
  elements.categoryFilters.replaceChildren(
    createCategoryFilter("all", "Tất cả", state.category === "all"),
    ...categories.map((category) =>
      createCategoryFilter(category, getCategoryLabel(category), state.category === category),
    ),
  );
}

function readStoredIds(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeStoredIds(key, ids) {
  try {
    window.localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // Ignore storage failures and keep the in-memory state usable.
  }
}

function readStoredReviews() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.reviews);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStoredReviews(reviews) {
  try {
    window.localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(reviews));
  } catch {
    // Ignore storage failures and keep the in-memory state usable.
  }
}

function readStoredPlaceReviews() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.placeReviews);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (review) =>
        review &&
        typeof review.id === "string" &&
        typeof review.placeId === "string" &&
        typeof review.author === "string" &&
        Number.isInteger(review.score) &&
        review.score >= 1 &&
        review.score <= 5 &&
        typeof review.text === "string" &&
        review.text.trim().length >= 3 &&
        typeof review.createdAt === "string" &&
        Number.isFinite(Date.parse(review.createdAt)),
    );
  } catch {
    return [];
  }
}

function persistPlaceReviews(reviews) {
  try {
    window.localStorage.setItem(STORAGE_KEYS.placeReviews, JSON.stringify(reviews));
    return true;
  } catch {
    return false;
  }
}

function readStoredObject(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStoredObject(key, data) {
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Ignore storage failures and keep the in-memory state usable.
  }
}

function readStoredArray(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === "string") : [];
  } catch {
    return [];
  }
}

function writeStoredArray(key, values) {
  try {
    window.localStorage.setItem(key, JSON.stringify(values));
  } catch {
    // Ignore storage failures and keep the in-memory state usable.
  }
}

function getEffectivePlaces() {
  const merged = new Map();
  for (const place of state.basePlaces) {
    merged.set(place.id, { ...place });
  }

  for (const [id, place] of Object.entries(state.adminOverrides)) {
    if (typeof id !== "string" || !place || typeof place !== "object") {
      continue;
    }
    const base = merged.get(id) ?? {};
    merged.set(id, { ...base, ...place, id });
  }

  const result = [...merged.values()].filter((place) => !state.adminDeleted.includes(place.id));
  return result.sort((a, b) => a.name.localeCompare(b.name, "vi"));
}

function getPlaceById(placeId) {
  return state.places.find((place) => place.id === placeId) ?? null;
}

function renderCollections() {
  const favoritePlaces = state.favorites
    .map((placeId) => getPlaceById(placeId))
    .filter(Boolean)
    .slice(0, 5);
  const historyPlaces = state.history
    .map((placeId) => getPlaceById(placeId))
    .filter(Boolean)
    .slice(0, 5);

  elements.favoritesList.replaceChildren(
    ...favoritePlaces.map((place) => {
      const button = createElement("button", "mini-item", place.name);
      button.type = "button";
      button.dataset.placeId = place.id;
      return button;
    }),
  );

  if (favoritePlaces.length === 0) {
    const empty = createElement("p", "mini-empty", "Chưa có địa điểm yêu thích nào.");
    elements.favoritesList.replaceChildren(empty);
  }

  elements.historyList.replaceChildren(
    ...historyPlaces.map((place) => {
      const button = createElement("button", "mini-item", place.name);
      button.type = "button";
      button.dataset.placeId = place.id;
      return button;
    }),
  );

  if (historyPlaces.length === 0) {
    const empty = createElement("p", "mini-empty", "Bạn chưa xem địa điểm nào gần đây.");
    elements.historyList.replaceChildren(empty);
  }

  const selectedPlace = getPlaceById(state.selectedPlaceId);
  if (!selectedPlace) {
    elements.reviewSelected.textContent = "Chọn địa điểm để lưu sao đánh giá nhanh trên trình duyệt này.";
    elements.ratingStars.innerHTML = "";
    return;
  }

  elements.reviewSelected.textContent = `Đánh giá nhanh cho ${selectedPlace.name} · chỉ lưu trên trình duyệt này`;
  const currentReview = state.reviews[selectedPlace.id] ?? 0;
  const buttons = Array.from({ length: 5 }, (_, index) => {
    const star = createElement("button", `rating-star${currentReview >= index + 1 ? " is-active" : ""}`);
    star.type = "button";
    star.dataset.placeId = selectedPlace.id;
    star.dataset.score = String(index + 1);
    star.setAttribute("aria-label", `Đánh giá ${index + 1} sao`);
    star.textContent = "★";
    return star;
  });
  elements.ratingStars.replaceChildren(...buttons);
}

function toggleFavorite(placeId) {
  const next = state.favorites.includes(placeId)
    ? state.favorites.filter((id) => id !== placeId)
    : [placeId, ...state.favorites.filter((id) => id !== placeId)];
  state.favorites = next.slice(0, 10);
  writeStoredIds(STORAGE_KEYS.favorites, state.favorites);
  renderCollections();
  renderPlaces();
}

function rememberPlaceVisit(placeId) {
  if (!placeId) {
    return;
  }
  const next = [placeId, ...state.history.filter((id) => id !== placeId)].slice(0, 6);
  state.history = next;
  writeStoredIds(STORAGE_KEYS.history, state.history);
  renderCollections();
}

function setPlaceReview(placeId, score) {
  state.reviews[placeId] = score;
  writeStoredReviews(state.reviews);
  renderCollections();
  renderPlaces();
}

function showAdminNotice(message, isError = false) {
  elements.adminNotice.textContent = message;
  elements.adminNotice.hidden = !message;
  elements.adminNotice.classList.toggle("is-error", isError);
}

function resetAdminForm() {
  elements.adminForm.reset();
  elements.adminId.value = "";
  elements.adminName.value = "";
  elements.adminCategory.value = "";
  elements.adminStatus.value = "candidate";
  elements.adminAddress.value = "";
  elements.adminLatitude.value = "";
  elements.adminLongitude.value = "";
  elements.adminCoordinateUrl.value = "";
  elements.adminTags.value = "";
  elements.adminNotes.value = "";
  elements.adminForm.dataset.editingId = "";
  showAdminNotice("");
}

function populateAdminForm(place) {
  if (!place) {
    resetAdminForm();
    return;
  }

  elements.adminForm.dataset.editingId = place.id;
  elements.adminId.value = place.id ?? "";
  elements.adminName.value = place.name ?? "";
  elements.adminCategory.value = place.category ?? "";
  elements.adminStatus.value = place.verificationStatus ?? "candidate";
  elements.adminAddress.value = place.address ?? "";
  elements.adminLatitude.value = Number.isFinite(place.latitude) ? String(place.latitude) : "";
  elements.adminLongitude.value = Number.isFinite(place.longitude) ? String(place.longitude) : "";
  elements.adminCoordinateUrl.value = place.coordinateSourceUrl ?? "";
  elements.adminTags.value = Array.isArray(place.tags) ? place.tags.join(", ") : "";
  elements.adminNotes.value = place.verificationNotes ?? "";
  showAdminNotice("");
}

function renderAdminList() {
  const places = getEffectivePlaces();
  elements.adminList.replaceChildren(
    ...places.map((place) => {
      const item = createElement("li", "admin-list-item");
      const button = createElement("button", "admin-list-button", place.name);
      button.type = "button";
      button.dataset.placeId = place.id;
      const meta = createElement("span", "admin-list-meta", place.id);
      item.append(button, meta);
      return item;
    }),
  );

  if (places.length === 0) {
    const empty = createElement("li", "admin-empty", "Chưa có địa điểm nào.");
    elements.adminList.replaceChildren(empty);
  }
}

function syncAdminState() {
  state.places = getEffectivePlaces();
  renderCategoryFilters();
  renderPlaces();
  renderCollections();
  renderAdminList();
  populateRouteOptions();
}

function restoreDefaultData() {
  state.adminOverrides = {};
  state.adminDeleted = [];
  writeStoredObject(STORAGE_KEYS.adminOverrides, state.adminOverrides);
  writeStoredArray(STORAGE_KEYS.adminDeleted, state.adminDeleted);
  syncAdminState();
  resetAdminForm();
  showAdminNotice("Đã khôi phục dữ liệu gốc từ tệp mẫu.");
}

function handleAdminSave(event) {
  event.preventDefault();

  const id = elements.adminId.value.trim();
  const name = elements.adminName.value.trim();
  const category = elements.adminCategory.value.trim();
  const latitudeRaw = elements.adminLatitude.value.trim();
  const longitudeRaw = elements.adminLongitude.value.trim();
  const coordinateUrl = elements.adminCoordinateUrl.value.trim();
  const status = elements.adminStatus.value;

  if (!id || !name || !category) {
    showAdminNotice("Vui lòng nhập ID, tên và danh mục cho địa điểm.", true);
    return;
  }

  let latitude = null;
  let longitude = null;

  if (latitudeRaw || longitudeRaw) {
    latitude = Number.parseFloat(latitudeRaw);
    longitude = Number.parseFloat(longitudeRaw);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      showAdminNotice("Tọa độ không hợp lệ. Vui lòng nhập giá trị số hợp lệ.", true);
      return;
    }
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      showAdminNotice("Tọa độ nằm ngoài phạm vi hợp lệ của bản đồ.", true);
      return;
    }
  }

  if (coordinateUrl && !/^https?:\/\//i.test(coordinateUrl)) {
    showAdminNotice("Nguồn tọa độ phải là URL hợp lệ bắt đầu bằng http:// hoặc https://.", true);
    return;
  }

  const tags = elements.adminTags.value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const place = {
    id,
    name,
    category,
    address: elements.adminAddress.value.trim() || null,
    latitude,
    longitude,
    coordinateSourceUrl: coordinateUrl || null,
    sourceUrl: null,
    image: null,
    imageSource: null,
    imageLicense: null,
    lastVerified: new Date().toISOString().slice(0, 10),
    openingHours: null,
    ticketInfo: null,
    visitorInfoVerified: false,
    hasPanorama: false,
    panoramaSource: null,
    panoramaLicense: null,
    tags,
    featured: false,
    verificationStatus: status,
    verificationNotes: elements.adminNotes.value.trim() || "Địa điểm do quản trị cục bộ lưu lại trong trình duyệt.",
  };

  state.adminOverrides[id] = place;
  state.adminDeleted = state.adminDeleted.filter((deletedId) => deletedId !== id);
  writeStoredObject(STORAGE_KEYS.adminOverrides, state.adminOverrides);
  writeStoredArray(STORAGE_KEYS.adminDeleted, state.adminDeleted);
  syncAdminState();
  populateAdminForm(place);
  showAdminNotice("Đã lưu địa điểm trong dữ liệu cục bộ của trình duyệt.");
}

function handleAdminDelete() {
  const id = elements.adminId.value.trim();
  if (!id) {
    showAdminNotice("Chưa có địa điểm nào được chọn để xóa.", true);
    return;
  }

  if (!window.confirm("Bạn có chắc muốn xóa địa điểm này khỏi dữ liệu cục bộ không?")) {
    return;
  }

  delete state.adminOverrides[id];
  if (!state.adminDeleted.includes(id)) {
    state.adminDeleted.push(id);
  }
  writeStoredObject(STORAGE_KEYS.adminOverrides, state.adminOverrides);
  writeStoredArray(STORAGE_KEYS.adminDeleted, state.adminDeleted);
  syncAdminState();
  resetAdminForm();
  showAdminNotice("Địa điểm đã được xóa khỏi dữ liệu cục bộ.");
}

function createPlaceCard(place) {
  const card = createElement(
    "article",
    `place-card${state.selectedPlaceId === place.id ? " is-selected" : ""}`,
  );
  card.dataset.placeId = place.id;
  const art = createElement("div", "place-art");
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.classList.add("icon");
  icon.setAttribute("aria-hidden", "true");
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", "#icon-building");
  icon.append(use);
  const artLabel = createElement("span", "place-art-label", "Chưa có ảnh phù hợp");
  art.append(icon, artLabel);

  if (hasViewablePlaceImage(place)) {
    const image = createElement("img", "place-art-image");
    image.src = place.image;
    image.alt = place.imageAlt?.trim() || `Ảnh ${place.name}`;
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("load", () => {
      art.classList.add("has-photo");
      artLabel.hidden = true;
      icon.hidden = true;
    }, { once: true });
    image.addEventListener("error", () => {
      art.classList.add("photo-error");
      artLabel.textContent = "Không tải được ảnh";
    }, { once: true });
    art.append(image);
  }

  const content = createElement("div", "place-card-content");
  content.append(
    createElement("span", "place-category", getCategoryLabel(place.category)),
    createElement("h3", "place-name", place.name),
  );

  const locationText = place.address ?? "Chưa có địa chỉ";
  content.append(createElement("p", "place-address", locationText));

  const actions = createElement("div", "place-card-actions");
  const detailsButton = createElement("button", "place-detail-action", "Chi tiết");
  detailsButton.type = "button";
  detailsButton.dataset.placeId = place.id;
  actions.append(detailsButton);

  const favoriteButton = createElement(
    "button",
    `place-favorite-toggle${state.favorites.includes(place.id) ? " is-favorited" : ""}`,
    state.favorites.includes(place.id) ? "Đã yêu thích" : "Yêu thích",
  );
  favoriteButton.type = "button";
  favoriteButton.dataset.placeId = place.id;
  favoriteButton.setAttribute("aria-pressed", String(state.favorites.includes(place.id)));
  actions.append(favoriteButton);

  if (Number.isFinite(place.latitude) && Number.isFinite(place.longitude) && place.coordinateSourceUrl) {
    const mapButton = createElement("button", "place-map-action", "Xem trên bản đồ");
    mapButton.type = "button";
    mapButton.dataset.placeId = place.id;
    actions.append(mapButton);
  } else {
    actions.append(createElement("span", "place-map-unavailable", "Chưa có vị trí bản đồ"));
  }

  const panorama = getPlacePanorama(place.id);
  if (panorama) {
    const panoramaButton = createElement("button", "place-map-action place-panorama-action", "Xem góc nhìn 360°");
    panoramaButton.type = "button";
    panoramaButton.dataset.placeId = place.id;
    actions.append(panoramaButton);
  } else if (Number.isFinite(place.latitude) && Number.isFinite(place.longitude)) {
    const streetViewLink = createElement("a", "place-map-action place-panorama-fallback", "Kiểm tra Street View");
    streetViewLink.href = getStreetViewUrl(place);
    streetViewLink.target = "_blank";
    streetViewLink.rel = "noopener noreferrer";
    streetViewLink.title = "Kiểm tra ảnh 360° gần tọa độ trên Google Maps; có thể không có ảnh tại đây";
    actions.append(streetViewLink);
  }

  if (hasViewablePlaceImage(place)) {
    const imageButton = createElement("button", "place-map-action place-image-action", "Xem ảnh địa điểm");
    imageButton.type = "button";
    imageButton.dataset.placeId = place.id;
    actions.append(imageButton);
  }

  content.append(actions);

  card.append(art, content);
  return card;
}

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

function isProjectImagePath(value) {
  if (typeof value !== "string" || !value.startsWith("./assets/images/") || value.includes("..")) {
    return false;
  }
  try {
    const imageUrl = new URL(value, window.location.href);
    return imageUrl.origin === window.location.origin;
  } catch {
    return false;
  }
}

function getPlacePanorama(placeId) {
  return state.panoramas.find((panorama) => panorama.placeId === placeId) ?? null;
}

function getStreetViewUrl(place) {
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${place.latitude},${place.longitude}`;
}

function hasViewablePlaceImage(place) {
  return (
    (isProjectImagePath(place.image) || isHttpsUrl(place.image)) &&
    isHttpsUrl(place.imageSource) &&
    isHttpsUrl(place.imageLicenseUrl) &&
    typeof place.imageLicense === "string" &&
    place.imageLicense.trim().length > 0 &&
    typeof place.imageCreator === "string" &&
    place.imageCreator.trim().length > 0
  );
}

function appendPlaceDetailFact(label, value, isUnverified = false) {
  const term = createElement("dt", "", label);
  const fallback = {
    "Giờ mở cửa": "Chưa xác minh được giờ mở cửa; vui lòng kiểm tra với địa điểm trước khi ghé.",
    "Thông tin vé": "Chưa xác minh được giá vé; vui lòng kiểm tra nguồn chính thức trước khi mua.",
  }[label] ?? "Chưa có thông tin.";
  const description = createElement(
    "dd",
    isUnverified ? "place-detail-fact-estimate" : "",
  );
  if (isUnverified) {
    description.append(
      createElement("strong", "place-detail-estimate-badge", "Tham khảo · Chưa xác minh"),
      createElement("span", "", value || fallback),
    );
  } else {
    description.textContent = value || fallback;
  }
  elements.placeDetailFacts.append(term, description);
}

function getPlaceTextReviews(placeId) {
  return state.placeReviews
    .filter((review) => review.placeId === placeId)
    .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt));
}

function renderPlaceTextReviews(placeId) {
  const reviews = getPlaceTextReviews(placeId);
  if (reviews.length === 0) {
    elements.placeReviewSummary.textContent = "Chưa có đánh giá";
    elements.placeReviewList.replaceChildren(
      createElement("p", "place-review-empty", "Hãy là người đầu tiên chia sẻ trải nghiệm."),
    );
    return;
  }

  const average = reviews.reduce((total, review) => total + review.score, 0) / reviews.length;
  elements.placeReviewSummary.textContent = `${average.toFixed(1)} ★ · ${reviews.length} đánh giá`;
  elements.placeReviewList.replaceChildren(
    ...reviews.map((review) => {
      const article = createElement("article", "place-review-item");
      const header = createElement("header", "place-review-item-header");
      const author = createElement("strong", "place-review-author", review.author);
      const date = new Date(review.createdAt);
      const dateLabel = Number.isNaN(date.getTime())
        ? ""
        : new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(date);
      const meta = createElement("span", "place-review-date", dateLabel);
      const score = createElement(
        "span",
        "place-review-score",
        `${"★".repeat(review.score)}${"☆".repeat(5 - review.score)}`,
      );
      score.setAttribute("aria-label", `${review.score} trên 5 sao`);
      const text = createElement("p", "place-review-text", review.text);
      header.append(author, meta);
      article.append(header, score, text);
      return article;
    }),
  );
}

function updateReviewDraftScore(score) {
  state.reviewDraftScore = score;
  elements.placeReviewStars.querySelectorAll("button[data-score]").forEach((button) => {
    const buttonScore = Number.parseInt(button.dataset.score, 10);
    button.classList.toggle("is-selected", buttonScore <= score);
    button.setAttribute("aria-pressed", String(buttonScore === score));
  });
  elements.placeReviewStatus.hidden = true;
  elements.placeReviewStatus.textContent = "";
}

function showPlaceReviewStatus(message, isError = false) {
  elements.placeReviewStatus.textContent = message;
  elements.placeReviewStatus.classList.toggle("is-error", isError);
  elements.placeReviewStatus.hidden = !message;
}

function submitPlaceReview(event) {
  event.preventDefault();
  const placeId = elements.placeDetailFavorite.dataset.placeId;
  const text = elements.placeReviewText.value.trim();
  const author = elements.placeReviewAuthor.value.trim() || "Khách tham quan";

  if (!placeId || !getPlaceById(placeId)) {
    showPlaceReviewStatus("Không xác định được địa điểm để lưu đánh giá.", true);
    return;
  }
  if (state.reviewDraftScore < 1 || state.reviewDraftScore > 5) {
    showPlaceReviewStatus("Vui lòng chọn số sao trước khi gửi.", true);
    return;
  }
  if (text.length < 3) {
    showPlaceReviewStatus("Nhận xét cần có ít nhất 3 ký tự.", true);
    return;
  }

  const review = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    placeId,
    author,
    score: state.reviewDraftScore,
    text,
    createdAt: new Date().toISOString(),
  };
  const nextReviews = [...state.placeReviews, review];
  if (!persistPlaceReviews(nextReviews)) {
    showPlaceReviewStatus("Không lưu được đánh giá trên trình duyệt này. Hãy kiểm tra dung lượng lưu trữ rồi thử lại.", true);
    return;
  }

  state.placeReviews = nextReviews;
  elements.placeReviewForm.reset();
  updateReviewDraftScore(0);
  showPlaceReviewStatus("Đã lưu đánh giá trên trình duyệt này.");
  renderPlaceTextReviews(placeId);
}

function renderPlaceDetails(place) {
  if (!place) {
    return;
  }

  elements.placeReviewForm.reset();
  updateReviewDraftScore(0);
  showPlaceReviewStatus("");
  renderPlaceTextReviews(place.id);
  elements.placeDetailCategory.textContent = getCategoryLabel(place.category);
  elements.placeDetailTitle.textContent = place.name;
  const hasImage = hasViewablePlaceImage(place);
  elements.placeDetailPhoto.hidden = !hasImage;
  elements.placeDetailPhotoOpen.hidden = false;
  elements.placeDetailPhotoImage.hidden = false;
  elements.placeDetailPhotoImage.alt = hasImage
    ? place.imageAlt?.trim() || `Ảnh ${place.name}`
    : "";
  elements.placeDetailPhotoImage.removeAttribute("src");
  elements.placeDetailPhotoCaption.replaceChildren();
  if (hasImage) {
    elements.placeDetailPhotoImage.src = place.image;
    const attribution = createElement(
      "span",
      "",
      `Ảnh: ${place.imageCreator} · ${place.imageLicense} · `,
    );
    const source = createExternalLink("Nguồn ảnh", place.imageSource);
    const license = createExternalLink("Giấy phép", place.imageLicenseUrl);
    elements.placeDetailPhotoCaption.append(attribution, source, document.createTextNode(" · "), license);
    elements.placeDetailPhotoOpen.setAttribute(
      "aria-label",
      `Mở ảnh ${place.name} kích thước lớn`,
    );
  }
  elements.placeDetailDescription.textContent =
    place.description || "Chưa có mô tả cho địa điểm này.";
  elements.placeDetailFacts.replaceChildren();
  appendPlaceDetailFact("Địa chỉ", place.address);
  appendPlaceDetailFact("Giờ mở cửa", place.openingHours, !place.visitorInfoVerified);
  appendPlaceDetailFact("Thông tin vé", place.ticketInfo, !place.visitorInfoVerified);
  if (place.lastVerified) {
    const verifiedDate = new Date(`${place.lastVerified}T00:00:00`);
    appendPlaceDetailFact(
      "Cập nhật thông tin",
      Number.isNaN(verifiedDate.getTime())
        ? place.lastVerified
        : new Intl.DateTimeFormat("vi-VN", { dateStyle: "long" }).format(verifiedDate),
    );
  }
  if (Array.isArray(place.tags) && place.tags.length > 0) {
    appendPlaceDetailFact("Từ khóa", place.tags.join(", "));
  }

  const sourceLinks = [];
  if (place.sourceUrl) {
    sourceLinks.push(createExternalLink("Nguồn thông tin địa điểm", place.sourceUrl));
  }
  if (place.coordinateSourceUrl) {
    sourceLinks.push(createExternalLink("Nguồn tọa độ", place.coordinateSourceUrl));
  }
  if (hasViewablePlaceImage(place)) {
    sourceLinks.push(createExternalLink("Nguồn ảnh", place.imageSource));
    sourceLinks.push(createExternalLink(`Giấy phép ảnh (${place.imageLicense})`, place.imageLicenseUrl));
  }
  elements.placeDetailSources.replaceChildren(...sourceLinks);
  elements.placeDetailSourcesSection.hidden = sourceLinks.length === 0;

  const isFavorite = state.favorites.includes(place.id);
  elements.placeDetailFavorite.textContent = isFavorite ? "Bỏ yêu thích" : "Thêm yêu thích";
  elements.placeDetailFavorite.setAttribute("aria-pressed", String(isFavorite));
  elements.placeDetailFavorite.dataset.placeId = place.id;
  const hasCoordinates =
    Number.isFinite(place.latitude) &&
    Number.isFinite(place.longitude) &&
    Boolean(place.coordinateSourceUrl);
  elements.placeDetailMap.hidden = !hasCoordinates;
  elements.placeDetailMap.dataset.placeId = place.id;
  const panorama = getPlacePanorama(place.id);
  elements.placeDetailExternalMap.hidden = !hasCoordinates || Boolean(panorama);
  if (hasCoordinates) {
    elements.placeDetailExternalMap.href = getStreetViewUrl(place);
    elements.placeDetailExternalMap.textContent = "Kiểm tra Street View trên Google Maps";
  } else {
    elements.placeDetailExternalMap.removeAttribute("href");
  }
  elements.placeDetailPanorama.hidden = !panorama;
  elements.placeDetailImage.hidden = !hasImage;
  elements.placeDetailMediaNote.hidden = Boolean(panorama);
  elements.placeDetailMediaNote.textContent = hasCoordinates
    ? "Chưa có ảnh 360° được xác nhận cho địa điểm này. Street View mở góc nhìn gần tọa độ; Google Maps có thể không có ảnh hoặc ảnh không chụp đúng điểm tham quan."
    : "Chưa có ảnh 360° được xác nhận hoặc vị trí để mở Street View.";
  elements.placeDetailPanorama.dataset.placeId = place.id;
  elements.placeDetailImage.dataset.placeId = place.id;
}

function renderPlaces() {
  const matches = filterPlaces(state.places, state.query, state.category);
  const hasFilters = Boolean(state.query) || state.category !== "all";

  elements.placeList.replaceChildren(...matches.map(createPlaceCard));
  elements.placeList.hidden = matches.length === 0;
  elements.placeList.setAttribute("aria-busy", "false");
  elements.emptyState.hidden = matches.length !== 0;
  elements.resultCount.textContent = `${matches.length} địa điểm`;
  elements.resetFilters.hidden = !hasFilters;
  elements.clearSearch.hidden = state.query.length === 0;
  state.map?.setVisiblePlaces(
    matches
      .filter(
        (place) =>
          Number.isFinite(place.latitude) &&
          Number.isFinite(place.longitude) &&
          Boolean(place.coordinateSourceUrl),
      )
      .map((place) => place.id),
  );

  const verifiedPlace = matches.find((place) => place.sourceUrl);
  if (verifiedPlace) {
    elements.sourceLink.href = verifiedPlace.sourceUrl;
    elements.sourceLink.hidden = false;
  } else {
    elements.sourceLink.hidden = true;
  }
}

function resetSearchAndFilters() {
  state.query = "";
  state.category = "all";
  elements.searchInput.value = "";
  renderCategoryFilters();
  renderPlaces();
  elements.searchInput.focus();
}

function setMobileView(view) {
  elements.workspace.dataset.mobileView = view;
  elements.viewTabs.forEach((tab) => {
    const isActive = tab.dataset.view === view;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  });
  if (view === "map" && state.map) {
    requestAnimationFrame(() => state.map?.invalidateSize());
  }
}

function showMapNotice(message, kind = "error") {
  elements.mapNotice.textContent = message;
  elements.mapNotice.classList.toggle("is-info", kind === "info");
  elements.mapNotice.classList.toggle("is-loading", kind === "loading");
  elements.mapNotice.hidden = !message;
}

function showRouteNotice(message) {
  elements.routeNotice.textContent = message;
  elements.routeNotice.hidden = !message;
}

function showPanoramaStatus(message, isError = false) {
  elements.panoramaStatus.textContent = message;
  elements.panoramaStatus.classList.toggle("is-error", isError);
  elements.panoramaStatus.hidden = !message;
}

function destroyPanoramaViewer() {
  if (state.panoramaViewer) {
    state.panoramaViewer.destroy();
    state.panoramaViewer = null;
  }
  elements.panoramaViewer.replaceChildren();
}

function createExternalLink(label, url) {
  const link = createElement("a", "", label);
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
}

function renderPanoramaAttribution(panorama) {
  const author = createElement("p", "panorama-credit");
  author.append(
    document.createTextNode("Ảnh: "),
    createExternalLink(panorama.creator, panorama.creatorUrl),
    document.createTextNode(` · ${panorama.licenseName} · `),
    createExternalLink("điều khoản giấy phép", panorama.licenseUrl),
  );
  const source = createElement("p", "panorama-source");
  source.append(createExternalLink("Nguồn ảnh và thông tin vị trí trên Wikimedia Commons", panorama.sourceUrl));
  elements.panoramaAttribution.replaceChildren(author, source);
  elements.panoramaDescription.textContent = panorama.description;
}

function renderPanorama(panoramaId) {
  const panorama = state.panoramas.find((item) => item.id === panoramaId);
  if (!panorama) {
    showPanoramaStatus("Không tìm thấy ảnh panorama đã chọn.", true);
    return;
  }

  destroyPanoramaViewer();
  elements.panoramaTitle.textContent = panorama.title;
  renderPanoramaAttribution(panorama);
  showPanoramaStatus("Đang tải ảnh panorama…");

  if (typeof window.pannellum?.viewer !== "function") {
    showPanoramaStatus("Không tải được trình xem 360°. Kiểm tra kết nối rồi thử lại.", true);
    return;
  }

  try {
    const viewer = window.pannellum.viewer(elements.panoramaViewer, {
      type: panorama.type,
      panorama: panorama.imageUrl,
      title: panorama.title,
      author: panorama.creator,
      authorURL: panorama.creatorUrl,
      autoLoad: true,
      escapeHTML: true,
      mouseZoom: "fullscreenonly",
      showFullscreenCtrl: true,
      showZoomCtrl: true,
    });
    state.panoramaViewer = viewer;
    viewer.on("load", () => {
      if (state.panoramaViewer === viewer) {
        showPanoramaStatus("");
      }
    });
    viewer.on("error", () => {
      if (state.panoramaViewer === viewer) {
        showPanoramaStatus("Không thể tải hoặc giải mã ảnh panorama. Bạn vẫn có thể mở nguồn ảnh để xem chi tiết.", true);
      }
    });
    if (viewer.isLoaded()) {
      showPanoramaStatus("");
    }
  } catch (error) {
    showPanoramaStatus(
      error instanceof Error ? `Không thể mở panorama: ${error.message}` : "Không thể mở panorama.",
      true,
    );
  }
}

function openPlacePanorama(place) {
  elements.placeDetailDialog.close();
  elements.panoramaTitle.textContent = `Góc nhìn 360° · ${place.name}`;
  elements.panoramaDialog.showModal();

  if (state.panoramaError) {
    destroyPanoramaViewer();
    showPanoramaStatus(state.panoramaError, true);
    return;
  }

  const panorama = getPlacePanorama(place.id);
  if (!panorama) {
    destroyPanoramaViewer();
    elements.panoramaDescription.textContent = "";
    elements.panoramaAttribution.replaceChildren();
    elements.panoramaPicker.hidden = true;
    showPanoramaStatus(
      `Chưa có ảnh 360° cho ${place.name}. Không hiển thị ảnh từ địa điểm khác.`,
    );
    return;
  }

  renderPanorama(panorama.id);
  requestAnimationFrame(() => state.panoramaViewer?.resize());
}

function openPlaceImage(place) {
  if (!hasViewablePlaceImage(place)) {
    return;
  }

  elements.placeDetailDialog.close();
  elements.placeImageTitle.textContent = place.name;
  elements.placeImageCaption.textContent = place.imageLicense;
  elements.placeImageError.hidden = true;
  elements.placeImageError.textContent = "";
  elements.placeImagePreview.hidden = false;
  elements.placeImagePreview.alt = place.imageAlt?.trim() || `Ảnh ${place.name}`;
  elements.placeImagePreview.src = place.image;
  const credit = createElement("span", "", `Ảnh: ${place.imageCreator} · ${place.imageLicense} · `);
  const source = createExternalLink("Nguồn ảnh", place.imageSource);
  const license = createExternalLink("Giấy phép", place.imageLicenseUrl);
  elements.placeImageSource.replaceChildren(credit, source, document.createTextNode(" · "), license);
  elements.placeImageDialog.showModal();
}

function clearPlaceImage() {
  elements.placeImagePreview.removeAttribute("src");
  elements.placeImagePreview.hidden = false;
}

function populatePanoramaOptions() {
  const options = state.panoramas.map((panorama) => {
    const option = createElement("option", "", panorama.title);
    option.value = panorama.id;
    return option;
  });
  elements.panoramaSelect.replaceChildren(...options);
  elements.panoramaPicker.hidden = state.panoramas.length < 2;
}

function clearRouteResult() {
  state.map?.clearRoute();
  elements.routeResult.hidden = true;
  elements.routeStops.replaceChildren();
  elements.routeMetrics.textContent = "";
  elements.routeResultNote.textContent = "";
  elements.mapRouteSummary.hidden = true;
  elements.mapRouteLabel.textContent = "TUYẾN THAM KHẢO";
  elements.mapRouteStops.textContent = "";
  elements.mapRouteMetrics.textContent = "";
  elements.mapRouteNote.textContent = "";
}

function populateRouteOptions() {
  const placeOptions = state.places
    .filter(
      (place) =>
        Number.isFinite(place.latitude) &&
        Number.isFinite(place.longitude) &&
        Boolean(place.coordinateSourceUrl),
    )
    .map((place) => {
      const option = createElement("option");
      option.value = place.name;
      return option;
    });
  elements.routePlaceSuggestions.replaceChildren(...placeOptions);
}

function populateItineraryOptions() {
  const goals = [
    ["sightseeing", "Tham quan"],
    ["shopping", "Mua sắm"],
    ["food", "Ăn uống"],
  ];
  elements.itineraryCategories.replaceChildren(
    ...goals.map(([goal, labelText]) => {
      const label = createElement("label", "itinerary-category-option");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = "goal";
      checkbox.value = goal;
      checkbox.checked = true;
      label.append(checkbox, createElement("span", "", labelText));
      return label;
    }),
  );

  const startOptions = state.places
    .filter(
      (place) =>
        Number.isFinite(place.latitude) &&
        Number.isFinite(place.longitude) &&
        Boolean(place.coordinateSourceUrl),
    )
    .map((place) => {
      const option = createElement("option", "", place.name);
      option.value = place.id;
      return option;
    });
  const automaticStart = createElement("option", "", "Tự chọn điểm bắt đầu gần trung tâm");
  automaticStart.value = "";
  elements.itineraryStart.replaceChildren(automaticStart, ...startOptions);
}

function showItineraryNotice(message, isError = false) {
  elements.itineraryNotice.textContent = message;
  elements.itineraryNotice.classList.toggle("is-error", isError);
  elements.itineraryNotice.hidden = !message;
}

function showItineraryRouteStatus(message, isError = false) {
  elements.itineraryRouteStatus.textContent = message;
  elements.itineraryRouteStatus.classList.toggle("is-error", isError);
  elements.itineraryRouteStatus.hidden = !message;
}

function renderItinerary(itinerary) {
  const stopItems = itinerary.stops.map((stop, index) => {
    const item = createElement("li", "itinerary-stop");
    const top = createElement("div", "itinerary-stop-top");
    const number = createElement("span", "itinerary-stop-number", String(index + 1));
    const title = createElement("h4", "", stop.place.name);
    const times = createElement("p", "itinerary-stop-times", `${stop.arrival}–${stop.departure}`);
    const visit = createElement(
      "p",
      "itinerary-stop-meta",
      `Thời gian ghé: ${stop.visitMinutes} phút · dự trù chi tiêu tại điểm: ${new Intl.NumberFormat("vi-VN").format(stop.activitySpendVnd)} ₫`,
    );
    const travel = createElement(
      "p",
      "itinerary-stop-meta",
      index === 0
        ? "Điểm bắt đầu lịch trình"
        : `Di chuyển ${itinerary.transportMode === "bus" ? "bằng xe buýt" : "bằng xe máy"} (ước tính): ${stop.travelMinutes} phút · ${stop.distanceKm.toFixed(1)} km · ${new Intl.NumberFormat("vi-VN").format(stop.fareVnd)} ₫`,
    );
    const viewButton = createElement("button", "text-button itinerary-place-button", "Xem trên bản đồ");
    viewButton.type = "button";
    viewButton.dataset.placeId = stop.place.id;
    const placePickerLabel = createElement("label", "itinerary-place-picker-label", "Đổi địa điểm");
    const placePicker = document.createElement("select");
    placePicker.className = "itinerary-place-picker";
    placePicker.dataset.stopIndex = String(index);
    placePicker.setAttribute("aria-label", `Đổi địa điểm dừng ${index + 1}`);
    const fixedPlaceIds = itinerary.stops.map((currentStop) => currentStop.place.id);
    const alternatives = state.places.filter(
      (place) =>
        Number.isFinite(place.latitude) &&
        Number.isFinite(place.longitude) &&
        Boolean(place.coordinateSourceUrl) &&
        (itineraryRequestAllowsCategory(place.category) || place.id === stop.place.id) &&
        (place.id === stop.place.id || !fixedPlaceIds.includes(place.id)),
    );
    for (const place of alternatives) {
      const option = createElement("option", "", place.name);
      option.value = place.id;
      const nextPlaceIds = [...fixedPlaceIds];
      nextPlaceIds[index] = place.id;
      const alternative = generateDayItinerary(state.places, {
        ...state.itineraryRequest,
        fixedPlaceIds: nextPlaceIds,
      });
      const removesGoal = (alternative.unmetGoals?.length ?? 0) > (itinerary.unmetGoals?.length ?? 0);
      option.disabled =
        (!alternative.isFeasible || removesGoal) && place.id !== stop.place.id;
      if (alternative.reason === "budget") {
        option.title = "Vượt ngân sách dự trù.";
      } else if (alternative.reason === "time") {
        option.title = "Vượt khung giờ rảnh.";
      } else if (removesGoal) {
        option.title = "Làm thiếu một trong các mục tiêu đã chọn.";
      } else if (alternative.reason === "location") {
        option.title = "Địa điểm không có tọa độ hợp lệ.";
      }
      option.selected = place.id === stop.place.id;
      placePicker.append(option);
    }
    placePickerLabel.append(placePicker);
    top.append(number, title, times);
    item.append(top, visit, travel, placePickerLabel, viewButton);
    return item;
  });
  const itineraryItems = [];
  itinerary.stops.forEach((stop, index) => {
    itineraryItems.push(stopItems[index]);
    if (stop.breakAfterMinutes > 0) {
      const pause = createElement("li", "itinerary-break");
      const startTime = stop.departure;
      const breakTime = createElement(
        "strong",
        "",
        `Nghỉ trưa · ${startTime}–${formatItineraryTime(startTime, stop.breakAfterMinutes)}`,
      );
      const breakNote = createElement("p", "", "Khoảng nghỉ tự do; dự trù bữa ăn riêng nếu ghé quán ăn.");
      pause.append(breakTime, breakNote);
      itineraryItems.push(pause);
    }
  });

  const totalHours = Math.floor(itinerary.totalMinutes / 60);
  const remainingMinutes = itinerary.totalMinutes % 60;
  const durationLabel = [
    totalHours ? `${totalHours} giờ` : "",
    remainingMinutes ? `${remainingMinutes} phút` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const formatVnd = (amount) => new Intl.NumberFormat("vi-VN").format(amount);
  const remainingBudgetVnd = itinerary.budgetVnd - itinerary.totalEstimatedCostVnd;
  elements.itinerarySummary.textContent =
    `${itinerary.stops.length} địa điểm · ${itinerary.transportMode === "bus" ? "xe buýt" : "xe máy"} · rảnh ${itinerary.startTime}–${itinerary.endTime} · lịch khoảng ${durationLabel || "0 phút"} · di chuyển ${itinerary.totalDistanceKm.toFixed(1)} km · dự trù ${formatVnd(itinerary.totalEstimatedCostVnd)} ₫ / ${formatVnd(itinerary.budgetVnd)} ₫ · còn khoảng ${formatVnd(remainingBudgetVnd)} ₫`;
  elements.itineraryStops.replaceChildren(...itineraryItems);
  elements.itineraryResult.hidden = false;
  elements.showItineraryMap.disabled = itinerary.stops.length < 2;
}

async function updateItineraryRoadRoute(itinerary) {
  const requestSequence = ++state.routeRequestSequence;
  elements.routeFind.disabled = false;
  elements.routeFind.removeAttribute("aria-busy");
  state.map?.clearRoute();
  elements.mapRouteSummary.hidden = true;

  if (itinerary.stops.length < 2) {
    showItineraryRouteStatus("Lịch trình có một điểm; cần ít nhất hai điểm để vẽ tuyến trên bản đồ.");
    return;
  }
  if (!state.map) {
    showItineraryRouteStatus("Bản đồ chưa sẵn sàng để tính tuyến đường.", true);
    return;
  }

  const stopPlaces = itinerary.stops.map((stop) => stop.place);
  showItineraryRouteStatus("Đang cập nhật tuyến đường theo các điểm dừng…");
  try {
    const route = await fetchRoadRoute(stopPlaces);
    if (requestSequence !== state.routeRequestSequence) {
      return;
    }

    state.map.showRoadRoute(route.coordinates, stopPlaces);
    elements.mapRouteLabel.textContent = "TUYẾN LỊCH TRÌNH THAM KHẢO";
    elements.mapRouteStops.textContent = stopPlaces.map((place) => place.name).join(" → ");
    elements.mapRouteMetrics.textContent =
      `${stopPlaces.length} điểm · đường bộ khoảng ${route.distanceKm.toFixed(1)} km · ${route.durationMinutes} phút`;
    elements.mapRouteNote.textContent =
      "Tuyến đường bộ tham khảo từ OSRM/OpenStreetMap; không phải tuyến xe buýt. Thời gian và chi phí trong lịch trình vẫn là dự trù minh họa.";
    elements.mapRouteSummary.hidden = false;
    showItineraryRouteStatus("Đã cập nhật đường đi trên bản đồ theo lịch trình hiện tại.");
  } catch (error) {
    if (requestSequence !== state.routeRequestSequence) {
      return;
    }
    state.map.clearRoute();
    showItineraryRouteStatus(
      `${error instanceof Error ? error.message : "Không thể tính tuyến đường."} Lịch trình vẫn được giữ; hãy thử mở bản đồ lại sau.`,
      true,
    );
  }
}

function itineraryRequestAllowsCategory(category) {
  return state.itineraryRequest?.categories.includes(category) ?? false;
}

function formatItineraryTime(time, minutesToAdd) {
  const [hours, minutes] = time.split(":").map(Number);
  const totalMinutes = (hours * 60 + minutes + minutesToAdd) % (24 * 60);
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}`;
}

function createDayItinerary(event) {
  event.preventDefault();
  const goals = [
    ...elements.itineraryCategories.querySelectorAll('input[name="goal"]:checked'),
  ].map((input) => input.value);
  const categories = [...new Set(goals.flatMap((goal) => ITINERARY_GOALS[goal] ?? []))];
  if (categories.length === 0) {
    elements.itineraryResult.hidden = true;
    showItineraryNotice("Hãy chọn ít nhất một sở thích để tạo lịch trình.", true);
    return;
  }

  let itinerary;
  try {
    itinerary = generateDayItinerary(state.places, {
      goals,
      categories,
      pace: elements.itineraryPace.value,
      startPlaceId: elements.itineraryStart.value,
      mode: elements.itineraryMode.value,
      startTime: elements.itineraryStartTime.value,
      endTime: elements.itineraryEndTime.value,
      budgetVnd: Number(elements.itineraryBudget.value),
    });
  } catch (error) {
    elements.itineraryResult.hidden = true;
    showItineraryNotice(
      error instanceof Error ? error.message : "Không thể tạo lịch trình với thông tin đã nhập.",
      true,
    );
    return;
  }
  if (itinerary.stops.length === 0) {
    elements.itineraryResult.hidden = true;
    showItineraryNotice(
      "Không có địa điểm nào phù hợp với ngân sách và khung giờ đã nhập. Hãy tăng ngân sách/thời gian hoặc đổi nhóm sở thích.",
      true,
    );
    return;
  }

  state.itineraryRequest = {
    goals,
    categories,
    pace: elements.itineraryPace.value,
    startPlaceId: elements.itineraryStart.value,
    mode: elements.itineraryMode.value,
    startTime: elements.itineraryStartTime.value,
    endTime: elements.itineraryEndTime.value,
    budgetVnd: Number(elements.itineraryBudget.value),
  };
  state.itinerary = itinerary;
  renderItinerary(itinerary);
  void updateItineraryRoadRoute(itinerary);
  const goalLabels = { sightseeing: "tham quan", shopping: "mua sắm", food: "ăn uống" };
  const unmetGoals = itinerary.unmetGoals ?? [];
  if (unmetGoals.length > 0) {
    showItineraryNotice(
      `Không tìm được điểm ${unmetGoals.map((goal) => goalLabels[goal]).join(", ")} trong giới hạn ngân sách/thời gian hiện tại.`,
    );
  } else if (
    itinerary.stops.length <
    (elements.itineraryPace.value === "relaxed"
      ? 4
      : elements.itineraryPace.value === "packed"
        ? 6
        : 5)
  ) {
    showItineraryNotice(
      "Đã chọn đủ mục tiêu; số điểm dừng ít hơn nhịp độ tối đa vì các điểm tiếp theo vượt ngân sách hoặc thời gian.",
    );
  } else {
    showItineraryNotice("");
  }
}

function changeItineraryPlace(event) {
  const picker = event.target.closest("select[data-stop-index]");
  if (!picker || !state.itinerary || !state.itineraryRequest) {
    return;
  }
  const nextPlaceIds = state.itinerary.stops.map((stop) => stop.place.id);
  nextPlaceIds[Number(picker.dataset.stopIndex)] = picker.value;
  const updatedItinerary = generateDayItinerary(state.places, {
    ...state.itineraryRequest,
    fixedPlaceIds: nextPlaceIds,
  });
  if (!updatedItinerary.isFeasible) {
    showItineraryNotice(
      updatedItinerary.reason === "budget"
        ? "Địa điểm này vượt ngân sách dự trù còn lại."
        : "Địa điểm này vượt khung giờ rảnh.",
      true,
    );
    renderItinerary(state.itinerary);
    return;
  }
  state.itinerary = updatedItinerary;
  renderItinerary(updatedItinerary);
  void updateItineraryRoadRoute(updatedItinerary);
  if (updatedItinerary.unmetGoals?.length) {
    const goalLabels = { sightseeing: "tham quan", shopping: "mua sắm", food: "ăn uống" };
    showItineraryNotice(
      `Chưa xếp được điểm ${updatedItinerary.unmetGoals.map((goal) => goalLabels[goal]).join(", ")} trong ngân sách/thời gian.`,
    );
  } else {
    showItineraryNotice("");
  }
}

function clearCurrentRoute(message = "") {
  state.routeRequestSequence += 1;
  elements.routeFind.disabled = false;
  elements.routeFind.removeAttribute("aria-busy");
  clearRouteResult();
  showRouteNotice(message);
}

function renderRouteResult(result) {
  const stops = result.stopPlaces.map((place) => createElement("li", "", place.name));
  elements.routeStops.replaceChildren(...stops);
  if (result.route.transportMode === "motorbike") {
    elements.routeResultTitle.textContent = "Tuyến xe máy tham khảo";
    elements.routeMetrics.textContent =
      `Xe máy · Khoảng ${result.route.distanceKm.toFixed(1)} km · ${result.route.durationMinutes} phút (ước tính từ OSRM)`;
    elements.mapRouteLabel.textContent = "TUYẾN XE MÁY THAM KHẢO";
  } else {
    elements.routeResultTitle.textContent = "Tuyến xe buýt mô phỏng";
    const fare = new Intl.NumberFormat("vi-VN").format(result.route.fareVnd);
    const estimateLabel = result.route.isGenerated ? "ước tính giả định" : "mô phỏng";
    elements.routeMetrics.textContent =
      `Xe buýt mô phỏng · Chi phí ${estimateLabel}: khoảng ${fare} ₫ · Thời gian ${estimateLabel}: khoảng ${result.route.durationMinutes} phút`;
    elements.mapRouteLabel.textContent = "TUYẾN XE BUÝT MÔ PHỎNG";
  }
  elements.routeResultNote.textContent = result.route.simulationNote;
  elements.mapRouteStops.textContent = result.stopPlaces.map((place) => place.name).join(" → ");
  elements.mapRouteMetrics.textContent = result.route.transportMode === "motorbike"
    ? `${result.route.distanceKm.toFixed(1)} km · khoảng ${result.route.durationMinutes} phút`
    : `Khoảng ${new Intl.NumberFormat("vi-VN").format(result.route.fareVnd)} ₫ · ${result.route.durationMinutes} phút`;
  elements.mapRouteNote.textContent = result.route.simulationNote;
  elements.mapRouteSummary.hidden = false;
  elements.routeResult.hidden = false;
  showRouteNotice("");
}

async function submitRouteSearch() {
  const requestSequence = ++state.routeRequestSequence;
  elements.routeFind.disabled = false;
  elements.routeFind.removeAttribute("aria-busy");
  clearRouteResult();
  const fromAddress = elements.routeFrom.value.trim();
  const toAddress = elements.routeTo.value.trim();

  if (!fromAddress || !toAddress) {
    showRouteNotice("Vui lòng nhập đủ địa chỉ xuất phát A và điểm đến B.");
    return;
  }
  if (fromAddress.toLocaleLowerCase("vi") === toAddress.toLocaleLowerCase("vi")) {
    showRouteNotice("Điểm đi và điểm đến phải là hai địa điểm khác nhau.");
    return;
  }

  if (!state.map) {
    showRouteNotice("Bản đồ chưa sẵn sàng để hiển thị tuyến đường.");
    return;
  }

  elements.routeFind.disabled = true;
  elements.routeFind.setAttribute("aria-busy", "true");
  showRouteNotice("Đang tìm tọa độ và tính tuyến đường…");

  try {
    const [fromPlace, toPlace] = await Promise.all([
      resolveAddress(fromAddress, state.places),
      resolveAddress(toAddress, state.places),
    ]);
    if (requestSequence !== state.routeRequestSequence) {
      return;
    }
    const sameCoordinates =
      Math.abs(fromPlace.latitude - toPlace.latitude) < 0.00001 &&
      Math.abs(fromPlace.longitude - toPlace.longitude) < 0.00001;
    if (fromPlace.id === toPlace.id || sameCoordinates) {
      throw new Error("Điểm đi và điểm đến đang trỏ tới cùng một địa điểm.");
    }

    const stopPlaces = [fromPlace, toPlace];
    let result;
    if (elements.routeMode.value === "bus") {
      result = findDemoRoute(
        state.busRoutes,
        fromPlace.id,
        toPlace.id,
        [...state.places, fromPlace, toPlace],
        "bus",
      );
      if (!result) {
        throw new Error("Không thể tạo tuyến xe buýt minh họa cho hai địa chỉ này.");
      }
      result.route.simulationNote =
        "Đây là đường nối minh họa giữa hai địa chỉ, không theo đường phố và không phải tuyến xe buýt thực tế.";
    } else {
      const roadRoute = await fetchRoadRoute(stopPlaces);
      if (requestSequence !== state.routeRequestSequence) {
        return;
      }
      result = {
        route: {
          distanceKm: roadRoute.distanceKm,
          durationMinutes: roadRoute.durationMinutes,
          transportMode: "motorbike",
          simulationNote:
            "Đường xe máy tham khảo được tính theo mạng lưới đường OpenStreetMap qua OSRM; không có thông tin giao thông thời gian thực.",
        },
        stopPlaces,
        coordinates: roadRoute.coordinates,
      };
    }
    if (requestSequence !== state.routeRequestSequence) {
      return;
    }

    renderRouteResult(result);
    if (result.route.transportMode === "motorbike") {
      state.map.showRoadRoute(result.coordinates, result.stopPlaces);
    } else {
      state.map.showRoute(result.stopPlaces);
    }
    setMobileView("map");
  } catch (error) {
    if (requestSequence === state.routeRequestSequence) {
      clearRouteResult();
      showRouteNotice(error instanceof Error ? error.message : "Không thể tìm tuyến đường.");
    }
  } finally {
    if (requestSequence === state.routeRequestSequence) {
      elements.routeFind.disabled = false;
      elements.routeFind.removeAttribute("aria-busy");
    }
  }
}

function selectPlace(placeId, openOnMap = false) {
  state.selectedPlaceId = placeId;
  rememberPlaceVisit(placeId);
  renderCollections();
  const cards = [...elements.placeList.querySelectorAll(".place-card")];
  cards.forEach((card) => {
    card.classList.toggle("is-selected", card.dataset.placeId === placeId);
  });

  if (openOnMap) {
    setMobileView("map");
    requestAnimationFrame(() => {
      state.map?.invalidateSize();
      state.map?.focusPlace(placeId);
    });
  } else if (window.matchMedia("(min-width: 761px)").matches) {
    cards.find((card) => card.dataset.placeId === placeId)?.scrollIntoView({ block: "nearest" });
  }
}

function showLoadError(error) {
  elements.notice.textContent = `${error.message} Hãy chạy website qua một local server và kiểm tra tệp data/places.json.`;
  elements.notice.hidden = false;
  elements.placeList.replaceChildren();
  elements.placeList.hidden = true;
  elements.placeList.setAttribute("aria-busy", "false");
  elements.emptyState.hidden = true;
  elements.resultCount.textContent = "Không tải được";
}

elements.searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.query = elements.searchInput.value.trim().replace(/\s+/g, " ");
  elements.searchInput.value = state.query;
  renderPlaces();
});

elements.searchInput.addEventListener("input", () => {
  state.query = elements.searchInput.value.trim().replace(/\s+/g, " ");
  renderPlaces();
});

elements.clearSearch.addEventListener("click", () => {
  elements.searchInput.value = "";
  state.query = "";
  renderPlaces();
  elements.searchInput.focus();
});

elements.categoryFilters.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-category]");
  if (!button) {
    return;
  }

  state.category = button.dataset.category;
  renderCategoryFilters();
  renderPlaces();
});

if (elements.openAdmin) {
  elements.openAdmin.addEventListener("click", () => {
    renderAdminList();
    if (!elements.adminDialog.open) {
      elements.adminDialog.showModal();
    }
  });
}

if (elements.closeAdmin) {
  elements.closeAdmin.addEventListener("click", () => elements.adminDialog.close());
}

elements.adminAddNew.addEventListener("click", () => {
  resetAdminForm();
  showAdminNotice("Bạn đang tạo địa điểm mới trong dữ liệu cục bộ.");
});

if (elements.adminRestoreDefault) {
  elements.adminRestoreDefault.addEventListener("click", restoreDefaultData);
}

elements.adminForm.addEventListener("submit", handleAdminSave);
elements.adminDelete.addEventListener("click", handleAdminDelete);
elements.adminResetForm.addEventListener("click", resetAdminForm);

elements.adminList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-place-id]");
  if (!button) {
    return;
  }
  const chosen = getEffectivePlaces().find((place) => place.id === button.dataset.placeId);
  populateAdminForm(chosen ?? null);
});

elements.resetFilters.addEventListener("click", resetSearchAndFilters);
elements.emptyReset.addEventListener("click", resetSearchAndFilters);
elements.viewTabs.forEach((tab) => {
  tab.addEventListener("click", () => setMobileView(tab.dataset.view));
  tab.addEventListener("keydown", (event) => {
    const currentIndex = [...elements.viewTabs].indexOf(tab);
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % elements.viewTabs.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + elements.viewTabs.length) % elements.viewTabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = elements.viewTabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextTab = elements.viewTabs[nextIndex];
    setMobileView(nextTab.dataset.view);
    nextTab.focus();
  });
});

elements.placeList.addEventListener("click", (event) => {
  const detailsButton = event.target.closest("button.place-detail-action[data-place-id]");
  if (detailsButton) {
    const place = getPlaceById(detailsButton.dataset.placeId);
    if (place) {
      selectPlace(place.id);
      renderPlaceDetails(place);
      elements.placeDetailDialog.showModal();
    }
    return;
  }

  const favoriteButton = event.target.closest("button.place-favorite-toggle[data-place-id]");
  if (favoriteButton) {
    toggleFavorite(favoriteButton.dataset.placeId);
    return;
  }

  const panoramaButton = event.target.closest("button.place-panorama-action[data-place-id]");
  if (panoramaButton) {
    const place = getPlaceById(panoramaButton.dataset.placeId);
    if (place) {
      selectPlace(place.id);
      openPlacePanorama(place);
    }
    return;
  }

  const imageButton = event.target.closest("button.place-image-action[data-place-id]");
  if (imageButton) {
    const place = getPlaceById(imageButton.dataset.placeId);
    if (place) {
      selectPlace(place.id);
      openPlaceImage(place);
    }
    return;
  }

  const mapButton = event.target.closest("button.place-map-action[data-place-id]");
  if (mapButton) {
    selectPlace(mapButton.dataset.placeId, true);
    return;
  }

  const card = event.target.closest(".place-card[data-place-id]");
  if (card) {
    selectPlace(card.dataset.placeId);
  }
});

elements.closePlaceDetail.addEventListener("click", () => elements.placeDetailDialog.close());
elements.placeDetailPhotoOpen.addEventListener("click", () => {
  const place = getPlaceById(elements.placeDetailImage.dataset.placeId);
  if (place) {
    openPlaceImage(place);
  }
});
elements.placeDetailPhotoImage.addEventListener("error", () => {
  elements.placeDetailPhotoImage.hidden = true;
  elements.placeDetailPhotoOpen.hidden = true;
  elements.placeDetailPhotoCaption.append(
    document.createTextNode(" · Không tải được ảnh. Hãy kiểm tra kết nối hoặc mở nguồn ảnh."),
  );
});
elements.placeDetailFavorite.addEventListener("click", () => {
  const placeId = elements.placeDetailFavorite.dataset.placeId;
  if (!placeId) {
    return;
  }
  toggleFavorite(placeId);
  renderPlaceDetails(getPlaceById(placeId));
});
elements.placeReviewStars.addEventListener("click", (event) => {
  const star = event.target.closest("button[data-score]");
  if (star) {
    updateReviewDraftScore(Number.parseInt(star.dataset.score, 10));
  }
});
elements.placeReviewForm.addEventListener("submit", submitPlaceReview);
elements.placeDetailPanorama.addEventListener("click", () => {
  const place = getPlaceById(elements.placeDetailPanorama.dataset.placeId);
  if (place) {
    openPlacePanorama(place);
  }
});
elements.placeDetailImage.addEventListener("click", () => {
  const place = getPlaceById(elements.placeDetailImage.dataset.placeId);
  if (place) {
    openPlaceImage(place);
  }
});
elements.placeDetailMap.addEventListener("click", () => {
  const placeId = elements.placeDetailMap.dataset.placeId;
  if (!placeId) {
    return;
  }
  elements.placeDetailDialog.close();
  selectPlace(placeId, true);
});
elements.closePlaceImage.addEventListener("click", () => elements.placeImageDialog.close());
elements.placeImageDialog.addEventListener("close", clearPlaceImage);
elements.placeImagePreview.addEventListener("error", () => {
  elements.placeImagePreview.hidden = true;
  elements.placeImageError.textContent = "Không tải được ảnh. Hãy kiểm tra kết nối hoặc mở nguồn ảnh.";
  elements.placeImageError.hidden = false;
});

["favoritesList", "historyList"].forEach((listName) => {
  elements[listName].addEventListener("click", (event) => {
    const button = event.target.closest("button[data-place-id]");
    if (!button) {
      return;
    }
    selectPlace(button.dataset.placeId);
  });
});

elements.ratingStars.addEventListener("click", (event) => {
  const star = event.target.closest("button[data-place-id]");
  if (!star) {
    return;
  }
  setPlaceReview(star.dataset.placeId, Number.parseInt(star.dataset.score, 10));
});

elements.fitMap.addEventListener("click", () => {
  if (!state.map?.fitVisiblePlaces()) {
    showMapNotice("Không có địa điểm để hiển thị trên bản đồ trong kết quả hiện tại.");
  } else {
    showMapNotice("");
  }
});

elements.locateUser.addEventListener("click", async () => {
  elements.locateUser.disabled = true;
  elements.locateUser.setAttribute("aria-busy", "true");
  showMapNotice("Đang xác định vị trí…", "loading");
  try {
    await state.map.locateUser();
    showMapNotice("Vị trí chỉ hiển thị trong phiên này và không được lưu.", "info");
  } catch (error) {
    showMapNotice(error instanceof Error ? error.message : "Không thể lấy vị trí của bạn.");
  } finally {
    elements.locateUser.disabled = false;
    elements.locateUser.removeAttribute("aria-busy");
  }
});

elements.routeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitRouteSearch();
});
elements.itineraryForm.addEventListener("submit", createDayItinerary);
elements.itineraryStops.addEventListener("change", changeItineraryPlace);
elements.itineraryStops.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-place-id]");
  if (button) {
    selectPlace(button.dataset.placeId, true);
  }
});
elements.showItineraryMap.addEventListener("click", () => {
  if (!state.itinerary || state.itinerary.stops.length < 2 || !state.map) {
    showItineraryNotice("Cần ít nhất hai địa điểm có tọa độ để vẽ lịch trình trên bản đồ.", true);
    return;
  }

  setMobileView("map");
  void updateItineraryRoadRoute(state.itinerary);
});

elements.routeFrom.addEventListener("change", () => clearCurrentRoute());
elements.routeTo.addEventListener("change", () => clearCurrentRoute());
elements.routeMode.addEventListener("change", () => clearCurrentRoute());
elements.swapRoute.addEventListener("click", () => {
  const fromPlaceId = elements.routeFrom.value;
  elements.routeFrom.value = elements.routeTo.value;
  elements.routeTo.value = fromPlaceId;
  clearCurrentRoute();
});
elements.clearRoute.addEventListener("click", () => {
  elements.routeFrom.value = "";
  elements.routeTo.value = "";
  clearCurrentRoute();
});

elements.openPanorama.addEventListener("click", () => {
  elements.panoramaDialog.showModal();
  elements.panoramaTitle.textContent = "Panorama TP. Hồ Chí Minh";
  elements.panoramaPicker.hidden = state.panoramas.length < 2;
  if (state.panoramaError) {
    showPanoramaStatus(state.panoramaError, true);
    return;
  }
  if (state.panoramas.length === 0) {
    showPanoramaStatus("Chưa có ảnh panorama để hiển thị.");
    return;
  }

  renderPanorama(elements.panoramaSelect.value || state.panoramas[0].id);
  requestAnimationFrame(() => state.panoramaViewer?.resize());
});
elements.closePanorama.addEventListener("click", () => elements.panoramaDialog.close());
elements.panoramaDialog.addEventListener("close", destroyPanoramaViewer);
elements.panoramaSelect.addEventListener("change", () => renderPanorama(elements.panoramaSelect.value));

try {
  state.basePlaces = await loadPlaces();
  state.adminOverrides = readStoredObject(STORAGE_KEYS.adminOverrides);
  state.adminDeleted = readStoredArray(STORAGE_KEYS.adminDeleted);
  state.places = getEffectivePlaces();
  state.favorites = readStoredIds(STORAGE_KEYS.favorites);
  state.history = readStoredIds(STORAGE_KEYS.history);
  state.reviews = readStoredReviews();
  state.placeReviews = readStoredPlaceReviews();
  renderCollections();
  renderCategoryFilters();
  renderPlaces();
  populateItineraryOptions();
  elements.notice.hidden = true;

  try {
    state.map = initializeMap({
      container: elements.mapContainer,
      places: state.places,
      onPlaceSelected: (placeId) => selectPlace(placeId),
      onTileError: (error) => showMapNotice(error.message),
    });
    elements.fitMap.disabled = false;
    elements.locateUser.disabled = false;
  } catch (error) {
    showMapNotice(error instanceof Error ? error.message : "Không thể khởi tạo bản đồ.");
    elements.fitMap.disabled = true;
    elements.locateUser.disabled = true;
  }

  try {
    state.busRoutes = await loadBusRoutes();
    populateRouteOptions();
  } catch (error) {
    state.busRoutes = [];
    populateRouteOptions();
    showRouteNotice(
      `${error instanceof Error ? error.message : "Không thể tải dữ liệu tuyến mẫu."} Vẫn có thể tạo lộ trình giả định giữa các địa điểm có tọa độ.`,
    );
  }
} catch (error) {
  showLoadError(error instanceof Error ? error : new Error("Đã xảy ra lỗi không xác định."));
}

try {
  state.panoramas = await loadPanoramas();
  populatePanoramaOptions();
  renderPlaces();
} catch (error) {
  state.panoramaError =
    error instanceof Error ? error.message : "Không thể tải dữ liệu panorama.";
}
