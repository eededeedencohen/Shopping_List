// import React, { useEffect, useState } from "react";
// import axios from "axios";

// function ReplaceProducts({ barcode }) {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const result = await axios(
//           `http://localhost:8000/api/v1/products/replacement-products/${barcode}`
//         );
//         setProducts(result.data.data.products.products);
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching data: ", error);
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [barcode]);

//   const handleProductClick = async (newBarcode) => {
//     try {
//       const response = await axios.post(
//         `http://localhost:8000/api/v1/carts/replace/1`,
//         {
//           oldbarcode: barcode,
//           newbarcode: newBarcode,
//         }
//       );
//       console.log(response);
//     } catch (error) {
//       console.error("Error posting data: ", error);
//     }
//   };

//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   return (
//     <div>
//       <h1>Replacement Products</h1>
//       {products.map((product) => (
//         <div key={product._id} onClick={() => handleProductClick(product.barcode)}>
//           <h2>{product.name}</h2>
//           <p>{product.barcode}</p>
//           <p>{product.brand}</p>
//           <p>Kosher: {product.kosher}</p>
//           <p>
//             Weight: {product.weight} {product.unitWeight}
//           </p>
//           <img src={product.imageCover} alt={product.name} />
//         </div>
//       ))}
//     </div>
//   );
// }

// export default ReplaceProducts;


import React, { useEffect, useState } from "react";
import axios from "axios";

function ReplaceProducts({ barcode, closeModal, loadCart, userId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await axios(
          `http://localhost:8000/api/v1/products/replacement-products/${barcode}`
        );
        setProducts(result.data.data.products.products);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [barcode]);

  const handleProductClick = async (newBarcode) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/v1/carts/replace/${userId}`,
        {
          oldbarcode: barcode,
          newbarcode: newBarcode,
        }
      );
      console.log(response);
      closeModal();
      loadCart(userId); // Add this line
    } catch (error) {
      console.error("Error posting data: ", error);
      closeModal();
    }
  };
  

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Replacement Products</h1>
      {products.map((product) => (
        <div key={product._id}>
          <h2>{product.name}</h2>
          <p>{product.barcode}</p>
          <p>{product.brand}</p>
          <p>Kosher: {product.kosher}</p>
          <p>Weight: {product.weight} {product.unitWeight}</p>
          <img src={product.imageCover} alt={product.name} />
          <button onClick={() => handleProductClick(product.barcode)}>Select Replacement</button>
        </div>
      ))}
    </div>
  );
}

export default ReplaceProducts;

