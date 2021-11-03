/* eslint-disable */

import { showAlert } from './alerts.js';


/////////////////////////////////////////
/// SIGN UP //////////////////////
const signUp = async (
  username,
  firstname,
  lastname,
  email,
  password,
  passwordConfirm,
  role
) => {
  try {
    axios.defaults.headers.post['Content-Type'] = 'text/plain';

    const res = await axios.post('/podatci/korisnici/registracija', {
      username,
      firstname,
      lastname,
      email,
      password,
      passwordConfirm,
      role
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        `Dobrodošli, ${username}, hvala Vam na prijavljivanju!`
      );
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

//////////////////////////////
///LISTENERI/////////////////
const signUpForm = $('#signUpForm');

if (signUpForm)
  signUpForm.on('submit', e => {
    e.preventDefault();
    const username = $('#signUp-username').val();
    const firstname = $('#signUp-firstname').val();
    const lastname = $('#signUp-lastname').val();
    const email = $('#signUp-email').val();
    const password = $('#signUp-password').val();
    const passwordConfirm = $('#signUp-passwordConfirm').val();
    const role = $('#signUp-role').val();
    console.log(role);
    signUp(
      username,
      firstname,
      lastname,
      email,
      password,
      passwordConfirm,
      role
    );
  });
