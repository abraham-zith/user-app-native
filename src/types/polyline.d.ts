declare module '@mapbox/polyline' {
    /**
     * Decodes an encoded polyline string into an array of [latitude, longitude] pairs.
     */
    export function decode(encoded: string, precision?: number): [number, number][];

    /**
     * Encodes an array of [latitude, longitude] pairs into a polyline string.
     */
    export function encode(points: [number, number][], precision?: number): string;
}