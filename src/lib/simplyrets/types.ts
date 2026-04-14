export interface SimplyRetsAddress {
  full: string;
  street?: string;
  city: string;
  state: string;
  postalCode?: string;
  country?: string;
  county?: string;
}

export interface SimplyRetsProperty {
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  lotSize?: number;
  yearBuilt?: number;
  type?: string;
  subtype?: string;
  stories?: number;
  pool?: string;
  garageSpaces?: number;
}

export interface SimplyRetsGeo {
  lat?: number;
  lng?: number;
  marketArea?: string;
}

export interface SimplyRetsOpenHouse {
  openHouseStartTime?: string;
  openHouseEndTime?: string;
  openHouseRemarks?: string;
}

export interface SimplyRetsListing {
  mlsId: number;
  listingId?: string;
  listPrice: number;
  listDate?: string;
  modified?: string;
  remarks?: string;
  photos?: string[];
  virtualTourUrl?: string;
  address: SimplyRetsAddress;
  property: SimplyRetsProperty;
  geo?: SimplyRetsGeo;
  mls?: { status?: string; daysOnMarket?: number; area?: string };
  listingAgent?: { firstName?: string; lastName?: string; contact?: { email?: string; office?: string } };
  office?: { name?: string; contact?: { office?: string } };
  school?: { district?: string; elementarySchool?: string; middleSchool?: string; highSchool?: string };
  tax?: { taxAnnualAmount?: number; taxYear?: number };
  association?: { fee?: number; frequency?: string };
  openHouses?: SimplyRetsOpenHouse[];
  features?: string[];
  waterfront?: boolean;
  newConstruction?: boolean;
}

export interface SimplyRetsSearchParams {
  status?: ("Active" | "Pending" | "ActiveUnderContract" | "ComingSoon" | "Closed")[];
  type?: string[];
  minprice?: number;
  maxprice?: number;
  minbeds?: number;
  maxbeds?: number;
  minbaths?: number;
  maxbaths?: number;
  minarea?: number;
  maxarea?: number;
  cities?: string[];
  counties?: string[];
  postalCodes?: string[];
  water?: string;
  features?: string[];
  neighborhoods?: string[];
  points?: string[];
  sort?: string;
  limit?: number;
  lastId?: number;
  vendor?: string;
  q?: string;
  include?: ("association" | "rooms" | "pool" | "parking" | "openHouses")[];
}
