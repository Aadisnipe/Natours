/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alert';
export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Logged In Successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1200);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

export const logout = async (email, password) => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    if (res.data.status === 'success') {
      location.assign('/');
    }
  } catch (error) {
    showAlert('error', 'Error logging out please try again');
  }
};
