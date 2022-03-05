import { showAlert } from './alerts.js';

  
  /////////////////////////////////////////
  /// kontakt //////////////////////
  const slanjeKontaktPoruke = async (ime, email, mob, sadrzaj) => {
    try {
      axios.defaults.headers.post['Content-Type'] = 'text/plain';
      let url = '/kontaktnaPoruka';
       const res = await axios.post(
        url,
  
        { ime, email, mob, sadrzaj }
      );

      if (res.data.status === 'success') {
        showAlert('success', 'Email je poslan!');
        window.setTimeout(() => {
          //location.assign('/contact');
        }, 1500);
      }
    } catch (err) {
        console.log(err)
      showAlert('error', err.response.data.message);
    }
  };
  
  //////////////////////////////
  ///LISTENERI/////////////////
  const sendMailBtn = document.querySelector('#send-mail-button');
  console.log("asdasdasdasdasdasds")
  if (sendMailBtn)
    sendMailBtn.addEventListener('click', e => {
      e.preventDefault();
      const ime = document.getElementById('kontakt-korisnickoIme').value;
      const email = document.getElementById('kontakt-email').value;
      const mob = document.getElementById('kontakt-mob').value;
      const sadrzaj = document.getElementById('kontakt-poruka').value;
  
      slanjeKontaktPoruke(ime, email, mob, sadrzaj);
    });
  