/** OSM tag filters for Overpass — value null = any value for that key */
export const ALL_TYPES_ID = "all";

/** One query per key — catches every tagged business on OSM */
export const ALL_MODE_CATCHALLS = [
  { key: "craft", value: null },
  { key: "shop", value: null },
  { key: "office", value: null },
  { key: "amenity", value: null },
  { key: "service", value: null },
  { key: "healthcare", value: null },
  { key: "tourism", value: null },
  { key: "leisure", value: null },
  { key: "industrial", value: null },
  { key: "company", value: null },
  { key: "landuse", value: "commercial" },
  { key: "landuse", value: "retail" },
  { key: "building", value: "commercial" },
  { key: "building", value: "retail" },
  { key: "building", value: "office" },
];

function tag(key, value) {
  return [{ key, value }];
}

const ACRONYMS = {
  hvac: "HVAC",
  it: "IT",
  atm: "ATM",
  ev: "EV",
  diy: "DIY",
};

export function formatOsmTagLabel(value) {
  if (!value) return "";
  const lower = value.toLowerCase();
  if (ACRONYMS[lower]) return ACRONYMS[lower];
  return lower.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function labelFromId(id) {
  return formatOsmTagLabel(id);
}

function craft(id, label) {
  return { id: `craft_${id}`, label: label || labelFromId(id), filters: tag("craft", id) };
}

function shop(id, label) {
  return { id: `shop_${id}`, label: label || labelFromId(id), filters: tag("shop", id) };
}

function office(id, label) {
  return { id: `office_${id}`, label: label || labelFromId(id), filters: tag("office", id) };
}

function amenity(id, label) {
  return { id: `amenity_${id}`, label: label || labelFromId(id), filters: tag("amenity", id) };
}

function service(id, label) {
  return { id: `service_${id}`, label: label || labelFromId(id), filters: tag("service", id) };
}

/** OSM craft=* trades — plumber, electrician, etc. */
const CRAFT_TYPES = [
  "plumber",
  "electrician",
  "carpenter",
  "painter",
  "hvac",
  "roofer",
  "glazier",
  "stonemason",
  "handyman",
  "gardener",
  "locksmith",
  "tiler",
  "plasterer",
  "scaffolder",
  "welder",
  "watchmaker",
  "photographer",
  "tailor",
  "shoemaker",
  "dressmaker",
  "cabinet_maker",
  "joiner",
  "floorer",
  "parquet_layer",
  "insulation",
  "sanitary_engineer",
  "heating_engineer",
  "window_construction",
  "metal_construction",
  "signmaker",
  "potter",
  "blacksmith",
  "beekeeper",
  "bookbinder",
  "clockmaker",
  "confectionery",
  "key_cutter",
  "saddler",
  "upholsterer",
  "vehicle_repair",
  "electronics_repair",
  "computer_repair",
  "jeweller",
  "optician",
  "bakery",
  "brewery",
  "caterer",
  "cleaning",
  "chimney_sweeper",
  "sun_protection",
  "sculptor",
  "rigger",
  "sailmaker",
  "boatbuilder",
  "grinding_mill",
  "agricultural_engines",
  "builder",
].map((id) => craft(id));

/** Common OSM service=* tags — plain labels (no "Service:" prefix) */
const SERVICE_TYPES = [
  service("cleaning", "Cleaning"),
  service("courier", "Courier"),
  service("dry_cleaning", "Dry cleaning"),
  service("funeral_directors", "Funeral directors"),
  service("insurance", "Insurance"),
  service("lawyer", "Lawyer"),
  service("moving", "Moving company"),
  service("pest_control", "Pest control"),
  service("real_estate", "Real estate"),
  service("tax_advisor", "Tax advisor"),
  service("translator", "Translator"),
  service("vehicle_repair", "Vehicle repair"),
  service("car_repair", "Car repair"),
  service("car_rental", "Car rental"),
  service("car_sharing", "Car sharing"),
  service("bicycle_repair", "Bicycle repair"),
  service("bicycle_rental", "Bicycle rental"),
  service("tailor", "Tailor"),
  service("photographer", "Photographer"),
  service("printing", "Printing"),
  service("internet_access", "Internet provider"),
  service("financial", "Financial services"),
  service("travel_agency", "Travel agency"),
  service("nursery", "Nursery"),
  service("childcare", "Childcare"),
  service("social_facility", "Social facility"),
  service("community_centre", "Community centre"),
  service("events_venue", "Events venue"),
  service("wedding_venue", "Wedding venue"),
  service("studio", "Studio"),
  service("repair", "Repair"),
  service("electrical", "Electrical"),
  service("plumbing", "Plumbing"),
  service("hvac", "HVAC"),
  service("roofing", "Roofing"),
  service("painting", "Painting"),
  service("carpentry", "Carpentry"),
  service("landscaping", "Landscaping"),
  service("security", "Security"),
  service("it", "IT services"),
  service("marketing", "Marketing"),
  service("consulting", "Consulting"),
  service("accounting", "Accounting"),
  service("architecture", "Architecture"),
  service("engineering", "Engineering"),
  service("construction", "Construction"),
  service("removal", "Removal / hauling"),
  service("storage", "Storage"),
  service("shipping", "Shipping"),
  service("logistics", "Logistics"),
];

const TRADE_GROUPS = [
  {
    id: "plumber",
    label: "Plumber / plumbing",
    filterSets: [
      tag("craft", "plumber"),
      tag("craft", "sanitary_engineer"),
      tag("craft", "heating_engineer"),
      tag("craft", "hvac"),
      tag("service", "plumbing"),
      tag("shop", "plumbing"),
    ],
  },
  {
    id: "electrician",
    label: "Electrician",
    filterSets: [
      tag("craft", "electrician"),
      tag("service", "electrical"),
      tag("shop", "electrical"),
    ],
  },
  {
    id: "carpenter_trade",
    label: "Carpenter / joiner",
    filterSets: [
      tag("craft", "carpenter"),
      tag("craft", "joiner"),
      tag("craft", "cabinet_maker"),
      tag("service", "carpentry"),
    ],
  },
  {
    id: "painter_trade",
    label: "Painter / decorator",
    filterSets: [
      tag("craft", "painter"),
      tag("service", "painting"),
    ],
  },
  {
    id: "roofer_trade",
    label: "Roofer",
    filterSets: [tag("craft", "roofer"), tag("service", "roofing")],
  },
  {
    id: "mechanic",
    label: "Mechanic / auto repair",
    filterSets: [
      tag("shop", "car_repair"),
      tag("craft", "vehicle_repair"),
      tag("service", "vehicle_repair"),
      tag("service", "car_repair"),
      tag("amenity", "car_repair"),
    ],
  },
  {
    id: "cleaning_service",
    label: "Cleaning service",
    filterSets: [
      tag("craft", "cleaning"),
      tag("service", "cleaning"),
      tag("shop", "dry_cleaning"),
      tag("service", "dry_cleaning"),
    ],
  },
  {
    id: "contractor",
    label: "Contractor / builder",
    filterSets: [
      tag("craft", "builder"),
      tag("service", "construction"),
      tag("office", "construction_company"),
    ],
  },
  {
    id: "all_crafts",
    label: "All trades & crafts",
    filterSets: [tag("craft", null)],
  },
  {
    id: "all_services",
    label: "All services",
    filterSets: [tag("service", null)],
  },
  {
    id: "all_shops",
    label: "All shops",
    filterSets: [tag("shop", null)],
  },
  {
    id: "all_offices",
    label: "All offices",
    filterSets: [tag("office", null)],
  },
];

const CORE_TYPES = [
  { id: "restaurant", label: "Restaurant", filters: tag("amenity", "restaurant") },
  { id: "cafe", label: "Cafe", filters: tag("amenity", "cafe") },
  { id: "fast_food", label: "Fast food", filters: tag("amenity", "fast_food") },
  { id: "bar", label: "Bar", filters: tag("amenity", "bar") },
  { id: "pub", label: "Pub", filters: tag("amenity", "pub") },
  { id: "ice_cream", label: "Ice cream", filters: tag("amenity", "ice_cream") },
  { id: "food_court", label: "Food court", filters: tag("amenity", "food_court") },
  { id: "lawyer", label: "Lawyer", filters: tag("office", "lawyer") },
  { id: "accountant", label: "Accountant", filters: tag("office", "accountant") },
  { id: "architect", label: "Architect", filters: tag("office", "architect") },
  { id: "insurance", label: "Insurance", filters: tag("office", "insurance") },
  { id: "estate_agent", label: "Estate agent", filters: tag("office", "estate_agent") },
  { id: "company", label: "Company office", filters: tag("office", "company") },
  { id: "it_company", label: "IT company", filters: tag("office", "it") },
  { id: "employment_agency", label: "Employment agency", filters: tag("office", "employment_agency") },
  { id: "travel_agency", label: "Travel agency", filters: tag("office", "travel_agent") },
  { id: "advertising_agency", label: "Advertising agency", filters: tag("office", "advertising_agency") },
  { id: "financial", label: "Financial office", filters: tag("office", "financial") },
  { id: "consulting", label: "Consulting", filters: tag("office", "consulting") },
  { id: "engineering", label: "Engineering office", filters: tag("office", "engineer") },
  { id: "surveyor", label: "Surveyor", filters: tag("office", "surveyor") },
  { id: "notary", label: "Notary", filters: tag("office", "notary") },
  { id: "doctor", label: "Doctor", filters: tag("amenity", "doctors") },
  { id: "clinic", label: "Clinic", filters: tag("amenity", "clinic") },
  { id: "hospital", label: "Hospital", filters: tag("amenity", "hospital") },
  { id: "dentist", label: "Dentist", filters: tag("amenity", "dentist") },
  { id: "pharmacy", label: "Pharmacy", filters: tag("amenity", "pharmacy") },
  { id: "veterinary", label: "Veterinary", filters: tag("amenity", "veterinary") },
  { id: "physiotherapist", label: "Physiotherapist", filters: tag("healthcare", "physiotherapist") },
  { id: "psychotherapist", label: "Psychotherapist", filters: tag("healthcare", "psychotherapist") },
  { id: "laboratory", label: "Medical laboratory", filters: tag("healthcare", "laboratory") },
  { id: "optometrist", label: "Optometrist", filters: tag("healthcare", "optometrist") },
  { id: "hotel", label: "Hotel", filters: tag("tourism", "hotel") },
  { id: "hostel", label: "Hostel", filters: tag("tourism", "hostel") },
  { id: "guest_house", label: "Guest house", filters: tag("tourism", "guest_house") },
  { id: "motel", label: "Motel", filters: tag("tourism", "motel") },
  { id: "beauty", label: "Beauty salon", filters: tag("shop", "beauty") },
  { id: "hairdresser", label: "Hairdresser", filters: tag("shop", "hairdresser") },
  { id: "spa", label: "Spa", filters: tag("leisure", "spa") },
  { id: "gym", label: "Gym / fitness", filters: tag("leisure", "fitness_centre") },
  { id: "sports_centre", label: "Sports centre", filters: tag("leisure", "sports_centre") },
  shop("supermarket", "Supermarket"),
  shop("convenience", "Convenience store"),
  shop("clothes", "Clothing shop"),
  shop("shoes", "Shoe shop"),
  shop("electronics", "Electronics shop"),
  shop("mobile_phone", "Mobile phone shop"),
  shop("computer", "Computer shop"),
  shop("furniture", "Furniture shop"),
  shop("hardware", "Hardware store"),
  shop("doityourself", "DIY store"),
  shop("trade", "Trade supplies"),
  shop("plumbing", "Plumbing supplies"),
  shop("electrical", "Electrical supplies"),
  shop("paint", "Paint shop"),
  shop("garden_centre", "Garden centre"),
  shop("pet", "Pet shop"),
  shop("florist", "Florist"),
  shop("jewelry", "Jewelry shop"),
  shop("books", "Bookshop"),
  shop("stationery", "Stationery"),
  shop("optician", "Optician"),
  shop("laundry", "Laundry"),
  shop("tailor", "Tailor shop"),
  shop("bakery", "Bakery"),
  shop("butcher", "Butcher"),
  shop("greengrocer", "Greengrocer"),
  shop("alcohol", "Alcohol shop"),
  shop("beverages", "Beverages shop"),
  shop("kiosk", "Kiosk"),
  shop("mall", "Shopping mall"),
  shop("department_store", "Department store"),
  shop("tyres", "Tyre shop"),
  shop("car_parts", "Car parts"),
  shop("car", "Car dealer"),
  shop("motorcycle", "Motorcycle dealer"),
  shop("bicycle", "Bicycle shop"),
  shop("toys", "Toy shop"),
  shop("gift", "Gift shop"),
  shop("interior_decoration", "Interior decoration"),
  shop("houseware", "Houseware"),
  shop("appliance", "Appliance shop"),
  shop("security", "Security shop"),
  shop("printing", "Print shop"),
  shop("copyshop", "Copy shop"),
  shop("travel_agency", "Travel agency shop"),
  shop("outpost", "Pickup point"),
  amenity("bank", "Bank"),
  amenity("atm", "ATM"),
  amenity("bureau_de_change", "Currency exchange"),
  amenity("school", "School"),
  amenity("college", "College"),
  amenity("university", "University"),
  amenity("kindergarten", "Kindergarten"),
  amenity("driving_school", "Driving school"),
  amenity("language_school", "Language school"),
  amenity("music_school", "Music school"),
  amenity("car_wash", "Car wash"),
  amenity("fuel", "Fuel station"),
  amenity("charging_station", "EV charging"),
  amenity("marketplace", "Marketplace"),
  amenity("arts_centre", "Arts centre"),
  amenity("studio", "Studio"),
  amenity("nightclub", "Nightclub"),
  amenity("cinema", "Cinema"),
  amenity("theatre", "Theatre"),
  amenity("library", "Library"),
  amenity("community_centre", "Community centre"),
  amenity("social_facility", "Social facility"),
  amenity("nursing_home", "Nursing home"),
  amenity("childcare", "Childcare"),
  amenity("events_venue", "Events venue"),
  amenity("place_of_worship", "Place of worship"),
  amenity("funeral_hall", "Funeral hall"),
  amenity("post_office", "Post office"),
  amenity("parcel_locker", "Parcel locker"),
  amenity("recycling", "Recycling"),
  amenity("waste_disposal", "Waste disposal"),
  amenity("parking", "Parking business"),
  amenity("taxi", "Taxi"),
  amenity("bus_station", "Bus station"),
];

export const BUSINESS_TYPES = [
  ...TRADE_GROUPS,
  ...CRAFT_TYPES,
  ...SERVICE_TYPES,
  ...CORE_TYPES,
];

export function getBusinessTypeById(id) {
  if (id === ALL_TYPES_ID) {
    return { id: ALL_TYPES_ID, label: "All business types (full city scan)", filters: null };
  }
  return BUSINESS_TYPES.find((t) => t.id === id) || null;
}

export function getFilterSetsForSearch(businessTypeId) {
  if (businessTypeId === ALL_TYPES_ID) {
    return ALL_MODE_CATCHALLS.map((f) => [f]);
  }

  const type = getBusinessTypeById(businessTypeId);
  if (!type) return [];

  if (type.filterSets?.length) {
    return type.filterSets;
  }

  if (type.filters?.length) {
    return [type.filters];
  }

  return [];
}

export function getBusinessTypeLabel(businessTypeId) {
  return getBusinessTypeById(businessTypeId)?.label || businessTypeId;
}
