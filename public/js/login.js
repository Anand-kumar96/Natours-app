/*eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

//LOGIN API CALL
export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email: email,
        password: password
      }
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

//LOGOUT API CALL
export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Logged out successfully!!');
      window.setTimeout(() => {
        location.assign('/login'); 
      }, 1500);
    }
  } catch (err) {
    showAlert('error', 'Error logging out! try again');
  }
};
