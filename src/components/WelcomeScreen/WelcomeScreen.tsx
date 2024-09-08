import React, { useRef, useEffect, useState } from "react";
import { FileWithPath } from "react-dropzone";

interface WelcomeScreenProps {
  onImageUpload: (acceptedFiles: FileWithPath[]) => void;
}

interface WelcomeScreenProps {
  onImageUpload: (acceptedFiles: FileWithPath[]) => void;
}

interface WelcomeScreenProps {
  onImageUpload: (acceptedFiles: FileWithPath[]) => void;
  isImageLoaded: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onImageUpload,
  isImageLoaded,
}) => {
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const preventDefault = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      preventDefault(e);
      if (isImageUploaded || isImageLoaded) return;

      if (e.dataTransfer?.files) {
        const files = Array.from(e.dataTransfer.files) as FileWithPath[];
        onImageUpload(files);
        setIsImageUploaded(true);
      }
    };

    document.addEventListener("dragenter", preventDefault);
    document.addEventListener("dragover", preventDefault);
    document.addEventListener("dragleave", preventDefault);
    document.addEventListener("drop", handleDrop);

    return () => {
      document.removeEventListener("dragenter", preventDefault);
      document.removeEventListener("dragover", preventDefault);
      document.removeEventListener("dragleave", preventDefault);
      document.removeEventListener("drop", handleDrop);
    };
  }, [onImageUpload, isImageUploaded, isImageLoaded]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && !isImageUploaded && !isImageLoaded) {
      const files = Array.from(event.target.files) as FileWithPath[];
      onImageUpload(files);
      setIsImageUploaded(true);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  if (isImageUploaded || isImageLoaded) {
    return null; // Hide the welcome screen when an image is uploaded or loaded
  }

  return (
    <div ref={dropzoneRef} className="welcome-screen">
      <h1>Welcome to Color Palette Creator</h1>
      <p>Create custom color palettes from your favorite images!</p>
      <ul>
        <li>Upload an image to get started</li>
        <li>Click on the image to select colors</li>
        <li>Zoom in and out for precise color picking</li>
        <li>Export your palette when you're done</li>
      </ul>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <button onClick={handleButtonClick}>
        Drag & drop an image here, or click to select one
      </button>
    </div>
  );
};

export default WelcomeScreen;
