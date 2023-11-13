import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const HistoryList = () => {
  const { id } = useParams();
  const [cart, setCart] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/v1/history/${id}`);
        setCart(response.data.data.history);
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };

    fetchCart();
  }, [id]);

  if (!cart) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Cart Details</h1>
      <p>Date: {cart.date}</p>
      <p>Total Amount: {cart.totalPrice}</p>
      <p>Supermarket: {cart.supermarketName}</p>
      <p>Supermarket Address: {cart.supermarketAddress}</p>
      <p>Supermarket City: {cart.supermarketCity}</p>
      <h2>Products:</h2>
      <ul>
        {cart.products.map((product) => (
          <li key={product._id}>
            <p>Barcode: {product.barcode}</p>
            <p>Amount: {product.amount}</p>
            <p>Name: {product.name}</p>
            <p>Brand: {product.brand}</p>
            <p>Total Price: {product.totalPrice}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryList;
