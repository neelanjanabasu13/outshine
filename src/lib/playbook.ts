import type { Trade } from "./audit";

/**
 * Trade-specific operational knowledge distilled from the Outshine research playbooks.
 * Each entry targets the upstream cause behind a public profile symptom, so the DIY
 * pack tells an owner what to change in the business, not only what to post on Google.
 */
export interface TradePlaybook {
  /** The moment in this trade when a customer is happiest and most willing to review. */
  askMoment: string;
  /** Common complaint themes and the operational change that removes each one. */
  rootCauses: { theme: string; fix: string }[];
  /** Five-shot photo set: what to capture and how. */
  shotList: { shot: string; how: string }[];
  /** Services named the way customers actually search for them. */
  serviceTerms: string[];
  /** How a customer checks the credential, so the owner can show it confidently. */
  credentialCheck: string;
  /** Prompt for AI-made graphics (never presented as photos of real work). */
  aiPrompt: string;
  /** A trade-specific script that prevents the most common bad review. */
  expectationScript: { label: string; text: string };
  /** Hard lines the owner must not cross for this trade. */
  guardrails: string[];
  /** Weekly update ideas that fit this trade's season and work. */
  postIdeas: string[];
}

export const PLAYBOOKS: Record<Trade, TradePlaybook> = {
  plumbing: {
    askMoment: "Right after you run the tap, fire the boiler or show the customer the fixed leak, while they can see it working.",
    rootCauses: [
      { theme: "Unexpected bill", fix: "Quote the call-out or diagnostic charge before you travel, and get a yes by text before any extra parts or labour." },
      { theme: "Late arrival or no update", fix: "Give a two-hour arrival window, and text the customer the moment that window changes." },
      { theme: "Same fault came back", fix: "Say clearly whether today's fix is temporary or permanent, and book the follow-up visit before you leave." },
      { theme: "Mess left behind", fix: "Lay dust sheets before starting and agree up front whether making good (tiling, boxing in) is included." },
    ],
    shotList: [
      { shot: "Context", how: "A wide shot of the room or cupboard where you worked, with no house numbers, post or family photos in view." },
      { shot: "Before", how: "The leak, old boiler or damaged pipe, taken from where you stand naturally, only if safe." },
      { shot: "After", how: "The exact same angle once finished, with the area wiped down and tools removed." },
      { shot: "Detail", how: "One close-up a homeowner understands, such as neat pipework or a new valve. Never claim a photo proves it is safe." },
      { shot: "You and the van", how: "You or your team beside the branded van, smiling, in work clothes." },
    ],
    serviceTerms: ["boiler repair", "boiler servicing", "new boiler installation", "leak detection and repair", "blocked drains", "bathroom installation", "emergency plumber", "radiator replacement", "landlord gas safety certificate"],
    credentialCheck: "Customers can look you up at gassaferegister.co.uk using your registration number or business name. Put that number on your profile description and website so they can check in seconds.",
    aiPrompt: "A clean, modern square graphic for a UK plumbing and heating company titled 'Boiler service from £[price]', navy and white, simple boiler icon, plenty of white space, no photos of people",
    expectationScript: { label: "Price before you travel (text or call)", text: "Hi [name], before I head over: our call-out is £[amount], which covers the first [time] and finding the fault. If it needs parts or more time, I'll tell you the cost and only carry on once you say yes. See you between [time] and [time]." },
    guardrails: [
      "Never post photos that show a gas appliance opened up unsafely, and never ask a customer to expose a hazard for a photo.",
      "Only state Gas Safe registration if every person doing gas work holds it in their own name.",
    ],
    postIdeas: ["Autumn reminder to service the boiler before winter, with your booking slots", "A before and after of a recent bathroom", "How to find and use your stopcock, with a photo", "Frozen pipe tips during a cold snap"],
  },
  electrician: {
    askMoment: "Straight after you hand over the certificate and show the customer their new board, charger or lights working.",
    rootCauses: [
      { theme: "Holes and dust left behind", fix: "Agree in writing before starting who fills and paints any chasing or holes (making good), and what it costs." },
      { theme: "Price went up mid-job", fix: "Quote fixed prices where you can, and if the old wiring needs more work, show the customer the problem and get a yes before continuing." },
      { theme: "Certificate never arrived", fix: "Send the electrical certificate by email within 48 hours and say so on the day." },
      { theme: "Hard to get hold of", fix: "Use a voicemail that promises a call back within a set time, and keep that promise." },
    ],
    shotList: [
      { shot: "Context", how: "A wide shot of the hallway or garage where the board or charger sits, no house numbers visible." },
      { shot: "Before", how: "The old fuse box or tangled wiring, only with power isolated and only if safe." },
      { shot: "After", how: "The new consumer unit, labelled and tidy, from the same angle." },
      { shot: "Detail", how: "Neat cable runs or a clean EV charger mount. A photo is not proof of safety, so never caption it as one." },
      { shot: "You and the van", how: "You beside the van or holding your NICEIC or NAPIT card." },
    ],
    serviceTerms: ["consumer unit replacement", "fuse board upgrade", "EV charger installation", "EICR electrical safety report", "rewiring", "extra sockets", "outdoor lighting", "landlord electrical certificate", "fault finding"],
    credentialCheck: "Customers can check you on the NICEIC or NAPIT 'find a contractor' search, or the Electrical Competent Person register at electricalcompetentperson.co.uk. Name the scheme and your registration number on your profile.",
    aiPrompt: "A clean, modern square graphic for a UK electrician titled 'EV charger installed from £[price]', dark blue and bright yellow, simple plug icon, no photos of people",
    expectationScript: { label: "Making good, agreed before you start", text: "Just so we're clear before I start: fitting this means [chasing the wall / lifting floorboards]. I'll [fill the holes ready for painting / leave it for your decorator], and that's included in the price. Painting isn't included. Is that okay?" },
    guardrails: [
      "Never photograph or post live, exposed parts, and never describe a job as certified unless the certificate has been issued.",
      "Only claim scheme membership you hold, and show your own registration number, not a former employer's.",
    ],
    postIdeas: ["Why an EICR matters for landlords, with your price", "A before and after of an old fuse box swapped for a new board", "Outdoor lighting ideas for darker evenings", "What the test button on your board does"],
  },
  cleaning: {
    askMoment: "When the customer walks round the finished home and says it looks great, or the first time a regular customer messages to say thanks.",
    rootCauses: [
      { theme: "Missed areas", fix: "Use a printed room-by-room checklist on every job and photograph it complete before leaving." },
      { theme: "Deposit not returned (end of tenancy)", fix: "Agree in writing what is and is not included (oven, inside cupboards, walls) and offer a free re-clean within 48 hours if the agent flags anything." },
      { theme: "Different cleaner every time", fix: "Keep the same cleaner for each regular customer where possible, and introduce any cover cleaner by name in advance." },
      { theme: "Something got broken", fix: "Report damage the same day, apologise, and explain how your insurance covers it." },
    ],
    shotList: [
      { shot: "Context", how: "A wide, tidy shot of the cleaned kitchen or living room, with no personal photos or post in view." },
      { shot: "Before", how: "The greasy hob, limescaled tap or dusty skirting, close and well lit." },
      { shot: "After", how: "The exact same angle once cleaned, in the same light." },
      { shot: "Detail", how: "A sparkling oven door or grout line, the small things customers notice." },
      { shot: "Team", how: "Your team in uniform with your kit, outside or in your van." },
    ],
    serviceTerms: ["regular domestic cleaning", "end of tenancy cleaning", "deep cleaning", "oven cleaning", "office cleaning", "after builders cleaning", "carpet cleaning", "Airbnb changeover cleaning"],
    credentialCheck: "Tell customers you hold public liability insurance and name the insurer and cover amount. If you take waste away, customers can check your waste carrier licence on the GOV.UK public register.",
    aiPrompt: "A fresh, modern square price list graphic for a UK cleaning company with three packages: Regular, Deep and End of tenancy, soft green and white, simple sparkle icon, no photos of people",
    expectationScript: { label: "End of tenancy scope, agreed when booking", text: "Hi [name], to confirm your end of tenancy clean on [date]: it includes [oven, inside cupboards, bathroom descale, windows inside]. It doesn't include [walls, outside windows, carpet shampoo] unless you add them. If your agent flags anything we covered, we'll come back and re-clean it free within 48 hours." },
    guardrails: [
      "Never photograph a customer's belongings, post, children's rooms or anything that shows the address without permission.",
      "Do not ask regular customers for a review every visit. Ask once, after the first few cleans go well.",
    ],
    postIdeas: ["Spring deep clean offer with your available dates", "A before and after of an oven", "End of tenancy checklist that helps tenants get their deposit back", "Meet the cleaner: a short intro to a team member"],
  },
  landscaping: {
    askMoment: "On the final walk round the finished garden, ideally on a dry day when the customer is standing on the new patio or lawn.",
    rootCauses: [
      { theme: "Job ran late", fix: "Explain at quoting that rain can delay groundwork, and text the customer whenever weather moves a day." },
      { theme: "Plants or turf died", fix: "Give every customer written aftercare (watering, mowing, feeding) on the day you finish, and check in after two weeks." },
      { theme: "Waste left on site", fix: "Agree skip or waste removal in the quote and leave the site swept on the last day." },
      { theme: "Final price higher than quote", fix: "Itemise the quote and get written approval for any extra materials or days." },
    ],
    shotList: [
      { shot: "Context", how: "A wide shot of the whole garden from the back door, avoiding neighbours' windows and house numbers." },
      { shot: "Before", how: "The overgrown lawn or cracked patio from a spot you can find again, ideally marked with a stone." },
      { shot: "After", how: "The same spot, same height, ideally in soft morning or late afternoon light." },
      { shot: "Detail", how: "Clean paving joints, a crisp lawn edge or new planting close up." },
      { shot: "Team at work", how: "Your team mid-job with your machinery, wearing proper safety kit." },
    ],
    serviceTerms: ["garden design", "patio laying", "turfing and new lawns", "fencing", "hedge cutting", "garden clearance", "decking", "artificial grass", "regular garden maintenance"],
    credentialCheck: "Customers can check your waste carrier licence on the GOV.UK public register, and APL or BALI members on those associations' 'find a member' pages. Name both on your profile if you hold them.",
    aiPrompt: "A fresh, modern square graphic for a UK landscaping company titled 'Book your spring garden tidy', earthy greens and cream, simple leaf illustration, no photos of people or gardens",
    expectationScript: { label: "Weather and aftercare, said at handover", text: "Your new [lawn / planting] needs watering [every evening for two weeks] and no mowing until [date]. I've written it down for you here. If anything looks unhappy in the next month, send me a photo and I'll come and take a look." },
    guardrails: [
      "Never use AI-generated or stock garden images as if they were your work. Customers compare them with your real jobs.",
      "Only take garden waste away if you hold a waste carrier licence, and say so on your profile.",
    ],
    postIdeas: ["Spring booking slots now open", "A dramatic garden clearance before and after", "How to look after new turf in the first two weeks", "Autumn leaf and hedge tidy offer"],
  },
  salon: {
    askMoment: "At the mirror, the second the client sees the finished look and smiles, before they pay.",
    rootCauses: [
      { theme: "Colour not what I asked for", fix: "Hold a five-minute consultation with reference photos, agree the shade and price, and note it on the client's record." },
      { theme: "Reaction to treatment", fix: "Carry out a patch test at least 48 hours before every colour or lash tint, and record the date." },
      { theme: "Running late", fix: "Book each service with a realistic duration and a buffer, and text clients if you are running over 15 minutes." },
      { theme: "Surprise price", fix: "Show 'from' prices clearly and confirm the final price before starting, especially for long or thick hair." },
    ],
    shotList: [
      { shot: "Context", how: "A wide, tidy shot of the salon floor or your chair, well lit, no clients' faces without permission." },
      { shot: "Before", how: "The client's hair from behind before the service, with their permission, against a plain wall." },
      { shot: "After", how: "The same angle after styling, in natural window light, not under a yellow bulb." },
      { shot: "Detail", how: "A close-up of the colour blend, nail art or lash line." },
      { shot: "Team", how: "You or your stylists at your stations, smiling, in uniform." },
    ],
    serviceTerms: ["balayage", "highlights", "cut and blow dry", "colour correction", "keratin treatment", "gel nails", "lash extensions", "brow lamination", "bridal hair and makeup"],
    credentialCheck: "Show stylist qualifications (NVQ or VTCT level) and, for treatments that need one, your council special treatments licence. Customers trust names and levels they can read, so list them on your profile.",
    aiPrompt: "An elegant square price menu graphic for a UK hair and beauty salon listing Cut, Colour and Treatments with 'from' prices, blush pink and charcoal, minimal line art, no photos of people",
    expectationScript: { label: "Patch test and booking terms (booking confirmation)", text: "Hi [name], you're booked for [service] on [date] at [time] with [stylist]. As it's a colour service, please pop in for a quick patch test at least 48 hours before. Prices start from £[price] and I'll confirm yours at your consultation. We need 24 hours' notice to change or cancel." },
    guardrails: [
      "Never post a client's photo without their clear permission, and never edit an after photo to change the colour or result.",
      "If you rent a chair in someone else's salon, make sure your Google profile is yours, not a duplicate of the salon's.",
    ],
    postIdeas: ["A colour transformation with the client's permission", "Last-minute slots this week", "Christmas party and bridal season booking reminder", "Aftercare tip: how to keep colour fresh between visits"],
  },
};
