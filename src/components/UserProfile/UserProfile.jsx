import styles from './UserProfile.module.css';
/* import img1 from '../../Images/imagesVidal.jpeg'; */
import { Table } from '../../helpers/indexComponents';
import EditUser from "./EditUser/EditUser";
import { useEffect, useState } from 'react';
import { UserAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Loading from '../loading/Loading';
import axios from 'axios';
import { API_URL } from '../../helpers/config';
import upperLowerCase from '../../utils/upperLowerCase';
import { cartAction, getCurrentUserAction, quantityCartAction } from '../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import getLocalStorageData from '../../utils/getLocalStorage';
import Swal from 'sweetalert2';
import Favorites from './Favorites/Favorites';
// import userPurchases from '../../utils/userPurchases';


function UserProfile() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex para validar el formato estandar de un email.
    const [isValidEmail, setIsValidEmail] = useState(true);
    const [notify, setNotify] = useState({});
    const [dataProgress, setDataProgress] = useState('0');
    const [userPurchases, setUserPurchases] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reloadPage, setReloadPage] = useState(false);
    const { user, logOut } = UserAuth() ?? {}; // condicional de distructuring para que no se rompa la app si hay un valor null o undefined.
    const [mainComponent, setMainComponent] = useState('purchasesTable');
    const userDataRender = useSelector((state) => state.currentUserData); // data del usuario a renderizar
    const imgUser = userDataRender ? userDataRender.image : null;
    const { id } = userDataRender ? userDataRender : '';
    // convertimos los nombres en iniciales para mostrar en la foto de perfil si esque no tiene imagen.
    const firstNameFull = userDataRender?.firstName ? userDataRender.firstName : '';
    const lastNameFull = userDataRender?.lastName ? userDataRender.lastName : '';
    let firstName = userDataRender?.firstName.charAt(0).toUpperCase();
    let lastName = userDataRender?.lastName && userDataRender.lastName.charAt(0).toUpperCase();
    if (!lastName && userDataRender) { // extraemos las iniciales del usuario en mayúscula, si el usuario no rellenó el campo lastName, usamos la segunda letra de su firstName.
        const splitFirstName = firstNameFull.split(' ');
        if (splitFirstName.length > 1) {
            lastName = splitFirstName[1].charAt(0).toUpperCase();
        }
        else {
            lastName = splitFirstName[0].charAt(1).toUpperCase();
        }
    }
    const [editUserData, setEditUserData] = useState(userDataRender);

    async function handleSubmit(deleteData) {
        console.log(deleteData);
        try {
            let editData = deleteData ? deleteData : editUserData; // si la data llega por parámetro, es porque estámos eliminando la cuenta.
            if (editData && !editData.firstName.trim().length)
                Swal.fire("El primer nombre no puede estar vacío!");

            else {
                if (emailRegex.test(editData.email)) {
                    const { data } = await axios.put(`${API_URL}/user/${id}`, editData);
                    setIsValidEmail(true);
                    // console.log(data);
                    if (deleteData) {
                        setReloadPage(!reloadPage);
                        Swal.fire("Su cuenta ha sido eliminada!");
                        handleSignOut(); // si eliminamos la cuenta, debemos cerrar sesión.
                    }
                    else {
                        setReloadPage(!reloadPage);
                        Swal.fire("Usuario actualizado con éxito!");
                    }
                }
                else {
                    setIsValidEmail(false);
                }
            }
        } catch (error) {
            console.error(error.message);
        }
    }

    function handlerComponent(e) {
        const id = e.target.id;
        setMainComponent(id);
    }

    async function handleSignOut() {
        try {
            // solo usamos el logOut de Firebase si el usuario es externo(externalSignIn en true)
            if (userDataRender.externalSignIn && logOut) await logOut();
            // reseteamos la data a renderizar y el local storage y automáticamente eso nos redirige al home.
            localStorage.removeItem('currentUser');
            localStorage.removeItem('currentCart');
            dispatch(quantityCartAction(0));
            dispatch(getCurrentUserAction(null));
            dispatch(cartAction(null));
            // y nos aseguramos de irnos al home ya que hicimos un log out.
            navigate('/');
        } catch (error) {
            console.error(error.message);
        }
    }

    async function handleUserData() {
        setLoading(true);
        try { // recuperamos toda la data necesaria del usuario en la base de datos, para renderizarla en su perfil.
            const userDataLocalStorage = await getLocalStorageData('currentUser'); // una vez finalizada esta función, seteamos el loading en false y se muestra la página recargada.
            const userData = JSON.parse(userDataLocalStorage);
            if (userData) { // hacemos la petición con el email ya que es lo primero que tenemos de Firebase, ellos no nos entregan un id.
                const { data } = await axios(`${API_URL}/user?email=${userData.user.email}&externalSignIn=${userData.user.externalSignIn}`);
                // console.log(data);
                if (data.active) { // solo si la cuenta del usuario está activa.
                    const userPurchasesData = await axios(`${API_URL}/purchases/${id}`);
                    console.log(userPurchasesData.data);
                    const findNullValue = Object.values(data).reduce((acc, value) => {
                        if (value === null) {
                            return acc + 1;
                        }
                        return acc;
                    }, 0);
                    const nullFormat = 7 - findNullValue;
                    const percent = Math.ceil((nullFormat * 100) / 7);
                    setDataProgress(`${percent.toString()}`);
                    // console.log(findNullValue);
                    if (findNullValue > 0) setNotify({ ...notify, userDataMissing: 'Complete la información de su perfil' })
                    if (!findNullValue) setNotify({ ...notify, userDataMissing: null });
                    if (userPurchasesData) setUserPurchases(userPurchasesData.data);
                    dispatch(getCurrentUserAction(data));
                    setEditUserData(data); // seteamos el estado local para mostrar la data del usuario en la tabla "Edit".
                    setLoading(false);
                }
                else navigate('/');
            }
            else navigate('/'); // significa que no hay nada en el local storage.
        } catch (error) {
            setUserPurchases([]); // ante cualquier error seteamos un array vacío para que no se rompa el componente.
            console.error(error.message);
            navigate('/');
        }
    }

    useEffect(() => { // si user existe (si está logeado) entonces se redirige al home.
        window.scrollTo(0, 0);
        handleUserData();
    }, [user, reloadPage]);
    return (
        <div className={styles.mainView}>
            {loading ?
                <Loading /> :
                <div className={styles.subMainView}>
                    <div className={styles.sideBarContainer}>
                        <div className={styles.headerSection}>
                            <div className={styles.userDataPreview}>
                                <div className={styles.imgContainer}>
                                    <div>
                                        {imgUser ?
                                            <img src={imgUser} alt="" /> :
                                            <p>{firstName}{lastName}</p>
                                        }
                                    </div>
                                </div>
                                <p className={styles.name}>{upperLowerCase(firstNameFull)} {upperLowerCase(lastNameFull)}</p>
                                <p className={styles.userCode}>Código de usuario: {id}</p>
                            </div>
                            <div className={styles.buttonsContainer}>
                                <div className={mainComponent === 'editUser' ? styles.selectedProfile : styles.editProfile} id='editUser' onClick={handlerComponent}>
                                    <i className="fa-regular fa-pen-to-square" id='editUser' onClick={handlerComponent}></i>
                                    <p id='editUser' onClick={handlerComponent}>Editar</p>
                                    {notify.userDataMissing && <div className={styles.circleNotify}></div>}
                                </div>
                                <div onClick={handleSignOut} className={styles.editProfile}>
                                    <p onClick={handleSignOut}>Cerrar sesión</p>
                                </div>
                            </div>
                            <div className={styles.progressContainer}>
                                <div className={styles[`class${dataProgress}`]}>
                                    <p>{dataProgress}%</p>
                                </div>
                            </div>
                        </div>
                        <div className={styles.footerSideSection}>
                            <div className={mainComponent === 'purchasesTable' ? styles.divSelected : styles.div} id='purchasesTable' onClick={handlerComponent}>
                                <i className="fa-solid fa-cart-shopping" id='purchasesTable' onClick={handlerComponent}></i>
                                <p id='purchasesTable' onClick={handlerComponent}>Historial de compra</p>
                            </div>
                            <div className={mainComponent === 'favorites' ? styles.divSelected : styles.div} id='favorites' onClick={handlerComponent}>
                                <i className='bx bx-bookmark' id='favorites' onClick={handlerComponent}></i>
                                <p id='favorites' onClick={handlerComponent}>Mi colección</p>
                            </div>
                            {/* <div className={mainComponent === 'orders' ? styles.divSelected : styles.div} id='orders' onClick={handlerComponent}>
                                <i className="fa-solid fa-truck" id='orders' onClick={handlerComponent}></i>
                                <p id='orders' onClick={handlerComponent}>Mis órdenes</p>
                            </div> */}
                            {/* <div className={mainComponent === 'reviews' ? styles.divSelected : styles.div} id='reviews' onClick={handlerComponent}>
                                <i className="fa-solid fa-magnifying-glass" id='reviews' onClick={handlerComponent}></i>
                                <p id='reviews' onClick={handlerComponent}>Mis reviews</p>
                            </div> */}
                        </div>
                    </div>
                    <div className={styles.mainComponentsContainer}>
                        {mainComponent === 'purchasesTable' &&
                            <div className={styles.componentContainer}>
                                {/* <p className={styles.titleMain}>Historial de compra:</p> */}
                                {(editUserData && userPurchases && userPurchases?.length) ? userPurchases?.map((purchase, i) => {
                                    return <Table key={i} records={purchase} userId={editUserData.id} />
                                })
                                    :
                                    <div>
                                        <p>No registra órdenes</p>
                                    </div>
                                }
                            </div>}
                        {mainComponent === 'editUser' &&
                            <div className={styles.componentContainer}>
                                <EditUser notify={notify} editUserData={editUserData} setEditUserData={setEditUserData} isValidEmail={isValidEmail} handleSubmit={(e) => handleSubmit(e)} />
                            </div>}
                        {mainComponent === 'favorites' &&
                            <div className={styles.componentContainer}>
                                {editUserData?.favorites.length ?
                                    <Favorites userDataRender={editUserData} setReloadPage={setReloadPage} reloadPage={reloadPage} />
                                    :
                                    <div>
                                        <p>Colección sin productos</p>
                                    </div>
                                }
                            </div>}
                    </div>
                </div>
            }
        </div>
    );
}

export default UserProfile;