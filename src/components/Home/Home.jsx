import { useTranslation } from 'react-i18next';
import styles from "./Home.module.css";
import { useEffect } from 'react';
import ProductCard from "../../components/ProductCard/ProductCard";
import FilterBar from "../FilterBar/FilterBar";
import Paginado from "../Paginado/Paginado";
import SearchResults from "../SearchResults/SearchResults";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { getCurrentUserAction, getProducts, responsiveNavBar } from "../../redux/actions";
import axios from 'axios';
import { API_URL } from '../../helpers/config';



function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const productRender = useSelector((state) => state.products);
  const search_Activity = useSelector((state => state.search));
  const totalFilters = useSelector((state => state.totalFilters));
  const sort = useSelector((state => state.sort));
  const genre = useSelector((state => state.genre));
  const priceFilter = useSelector((state => state.priceFilter));

  const getLocalStorageData = async () => {
    return new Promise((resolve, reject) => {
      try {
        const data = localStorage.getItem('currentUser');
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  };
  
  async function handleUserData() {
    try {
      const storageData = await getLocalStorageData();
      const userData = storageData ? JSON.parse(storageData) : null;
      if (userData) {
        const { data } = await axios(`${API_URL}/user?email=${userData.user.email}&externalSignIn=${userData.user.externalSignIn}`);
        dispatch(getCurrentUserAction(data));
      }
    } catch (error) {
      console.error(error.message);
    }
  }

  useEffect(() => {
    const sumFilters = [...totalFilters, priceFilter[0], priceFilter[1], sort[0], sort[1], genre[0], { search: search_Activity }]
    dispatch(getProducts(sumFilters));
    dispatch(responsiveNavBar(false));
    if (!search_Activity) {
      navigate('/');
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    handleUserData(); // para saber si hay algún usuario logueado en este compu y renderizar su imagen en el navbar.
  }, []);

  return (
    <div className={styles.mainView}>
      <div className={styles.subMainView}>
        {/* {location.pathname === '/search' &&
          <div className={styles.FilterBarContainer}>
            <FilterBar />
          </div>
        } */}
        <div className={location.pathname === '/search' ? styles.FilterBarContainer : styles.FilterBarHidden}>
          <FilterBar />
        </div>
        {productRender.data?.length > 0 ?
          <div className={styles.conteinerHome}>
            <div className={styles.paginado}>
              <Paginado />
            </div>
            <div className={styles.results}>
              <p>Resultados: {productRender?.totalFilteredCount}</p>
            </div>
            <div className={styles.conteinerCards}>
              {productRender.data?.length > 0 && productRender.data.map((product, i) => {
                return (
                  <div key={i} className={styles.cardComponentContainer}>
                    <ProductCard productData={product} />
                  </div>
                )
              })}
            </div>
            <div className={styles.paginado}>
              <Paginado />
            </div>
          </div> :
          <div className={styles.searchNoResultsContainer}>
            <SearchResults />
          </div>
        }
      </div>
    </div>
  );
}

export default Home;

