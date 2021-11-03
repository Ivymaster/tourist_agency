/* eslint-disable */

import { showAlert } from './alerts.js';


/////////////////////////////////////////
/// update //////////////////////
const updateData = async data => {
  try {
    axios.defaults.headers.post['Content-Type'] = 'text/plain';

    const res = await axios.post(
      '/podatci/korisnici/azuriranjeProfila',

      data
    );
     if (res.data.status === 'success') {
      document.getElementById('userImage').src =
        '/img/korisnici/' + res.data.data.user.fotografija;
      showAlert('success', `Profil ažuriran`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

const updatePass = async (passwordCurrent, password, passwordConfirm) => {
  try {
    axios.defaults.headers.post['Content-Type'] = 'text/plain';

    const res = await axios.post(
      '/podatci/korisnici/azuriranjeSifre',

      { passwordCurrent, password, passwordConfirm }
    );

    if (res.data.status === 'success') {
      showAlert('success', `Profil ažuriran`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
//////////////////////////////
///LISTENERI/////////////////
const updateDataForm = $('#updateDataForm');
const updatePassword = $('#updatePasswordForm');

if (updateDataForm)
  updateDataForm.on('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('korisnickoIme', $('#update-username').val());
    form.append('prezime', $('#update-lastname').val());
    form.append('ime', $('#update-firstname').val());
    form.append('email', $('#update-email').val());
    form.append('fotografija', $('#update-photo').prop('files')[0]);
    updateData(form);
  });

if (updatePassword)
  updatePassword.on('submit', e => {
    e.preventDefault();
    
    const passwordCurrent = $('#old-password').val();
    const password = $('#update-password').val();
    const passwordConfirm = $('#update-passwordConfirm').val();
    updatePass(passwordCurrent, password, passwordConfirm);
  });
