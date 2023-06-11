import styled from "@emotion/styled";
import { useProducts } from "../../context/ProductContext";

const ProductListStyle = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  @media (max-width: 768px) {
    grid-template-columns: repeat(1, 1fr);
  }
`;

const ProductCardStyle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  h1 {
    font-size: 1.5rem;
    font-weight: 500;
  }

  h3 {
    font-size: 1rem;
    font-weight: 400;
  }
`;

function ProductList() {
  const { products  } = useProducts();  // , error } = useProducts();

  console.log(products);

  return (
    <ProductListStyle>
      {products?.map((product) => (
        <ProductCardStyle key={product.barcode}>
          <h1>{product.name}</h1>
          <h3>{product.barcode}</h3>
        </ProductCardStyle>
      ))}
    </ProductListStyle>
  );
}

export default ProductList;

/**
 {
    "_id": "646db90aadbba146043f7114",
    "name": "חלב דל לקטוז 2% קרטון",
    "hasUiqueBarcode": true,
    "barcode": "40974",
    "kosher": "Kosher",
    "healthMarking": "",
    "description": "",
    "imageCover": "no-image.jpg",
    "weight": 1,
    "unitWeight": "l",
    "generalName": "Milk",
    "id": "646db90aadbba146043f7114"
  },
  */
