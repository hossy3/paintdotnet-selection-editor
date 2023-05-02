import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogProps,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Label,
  SpinButton,
  makeStyles,
} from "@fluentui/react-components";
import { Box } from "./logics";

const useStyles = makeStyles({
  content: {
    display: "flex",
    flexDirection: "column",
    rowGap: "10px",
  },
});

type BoxFormDialogProps = Pick<DialogProps, "open" | "onOpenChange"> & {
  box: Box;
  onSubmit: (box: Box) => void;
};

type State = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const initialState: State = {
  x: 0,
  y: 0,
  width: 1,
  height: 1,
};

type Action =
  | { type: "init"; payload: { box: Box } }
  | { type: "set_x"; payload: { value: number | null | undefined } }
  | { type: "set_y"; payload: { value: number | null | undefined } }
  | { type: "set_width"; payload: { value: number | null | undefined } }
  | { type: "set_height"; payload: { value: number | null | undefined } };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "init":
      if (action.payload.box == null) {
        return state;
      }
      return {
        ...state,
        x: Math.round(action.payload.box[0]),
        y: Math.round(action.payload.box[1]),
        width:
          Math.round(action.payload.box[2]) - Math.round(action.payload.box[0]),
        height:
          Math.round(action.payload.box[3]) - Math.round(action.payload.box[1]),
      };

    case "set_x":
      if (action.payload.value == null || !isFinite(action.payload.value)) {
        return state;
      }
      return { ...state, x: action.payload.value };

    case "set_y":
      if (action.payload.value == null || !isFinite(action.payload.value)) {
        return state;
      }
      return { ...state, y: action.payload.value };

    case "set_width":
      if (action.payload.value == null || !isFinite(action.payload.value)) {
        return state;
      }
      return { ...state, width: action.payload.value };

    case "set_height":
      if (action.payload.value == null || !isFinite(action.payload.value)) {
        return state;
      }
      return { ...state, height: action.payload.value };
  }
};

export const BoxFormDialog = (props: BoxFormDialogProps) => {
  const styles = useStyles();
  const [state, dispatch] = React.useReducer(reducer, initialState);

  React.useEffect(
    () => dispatch({ type: "init", payload: { box: props.box } }),
    [props.open, props.box]
  );

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    props.onSubmit([
      state.x,
      state.y,
      state.x + state.width,
      state.y + state.height,
    ]);
  };

  return (
    <Dialog {...props}>
      <DialogSurface>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <DialogTitle>選択範囲を編集</DialogTitle>
            <DialogContent className={styles.content}>
              <Label htmlFor={"x-input"}>左上座標 X</Label>
              <SpinButton
                id={"x-input"}
                value={state.x ?? 0}
                onChange={(_, data) =>
                  dispatch({
                    type: "set_x",
                    payload: { value: data.value ?? Number(data.displayValue) },
                  })
                }
              />
              <Label htmlFor={"y-input"}>左上座標 Y</Label>
              <SpinButton
                id={"y-input"}
                value={state.y ?? 0}
                onChange={(_, data) =>
                  dispatch({
                    type: "set_y",
                    payload: { value: data.value ?? Number(data.displayValue) },
                  })
                }
              />
              <Label htmlFor={"width-input"}>幅</Label>
              <SpinButton
                id={"width-input"}
                min={1}
                value={state.width ?? 1}
                onChange={(_, data) =>
                  dispatch({
                    type: "set_width",
                    payload: { value: data.value ?? Number(data.displayValue) },
                  })
                }
              />
              <Label htmlFor={"height-input"}>高さ</Label>
              <SpinButton
                id={"height-input"}
                min={1}
                value={state.height ?? 1}
                onChange={(_, data) =>
                  dispatch({
                    type: "set_height",
                    payload: { value: data.value ?? Number(data.displayValue) },
                  })
                }
              />
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">キャンセル</Button>
              </DialogTrigger>
              <Button type="submit" appearance="primary">
                OK
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
};
