import {
  Box,
  fillVoid,
  getBoundingBox,
  hasVoid,
  isBoxValid,
  isPolygonListValid,
  isRectangle,
  makeRectangle,
  PolygonList,
  toPolygonList,
  toPolygonListFromBox,
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

describe("toPolygonListFromBox", () => {
  it("returns polygonList when box is valid", () => {
    const box: Box = [1, 2, 4, 8];
    const expected = [[4, 2, 1, 2, 1, 8, 4, 8]];
    expect(toPolygonListFromBox(box)).toEqual(expected);
  });

  it("returns empty list when box is invalid", () => {
    const box: Box = undefined;
    expect(toPolygonListFromBox(box)).toEqual([]);
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

describe("makeRectangle", () => {
  it("returns bounding box from a triangle", () => {
    const polygonList = [[5, 0, 1, 6, 8, 10, 5, 0]];
    const expected = [[8, 0, 1, 0, 1, 10, 8, 10]];
    expect(makeRectangle(polygonList)).toEqual(expected);
  });

  it("returns bounding box from 2 rectangles", () => {
    const polygonList = [
      [2, 0, 0, 0, 0, 1, 2, 1, 2, 0],
      [5, 4, 4, 4, 4, 6, 5, 6, 5, 4],
    ];
    const expected = [[5, 0, 0, 0, 0, 6, 5, 6]];
    expect(makeRectangle(polygonList)).toEqual(expected);
  });

  it("returns bounding box with offset from 2 rectangles", () => {
    const polygonList = [
      [2, 0, 0, 0, 0, 1, 2, 1, 2, 0],
      [5, 4, 4, 4, 4, 6, 5, 6, 5, 4],
    ];
    const expected = [[6, -1, -1, -1, -1, 7, 6, 7]];
    expect(makeRectangle(polygonList, 1)).toEqual(expected);
  });
});

describe("hasVoid", () => {
  it("returns true when selection has an outer loop and an inner loop", () => {
    const polygonList = [
      [11, 8, 4, 8, 4, 2, 11, 2],
      [13, 1, 2, 1, 2, 9, 13, 9],
    ];
    expect(hasVoid(polygonList)).toBeTruthy();
  });

  it("returns false when selection has 2 outer loops", () => {
    const polygonList = [
      [2, 0, 0, 0, 0, 1, 2, 1, 2, 0],
      [5, 4, 4, 4, 4, 6, 5, 6, 5, 4],
    ];
    expect(hasVoid(polygonList)).toBeFalsy();
  });

  it("returns false when selection has 1 outer loop", () => {
    const polygonList = [[2, 0, 0, 0, 0, 1, 2, 1, 2, 0]];
    expect(hasVoid(polygonList)).toBeFalsy();
  });

  it("returns false when selection is empty", () => {
    const polygonList: PolygonList = [];
    expect(hasVoid(polygonList)).toBeFalsy();
  });
});

describe("fillVoid", () => {
  it("keeps an outer loop and removes an inner loop", () => {
    const polygonList = [
      [11, 8, 4, 8, 4, 2, 11, 2],
      [13, 1, 2, 1, 2, 9, 13, 9],
    ];
    const expected = [[13, 1, 2, 1, 2, 9, 13, 9]];
    expect(fillVoid(polygonList)).toEqual(expected);
  });

  it("returns itself when selection has 2 outer loops", () => {
    const polygonList = [
      [2, 0, 0, 0, 0, 1, 2, 1, 2, 0],
      [5, 4, 4, 4, 4, 6, 5, 6, 5, 4],
    ];
    expect(fillVoid(polygonList)).toEqual(polygonList);
  });

  it("returns itself when selection has 1 outer loop", () => {
    const polygonList = [[2, 0, 0, 0, 0, 1, 2, 1, 2, 0]];
    expect(fillVoid(polygonList)).toEqual(polygonList);
  });

  it("returns itself when selection is empty", () => {
    const polygonList: PolygonList = [];
    expect(fillVoid(polygonList)).toEqual(polygonList);
  });
});
