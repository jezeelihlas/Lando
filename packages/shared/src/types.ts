import {
  LandCondition,
  LandExtentUnit,
  NearbyPlaceType,
  PropertyStatus,
  PropertyType,
  RoadAccess,
  RoadWidthUnit,
} from "./enums";

export interface PropertyImageDto {
  id: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface PropertyNearbyPlaceDto {
  type: NearbyPlaceType;
  name: string;
  distanceMeters: number;
}

// Public-facing shape only. Never include deed fields here (see §19, Rule 7).
export interface PropertySummaryDto {
  id: string;
  type: PropertyType;
  price: number;
  landCondition: LandCondition;
  landExtent: number;
  landExtentUnit: LandExtentUnit;
  roadWidth: number;
  roadWidthUnit: RoadWidthUnit;
  roadAccess: RoadAccess;
  primaryImageUrl: string | null;
  imageCount: number;
  latitude: number;
  longitude: number;
  region: string;
  createdAt: string;
}

export interface PropertyDetailDto extends PropertySummaryDto {
  description: string;
  images: PropertyImageDto[];
  nearbyPlaces: PropertyNearbyPlaceDto[];
  status: PropertyStatus;
  sellerPhoneNumber: string;
}

export interface PropertySearchFilters {
  type?: PropertyType;
  priceMin?: number;
  priceMax?: number;
  landCondition?: LandCondition;
  roadWidthMin?: number;
  nearby?: NearbyPlaceType[];
  town?: string;
  page?: number;
}

export interface PropertyListResponse {
  items: PropertySummaryDto[];
  page: number;
  pageSize: number;
  total: number;
}

export interface SellerPropertyImageDto {
  id: string;
  propertyId: string;
  storageKey: string;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
}

// The seller-facing shape (create/update/my-properties responses) returns
// the raw draft row — unlike PropertySummaryDto/PropertyDetailDto, wizard
// fields are nullable here because a draft may not have filled them in yet
// (see backend schema.prisma comment on Property). Decimal fields come
// back as strings (Prisma's default Decimal JSON serialization).
export interface SellerPropertyDto {
  id: string;
  sellerId: string;
  type: PropertyType;
  roadWidth: string | null;
  roadWidthUnit: RoadWidthUnit;
  roadAccess: RoadAccess | null;
  landCondition: LandCondition | null;
  landExtent: string | null;
  landExtentUnit: LandExtentUnit;
  price: string | null;
  description: string | null;
  latitude: string | null;
  longitude: string | null;
  region: string;
  status: PropertyStatus;
  contactPhoneNumber: string | null;
  phoneVisibilityConfirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
  images?: SellerPropertyImageDto[];
}

export interface PropertyUpdateInput {
  type?: PropertyType;
  roadWidth?: number;
  roadWidthUnit?: RoadWidthUnit;
  roadAccess?: RoadAccess;
  landCondition?: LandCondition;
  landExtent?: number;
  landExtentUnit?: LandExtentUnit;
  price?: number;
  description?: string;
  latitude?: number;
  longitude?: number;
  contactPhoneNumber?: string;
}

export interface NearbyPlaceCandidateDto {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
}
