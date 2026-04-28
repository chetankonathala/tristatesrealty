import { z } from "zod";

export const searchParamsSchema = z.object({
  // Price (D-05 top bar pill)
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().nonnegative().optional(),

  // Beds (D-05)
  minBeds: z.coerce.number().int().min(0).max(10).optional(),
  maxBeds: z.coerce.number().int().min(0).max(20).optional(),

  // Baths (D-05)
  minBaths: z.coerce.number().min(0).max(20).optional(),
  maxBaths: z.coerce.number().min(0).max(20).optional(),

  // Square footage (More Filters)
  minSqft: z.coerce.number().int().nonnegative().optional(),
  maxSqft: z.coerce.number().int().nonnegative().optional(),

  // Lot size acres
  minLotSize: z.coerce.number().nonnegative().optional(),
  maxLotSize: z.coerce.number().nonnegative().optional(),

  // Year built
  minYearBuilt: z.coerce.number().int().min(1800).max(2100).optional(),

  // Property type — comma-separated multi-select (D-05 home type pill)
  type: z.string().optional(),

  // Location filters (IDX-04: zip, city, county)
  cities: z.string().optional(),       // comma-separated
  counties: z.string().optional(),
  postalCodes: z.string().optional(),
  state: z.enum(["DE", "MD", "NJ", "PA"]).optional(),

  // School district
  schoolDistrict: z.string().optional(),

  // Boolean features
  waterfront: z.coerce.boolean().optional(),
  newConstruction: z.coerce.boolean().optional(),
  garage: z.coerce.boolean().optional(),

  // Status
  status: z.enum(["Active", "Pending", "ActiveUnderContract", "ComingSoon"]).optional(),

  // Sort + pagination
  sort: z.enum(["price-asc", "price-desc", "date-desc", "date-asc", "beds-desc", "sqft-desc", "dom-asc"]).default("date-desc"),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(24),

  // View mode (D-01/D-02/D-03)
  view: z.enum(["map", "list", "split"]).default("split"),

  // Map viewport bounds: "swLng,swLat,neLng,neLat" (D-02 search-as-you-move)
  bounds: z.string().regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?$/).optional(),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

export function parseSearchParams(input: Record<string, string | string[] | undefined>): SearchParams {
  // Flatten arrays (URLSearchParams) to first value
  const flat: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(input)) {
    flat[k] = Array.isArray(v) ? v[0] : v;
  }
  return searchParamsSchema.parse(flat);
}

export function parseBounds(bounds?: string): [number, number, number, number] | null {
  if (!bounds) return null;
  const parts = bounds.split(",").map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return null;
  return parts as [number, number, number, number];
}

export function parseMultiValue(value?: string): string[] {
  if (!value) return [];
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}
