import { useParams, useNavigate } from "react-router-dom";
import styles from "./ProductDetail.module.css";
import { useEffect, useState } from "react";
import { API_URL } from "../../helpers/config";
import Carousel2 from "../Carousel2/Carousel2";
import Loading from "../loading/Loading";
import axios from "axios";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const title = data?.title ? data.title : "";
  const Colors = data?.Colors.length ? data.Colors : [""];
  const Images = data?.Images.length ? data.Images : [""];
  const Stocks = data?.Stocks.length ? data.Stocks : [""];
  const description = data?.description ? data.description : "";
  const brand = data?.mark ? data.mark : "";
  let price = data?.price ? data.price : "";
  price = (price / 1).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  // const available = data?.available ? data.available : "";
  // const category = data?.category ? data.category : "";
  // const discount = data?.discount ? data.discount : "";
  // const subCategory = data?.subCategory ? data.subCategory : "";

  useEffect(() => {
    axios
      .get(`${API_URL}/detail/${id}`)

      .then(({ data }) => {
        setData(data.data);
      })
      .catch((error) => {
        console.log("Error fetching product details:", error);
      });
  }, []);

  const handleAddToCart = () => {
    if (selectedProduct) {
      // Agrega lógica para agregar el producto al carrito
      // y luego redirige al usuario al carrito de compras, debe tener el login 
      // Puedes usar la función `setCartItems` del estado del carrito en `ShoppingCart`.
      // Aquí se asume que hay una función `addToCart` para agregar al carrito.
      // Ajusta según tu implementación real.
      addToCart(selectedProduct);
      navigate("/shoppingcart"); // Redirige al carrito después de agregar al carrito.
    }
  };
  
    useEffect(() => {
      window.scrollTo(0, 0);
    }, []); 
  
  return (
    <div className={styles.conteinerDetail}>
      {data ? (
        <div className={styles.subContainerDetail}>
          <div className={styles.boxTitle}>
            <p>{title}</p>
          </div>
          <hr />
          <div className={styles.imgContainer}>
            {Images.length &&
              Images.map((image, i) => {
                return (
                  <div key={i}>
                    <img key={id} src={image} alt="" />
                  </div>
                );
              })}
          </div>
          <div className={styles.buttonContainer}>
              <button onClick={handleAddToCart}>
              Agregar al carrito
              <i className="bi bi-cart-plus" />
            </button>
          </div>
          <hr />
          <div className={styles.Box}>
            <p> {description}</p>
            <p>{brand}</p>
            <p>{price}</p>
            <p>{Colors?.join(", ")}</p>
            <div className={styles.talleBox}>
              {Stocks.length &&
                Stocks.map((stock, i) => {
                  return (
                    <div key={i}>
                      
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default ProductDetail;
