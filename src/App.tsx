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
import { convertToRectangleSelection, isValidSelection } from "./logics";
import { AboutDialog } from "./AboutDialog";

const useStyles = makeStyles({
  base: {
    display: "flex",
    flexDirection: "column",
  },
  textarea: {
    height: "12em",
  },
});

type State = {
  selectionText: string;
  validSelection: boolean;
  hasVoid: boolean;
};

const initialState: State = {
  selectionText: "",
  validSelection: false,
  hasVoid: false,
};

type Action =
  | { type: "set_selection"; payload: { text: string } }
  | { type: "convert_to_rectangle"; payload: { offset?: number } };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "set_selection": {
      const selectionText = action.payload.text;
      return {
        selectionText: selectionText,
        validSelection: isValidSelection(selectionText),
        hasVoid: isValidSelection(selectionText),
      };
    }
    case "convert_to_rectangle": {
      const selectionText = convertToRectangleSelection(
        state.selectionText,
        action.payload.offset
      );
      if (selectionText == null) {
        return state;
      }
      return {
        selectionText: selectionText,
        validSelection: isValidSelection(selectionText),
        hasVoid: isValidSelection(selectionText),
      };
    }
  }
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
            disabled={!state.validSelection}
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
            disabled={!state.validSelection}
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
            disabled={true}
            icon={<ShapeUnion24Regular />}
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
      <AboutDialog
        open={dialogOpen}
        onOpenChange={(_, data) => setDialogOpen(data.open)}
      />
    </div>
  );
};

export default App;
