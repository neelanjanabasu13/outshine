import type { Trade } from "./audit";

export const REFERENCE_CITIES = ["London", "Manchester", "Birmingham", "Leeds", "Edinburgh"] as const;
export type ReferenceCity = typeof REFERENCE_CITIES[number];
export type ReferenceEntry = { city: ReferenceCity; trade: Trade; name: string; website: string; source: string };

/** Editorial selections only. Current Google evidence, not this catalogue, determines the grade. */
export const REFERENCES: ReferenceEntry[] = [
  { city: "London", trade: "plumbing", name: "Pimlico Plumbers", website: "https://www.pimlicoplumbers.com/", source: "https://www.pimlicoplumbers.com/" },
  { city: "London", trade: "electrician", name: "Aspect", website: "https://www.aspect.co.uk/", source: "https://www.aspect.co.uk/locations/london/electricians-london/" },
  { city: "London", trade: "cleaning", name: "Fantastic Services", website: "https://www.fantasticservices.com/", source: "https://www.fantasticservices.com/london/" },
  { city: "London", trade: "landscaping", name: "Alcourt Landscapes", website: "https://alcourtlandscapes.co.uk/", source: "https://alcourtlandscapes.co.uk/driveways/south-west-london/" },
  { city: "London", trade: "salon", name: "Taylor Taylor London", website: "https://taylortaylorlondon.com/", source: "https://taylortaylorlondon.com/salons.html" },
  { city: "Manchester", trade: "plumbing", name: "Manchester Plumbing Services", website: "https://www.manchesterplumbingservices.com/", source: "https://www.manchesterplumbingservices.com/" },
  { city: "Manchester", trade: "electrician", name: "Manchester Electric Ltd", website: "https://www.manchesterelectric.co.uk/", source: "https://www.manchesterelectric.co.uk/reviews.html" },
  { city: "Manchester", trade: "cleaning", name: "Manchester House Cleaning Services", website: "https://www.manchesterhousecleaningservices.co.uk/", source: "https://www.manchesterhousecleaningservices.co.uk/en/testimonials/" },
  { city: "Manchester", trade: "landscaping", name: "KMR Gardens & Landscapes", website: "https://kmr-gardens-and-landscapes.co.uk/", source: "https://kmr-gardens-and-landscapes.co.uk/" },
  { city: "Manchester", trade: "salon", name: "McCrory Hair", website: "https://mccroryhair.co.uk/", source: "https://mccroryhair.co.uk/" },
  { city: "Birmingham", trade: "plumbing", name: "J. Avery Plumbing & Heating", website: "https://www.javeryplumbing.co.uk/", source: "https://www.javeryplumbing.co.uk/" },
  { city: "Birmingham", trade: "electrician", name: "ELECSAN Ltd", website: "https://www.elecsan-ltd.com/", source: "https://www.elecsan-ltd.com/contact/" },
  { city: "Birmingham", trade: "cleaning", name: "Mopheads", website: "https://www.mopheads.co.uk/", source: "https://www.mopheads.co.uk/" },
  { city: "Birmingham", trade: "landscaping", name: "Design It Landscapes", website: "https://www.designitlandscapes.co.uk/", source: "https://www.trustmark.org.uk/firms/Design%20It%20Landscapes-1426532-B45%209BY?id=c984a8dd-c1a2-426a-809a-347e6359a53b" },
  { city: "Birmingham", trade: "salon", name: "Urban Roots", website: "https://www.urbanrootshair.com/", source: "https://www.urbanrootshair.com/" },
  { city: "Leeds", trade: "plumbing", name: "Barlow’s Heating & Plumbing", website: "https://bhpleeds.com/", source: "https://bhpleeds.com/" },
  { city: "Leeds", trade: "electrician", name: "Fletcher Electric", website: "https://www.fletcherelectric.co.uk/", source: "https://www.fletcherelectric.co.uk/about-us/" },
  { city: "Leeds", trade: "cleaning", name: "Poppies Leeds", website: "https://poppies.co.uk/leeds/", source: "https://poppies.co.uk/leeds/" },
  { city: "Leeds", trade: "landscaping", name: "Gardening Leeds", website: "https://gardeningleeds.co.uk/", source: "https://gardeningleeds.co.uk/" },
  { city: "Leeds", trade: "salon", name: "RMUK", website: "https://www.rm-uk.com/", source: "https://www.rm-uk.com/" },
  { city: "Edinburgh", trade: "plumbing", name: "Aspire Trade Services", website: "https://www.aspiretradeservices.co.uk/", source: "https://www.aspiretradeservices.co.uk/plumbing-heating/plumbing/" },
  { city: "Edinburgh", trade: "electrician", name: "N. Watt & Son", website: "https://nwattandson.com/", source: "https://nwattandson.com/" },
  { city: "Edinburgh", trade: "cleaning", name: "Home Sweet Home Cleaning", website: "https://www.hshcleaning.co.uk/", source: "https://www.hshcleaning.co.uk/edinburgh/reviews/" },
  { city: "Edinburgh", trade: "landscaping", name: "The Gardener", website: "https://www.thegardeneredinburgh.co.uk/", source: "https://www.thegardeneredinburgh.co.uk/" },
  { city: "Edinburgh", trade: "salon", name: "MacIntyres Hair & Beauty", website: "https://macintyreshairandbeauty.com/", source: "https://macintyreshairandbeauty.com/" },
];

export function referenceCity(address: string, location?: { latitude: number; longitude: number }): ReferenceCity | null {
  const exact = REFERENCE_CITIES.find((city) => new RegExp(`\\b${city}\\b`, "i").test(address));
  if (exact) return exact;
  if (!location) return null;
  const centres: Record<ReferenceCity, [number, number]> = { London: [51.5074, -0.1278], Manchester: [53.4808, -2.2426], Birmingham: [52.4862, -1.8904], Leeds: [53.8008, -1.5491], Edinburgh: [55.9533, -3.1883] };
  const nearest = [...REFERENCE_CITIES].sort((a, b) => {
    const distance = (city: ReferenceCity) => (centres[city][0] - location.latitude) ** 2 + ((centres[city][1] - location.longitude) * Math.cos(location.latitude * Math.PI / 180)) ** 2;
    return distance(a) - distance(b);
  })[0] ?? null;
  if (!nearest) return null;
  const [lat, lng] = centres[nearest];
  const km = 111 * Math.hypot(lat - location.latitude, (lng - location.longitude) * Math.cos(location.latitude * Math.PI / 180));
  return km <= 35 ? nearest : null;
}