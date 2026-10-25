export const TRANSPORT_MODES = {
  bus: {
    label: "xe buýt",
    speedKmPerHour: 18,
    extraMinutes: 8,
    minimumFareVnd: 5000,
    farePerThreeKmVnd: 1000,
    baseFareVnd: 4000,
  },
  motorbike: {
    label: "xe máy",
    speedKmPerHour: 25,
    extraMinutes: 5,
    minimumFareVnd: 0,
    farePerThreeKmVnd: 1000,
    baseFareVnd: 0,
  },
};

export function estimateTransportLeg(distanceKm, mode) {
  const settings = TRANSPORT_MODES[mode];
  if (!settings || !Number.isFinite(distanceKm) || distanceKm < 0) {
    throw new Error("Không thể ước tính chặng đường với phương tiện hoặc khoảng cách không hợp lệ.");
  }

  const roadDistanceKm = distanceKm * 1.35;
  const fareVnd =
    mode === "motorbike"
      ? Math.ceil((roadDistanceKm * 1000) / 1000) * 1000
      : Math.max(
          settings.minimumFareVnd,
          Math.ceil(roadDistanceKm / 3) * settings.farePerThreeKmVnd + settings.baseFareVnd,
        );
  return {
    distanceKm: roadDistanceKm,
    minutes: Math.max(
      mode === "motorbike" ? 5 : 8,
      Math.ceil((roadDistanceKm / settings.speedKmPerHour) * 60) + settings.extraMinutes,
    ),
    fareVnd,
  };
}
