// Sample UK businesses used until Google Places is connected.
import plumbing from "@/assets/plumbing.jpg";
import electrician from "@/assets/electrician.jpg";
import cleaning from "@/assets/cleaning.jpg";
import landscaping from "@/assets/landscaping.jpg";
import salon from "@/assets/salon.jpg";
import type { Signals, Trade } from "./audit";

export const TRADE_PHOTOS: Record<Trade, string> = { plumbing, electrician, cleaning, landscaping, salon };

export interface Business {
  id: string;
  name: string;
  trade: Trade;
  address: string;
  area: string;
  phone: string;
  signals: Signals;
  services: string[];
  reviews: { author: string; stars: number; text: string; replied: boolean }[];
  competitors: { name: string; signals: Signals; photo?: string | undefined }[];
  photo?: string | undefined;
  live?: boolean;
  location?: { latitude: number; longitude: number };
}

const sig = (o: Partial<Signals>): Signals => ({
  rating: 4.3, reviewCount: 40, reviewsLast90: 3, replyRate: 0.2, photoCount: 6, newestPhotoDays: 300,
  descriptionLength: 90, hasWebsite: false, hasHours: true, postsLast30: 0, credentialMentioned: false,
  servicesListed: 3, ...o,
});
const strong = (o: Partial<Signals> = {}) => sig({ rating: 4.9, reviewCount: 210, reviewsLast90: 18, replyRate: 0.95, photoCount: 40, newestPhotoDays: 12, descriptionLength: 720, hasWebsite: true, postsLast30: 4, credentialMentioned: true, servicesListed: 9, ...o });
const mid = (o: Partial<Signals> = {}) => sig({ rating: 4.7, reviewCount: 120, reviewsLast90: 9, replyRate: 0.6, photoCount: 18, newestPhotoDays: 60, descriptionLength: 400, hasWebsite: true, postsLast30: 1, credentialMentioned: true, servicesListed: 6, ...o });

