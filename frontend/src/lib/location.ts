export interface Coordinates {
  lat: number;
  lng: number;
}

export function hasCoordinates(
  value: Partial<Coordinates> | null | undefined,
): value is Coordinates {
  return Boolean(
    value &&
    Number.isFinite(value.lat) &&
    Number.isFinite(value.lng),
  );
}

export function calculateDistanceKm(start: Coordinates, end: Coordinates) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(end.lat - start.lat);
  const deltaLng = toRadians(end.lng - start.lng);
  const startLat = toRadians(start.lat);
  const endLat = toRadians(end.lat);

  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(deltaLng / 2) ** 2;
  const centralAngle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return earthRadiusKm * centralAngle;
}

export function formatDistanceKm(distanceKm: number) {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    return "";
  }

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }

  return `${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)} km away`;
}

export function requestBrowserLocation(options?: PositionOptions) {
  return new Promise<Coordinates>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported in this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error("Location permission was denied."));
          return;
        }

        if (error.code === error.POSITION_UNAVAILABLE) {
          reject(new Error("Current location is unavailable right now."));
          return;
        }

        if (error.code === error.TIMEOUT) {
          reject(new Error("Location lookup timed out. Please try again."));
          return;
        }

        reject(new Error("We could not access your current location."));
      },
      options,
    );
  });
}
