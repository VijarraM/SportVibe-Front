import axios from 'axios';

export async function allProducts(value) {
    const { data } = await axios.post('http:ncjnskjnkjcd', value);
    return data;
}

export async function allUsers(value) {
    const { data } = await axios('http:ncjnskjnkjcd', value);
    return data;
}