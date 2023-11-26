import React, { useState } from "react";
import { DOMAIN } from "../../constants";

function ImageParser() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState(null);

  const handleImageChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${DOMAIN}/api/v1/carts/text`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error("Upload failed");
      return;
    }

    const result = await response.json();
    setText(result.data.text);
    console.log(result.data.text);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleImageChange} />
        <button type="submit">Upload</button>
      </form>
      {text && <p>Detected text: {text}</p>}
    </div>
  );
}

export default ImageParser;
