const POLYGON_LIST = "polygonList";

export type PolygonList = number[][] | undefined; // [[x0, y0, x1, y1, ...], ...]
export type Box = [number, number, number, number] | undefined; // [x_min, y_min, x_max, y_max]

export const toPolygonList = (selectionText: string): PolygonList => {
  try {
    const json = JSON.parse(selectionText);
    const len = (json[POLYGON_LIST] as number[] | undefined)?.length;
    if (len == null || len === 0) {
      return undefined;
    }

    const polygonList = [];
    for (const line of json[POLYGON_LIST]) {
      const polygon = [];
      const array = line.split(",");
      if (array.length === 0 || array.length % 2 === 1) {
        return undefined;
      }
      for (let i = 0; i < array.length; ++i) {
        const x = parseInt(array[i]);
        if (Number.isNaN(x)) {
          return undefined;
        }
        polygon.push(x);
      }
      polygonList.push(polygon);
    }

    return polygonList;
  } catch {
    return undefined;
  }
};

export const toPolygonListFromBox = (box: Box): PolygonList => {
  if (!isBoxValid(box)) {
    return undefined;
  }
  const [x_min, y_min, x_max, y_max] = box;
  return [[x_max, y_min, x_min, y_min, x_min, y_max, x_max, y_max]];
};

export const toSelection = (polygonList: PolygonList): string => {
  if (!isPolygonListValid(polygonList)) {
    return "";
  }
  const list = [];
  for (const polygon of polygonList) {
    list.push(polygon.join(","));
  }
  const obj = {
    [POLYGON_LIST]: list,
  };
  return JSON.stringify(obj, undefined, 2);
};

export const getBoundingBox = (polygonList: PolygonList): Box => {
  if (!isPolygonListValid(polygonList)) {
    return undefined;
  }
  if (polygonList.length < 1 || polygonList[0].length < 2) {
    return undefined;
  }

  let x_min = polygonList[0][0];
  let y_min = polygonList[0][1];
  let x_max = x_min;
  let y_max = y_min;

  for (const polygon of polygonList) {
    for (let i = 0; i < polygon.length; i += 2) {
      const x = polygon[i];
      if (x_min == null || x_min > x) {
        x_min = x;
      }
      if (x_max == null || x_max < x) {
        x_max = x;
      }

      const y = polygon[i + 1];
      if (y_min == null || y_min > y) {
        y_min = y;
      }
      if (y_max == null || y_max < y) {
        y_max = y;
      }
    }
  }

  return [x_min, y_min, x_max, y_max];
};

export const isPolygonListValid = (
  polygonList: PolygonList
): polygonList is NonNullable<PolygonList> =>
  polygonList != null && polygonList.length > 0;

export const isBoxValid = (box: Box): box is NonNullable<Box> =>
  box != null && box.length === 4;

export const isRectangle = (polygonList: PolygonList): boolean => {
  if (!isPolygonListValid(polygonList) || polygonList.length > 1) {
    return false;
  }
  const box = getBoundingBox(polygonList);
  if (!isBoxValid(box)) {
    return false;
  }

  const [x_min, y_min, x_max, y_max] = box;
  const polygon = polygonList[0];
  for (let i = 0; i < polygon.length; i += 2) {
    const x = polygon[i];
    if (x !== x_min && x !== x_max) {
      return false;
    }

    const y = polygon[i + 1];
    if (y !== y_min && y !== y_max) {
      return false;
    }

    const x0 = polygon[(i + 2) % polygon.length];
    const y0 = polygon[(i + 3) % polygon.length];
    if (x !== x0 && y !== y0) {
      return false; // all lines must be vertical or horizontal
    }
  }

  return true; // TODO: edge cases
};

