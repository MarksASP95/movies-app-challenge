import { describe, expect, it } from "vitest";
import { ObjectUtils } from "../object.util";

describe("ObjectUtils", () => {
  describe("buildRecord", () => {
    it("should create record from specified key", () => {
      const data = [
        { id: 1, name: "some movie 1" },
        { id: 2, name: "some movie 2" },
        { id: 3, name: "some movie 3" },
      ];

      const byId = ObjectUtils.buildRecord(data, "id");

      expect(byId).toEqual({
        1: { id: 1, name: "some movie 1" },
        2: { id: 2, name: "some movie 2" },
        3: { id: 3, name: "some movie 3" },
      });

      const byName = ObjectUtils.buildRecord(data, "name");

      expect(byName).toEqual({
        "some movie 1": { id: 1, name: "some movie 1" },
        "some movie 2": { id: 2, name: "some movie 2" },
        "some movie 3": { id: 3, name: "some movie 3" },
      });
    });

    it("should handle empty array", () => {
      const result = ObjectUtils.buildRecord([], "id");
      expect(result).toEqual({});
    });
  });
});
