/* eslint-disable */

import { showAlert } from './alerts.js';
/////////////////////////////////////////
/// SIGN UP //////////////////////
const kreirajOglas = async  (id,data) => {
  try {
    axios.defaults.headers.post['Content-Type'] = 'multipart/form-data';

    const res = await axios({
        method: 'POST',
        url:"/oglasi/podatci",
        data
      });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        `Kreiran oglas!`
      );
      window.setTimeout(() => {
        location.assign('/oglasi');
      }, 1500);
    }
  } catch (err) {
    console.log(err);

    showAlert('error', err.response.data.message);
  }
};

//////////////////////////////
///LISTENERI/////////////////
 

const oglasForm = $('#oglasFormBtn');
 
$("#zaposlenik").hide();
$("#zaposlenik-label").hide();
 
$("#status").change(function() {
  if($(this).val()=="specificni"){
    $("#zaposlenik").show();
    $("#zaposlenik-label").show();
  }else{
    $("#zaposlenik").hide();
  $("#zaposlenik-label").hide();
  }
});

if (oglasForm)
oglasForm.on('click', e => {
    e.preventDefault();
    const naslov = $('#naslov').val();
    const sazetak = $('#sazetak').val().replaceAll("\n","<br>");
    const sadrzaj = $('#sadrzaj').val().replaceAll("\n","<br>");
    const status = $('#status').val();
    const zaposlenik = $('#zaposlenik').val();
    console.log(naslov, sadrzaj, status, zaposlenik);

    let form = new FormData();
    form.append('naslov',naslov );
    form.append('sazetak', sazetak);
    form.append('sadrzaj', sadrzaj);
    form.append('status',status  );
    form.append('zaposlenik',JSON.stringify(zaposlenik) );
    form.append('dokumentiPutanje', "")
    const dokumenti = document.getElementById("dokumenti").files;
    
    for(let i = 0; i<dokumenti.length;i++){
        form.append('dokumenti',dokumenti[i]);
        console.log(dokumenti[i]);

      }
    kreirajOglas(2,form);
  });
 
 