export const polygonListEqual = (
  polygonList0: PolygonList,
  polygonList1: PolygonList
): boolean => {
  if (polygonList0 == null && polygonList1 == null) {
    return true;
  } else if (polygonList0 == null || polygonList1 == null) {
    return false;
  }
  if (polygonList0.length !== polygonList1.length) {
    return false;
  }
  for (let i = 0; i < polygonList0.length; ++i) {
    const polygon0 = polygonList0[i];
    const polygon1 = polygonList1[i];
    if (polygon0.length !== polygon1.length) {
      return false;
    }
    for (let j = 0; j < polygon0.length; ++j) {
      if (polygon0[j] !== polygon1[j]) {
        return false;
      }
    }
  }
  return true;
};

export const makeRectangle = (
  polygonList: PolygonList,
  offset: number | undefined = undefined
): PolygonList => {
  const box = getBoundingBox(polygonList);
  if (!isBoxValid(box)) {
    return [];
  }
  let [x_min, y_min, x_max, y_max] = box;
  if (offset != null) {
    x_min -= offset;
    y_min -= offset;
    x_max += offset;
    y_max += offset;
  }
  return [[x_max, y_min, x_min, y_min, x_min, y_max, x_max, y_max]];
};

const findInnerLoop = (polygonList: PolygonList, all = false): Set<number> => {
  const innerLoops = new Set<number>();
  type BoxWithIndex = [NonNullable<Box>, number];

  if (!isPolygonListValid(polygonList)) {
    return innerLoops;
  }
  if (polygonList.length === 1) {
    return innerLoops;
  }
  const boxes: BoxWithIndex[] = [];
  for (let i = 0; i < polygonList.length; ++i) {
    const box = getBoundingBox([polygonList[i]]);
    if (isBoxValid(box)) {
      boxes.push([box, i]);
    }
  }
  const getArea = (box: NonNullable<Box>) =>
    (box[2] - box[0]) * (box[3] - box[1]);
  boxes.sort((a, b) => -(getArea(a[0]) - getArea(b[0]))); // large (probably outer) to small

  const outerBoxes: BoxWithIndex[] = [];
  for (const boxWithIndex of boxes) {
    const [box, i] = boxWithIndex;
    let inner = false;
    for (const outerBoxWithIndex of outerBoxes) {
      const [box0, i0] = outerBoxWithIndex;
      if (
        box[0] > box0[0] &&
        box[1] > box0[1] &&
        box[2] < box0[2] &&
        box[3] < box0[3]
      ) {
        const x = polygonList[i][0]; // any point in polygonList[i]
        const y = polygonList[i][1];
        let upperCount = 0; // number of upper cross points
        let lowerCount = 0; // number of lower cross points
        const polygon = polygonList[i0];
        for (let j = 0; j < polygon.length; j += 2) {
          const x0 = polygon[j];
          const y0 = polygon[j + 1];
          const x1 = polygon[(j + 2) % polygon.length];
          const y1 = polygon[(j + 3) % polygon.length];
          if ((x0 <= x && x < x1) || (x1 <= x && x < x0)) {
            const y2 = ((x - x0) * y1 + (x1 - x) * y0) / (x1 - x0);
            if (y2 > y) {
              upperCount += 1;
            } else {
              lowerCount += 1;
            }
          }
        }
        if (upperCount % 2 === 1 && lowerCount % 2 === 1) {
          inner = true;
          break;
        }
      }
      if (inner) {
        break;
      }
    }

    if (inner) {
      innerLoops.add(i);
      if (!all) {
        return innerLoops;
      }
    } else {
      outerBoxes.push(boxWithIndex);
    }
  }

  return innerLoops;
};

export const hasVoid = (polygonList: PolygonList): boolean =>
  findInnerLoop(polygonList).size > 0;

export const fillVoid = (polygonList: PolygonList): PolygonList => {
  if (!isPolygonListValid(polygonList)) {
    return undefined;
  }
  const innerLoops = findInnerLoop(polygonList, true);
  const result: PolygonList = [];
  for (let i = 0; i < polygonList.length; ++i) {
    if (!innerLoops.has(i)) {
      result.push(polygonList[i]);
    }
  }
  return result;
};
