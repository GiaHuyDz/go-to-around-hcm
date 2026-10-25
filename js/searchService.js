export const CATEGORY_LABELS = {
  "historical-site": "Di tích & lịch sử",
  market: "Chợ & mua sắm",
  architecture: "Kiến trúc",
  museum: "Bảo tàng & văn hóa",
  "public-space": "Không gian công cộng",
  "performing-arts": "Nghệ thuật & biểu diễn",
  nature: "Công viên & thiên nhiên",
  shopping: "Mua sắm",
  "cultural-area": "Khu vực văn hóa",
  food: "Ẩm thực",
};

export function normalizeSearchText(value) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ");
}

export function filterPlaces(places, query, category) {
  const normalizedQuery = normalizeSearchText(query);

  return places.filter((place) => {
    const matchesCategory = category === "all" || place.category === category;
    if (!matchesCategory) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchableText = [
      place.name,
      place.category,
      CATEGORY_LABELS[place.category],
      place.description,
      place.address,
      ...(Array.isArray(place.tags) ? place.tags : []),
    ]
      .filter(Boolean)
      .join(" ");

    return normalizeSearchText(searchableText).includes(normalizedQuery);
  });
}
