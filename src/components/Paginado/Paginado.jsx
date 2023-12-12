import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProductPage, getProducts } from '../../redux/actions';
import { useNavigate } from 'react-router-dom';
import styles from './Paginado.module.css';

const Paginado = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const totalFilters = useSelector((state => state.totalFilters));
  const sort = useSelector((state => state.sort));
  const genre = useSelector((state => state.genre));
  const priceFilter = useSelector((state => state.priceFilter));
  const { currentPage, limitPage, totalFilteredCount } = useSelector((state) => state.products);
  let arrayPages = [];
  const totalPages = (totalFilteredCount && limitPage) ? totalFilteredCount / limitPage : 1;
  for (let i = 0; i < totalPages; i++) {
    arrayPages.push(i + 1);
  }
  const [pageNumber, setPageNumber] = useState(currentPage);

  const handlePageChange = (newPage) => {
    setPageNumber(newPage);
    const sumFilters = [...totalFilters, priceFilter[0], priceFilter[1], sort[0], sort[1], genre[0], { page: newPage }, { limit: limitPage }]
    dispatch(getProducts(sumFilters));
    navigate('/search');
  };

  const handlePageChangeLeft = (newPage) => {
    if (currentPage !== 1) {
      setPageNumber(newPage);
      const sumFilters = [...totalFilters, priceFilter[0], priceFilter[1], sort[0], sort[1], genre[0], { page: newPage }, { limit: limitPage }]
      dispatch(getProducts(sumFilters));
      navigate('/search');
    }
  };

  const handlePageChangeRight = (newPage) => {
    if (currentPage !== arrayPages.length) {
      setPageNumber(newPage);
      const sumFilters = [...totalFilters, priceFilter[0], priceFilter[1], sort[0], sort[1], genre[0], { page: newPage }, { limit: limitPage }]
      dispatch(getProducts(sumFilters));
      navigate('/search');
    }
  };

  return (
    <nav aria-label="Page navigation example">
      <ul className="pagination">
        <li className="page-item" onClick={() => handlePageChangeLeft(currentPage - 1)}>
          <a className="page-link" href="#" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
        {arrayPages.length && arrayPages.map((pageNumber, i) => {
          const pageSelected = i + 1;
          return (
            <li key={i} className="page-item" onClick={() => handlePageChange(pageNumber)}><a id={currentPage === pageSelected && styles.currentPage} class="page-link" href="#">{pageNumber}</a></li>
          )
        })}
        <li className="page-item" onClick={() => handlePageChangeRight(currentPage + 1)}>
          <a className="page-link" href="#" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Paginado;

{/* <div className="mainView d-flex justify-content-center w-100">
    <div id="arrows" className="leftArrow" onClick={() => handlePageChange(pageNumber - 1)}>
      &laquo;
    </div>
    <div className="pagesBox">
      <div className="pagesSubBox">
        <input
          type="number"
          value={pageNumber}
          onChange={(e) => setPageNumber(e.target.value)}
        />
        <p>of {limitPage}</p>
      </div>
    </div>
    <div id="arrows" className="rightArrow" onClick={() => handlePageChange(pageNumber + 1)}>
      &raquo;
    </div>
  </div> */}