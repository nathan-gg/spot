async function getVancouverOpenData(lat, lng) {
  try {
    const response = await fetch(
      `https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/parking-meters/records?where=within_distance(geo_point_2d,%20geom%27POINT(${lng}%20${lat})%27,%20500m)&limit=50`,
    );
    const data = await response.json();

    return data.results.map((parkingSpot) => ({
      id: parkingSpot.meter_id,
      type: "street_parking_meter",
      latitude: parkingSpot.geo_point_2d.lat,
      longitude: parkingSpot.geo_point_2d.lon,
      rate: parkingSpot.rate_9am_6pm,
      timeLimit: parkingSpot.time_limit_9am_6pm, // weekday time limit 9am-6pm
    }));
  } catch (error) {
    console.warn("Error fetching street meters: ", error);
    return [];
  }
}

export async function getParkingData(lat, lng) {
  return await getVancouverOpenData(lat, lng);
}
