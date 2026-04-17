/*eslint-disable*/
// update Date
import axios from 'axios';
import { showAlert } from './alert';

export const updateSetting = async (type, data) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/update-my-password'
        : '/api/v1/users/update-me';
    const res = await axios({
      method: 'PATCH',
      url: url,
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', ` ${type.toUpperCase()} Updated Successfully !!`);
      location.reload(true);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