export const BUSINESSES: Business[] = [
  {
    id: "riverside-plumbing", name: "Riverside Plumbing & Heating", trade: "plumbing",
    address: "14 Stroud Green Rd, London N4", area: "Finsbury Park", phone: "07812 345678",
    signals: sig({ rating: 4.4, reviewCount: 63, reviewsLast90: 2, replyRate: 0.12, photoCount: 7, newestPhotoDays: 410, descriptionLength: 48, servicesListed: 3 }),
    services: ["Boiler servicing", "Boiler installs", "Emergency leaks", "Bathroom fitting", "Radiators", "Power flushing"],
    reviews: [
      { author: "Sarah K.", stars: 5, text: "Fixed our boiler on a Sunday. Lifesaver.", replied: false },
      { author: "Tom B.", stars: 2, text: "Good work but turned up two hours late with no call.", replied: false },
      { author: "Priya M.", stars: 5, text: "Tidy, fair price, explained everything.", replied: false },
    ],
    competitors: [{ name: "North London Heating Co", signals: strong() }, { name: "Crouch End Plumbers", signals: mid() }, { name: "Harringay Gas Services", signals: mid({ rating: 4.6, replyRate: 0.4 }) }],
  },
  {
    id: "brightwire-electrical", name: "Brightwire Electrical", trade: "electrician",
    address: "3 Deansgate Mews, Manchester M3", area: "Deansgate", phone: "07700 900321",
    signals: sig({ rating: 4.8, reviewCount: 88, reviewsLast90: 5, replyRate: 0.35, photoCount: 4, newestPhotoDays: 220, descriptionLength: 160, hasWebsite: true, servicesListed: 4 }),
    services: ["Consumer unit upgrades", "EICR certificates", "EV chargers", "Rewires", "Lighting", "Fault finding"],
    reviews: [
      { author: "Jamal O.", stars: 5, text: "EV charger fitted in half a day, really neat job.", replied: true },
      { author: "Lucy H.", stars: 3, text: "Fine work, quote took a week to arrive.", replied: false },
      { author: "Dev P.", stars: 5, text: "Found a fault two others missed.", replied: false },
    ],
    competitors: [{ name: "Spark Manchester", signals: strong() }, { name: "Volt & Co", signals: mid() }, { name: "Salford Sparks", signals: mid({ rating: 4.5 }) }],
  },
  {
    id: "sparkle-and-co", name: "Sparkle & Co Cleaning", trade: "cleaning",
    address: "22 Gloucester Rd, Bristol BS7", area: "Bishopston", phone: "07911 223344",
    signals: sig({ rating: 4.2, reviewCount: 29, reviewsLast90: 1, replyRate: 0.05, photoCount: 2, newestPhotoDays: 500, descriptionLength: 0, servicesListed: 2, hasHours: false }),
    services: ["Regular home cleans", "End of tenancy", "Deep cleans", "Office cleaning", "Oven cleaning"],
    reviews: [
      { author: "Hannah R.", stars: 5, text: "Flat has never looked better.", replied: false },
      { author: "Owen J.", stars: 1, text: "Cancelled on the morning, twice.", replied: false },
      { author: "Mei L.", stars: 4, text: "Lovely team, missed the skirting boards.", replied: false },
    ],
    competitors: [{ name: "Bristol Home Clean", signals: strong() }, { name: "Fresh Start Cleaners", signals: mid() }, { name: "Redland Maids", signals: mid({ replyRate: 0.8 }) }],
  },
  {
    id: "greenline-gardens", name: "Greenline Gardens", trade: "landscaping",
    address: "Unit 5, Mill Lane, Guildford GU1", area: "Guildford", phone: "07400 112233",
    signals: sig({ rating: 4.9, reviewCount: 54, reviewsLast90: 4, replyRate: 0.7, photoCount: 9, newestPhotoDays: 150, descriptionLength: 280, hasWebsite: true, servicesListed: 4, postsLast30: 1 }),
    services: ["Garden design", "Patios", "Turfing", "Fencing", "Hedge cutting", "Planting"],
    reviews: [
      { author: "Clare W.", stars: 5, text: "Our patio is the envy of the street.", replied: true },
      { author: "Rob T.", stars: 5, text: "Turned a jungle into a garden in a week.", replied: false },
      { author: "Anita S.", stars: 4, text: "Great result, a bit of mess left on day two.", replied: true },
    ],
    competitors: [{ name: "Surrey Landscapes", signals: strong() }, { name: "Garden Craft Guildford", signals: mid() }, { name: "Wey Valley Gardens", signals: mid({ photoCount: 30 }) }],
  },
  {
    id: "the-hair-lab", name: "The Hair Lab", trade: "salon",
    address: "41 Church St, Leeds LS1", area: "Leeds city centre", phone: "0113 496 0000",
    signals: sig({ rating: 4.6, reviewCount: 142, reviewsLast90: 11, replyRate: 0.28, photoCount: 14, newestPhotoDays: 95, descriptionLength: 210, hasWebsite: false, servicesListed: 5, postsLast30: 0, credentialMentioned: true }),
    services: ["Cut & finish", "Balayage", "Colour correction", "Keratin", "Bridal hair", "Men's cuts", "Brows", "Blow dry"],
    reviews: [
      { author: "Ellie D.", stars: 5, text: "Best balayage I've ever had.", replied: false },
      { author: "Sophie N.", stars: 3, text: "Lovely stylist but waited 25 minutes.", replied: false },
      { author: "Grace A.", stars: 5, text: "So friendly, will be back.", replied: true },
    ],
    competitors: [{ name: "Studio Nine Leeds", signals: strong() }, { name: "Mane Street", signals: mid() }, { name: "Cut Above Leeds", signals: mid({ photoCount: 40 }) }],
  },
];

export const findBusiness = (id: string) => BUSINESSES.find((b) => b.id === id);

export const photoOf = (b: Pick<Business, "photo" | "trade">) => b.photo ?? TRADE_PHOTOS[b.trade];
