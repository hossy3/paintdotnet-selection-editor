import {
  getBoundingBox,
  hasVoid,
  isBoxValid,
  isPolygonListValid,
  isRectangle,
  PolygonList,
  toPolygonList,
  toSelection,
} from "./logics";

describe("toPolygonList", () => {
  it("returns polygonList when selection is valid", () => {
    const polygonList = [
      [2, 0, 0, 0, 0, 1, 2, 1, 2, 0],
      [5, 4, 4, 4, 4, 6, 5, 6, 5, 4],
    ];
    expect(
      toPolygonList(
        '{"polygonList": ["2,0,0,0,0,1,2,1,2,0", "5,4,4,4,4,6,5,6,5,4"]}'
      )
    ).toStrictEqual(polygonList);
  });

  it("returns empty list when selection text is invalid json", () => {
    expect(
      toPolygonList('{"polygonList": ["2,0,0,0,0,1,2,1,2,0",')
    ).toStrictEqual([]);
  });

  it("returns empty list when polygon size is odd", () => {
    expect(
      toPolygonList(
        '{"polygonList": ["2,0,0,0,0,1,2,1,2,0", "5,4,4,4,4,6,5,6,5"]}'
      )
    ).toStrictEqual([]);
  });

  it("returns empty list when polygonList is empty", () => {
    expect(toPolygonList('{"polygonList": []}')).toHaveLength(0);
  });
});

describe("toSelection", () => {
  it("returns selection string when selection is valid", () => {
    const polygonList = [
      [2, 0, 0, 0, 0, 1, 2, 1, 2, 0],
      [5, 4, 4, 4, 4, 6, 5, 6, 5, 4],
    ];
    const actual = toSelection(polygonList);
    const actualObj = JSON.parse(actual);
    const actualPolygonList = [
      actualObj.polygonList[0].split(",").map((x: string) => parseInt(x)),
      actualObj.polygonList[1].split(",").map((x: string) => parseInt(x)),
    ];
    expect(actualPolygonList).toEqual(polygonList);
  });

  it("returns empty string when selection is not valid", () => {
    const polygonList: PolygonList = [];
    expect(toSelection(polygonList)).toBe("");
  });
});

describe("getBoundingBox", () => {
  it("returns bounding box when polygonList has 2 outer loops", () => {
    const polygonList = [
      [2, 0, 0, 0, 0, 1, 2, 1, 2, 0],
      [5, 4, 4, 4, 4, 6, 5, 6, 5, 4],
    ];
    const expected = [0, 0, 5, 6];
    expect(getBoundingBox(polygonList)).toEqual(expected);
  });

  it("returns bounding box when polygonList has an outer loop and an inner loop", () => {
    const polygonList = [
      [11, 8, 4, 8, 4, 2, 11, 2],
      [13, 1, 2, 1, 2, 9, 13, 9],
    ];
    const expected = [2, 1, 13, 9];
    expect(getBoundingBox(polygonList)).toEqual(expected);
  });

  it("returns undefined when polygonList is invalid", () => {
    const polygonList = [[]];
    expect(getBoundingBox(polygonList)).toBeUndefined();
  });
});

describe("isPolygonListValid", () => {
  it("returns true when polygonList has 2 loops", () => {
    const polygonList = [
      [2, 0, 0, 0, 0, 1, 2, 1, 2, 0],
      [5, 4, 4, 4, 4, 6, 5, 6, 5, 4],
    ];
    expect(isPolygonListValid(polygonList)).toBeTruthy();
  });

  it("returns true when polygonList has 1 loop", () => {
    const polygonList = [[2, 0, 0, 0, 0, 1, 2, 1, 2, 0]];
    expect(isPolygonListValid(polygonList)).toBeTruthy();
  });

  it("returns false when polygonList is empty", () => {
    const polygonList: PolygonList = [];
    expect(isPolygonListValid(polygonList)).toBeFalsy();
  });
});

describe("hasVoid", () => {
  it("returns true when selection has 2 loops", () => {
    const polygonList = [
      [2, 0, 0, 0, 0, 1, 2, 1, 2, 0], // TODO: check whether it is an outer loop or inner loop.
      [5, 4, 4, 4, 4, 6, 5, 6, 5, 4],
    ];
    expect(hasVoid(polygonList)).toBeTruthy();
  });

  it("returns false when selection has 1 loop", () => {
    const polygonList = [[2, 0, 0, 0, 0, 1, 2, 1, 2, 0]];
    expect(hasVoid(polygonList)).toBeFalsy();
  });

  it("returns false when selection is empty", () => {
    const polygonList: PolygonList = [];
    expect(hasVoid(polygonList)).toBeFalsy();
  });
});

describe("isBoxValid", () => {
  it("returns true when box is defined", () => {
    expect(isBoxValid([1, 2, 3, 4])).toBeTruthy();
  });

  it("returns false when box is undefined", () => {
    expect(isBoxValid(undefined)).toBeFalsy();
  });
});

describe("isRectangle", () => {
  it("returns true when polygonList has a rectanglar loop", () => {
    const polygonList = [[2, 0, 0, 0, 0, 1, 2, 1, 2, 0]];
    expect(isRectangle(polygonList)).toBeTruthy();
  });

  it("returns false when polygonList has 2 rectanglar loops", () => {
    const polygonList = [
      [2, 0, 0, 0, 0, 1, 2, 1, 2, 0],
      [5, 4, 4, 4, 4, 6, 5, 6, 5, 4],
    ];
    expect(isRectangle(polygonList)).toBeFalsy();
  });

  it("returns false when polygonList has a non-rectangular loop", () => {
    const polygonList = [
      [2, 0, 0, 0, 0, 1, 4, 1, 2, 0], // lower side is longer than upper side
    ];
    expect(isRectangle(polygonList)).toBeFalsy();
  });
});
