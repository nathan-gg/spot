// using async function to fetch data because it will wait until the data is received in situation with poor connection
// take in latitude and longitude as parameters to call the api to the correct location coordinates
async function getVancouverOpenData(lat, lng) {
//  use a try/catch function so if the API fetch is unsuccessful the app will return an error instead of just crashing
  try {
    // use fetch and wait for a response from the API
    // by placing the link inside backticks (``) instead of quotes, we can use the parameters lat and lng to enters the user's search coordinates
    const response = await fetch(
      `https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/parking-meters/records?where=within_distance(geo_point_2d,%20geom%27POINT(${lng}%20${lat})%27,%20500m)&limit=50`,
    );
    // turns the response data into an array of json objects
    const data = await response.json();
    // for each parking meter in the array, use .map() to create a new object with normalized values, this allows us to add more parking location API's in the future and normalize them in the same way so they all work cohesively
    return data.results.map((parkingSpot) => ({
      id: parkingSpot.meter_id, // the unique meter id 
      type: "street_parking_meter", // the type of parking
      latitude: parkingSpot.geo_point_2d.lat, // latitude
      longitude: parkingSpot.geo_point_2d.lon, // longitude
      rate: parkingSpot.rate_9am_6pm, // parking rate from 9 am to 6 pm, we will need to add more values from the Vancouver Open Data API later but this works as a proof of concept
      timeLimit: parkingSpot.time_limit_9am_6pm, // parking duration from 9 am to 6 pm
    }));
  } catch (error) { // error message if there is a network error, no results, etc
    console.warn("Error fetching street meters: ", error);
    return [];
  }
}

// exports the function from this file so that the other pages can use it
export async function getParkingData(lat, lng) {
  return await getVancouverOpenData(lat, lng);
}
