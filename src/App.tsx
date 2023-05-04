import React from "react";
import {
  Textarea,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  Tooltip,
  makeStyles,
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
import { AboutDialog } from "./AboutDialog";
import { PreviewCanvas } from "./PreviewCanvas";
import { BoxFormDialog } from "./BoxFormDialog";
import { initialState, reducer } from "./appState";

const useStyles = makeStyles({
  base: {
    display: "flex",
    flexDirection: "column",
  },
  textarea: {
    height: "12em",
  },
  canvasContainer: {
    width: "100%",
  },
});

const App = () => {
  const textareaId = useId("textarea");
  const styles = useStyles();

  const [state, dispatch] = React.useReducer(reducer, initialState);

  React.useEffect(() => {
    if (state.copyTrigger > 0 && state.selectionText !== "") {
      navigator.clipboard.writeText(state.selectionText);
    }
  }, [state.copyTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  const previewCanvas = React.useMemo(
    () => (
      <PreviewCanvas
        polygonList={state.polygonList}
        boundingBox={state.boundingBox}
        fillStyle="#b4d6fa"
        strokeStyle="#0f6cbd"
      />
    ),
    [state.polygonList, state.boundingBox]
  );

  return (
    <div className={styles.base}>
      <Toolbar aria-label="Default">
        <Tooltip content="コピー" relationship="description" withArrow>
          <ToolbarButton
            aria-label="コピー"
            disabled={!state.validSelection}
            onClick={() => {
              navigator.clipboard.writeText(state.selectionText);
            }}
            icon={<DocumentCopy24Regular />}
          />
        </Tooltip>
        <Tooltip content="貼り付け" relationship="description" withArrow>
          <ToolbarButton
            aria-label="貼り付け"
            onClick={() => {
              navigator.clipboard.readText().then((text) => {
                dispatch({ type: "set_selection", payload: { text } });
              });
            }}
            icon={<ClipboardPaste24Regular />}
          />
        </Tooltip>
        <ToolbarDivider />
        <Tooltip content="四角形にする" relationship="description" withArrow>
          <ToolbarButton
            aria-label="四角形にする"
            disabled={!state.validSelection || state.isRectangle}
            icon={<SelectObject24Regular />}
            onClick={() => {
              dispatch({ type: "convert_to_rectangle", payload: {} });
            }}
          />
        </Tooltip>
        <Tooltip content="拡大" relationship="description" withArrow>
          <ToolbarButton
            aria-label="拡大"
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
        <Tooltip content="選択範囲を編集" relationship="description" withArrow>
          <ToolbarButton
            aria-label="選択範囲を編集"
            disabled={!state.validSelection}
            icon={<Form24Regular />}
            onClick={() => {
              dispatch({
                type: "set_box_form_dialog_open",
                payload: { open: true },
              });
            }}
          />
        </Tooltip>
        <Tooltip content="穴の除去" relationship="description" withArrow>
          <ToolbarButton
            aria-label="穴の除去"
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
        <Tooltip content="About" relationship="description" withArrow>
          <ToolbarButton
            aria-label="About"
            icon={<QuestionCircle24Regular />}
            onClick={() => {
              dispatch({
                type: "set_about_dialog_open",
                payload: { open: true },
              });
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
      <div className={styles.canvasContainer}>{previewCanvas}</div>
      <BoxFormDialog
        box={state.boundingBox}
        open={state.boxFormDialogOpen}
        onOpenChange={(_, data) =>
          dispatch({
            type: "set_box_form_dialog_open",
            payload: { open: data.open },
          })
        }
        onSubmit={(box) => {
          dispatch({
            type: "set_bounding_box_and_close_dialog",
            payload: { box },
          });
        }}
      />
      <AboutDialog
        open={state.aboutDialogOpen}
        onOpenChange={(_, data) =>
          dispatch({
            type: "set_about_dialog_open",
            payload: { open: data.open },
          })
        }
      />
    </div>
  );
};

export default App;
