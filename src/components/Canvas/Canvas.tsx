import React, { useRef, useEffect } from "react";
import { ColorSpot } from "./ColorSpot";

interface CanvasProps {
  image: string;
  colorSpots: ColorSpot[];
  zoom: number;
  pan: { x: number; y: number };
  onCanvasClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onWheel: (e: React.WheelEvent<HTMLCanvasElement>) => void;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: () => void;
}

function Canvas({
  image,
  colorSpots,
  zoom,
  pan,
  onCanvasClick,
  onWheel,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Apply zoom and pan
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // Draw the image
      ctx.drawImage(img, 0, 0, img.width, img.height);

      // Draw color spots
      colorSpots.forEach((spot) => {
        ctx.beginPath();
        ctx.arc(spot.x, spot.y, 5 / zoom, 0, 2 * Math.PI);
        ctx.fillStyle = spot.color;
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2 / zoom;
        ctx.stroke();
      });

      ctx.restore();
    };
  }, [image, colorSpots, zoom, pan]);

  return (
    <canvas
      ref={canvasRef}
      onClick={onCanvasClick}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      style={{
        cursor: "crosshair",
        width: "80%",
        height: "auto",
        display: "block",
        margin: "0 auto",
      }}
    />
  );
}

export default Canvas;
