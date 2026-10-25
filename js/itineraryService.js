import { estimateTransportLeg, TRANSPORT_MODES } from "./transportService.js";

const CITY_CENTER = { latitude: 10.7769, longitude: 106.7009 };

const VISIT_DURATION_MINUTES = {
  "historical-site": 75,
  market: 60,
  architecture: 50,
  museum: 90,
  "public-space": 45,
  "performing-arts": 60,
  nature: 75,
  shopping: 60,
  "cultural-area": 75,
  food: 60,
};

const VISIT_SPEND_ESTIMATES_VND = {
  "historical-site": 50000,
  market: 80000,
  architecture: 0,
  museum: 50000,
  "public-space": 0,
  "performing-arts": 100000,
  nature: 30000,
  shopping: 150000,
  "cultural-area": 80000,
  food: 100000,
};

export const ITINERARY_GOALS = {
  sightseeing: [
    "historical-site",
    "architecture",
    "museum",
    "public-space",
    "performing-arts",
    "nature",
    "cultural-area",
  ],
  shopping: ["shopping", "market"],
  food: ["food"],
};

const PACE_STOP_LIMITS = {
  relaxed: 4,
  balanced: 5,
  packed: 6,
};
const LUNCH_BREAK_AFTER_STOPS = 3;
const LUNCH_BREAK_MINUTES = 45;

function hasCoordinates(place) {
  return (
    Number.isFinite(place.latitude) &&
    Number.isFinite(place.longitude) &&
    Boolean(place.coordinateSourceUrl)
  );
}

