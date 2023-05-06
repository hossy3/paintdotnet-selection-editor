import {
  canRedo,
  canUndo,
  reduceSelectionTextHistory,
  reducer,
} from "./appState";
import { Box } from "./logics";

type State = Parameters<typeof reducer>[0];
type PickedState = Parameters<typeof reduceSelectionTextHistory>[0];

describe("reduceSelectionTextHistory", () => {
  it("returns selectionTextHistory with the previous and current text", () => {
    const state: PickedState = {
      selectionText: "previous",
      polygonList: [[1, 2, 3, 4]],
      selectionTextHistory: ["history 0", "history 1"],
      selectionTextHistoryIndex: 1,
    };
    const selectionText = "current";
    const expected = ["history 0", "history 1", "previous", "current"];
    expect(reduceSelectionTextHistory(state, selectionText)).toEqual(expected);
  });

  it("returns selectionTextHistory with current text when previous polygonList is invalid", () => {
    const state: PickedState = {
      selectionText: "invalid",
      polygonList: undefined,
      selectionTextHistory: ["history 0", "history 1"],
      selectionTextHistoryIndex: 1,
    };
    const selectionText = "current";
    const expected = ["history 0", "history 1", "current"];
    expect(reduceSelectionTextHistory(state, selectionText)).toEqual(expected);
  });

  it("returns selectionTextHistory with a text when previous and current are same", () => {
    const state: PickedState = {
      selectionText: "selectionText",
      polygonList: [[1, 2, 3, 4]],
      selectionTextHistory: ["history 0", "history 1"],
      selectionTextHistoryIndex: 1,
    };
    const selectionText = "selectionText";
    const expected = ["history 0", "history 1", "selectionText"];
    expect(reduceSelectionTextHistory(state, selectionText)).toEqual(expected);
  });

  it("clears redo buffer", () => {
    const state: PickedState = {
      selectionText: "previous",
      polygonList: [[1, 2, 3, 4]],
      selectionTextHistory: ["history 0", "history 1"],
      selectionTextHistoryIndex: 0,
    };
    const selectionText = "current";
    const expected = ["history 0", "previous", "current"];
    expect(reduceSelectionTextHistory(state, selectionText)).toEqual(expected);
  });

  it("works when selectionTextHistory is empty", () => {
    const state: PickedState = {
      selectionText: "previous",
      polygonList: [[1, 2, 3, 4]],
      selectionTextHistory: [],
      selectionTextHistoryIndex: 0,
    };
    const selectionText = "current";
    const expected = ["previous", "current"];
    expect(reduceSelectionTextHistory(state, selectionText)).toEqual(expected);
  });

  it("keeps selectionTextHistory when selectionText and last selectionTextHistory are same", () => {
    const state: PickedState = {
      selectionText: "history 1",
      polygonList: [[1, 2, 3, 4]],
      selectionTextHistory: ["history 0", "history 1"],
      selectionTextHistoryIndex: 1,
    };
    const selectionText = "history 1";
    const expected = state.selectionTextHistory;
    expect(reduceSelectionTextHistory(state, selectionText)).toBe(expected);
  });
});

describe("canUndo", () => {
  it("can undo (from index 1 to 0)", () => {
    const selectionTextHistoryIndex = 1;
    expect(canUndo(selectionTextHistoryIndex)).toBeTruthy();
  });

  it("can not undo (index 0 is first)", () => {
    const selectionTextHistoryIndex = 0;
    expect(canUndo(selectionTextHistoryIndex)).toBeFalsy();
  });
});

describe("canRedo", () => {
  it("can redo (from history 1 to 2)", () => {
    const selectionTextHistory = ["history 0", "history 1", "history 2"];
    const selectionTextHistoryIndex = 1;
    expect(
      canRedo(selectionTextHistoryIndex, selectionTextHistory)
    ).toBeTruthy();
  });

  it("can not redo (history 2 is last)", () => {
    const selectionTextHistory = ["history 0", "history 1", "history 2"];
    const selectionTextHistoryIndex = 2;
    expect(
      canRedo(selectionTextHistoryIndex, selectionTextHistory)
    ).toBeFalsy();
  });

  it("can not redo (empty)", () => {
    const selectionTextHistory: string[] = [];
    const selectionTextHistoryIndex = 0;
    expect(
      canRedo(selectionTextHistoryIndex, selectionTextHistory)
    ).toBeFalsy();
  });
});

