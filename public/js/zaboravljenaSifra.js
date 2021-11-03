
import { showAlert } from './alerts.js';


/////////////////////////////////////////
/// LOG IN - OUT //////////////////////
const forgotPass = async email => {
  try {
    axios.defaults.headers.post['Content-Type'] = 'text/plain';

    const res = await axios.post(
      '/podatci/korisnici/zaboravljenaSifra',
      {
        email 
      }
    );
      console.log(res.data.status)
    if (res.data.status == "success") {
      console.log("sdsdsdsdsds")
      showAlert('success', 'Poslana poruka sa šifrom');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
const newPass = async (password, passwordConfirm, token) => {
  try {
    axios.defaults.headers.post['Content-Type'] = 'text/plain';

    const res = await axios.post(
      `/podatci/korisnici/resetSifre/${token}`,
      {
        password,
        passwordConfirm
      }
    );
      console.log(res);
    if (res.data.status === 'success') {
      showAlert('success', 'Šifra promijenjena');
      window.setTimeout(() => {
        location.assign('/prijava');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
/////////////////////////////////////////////////
// DODAVANJE LISTENERA /////////////////////////
const forgotPassForm = document.querySelector('#forgotPass');
const newPassForm = document.querySelector('#newForgotPass');

if (forgotPassForm)
  forgotPassForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    console.log(email);
    forgotPass(email);
  });

if (newPassForm)
  newPassForm.addEventListener('submit', e => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const token = document.getElementById('newForgotBtn').value;
    console.log();
    newPass(password, passwordConfirm, token);
  });
