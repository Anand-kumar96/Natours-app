/*eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
export const signup = async data => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: data
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Signup successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert(
      'error',
      err.response.data.message.startsWith('User validation failed')
        ? err.response.data.message.split(':')[2]
        : err.response.data.message.startsWith('E11000')
        ? 'User already exist!!.'
        : err.response.data.message
    );
  }
  document.getElementById('signUp').textContent = 'Sign Up';
};
