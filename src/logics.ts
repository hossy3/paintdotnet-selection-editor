const POLYGON_LIST = "polygonList";

export type PolygonList = number[][]; // [[x0, y0, x1, y1, ...], ...]
export type Box = [number, number, number, number] | undefined; // [x_min, y_min, x_max, y_max]

export const toPolygonList = (selectionText: string): PolygonList => {
  try {
    const json = JSON.parse(selectionText);
    const len = (json[POLYGON_LIST] as number[] | undefined)?.length;
    if (len == null || len === 0) {
      return [];
    }

    const polygonList = [];
    for (const line of json[POLYGON_LIST]) {
      const polygon = [];
      const array = line.split(",");
      if (array.length === 0 || array.length % 2 === 1) {
        return [];
      }
      for (let i = 0; i < array.length; ++i) {
        const x = parseInt(array[i]);
        if (Number.isNaN(x)) {
          return [];
        }
        polygon.push(x);
      }
      polygonList.push(polygon);
    }

    return polygonList;
  } catch {
    return [];
  }
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

export const isPolygonListValid = (polygonList: PolygonList): boolean =>
  polygonList.length > 0;

export const hasVoid = (polygonList: PolygonList): boolean =>
  polygonList.length > fillVoid(polygonList).length;

export const isBoxValid = (box: Box): box is NonNullable<Box> => box != null;

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

export const fillVoid = (polygonList: PolygonList): PolygonList => {
  if (!isPolygonListValid(polygonList)) {
    return [];
  }

  const result: PolygonList = [];
  for (const polygon of polygonList) {
    const i_max = polygon.length / 2;
    let area = 0;
    for (let i = 2; i < i_max; i++) {
      let [x0, x1, x2] = [polygon[0], polygon[(i - 1) * 2], polygon[i * 2]];
      let [y0, y1, y2] = [polygon[1], polygon[(i - 1) * 2 + 1], polygon[i * 2 + 1]];
      area -= ((x1 - x0) * (y2 - y0) + (x2 - x0) * (y1 - y1)) / 2; // (0, 0): upper-left (math: lower-left)
    }
    if (area > 0) {
      result.push(polygon); // outer loop (TODO: nested outer-inner-outer case)
    }
  }

  return result;
};
