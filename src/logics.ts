const POLYGON_LIST = "polygonList";

export const isValidSelection = (selectionText: string): boolean => {
  try {
    const json = JSON.parse(selectionText);
    const len = (json[POLYGON_LIST] as Array<number> | undefined)?.length;
    if (len == null || len === 0) {
      return false;
    }

    for (const line of json[POLYGON_LIST]) {
      const array = line.split(",");
      if (array.length === 0 || array.length % 2 === 1) {
        return false;
      }
      for (let i = 0; i < array.length; ++i) {
        const x = parseInt(array[i]);
        if (Number.isNaN(x)) {
          return false;
        }
      }
    }
  } catch {
    return false;
  }

  return true;
};

export const convertToRectangleSelection = (
  selectionText: string,
  offset: number | undefined = undefined
): string | undefined => {
  if (!isValidSelection(selectionText)) {
    return undefined;
  }

  const json = JSON.parse(selectionText);

  let x_min: number | undefined = undefined;
  let x_max: number | undefined = undefined;
  let y_min: number | undefined = undefined;
  let y_max: number | undefined = undefined;

  for (const line of json[POLYGON_LIST]) {
    const array = line.split(",");
    for (let i = 0; i < array.length; i += 2) {
      const x = parseInt(array[i]);
      if (x_min == null || x_min > x) {
        x_min = x;
      }
      if (x_max == null || x_max < x) {
        x_max = x;
      }

      const y = parseInt(array[i + 1]);
      if (y_min == null || y_min > y) {
        y_min = y;
      }
      if (y_max == null || y_max < y) {
        y_max = y;
      }
    }
  }

  if (offset != null) {
    x_min = x_min! - offset;
    x_max = x_max! + offset;
    y_min = y_min! - offset;
    y_max = y_max! + offset;
  }

  const list = [x_max, y_min, x_min, y_min, x_min, y_max, x_max, y_max];
  const obj = {
    [POLYGON_LIST]: [list.join(",")],
  };
  return JSON.stringify(obj, undefined, 2);
};
