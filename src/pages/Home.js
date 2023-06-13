import styled from "@emotion/styled";
import ProductList from "../components/ProductList/ProductList";

const HomeStyle = styled.div`
  background-color: #f5f5f5;
  min-height: 100vh;
  display: block;
`;

function Home() {
  return (
    <HomeStyle>
      <ProductList />
    </HomeStyle>
  );
}

export default Home;
