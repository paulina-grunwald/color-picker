import React, { useState, useRef, useEffect } from "react";
import "./App.css";

interface ColorSpot {
  x: number;
  y: number;
  color: string;
}

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [colorSpots, setColorSpots] = useState<ColorSpot[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setColorSpots([]); // Clear color spots when new image is uploaded
        setZoom(1); // Reset zoom
        setPan({ x: 0, y: 0 }); // Reset pan
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const imageData = ctx.getImageData(
          (x - pan.x) / zoom,
          (y - pan.y) / zoom,
          1,
          1
        );
        const r = imageData.data[0];
        const g = imageData.data[1];
        const b = imageData.data[2];
        const color = `rgb(${r},${g},${b})`;
        setColorSpots([
          ...colorSpots,
          { x: (x - pan.x) / zoom, y: (y - pan.y) / zoom, color },
        ]);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prevZoom) => Math.max(1, Math.min(5, prevZoom * delta)));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const exportPalette = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const paletteCanvas = document.createElement("canvas");
        paletteCanvas.width = canvas.width;
        paletteCanvas.height = canvas.height;
        const paletteCtx = paletteCanvas.getContext("2d");

        if (paletteCtx) {
          paletteCtx.drawImage(canvas, 0, 0);

          colorSpots.forEach((spot) => {
            paletteCtx.beginPath();
            paletteCtx.arc(spot.x, spot.y, 40, 0, 2 * Math.PI);
            paletteCtx.fillStyle = spot.color;
            paletteCtx.fill();
            paletteCtx.strokeStyle = "white";
            paletteCtx.lineWidth = 2;
            paletteCtx.stroke();
          });

          const dataUrl = paletteCanvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.download = "color-palette.png";
          link.href = dataUrl;
          link.click();
        }
      }
    }
  };

  const deleteAllSelections = () => {
    setColorSpots([]);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx && image) {
      const img = new Image();
      img.onload = () => {
        const screenWidth = window.innerWidth;
        const canvasWidth = screenWidth * 0.8;
        const aspectRatio = img.height / img.width;
        const canvasHeight = canvasWidth * aspectRatio;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.save();
        ctx.translate(pan.x, pan.y);
        ctx.scale(zoom, zoom);
        ctx.drawImage(img, 0, 0, canvasWidth / zoom, canvasHeight / zoom);
        ctx.restore();

        if (colorSpots.length > 0) {
          colorSpots.forEach((spot) => {
            ctx.save();
            ctx.beginPath();
            // Increase the radius from 10 to 20 (twice as big)
            ctx.arc(spot.x, spot.y, 20, 0, 2 * Math.PI);
            ctx.fillStyle = spot.color;
            ctx.fill();
            ctx.strokeStyle = "white";
            // Optionally, increase the line width for better visibility
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
          });
        }
      };
      img.src = image;
    }
  }, [image, colorSpots, zoom, pan]);

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
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onWheel={handleWheel}
            style={{
              cursor: "crosshair",
              width: "80%",
              height: "auto",
              display: "block",
              margin: "0 auto",
            }}
          />
          <div className="button-container">
            <button onClick={exportPalette}>Export Palette</button>
            <button onClick={deleteAllSelections}>Delete All Selections</button>
            <button
              onClick={() => {
                setImage(null);
                setColorSpots([]);
              }}
            >
              Upload New Image
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