describe("reduce", () => {
  const state: State = {
    aboutDialogOpen: false,
    boxFormDialogOpen: false,
    selectionText: '{"polygonList": ["0,0,0,4,5,0"]}',
    polygonList: [[0, 0, 0, 4, 5, 0]],
    boundingBox: [0, 0, 5, 4],
    validSelection: true,
    isRectangle: false,
    hasVoid: false,
    selectionTextHistory: ['{"polygonList": ["0,1,0,5,5,1"]}'],
    selectionTextHistoryIndex: 0,
    canUndo: false,
    canRedo: false,
  };

  it("handles 'set_about_dialog_open'", () => {
    const actual = reducer(state, {
      type: "set_about_dialog_open",
      payload: { open: true },
    });
    expect(state.aboutDialogOpen).toBeFalsy();
    expect(actual.aboutDialogOpen).toBeTruthy();
  });

  it("handles 'set_box_form_dialog_open'", () => {
    const actual = reducer(state, {
      type: "set_box_form_dialog_open",
      payload: { open: true },
    });
    expect(state.boxFormDialogOpen).toBeFalsy();
    expect(actual.boxFormDialogOpen).toBeTruthy();
  });

  it("handles 'set_selection'", () => {
    const text = '{"polygonList": ["5,0,0,0,0,4,5,4"]}';
    const actual = reducer(state, {
      type: "set_selection",
      payload: { text },
    });
    expect(state.selectionText).not.toBe(text);
    expect(actual.selectionText).toBe(text);
  });

  it("handles 'set_bounding_box_and_close_dialog'", () => {
    const box: Box = [10, 20, 650, 500];
    const actual = reducer(
      { ...state, boxFormDialogOpen: true },
      {
        type: "set_bounding_box_and_close_dialog",
        payload: { box },
      }
    );
    const expectedSelectionTextObj = {
      polygonList: ["650,20,10,20,10,500,650,500"],
    };
    expect(state.boundingBox).not.toEqual(box);
    expect(JSON.parse(actual.selectionText)).toEqual(expectedSelectionTextObj);
    expect(actual.selectionTextHistory[actual.selectionTextHistoryIndex]).toBe(
      actual.selectionText
    );
  });

  it("handles 'convert_to_rectangle'", () => {
    const polygonList = [[0, 0, 0, 4, 5, 0]];
    const actual = reducer(
      { ...state, polygonList },
      {
        type: "convert_to_rectangle",
        payload: {},
      }
    );
    const expectedSelectionTextObj = { polygonList: ["5,0,0,0,0,4,5,4"] };
    const expectedPolygonList = [[5, 0, 0, 0, 0, 4, 5, 4]];
    const expectedBoundingBox = [0, 0, 5, 4];
    expect(JSON.parse(actual.selectionText)).toEqual(expectedSelectionTextObj);
    expect(actual.polygonList).toEqual(expectedPolygonList);
    expect(actual.boundingBox).toEqual(expectedBoundingBox);
    expect(actual.isRectangle).toBeTruthy();
    expect(actual.selectionTextHistory[actual.selectionTextHistoryIndex]).toBe(
      actual.selectionText
    );
  });

  it("handles 'fill_void'", () => {
    const polygonList = [
      [1, 2, 2, 2, 2, 3, 1, 3, 1, 2],
      [0, 0, 0, 4, 5, 0],
    ];
    const actual = reducer(
      { ...state, polygonList },
      {
        type: "fill_void",
        payload: {},
      }
    );
    const expectedSelectionTextObj = { polygonList: ["0,0,0,4,5,0"] };
    const expectedPolygonList = [[0, 0, 0, 4, 5, 0]];
    const expectedBoundingBox = [0, 0, 5, 4];
    expect(JSON.parse(actual.selectionText)).toEqual(expectedSelectionTextObj);
    expect(actual.polygonList).toEqual(expectedPolygonList);
    expect(actual.boundingBox).toEqual(expectedBoundingBox);
    expect(actual.isRectangle).toBeFalsy();
    expect(actual.selectionTextHistory[actual.selectionTextHistoryIndex]).toBe(
      actual.selectionText
    );
  });

  it("handles 'undo'", () => {
    const prevState: State = {
      ...state,
      polygonList: undefined,
      selectionTextHistory: [
        '{"polygonList": ["0,0,0,4,5,0"]}',
        '{"polygonList": ["0,1,0,5,5,1"]}',
      ],
      selectionTextHistoryIndex: 1,
    };
    const actual = reducer(prevState, {
      type: "undo",
      payload: {},
    });
    const expectedSelectionTextObj = { polygonList: ["0,0,0,4,5,0"] };
    const expectedPolygonList = [[0, 0, 0, 4, 5, 0]];
    const expectedBoundingBox = [0, 0, 5, 4];
    expect(JSON.parse(actual.selectionText)).toEqual(expectedSelectionTextObj);
    expect(actual.polygonList).toEqual(expectedPolygonList);
    expect(actual.boundingBox).toEqual(expectedBoundingBox);
    expect(actual.isRectangle).toBeFalsy();
    expect(actual.selectionTextHistoryIndex).toBe(0);
    expect(actual.selectionTextHistory).toBe(prevState.selectionTextHistory);
  });

  it("handles 'redo'", () => {
    const prevState: State = {
      ...state,
      polygonList: undefined,
      selectionTextHistory: [
        '{"polygonList": ["0,0,0,4,5,0"]}',
        '{"polygonList": ["0,1,0,5,5,1"]}',
      ],
      selectionTextHistoryIndex: 0,
    };
    const actual = reducer(prevState, {
      type: "redo",
      payload: {},
    });
    const expectedSelectionTextObj = { polygonList: ["0,1,0,5,5,1"] };
    const expectedPolygonList = [[0, 1, 0, 5, 5, 1]];
    const expectedBoundingBox = [0, 1, 5, 5];
    expect(JSON.parse(actual.selectionText)).toEqual(expectedSelectionTextObj);
    expect(actual.polygonList).toEqual(expectedPolygonList);
    expect(actual.boundingBox).toEqual(expectedBoundingBox);
    expect(actual.isRectangle).toBeFalsy();
    expect(actual.selectionTextHistoryIndex).toBe(1);
    expect(actual.selectionTextHistory).toBe(prevState.selectionTextHistory);
  });
});
