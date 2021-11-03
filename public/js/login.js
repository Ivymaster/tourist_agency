/* eslint-disable */
import { showAlert } from './alerts.js';


/////////////////////////////////////////
/// LOG IN - OUT //////////////////////
const login = async (username, password) => {
  try {
    axios.defaults.headers.post['Content-Type'] = 'text/plain';

    const res = await axios.post('/podatci/korisnici/prijava', {
      username,
      password,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Uspješna prijava!');
      setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {

    showAlert('error', err.response.data.message);
  }
};

const logout = async () => {
  try {
    axios.defaults.headers.post['Content-Type'] = 'text/plain';

    const res2 = await axios.get('/podatci/korisnici/odjava');

    if ((res2.data.status = 'success')) location.reload(true);
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Pogreska prilikom prijave. Pokusajte ponovo!');
  }
};


/////////////////////////////////////////////////
// DODAVANJE LISTENERA /////////////////////////
//const loginForm = document.querySelector('#loginForm');
const logOut = $('#logOut');
const loginForm = $('#loginForm');

if (loginForm)
  loginForm.on('submit', e => {
    e.preventDefault();
    const username = $('#username').val();
    const password = $('#password').val();
     login(username, password);
  });

if (logOut) logOut.on('click', logout);
