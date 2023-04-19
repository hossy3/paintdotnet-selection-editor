import { convertToRectangleSelection, isValidSelection } from "./logics";

describe("isValidSelection", () => {
  it("returns true when selection is valid", () => {
    expect(
      isValidSelection(
        '{"polygonList": ["2,0,0,0,0,1,2,1,2,0", "5,4,4,4,4,6,5,6,5,4"]}'
      )
    ).toBeTruthy();
  });

  it("returns false when selection text is invalid json", () => {
    expect(
      isValidSelection('{"polygonList": ["2,0,0,0,0,1,2,1,2,0",')
    ).toBeFalsy();
  });

  it("returns false when polygon size is odd", () => {
    expect(
      isValidSelection(
        '{"polygonList": ["2,0,0,0,0,1,2,1,2,0", "5,4,4,4,4,6,5,6,5"]}'
      )
    ).toBeFalsy();
  });

  it("returns false when polygonList is empty", () => {
    expect(isValidSelection('{"polygonList": []}')).toBeFalsy();
  });
});

describe("convertToRectangleSelection", () => {
  it("returns undefined when selection is not valid", () => {
    expect(convertToRectangleSelection("invalid selection")).toBeUndefined();
  });

  it("converts from 2 rectangles to 1 rectangle", () => {
    const actual = convertToRectangleSelection(
      '{"polygonList": ["2,0,0,0,0,1,2,1,2,0", "5,4,4,4,4,6,5,6,5,4"]}'
    );
    expect(actual).not.toBeUndefined();
    const actualObj = JSON.parse(actual!);
    const expected = { polygonList: ["5,0,0,0,0,6,5,6"] };
    expect(actualObj).toEqual(expected);
  });

  it("converts from 1 triangle to 1 rectangle", () => {
    const actual = convertToRectangleSelection(
      '{"polygonList": ["10,0,5,20,15,15"]}'
    );
    expect(actual).not.toBeUndefined();
    const actualObj = JSON.parse(actual!);
    const expected = { polygonList: ["15,0,5,0,5,20,15,20"] };
    expect(actualObj).toEqual(expected);
  });
});
