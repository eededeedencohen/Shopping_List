import React, { useState } from "react";
import { DOMAIN } from "../../constants";
import Modal from "../Cart/Modal";
import ReceiptProducts from "./ReceiptProducts";

function ImageParser() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState(null);
  // const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [receiptProducts, setReceiptProducts] = useState([]);


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
    setReceiptProducts(result.data.products);
    console.log(result.data.products);
    setModalOpen(true);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleImageChange} />
        <button type="submit">Upload</button>
      </form>
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
          <ReceiptProducts receiptProducts={receiptProducts} />
        </Modal>
      )}
      <button onClick={() => setModalOpen(true)}>Open Modal</button>
    </div>
  );
}

export default ImageParser;
