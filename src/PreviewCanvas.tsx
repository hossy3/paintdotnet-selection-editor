import React from "react";
import { Box, PolygonList } from "./logics";
import { Tooltip, makeStyles } from "@fluentui/react-components";

const useStyles = makeStyles({
  canvas: {
    marginTop: "1em",
    maxWidth: "100%",
  },
});

type PreviewCanvasProps = {
  polygonList: PolygonList;
  boundingBox: Box;
  fillStyle: string;
  strokeStyle: string;
};

export const PreviewCanvas = (props: PreviewCanvasProps) => {
  const styles = useStyles();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const width =
    props.boundingBox == null ? 0 : props.boundingBox[2] - props.boundingBox[0];
  const height =
    props.boundingBox == null ? 0 : props.boundingBox[3] - props.boundingBox[1];

  const tooltip =
    props.boundingBox == null
      ? ""
      : `左上 (${props.boundingBox[0]}, ${props.boundingBox[1]}), サイズ (${width}, ${height})`;

  React.useEffect(() => {
    if (props.polygonList.length === 0 || props.boundingBox == null) {
      return;
    }

    const ctx = canvasRef.current?.getContext("2d");
    if (ctx == null) {
      return;
    }
    ctx.clearRect(0, 0, width, height);

    const cx = props.boundingBox[0] - 0.5;
    const cy = props.boundingBox[1] - 0.5;

    const region = new Path2D();
    ctx.fillStyle = props.fillStyle;
    ctx.strokeStyle = props.strokeStyle;
    for (const polygon of props.polygonList) {
      const i_max = polygon.length / 2;
      region.moveTo(polygon[0] - cx, polygon[1] - cy);
      for (let i = 1; i < i_max; i++) {
        region.lineTo(polygon[i * 2] - cx, polygon[i * 2 + 1] - cy);
      }
      region.closePath();
    }
    ctx.fill(region, "evenodd");
    ctx.stroke(region);
    ctx.save();
  }, [
    canvasRef,
    width,
    height,
    props.polygonList,
    props.boundingBox,
    props.fillStyle,
    props.strokeStyle,
  ]);

  return (
    <Tooltip content={tooltip} relationship="inaccessible" withArrow>
      <canvas
        className={styles.canvas}
        width={width + 1}
        height={height + 1}
        ref={canvasRef}
      ></canvas>
    </Tooltip>
  );
};
