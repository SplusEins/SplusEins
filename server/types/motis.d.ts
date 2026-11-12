// The motis client has no types, these cover the parts which are used.
declare module '@motis-project/motis-fptf-client' {
  export interface Leg {
    departure: string;
    line: { name: string };
  }
  export interface Journey {
    legs: Leg[];
  }
  export function createClient(
    profile: unknown,
    userAgent: string,
    options?: object,
  ): {
    journeys(
      from: string,
      to: string,
      options?: object,
    ): Promise<{ journeys: Journey[] }>;
  };
}

declare module '@motis-project/motis-fptf-client/p/transitous' {
  export const profile: unknown;
}
