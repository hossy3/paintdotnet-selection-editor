import { canRedo, canUndo, reduceSelectionTextHistory } from "./appState";

describe("reduceSelectionTextHistory", () => {
  it("returns selectionTextHistory with the previous and current text", () => {
    const state: Parameters<typeof reduceSelectionTextHistory>[0] = {
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
    const state: Parameters<typeof reduceSelectionTextHistory>[0] = {
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
    const state: Parameters<typeof reduceSelectionTextHistory>[0] = {
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
    const state: Parameters<typeof reduceSelectionTextHistory>[0] = {
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
    const state: Parameters<typeof reduceSelectionTextHistory>[0] = {
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
    const state: Parameters<typeof reduceSelectionTextHistory>[0] = {
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
