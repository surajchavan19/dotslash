import React, { useRef, useState } from "react";

function Interior() {
  const canvasRef = useRef(null);
  const imageInputRef = useRef(null);
  const [promptText, setPromptText] = useState("");

  const [isDrawing, setIsDrawing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");
  const [isLoaded, setIsLoaded] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setIsLoaded(true);
    if (file) {
      const reader = new FileReader();

      reader.onload = function (readerEvent) {
        const image = new Image();
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        image.onload = function () {
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        };
        image.src = readerEvent.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    draw(e);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const x = e.clientX - canvas.getBoundingClientRect().left;
    const y = e.clientY - canvas.getBoundingClientRect().top;

    ctx.fillStyle = "#fff"; // Set color to white
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, 7 * Math.PI);
    ctx.fill();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const saveImage = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Get the image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const originalImage = canvas.toDataURL("image/png");

    // Set non-white pixels to black
    for (let i = 0; i < imageData.data.length; i += 4) {
      const isWhite =
        imageData.data[i] === 255 &&
        imageData.data[i + 1] === 255 &&
        imageData.data[i + 2] === 255;
      if (!isWhite) {
        imageData.data[i] = 0;
        imageData.data[i + 1] = 0;
        imageData.data[i + 2] = 0;
      }
    }

    // Put the modified image data back on the canvas
    ctx.putImageData(imageData, 0, 0);

    const modifiedImage = canvas.toDataURL("image/png");

    // Create a download link for the modified image
    const downloadLink = document.createElement("a");
    downloadLink.href = modifiedImage;
    downloadLink.download = "Sachin.png";
    downloadLink.click();

    try {
      const response = await fetch("http://localhost:3003/op", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalImage,
          modifiedImage,
          promptText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send images to the server");
      }
      const result = await response.json();

      setGeneratedImage(result.data);
      console.log(result.data);
    } catch (error) {
      console.error("Error sending images to the server:", error);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <input
        type="file"
        id="imageInput"
        accept="image/*"
        ref={imageInputRef}
        onChange={handleImageUpload}
      />
      <input
        type="text"
        placeholder="Enter prompt text"
        value={promptText}
        onChange={(e) => setPromptText(e.target.value)}
      />
      <br />
      {isLoaded ? (
        <canvas
          id="canvas"
          width="500"
          height="500"
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          style={{ border: "1px solid #000" }}
        ></canvas>
      ) : (
        <div></div>
      )}
      <br />

      <button onClick={saveImage}>Save Image</button>

      {generatedImage ? (
        <div>
          <img src={generatedImage} alt="" />
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default Interior;