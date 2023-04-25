import React from "react";
import {
  Textarea,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  Tooltip,
  makeStyles,
  tokens,
  useId,
} from "@fluentui/react-components";
import {
  ArrowExpand24Regular,
  ClipboardPaste24Regular,
  DocumentCopy24Regular,
  Form24Regular,
  QuestionCircle24Regular,
  SelectObject24Regular,
  ShapeUnion24Regular,
} from "@fluentui/react-icons";
import {
  Box,
  PolygonList,
  fillVoid,
  getBoundingBox,
  hasVoid,
  isPolygonListValid,
  isRectangle,
  makeRectangle,
  toPolygonList,
  toSelection,
} from "./logics";
import { AboutDialog } from "./AboutDialog";
import { PreviewCanvas } from "./PreviewCanvas";

const useStyles = makeStyles({
  base: {
    display: "flex",
    flexDirection: "column",
  },
  textarea: {
    height: "12em",
  },
  canvasContainer: {
    marginTop: "1em",
  },
});

type State = {
  selectionText: string;
  polygonList: PolygonList;
  boundingBox: Box;
  validSelection: boolean;
  isRectangle: boolean;
  hasVoid: boolean;
};

const initialState: State = {
  selectionText: "",
  polygonList: [],
  boundingBox: undefined,
  validSelection: false,
  isRectangle: false,
  hasVoid: false,
};

type Action =
  | { type: "set_selection"; payload: { text: string } }
  | { type: "convert_to_rectangle"; payload: { offset?: number } }
  | { type: "fill_void"; payload: {} };

const reducer = (state: State, action: Action): State => {
  let selectionText = state.selectionText;
  let polygonList = state.polygonList;
  switch (action.type) {
    case "set_selection":
      selectionText = action.payload.text;
      polygonList = toPolygonList(selectionText);
      break;

    case "convert_to_rectangle":
      polygonList = makeRectangle(polygonList, action.payload.offset);
      selectionText = toSelection(polygonList);
      if (selectionText === "") {
        return state;
      }
      break;

    case "fill_void": {
      polygonList = fillVoid(polygonList);
      selectionText = toSelection(polygonList);
      if (selectionText === "") {
        return state;
      }
    }
  }

  return {
    ...state,
    selectionText,
    polygonList,
    boundingBox: getBoundingBox(polygonList),
    validSelection: isPolygonListValid(polygonList),
    isRectangle: isRectangle(polygonList),
    hasVoid: hasVoid(polygonList),
  };
};

const App = () => {
  const textareaId = useId("textarea");
  const styles = useStyles();

  const [state, dispatch] = React.useReducer(reducer, initialState);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <div className={styles.base}>
      <Toolbar aria-label="Default">
        <Tooltip content="Copy" relationship="description" withArrow>
          <ToolbarButton
            aria-label="Copy"
            disabled={!state.validSelection}
            onClick={() => {
              navigator.clipboard.writeText(state.selectionText);
            }}
            icon={<DocumentCopy24Regular />}
          />
        </Tooltip>
        <Tooltip content="Paste" relationship="description" withArrow>
          <ToolbarButton
            aria-label="Paste"
            onClick={() => {
              navigator.clipboard.readText().then((text) => {
                dispatch({ type: "set_selection", payload: { text } });
              });
            }}
            icon={<ClipboardPaste24Regular />}
          />
        </Tooltip>
        <ToolbarDivider />
        <Tooltip content="Rectangle" relationship="description" withArrow>
          <ToolbarButton
            aria-label="Rectangle"
            disabled={!state.validSelection || state.isRectangle}
            icon={<SelectObject24Regular />}
            onClick={() => {
              dispatch({ type: "convert_to_rectangle", payload: {} });
            }}
          />
        </Tooltip>
        <Tooltip content="Expand" relationship="description" withArrow>
          <ToolbarButton
            aria-label="Expand"
            icon={<ArrowExpand24Regular />}
            disabled={!state.validSelection || !state.isRectangle}
            onClick={() => {
              dispatch({
                type: "convert_to_rectangle",
                payload: { offset: 1 },
              });
            }}
          />
        </Tooltip>
        <Tooltip content="Form" relationship="description" withArrow>
          <ToolbarButton
            aria-label="Form"
            disabled={true}
            icon={<Form24Regular />}
          />
        </Tooltip>
        <Tooltip content="Fill void" relationship="description" withArrow>
          <ToolbarButton
            aria-label="Fill void"
            disabled={!state.validSelection || !state.hasVoid}
            icon={<ShapeUnion24Regular />}
            onClick={() => {
              dispatch({
                type: "fill_void",
                payload: {},
              });
            }}
          />
        </Tooltip>
        <ToolbarDivider />
        <Tooltip content="Help" relationship="description" withArrow>
          <ToolbarButton
            aria-label="Help"
            icon={<QuestionCircle24Regular />}
            onClick={() => {
              setDialogOpen(true);
            }}
          />
        </Tooltip>
      </Toolbar>
      <Textarea
        id={textareaId}
        onChange={(_, data) => {
          dispatch({ type: "set_selection", payload: { text: data.value } });
        }}
        placeholder='Paint.NET "選択範囲自体をコピー"'
        resize="vertical"
        textarea={{ className: styles.textarea }}
        value={state.selectionText}
      />
      <div className={styles.canvasContainer}>
        <PreviewCanvas
          polygonList={state.polygonList}
          boundingBox={state.boundingBox}
          fillStyle="#0f6cbd"
        />
      </div>

      <AboutDialog
        open={dialogOpen}
        onOpenChange={(_, data) => setDialogOpen(data.open)}
      />
    </div>
  );
};

export default App;