function distanceKm(first, second) {
  const radians = (degrees) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(second.latitude - first.latitude);
  const longitudeDelta = radians(second.longitude - first.longitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(first.latitude)) *
      Math.cos(radians(second.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function parseTime(time) {
  if (typeof time !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return null;
  }
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatTime(totalMinutes) {
  const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalizedMinutes / 60);
  const minutes = normalizedMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function createScheduledItinerary(placesById, placeIds, options) {
  const stops = [];
  let elapsedMinutes = 0;
  let totalDistanceKm = 0;
  let totalFareVnd = 0;
  let totalActivitySpendVnd = 0;
  let previousPlace = null;

  for (const [index, placeId] of placeIds.entries()) {
    const place = placesById.get(placeId);
    if (!place || !hasCoordinates(place)) {
      return { isFeasible: false, reason: "location", stops: [] };
    }

    const travel =
      previousPlace === null
        ? { distanceKm: 0, minutes: 0, fareVnd: 0 }
        : estimateTransportLeg(distanceKm(previousPlace, place), options.mode);
    const visitMinutes = VISIT_DURATION_MINUTES[place.category] ?? 60;
    const activitySpendVnd = VISIT_SPEND_ESTIMATES_VND[place.category] ?? 0;
    const arrivalMinutes = options.startMinutes + elapsedMinutes + travel.minutes;
    const departureMinutes = arrivalMinutes + visitMinutes;
    const breakAfterMinutes =
      index === LUNCH_BREAK_AFTER_STOPS - 1 && index < placeIds.length - 1
        ? LUNCH_BREAK_MINUTES
        : 0;

    stops.push({
      place,
      arrival: formatTime(arrivalMinutes),
      departure: formatTime(departureMinutes),
      visitMinutes,
      activitySpendVnd,
      travelMinutes: travel.minutes,
      distanceKm: travel.distanceKm,
      fareVnd: travel.fareVnd,
      breakAfterMinutes,
    });

    elapsedMinutes = departureMinutes - options.startMinutes + breakAfterMinutes;
    totalDistanceKm += travel.distanceKm;
    totalFareVnd += travel.fareVnd;
    totalActivitySpendVnd += activitySpendVnd;
    previousPlace = place;
  }

  const totalEstimatedCostVnd = totalFareVnd + totalActivitySpendVnd;
  if (options.startMinutes + elapsedMinutes > options.endMinutes) {
    return {
      isFeasible: false,
      reason: "time",
      stops,
      totalMinutes: elapsedMinutes,
      totalFareVnd,
      totalActivitySpendVnd,
      totalEstimatedCostVnd,
    };
  }
  if (totalEstimatedCostVnd > options.budgetVnd) {
    return {
      isFeasible: false,
      reason: "budget",
      stops,
      totalMinutes: elapsedMinutes,
      totalFareVnd,
      totalActivitySpendVnd,
      totalEstimatedCostVnd,
    };
  }

  return {
    isFeasible: true,
    reason: null,
    stops,
    totalMinutes: elapsedMinutes,
    totalDistanceKm,
    totalFareVnd,
    totalActivitySpendVnd,
    totalEstimatedCostVnd,
  };
}

export function generateDayItinerary(
  places,
  {
    categories,
    goals = [],
    pace,
    startPlaceId,
    mode = "bus",
    startTime = "08:00",
    endTime = "18:00",
    budgetVnd = 500000,
    fixedPlaceIds,
  },
) {
  if (!TRANSPORT_MODES[mode]) {
    throw new Error("Phương tiện di chuyển không hợp lệ.");
  }
  const startMinutes = parseTime(startTime);
  const endMinutes = parseTime(endTime);
  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
    throw new Error("Giờ kết thúc phải sau giờ bắt đầu trong cùng một ngày.");
  }
  if (!Number.isSafeInteger(budgetVnd) || budgetVnd < 0) {
    throw new Error("Ngân sách phải là số nguyên không âm.");
  }
  if (!Array.isArray(categories)) {
    throw new Error("Hãy chọn ít nhất một nhóm sở thích.");
  }

  const allowedCategories = new Set(categories);
  const candidates = places.filter(
    (place) => hasCoordinates(place) && allowedCategories.has(place.category),
  );
  const stopLimit = PACE_STOP_LIMITS[pace] ?? PACE_STOP_LIMITS.balanced;
  const chosenStart = places.find(
    (place) => place.id === startPlaceId && hasCoordinates(place),
  );
  if (chosenStart && !candidates.some((place) => place.id === chosenStart.id)) {
    candidates.push(chosenStart);
  }
  const placesById = new Map(places.map((place) => [place.id, place]));
  const options = { mode, startMinutes, endMinutes, budgetVnd };
  const orderedGoals = goals.filter((goal) =>
    Object.prototype.hasOwnProperty.call(ITINERARY_GOALS, goal),
  );
  const selectedGoals =
    orderedGoals.length > 0 ? orderedGoals : ["sightseeing", "shopping", "food"];
  const goalForPlace = (place) =>
    selectedGoals.find((goal) => ITINERARY_GOALS[goal].includes(place.category));

  if (Array.isArray(fixedPlaceIds)) {
    if (fixedPlaceIds.length === 0 || fixedPlaceIds.length > stopLimit) {
      return {
        isFeasible: false,
        reason: "time",
        stops: [],
        totalMinutes: 0,
        totalDistanceKm: 0,
        totalFareVnd: 0,
        totalActivitySpendVnd: 0,
        totalEstimatedCostVnd: 0,
      };
    }
    if (new Set(fixedPlaceIds).size !== fixedPlaceIds.length) {
      return {
        isFeasible: false,
        reason: "duplicate",
        stops: [],
        totalMinutes: 0,
        totalDistanceKm: 0,
        totalFareVnd: 0,
        totalActivitySpendVnd: 0,
        totalEstimatedCostVnd: 0,
      };
    }
    const fixedPlaces = fixedPlaceIds.map((placeId) => placesById.get(placeId));
    if (
      fixedPlaces.some(
        (place) =>
          !place ||
          !hasCoordinates(place) ||
          (!allowedCategories.has(place.category) && place.id !== startPlaceId),
      )
    ) {
      return {
        isFeasible: false,
        reason: "location",
        stops: [],
        totalMinutes: 0,
        totalDistanceKm: 0,
        totalFareVnd: 0,
        totalActivitySpendVnd: 0,
        totalEstimatedCostVnd: 0,
      };
    }
    const scheduled = createScheduledItinerary(placesById, fixedPlaceIds, options);
    return {
      ...scheduled,
      unmetGoals: selectedGoals.filter(
        (goal) =>
          !fixedPlaces.some((place) => goalForPlace(place) === goal),
      ),
      transportMode: mode,
      budgetVnd,
      startTime,
      endTime,
    };
  }

  if (candidates.length === 0) {
    return {
      isFeasible: false,
      reason: "location",
      stops: [],
      totalMinutes: 0,
      totalDistanceKm: 0,
      totalFareVnd: 0,
      totalActivitySpendVnd: 0,
      totalEstimatedCostVnd: 0,
    };
  }

  const firstStop =
    chosenStart && candidates.some((place) => place.id === chosenStart.id)
      ? chosenStart
      : [...candidates].sort((first, second) => {
          const firstGoalIndex = selectedGoals.indexOf(goalForPlace(first));
          const secondGoalIndex = selectedGoals.indexOf(goalForPlace(second));
          if (firstGoalIndex !== secondGoalIndex) {
            return firstGoalIndex - secondGoalIndex;
          }
          return (
            distanceKm(first, CITY_CENTER) - distanceKm(second, CITY_CENTER)
          );
        })[0];
  const remaining = candidates.filter((place) => place.id !== firstStop.id);
  const selectedIds = [firstStop.id];
  const coveredGoals = new Set([goalForPlace(firstStop)].filter(Boolean));
  const firstStopPlan = createScheduledItinerary(placesById, selectedIds, options);
  if (!firstStopPlan.isFeasible) {
    return {
        ...firstStopPlan,
        stops: [],
        totalMinutes: 0,
        totalDistanceKm: 0,
        totalFareVnd: 0,
        totalActivitySpendVnd: 0,
        totalEstimatedCostVnd: 0,
        transportMode: mode,
        budgetVnd,
        startTime,
        endTime,
    };
  }

  while (selectedIds.length < stopLimit && remaining.length > 0) {
    const previousPlace = placesById.get(selectedIds.at(-1));
    const unmetGoals = selectedGoals.filter((goal) => !coveredGoals.has(goal));
    const nearbyFirst = [...remaining].sort(
      (first, second) => {
        const firstGoalIndex = unmetGoals.indexOf(goalForPlace(first));
        const secondGoalIndex = unmetGoals.indexOf(goalForPlace(second));
        const firstPriority = firstGoalIndex < 0 ? Number.MAX_SAFE_INTEGER : firstGoalIndex;
        const secondPriority = secondGoalIndex < 0 ? Number.MAX_SAFE_INTEGER : secondGoalIndex;
        return (
          firstPriority - secondPriority ||
          distanceKm(previousPlace, first) - distanceKm(previousPlace, second)
        );
      },
    );
    let nextPlace = null;
    for (const candidate of nearbyFirst) {
      const trial = createScheduledItinerary(
        placesById,
        [...selectedIds, candidate.id],
        options,
      );
      if (trial.isFeasible) {
        nextPlace = candidate;
        break;
      }
    }
    if (!nextPlace) {
      break;
    }
    selectedIds.push(nextPlace.id);
    const coveredGoal = goalForPlace(nextPlace);
    if (coveredGoal) {
      coveredGoals.add(coveredGoal);
    }
    remaining.splice(remaining.indexOf(nextPlace), 1);
  }

  const itinerary = createScheduledItinerary(placesById, selectedIds, options);
  const unmetGoals = selectedGoals.filter(
    (goal) =>
      !selectedIds.some((placeId) => goalForPlace(placesById.get(placeId)) === goal),
  );
  return {
    ...itinerary,
    unmetGoals,
    transportMode: mode,
    budgetVnd,
    startTime,
    endTime,
  };
}
