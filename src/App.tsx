import React, { useState, useRef } from "react";
import { Stage, Layer, Image, Circle } from "react-konva";
import Konva from "konva";
import "./App.css";
import { Button } from "@mui/material";
import ExportModal from "./components/ExportModal";

interface ColorSpot {
  x: number;
  y: number;
  color: string;
}

function App() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [colorSpots, setColorSpots] = useState<ColorSpot[]>([]);
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const stageRef = useRef<Konva.Stage>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const { width, height } = img;
          const scale = Math.min(
            (window.innerWidth * 0.8) / width,
            (window.innerHeight * 0.8) / height
          );
          setImage(img);
          setImageSize({ width, height });
          setColorSpots([]);
          setStageScale(scale);
          setStagePosition({ x: 0, y: 0 });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!image) return;
    const stage = e.target.getStage();
    const pointerPosition = stage?.getPointerPosition();
    if (pointerPosition) {
      const x = (pointerPosition.x - stagePosition.x) / stageScale;
      const y = (pointerPosition.y - stagePosition.y) / stageScale;
      const canvas = document.createElement("canvas");
      canvas.width = imageSize.width;
      canvas.height = imageSize.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(image, 0, 0, imageSize.width, imageSize.height);
        const imageData = ctx.getImageData(Math.round(x), Math.round(y), 1, 1);
        const r = imageData.data[0];
        const g = imageData.data[1];
        const b = imageData.data[2];
        const color = `rgb(${r},${g},${b})`;
        setColorSpots((prevSpots) => [...prevSpots, { x, y, color }]);
      }
    }
  };

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = stageScale;
    const pointerPosition = stage?.getPointerPosition();

    if (pointerPosition) {
      const mousePointTo = {
        x: (pointerPosition.x - stagePosition.x) / oldScale,
        y: (pointerPosition.y - stagePosition.y) / oldScale,
      };

      const newScale =
        e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

      setStageScale(newScale);
      setStagePosition({
        x: pointerPosition.x - mousePointTo.x * newScale,
        y: pointerPosition.y - mousePointTo.y * newScale,
      });
    }
  };

  const exportPalette = (includeBackground: boolean = true) => {
    if (!image) return;

    const canvas = document.createElement("canvas");
    const aspectRatio = image.width / image.height;
    const canvasWidth = 1920;
    const canvasHeight = Math.round(canvasWidth / aspectRatio);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      if (includeBackground) {
        // Draw the original image
        ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);

        // Apply a faded effect to the image
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      } else {
        // Fill with white background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Draw image outline
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
      }

      // Draw color spots
      const spotRadius = Math.round(canvasWidth * 0.015);
      colorSpots.forEach((spot) => {
        const x = (spot.x / image.width) * canvasWidth;
        const y = (spot.y / image.height) * canvasHeight;

        ctx.beginPath();
        ctx.arc(x, y, spotRadius, 0, Math.PI * 2);
        ctx.fillStyle = spot.color;
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Convert canvas to image and trigger download
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = includeBackground
        ? "color-palette-with-bg.png"
        : "color-palette.png";
      link.href = dataUrl;
      link.click();
    }
  };

  const deleteAllSelections = () => {
    setColorSpots([]);
  };

  const exportColorPalette = () => {
    if (colorSpots.length === 0) return;

    const canvas = document.createElement("canvas");
    const canvasWidth = 1000;
    const canvasHeight = 200;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      const spotWidth = canvasWidth / colorSpots.length;

      colorSpots.forEach((spot, index) => {
        ctx.fillStyle = spot.color;
        ctx.fillRect(index * spotWidth, 0, spotWidth, canvasHeight);

        // Add color hex code
        ctx.fillStyle = getContrastColor(spot.color);
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.fillText(spot.color, (index + 0.5) * spotWidth, canvasHeight - 20);
      });

      // Convert canvas to image and trigger download
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "color-palette.png";
      link.href = dataUrl;
      link.click();
    }
  };

  // Helper function to determine contrasting text color
  const getContrastColor = (hexColor: string) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "black" : "white";
  };

  const handleExportClick = () => {
    setIsExportModalOpen(true);
  };

  return (
    <div className="App">
      {!image ? (
        <div className="welcome-screen">
          <h1>Welcome to Color Palette Creator</h1>
          <p>Create custom color palettes from your favorite images!</p>
          <ul>
            <li>Upload an image to get started</li>
            <li>Click on the image to select colors</li>
            <li>Zoom in and out for precise color picking</li>
            <li>Export your palette when you're done</li>
          </ul>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            id="image-upload"
            style={{ display: "none" }}
          />
          <label htmlFor="image-upload" className="upload-button">
            Upload an Image
          </label>
        </div>
      ) : (
        <>
          <Stage
            width={window.innerWidth * 0.8}
            height={window.innerHeight * 0.8}
            onWheel={handleWheel}
            onClick={handleStageClick}
            scaleX={stageScale}
            scaleY={stageScale}
            x={stagePosition.x}
            y={stagePosition.y}
            ref={stageRef}
            draggable
          >
            <Layer>
              <Image
                image={image}
                width={imageSize.width}
                height={imageSize.height}
              />
              {colorSpots.map((spot, i) => (
                <Circle
                  key={i}
                  x={spot.x}
                  y={spot.y}
                  radius={15 / stageScale}
                  fill={spot.color}
                  stroke="white"
                  strokeWidth={2 / stageScale}
                />
              ))}
            </Layer>
          </Stage>
          <div className="button-container">
            <Button
              variant="contained"
              onClick={handleExportClick}
              disabled={colorSpots.length === 0}
            >
              Export Options
            </Button>
            <Button variant="contained" onClick={deleteAllSelections}>
              Delete All Selections
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setImage(null);
                setColorSpots([]);
              }}
            >
              Upload New Image
            </Button>
          </div>
          <ExportModal
            open={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            onExportWithBackground={() => {
              exportPalette(true);
              setIsExportModalOpen(false);
            }}
            onExportPaletteOnly={() => {
              exportPalette(false);
              setIsExportModalOpen(false);
            }}
            onExportColorPalette={() => {
              exportColorPalette();
              setIsExportModalOpen(false);
            }}
          />
        </>
      )}
      <div></div>
    </div>
  );
}

export default App;
