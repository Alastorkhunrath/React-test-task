import { describe, it, expect } from "vitest";

import {calcAQIFromPM25} from "./aqi"

describe("calcAQIFromPM25", () => {
    it("возвращает ~50 при PM2.5 = 12", () => {
      expect(calcAQIFromPM25(12)).toBeCloseTo(50, 0);
    });
  
    it("возвращает ~100 при PM2.5 = 35.4", () => {
      expect(calcAQIFromPM25(35.4)).toBeCloseTo(100, 0);
    });
  
    it("возвращает ~250 при PM2.5 = 200", () => {
      expect(calcAQIFromPM25(200)).toBeCloseTo(250, 0);
    });
  
    it("возвращает ~500 при PM2.5 = 500", () => {
      expect(calcAQIFromPM25(500)).toBeCloseTo(500, 0);
    });
  });