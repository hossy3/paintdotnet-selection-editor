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
  selectionTextHistory: string[];
  selectionTextHistoryIndex: number;
  canUndo: boolean;
  canRedo: boolean;
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
  selectionTextHistory: [],
  selectionTextHistoryIndex: 0,
  canUndo: false,
  canRedo: false,
  copyTrigger: 0,
};

type Action =
  | { type: "set_about_dialog_open"; payload: { open: boolean } }
  | { type: "set_box_form_dialog_open"; payload: { open: boolean } }
  | { type: "set_selection"; payload: { text: string } }
  | { type: "set_bounding_box_and_close_dialog"; payload: { box: Box } }
  | { type: "convert_to_rectangle"; payload: { offset?: number } }
  | { type: "fill_void"; payload: {} }
  | { type: "undo"; payload: {} }
  | { type: "redo"; payload: {} };

export const reduceSelectionTextHistory = (
  state: Pick<
    State,
    | "selectionText"
    | "polygonList"
    | "selectionTextHistory"
    | "selectionTextHistoryIndex"
  >,
  selectionText: string
): string[] => {
  const selectionTextHistory = [...state.selectionTextHistory];
  let modified = false;
  if (selectionTextHistory.length > state.selectionTextHistoryIndex + 1) {
    selectionTextHistory.length = state.selectionTextHistoryIndex + 1; // clear redo buffer
    modified = true;
  }
  if (state.polygonList != null) {
    if (
      selectionTextHistory.length === 0 ||
      selectionTextHistory[selectionTextHistory.length - 1] !==
        state.selectionText
    ) {
      selectionTextHistory.push(state.selectionText);
      modified = true;
    }
  }
  if (
    selectionTextHistory.length === 0 ||
    selectionTextHistory[selectionTextHistory.length - 1] !== selectionText
  ) {
    selectionTextHistory.push(selectionText);
    modified = true;
  }
  return modified ? selectionTextHistory : state.selectionTextHistory;
};

export const canUndo = (selectionTextHistoryIndex: number): boolean =>
  selectionTextHistoryIndex > 0;

export const canRedo = (
  selectionTextHistoryIndex: number,
  selectionTextHistory: string[]
): boolean => selectionTextHistoryIndex + 1 < selectionTextHistory.length;

export const reducer = (state: State, action: Action): State => {
  let selectionText = state.selectionText;
  let polygonList = state.polygonList;
  let boxFormDialogOpen = state.boxFormDialogOpen;
  let selectionTextHistory = state.selectionTextHistory;
  let selectionTextHistoryIndex = state.selectionTextHistoryIndex;
  let copyTrigger = state.copyTrigger;

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

    case "undo":
    case "redo":
      if (action.type === "undo") {
        if (!canUndo(selectionTextHistoryIndex)) {
          return state;
        }
        selectionTextHistoryIndex -= 1;
      } else if (action.type === "redo") {
        if (!canRedo(selectionTextHistoryIndex, state.selectionTextHistory)) {
          return state;
        }
        selectionTextHistoryIndex += 1;
      }
      selectionText = state.selectionTextHistory[selectionTextHistoryIndex];
      polygonList = toPolygonList(selectionText);
      if (polygonListEquals(polygonList, state.polygonList)) {
        return {
          ...state,
          selectionText,
          selectionTextHistoryIndex,
        };
      }
      break;

    case "set_bounding_box_and_close_dialog":
    case "convert_to_rectangle":
    case "fill_void":
      if (action.type === "set_bounding_box_and_close_dialog") {
        polygonList = toPolygonListFromBox(action.payload.box);
        boxFormDialogOpen = false;
      } else if (action.type === "convert_to_rectangle") {
        polygonList = makeRectangle(polygonList, action.payload.offset);
      } else if (action.type === "fill_void") {
        polygonList = fillVoid(polygonList);
      }

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
      selectionTextHistory = reduceSelectionTextHistory(state, selectionText);
      selectionTextHistoryIndex = selectionTextHistory.length - 1;

      copyTrigger += 1;
      break;
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
    selectionTextHistory,
    selectionTextHistoryIndex,
    canUndo: canUndo(selectionTextHistoryIndex),
    canRedo: canRedo(selectionTextHistoryIndex, selectionTextHistory),
    copyTrigger,
  };
};
