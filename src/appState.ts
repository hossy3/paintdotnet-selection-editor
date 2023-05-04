import {
  Box,
  PolygonList,
  boxEquals,
  fillVoid,
  getBoundingBox,
  hasVoid,
  isPolygonListValid,
  isRectangle,
  makeRectangle,
  polygonListEquals,
  toPolygonList,
  toPolygonListFromBox,
  toSelection,
} from "./logics";

type State = {
  aboutDialogOpen: boolean;
  boxFormDialogOpen: boolean;
  selectionText: string;
  polygonList: PolygonList;
  boundingBox: Box;
  validSelection: boolean;
  isRectangle: boolean;
  hasVoid: boolean;
  copyTrigger: number;
};

export const initialState: State = {
  aboutDialogOpen: false,
  boxFormDialogOpen: false,
  selectionText: "",
  polygonList: [],
  boundingBox: undefined,
  validSelection: false,
  isRectangle: false,
  hasVoid: false,
  copyTrigger: 0,
};

type Action =
  | { type: "set_about_dialog_open"; payload: { open: boolean } }
  | { type: "set_box_form_dialog_open"; payload: { open: boolean } }
  | { type: "set_selection"; payload: { text: string } }
  | { type: "set_bounding_box_and_close_dialog"; payload: { box: Box } }
  | { type: "convert_to_rectangle"; payload: { offset?: number } }
  | { type: "fill_void"; payload: {} };

export const reducer = (state: State, action: Action): State => {
  let selectionText = state.selectionText;
  let polygonList = state.polygonList;
  let boxFormDialogOpen = state.boxFormDialogOpen;

  switch (action.type) {
    case "set_about_dialog_open":
      return { ...state, aboutDialogOpen: action.payload.open };

    case "set_box_form_dialog_open":
      return { ...state, boxFormDialogOpen: action.payload.open };

    case "set_selection":
      selectionText = action.payload.text;
      polygonList = toPolygonList(selectionText);
      if (polygonListEquals(polygonList, state.polygonList)) {
        return {
          ...state,
          selectionText,
        };
      }
      break;

    case "set_bounding_box_and_close_dialog":
      polygonList = toPolygonListFromBox(action.payload.box);
      boxFormDialogOpen = false;
      break;

    case "convert_to_rectangle":
      polygonList = makeRectangle(polygonList, action.payload.offset);
      break;

    case "fill_void": {
      polygonList = fillVoid(polygonList);
    }
  }

  let copyTrigger = state.copyTrigger;
  if (action.type !== "set_selection") {
    selectionText = toSelection(polygonList);
    if (selectionText === "") {
      return { ...state, boxFormDialogOpen };
    }
    if (polygonListEquals(polygonList, state.polygonList)) {
      return {
        ...state,
        boxFormDialogOpen,
        selectionText,
      };
    }
    copyTrigger += 1;
  }

  let boundingBox = getBoundingBox(polygonList);
  if (boxEquals(boundingBox, state.boundingBox)) {
    boundingBox = state.boundingBox;
  }

  return {
    ...state,
    boxFormDialogOpen,
    selectionText,
    polygonList,
    boundingBox: getBoundingBox(polygonList),
    validSelection: isPolygonListValid(polygonList),
    isRectangle: isRectangle(polygonList),
    hasVoid: hasVoid(polygonList),
    copyTrigger,
  };
};
