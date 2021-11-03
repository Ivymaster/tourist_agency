/* eslint-disable */

import { showAlert } from './alerts.js';
import { kupovanjePonude } from './stripe.js';
/////////////////////////////////////////
/// SIGN UP //////////////////////
const brisanjePonude = async (id) => {
  try {
    axios.defaults.headers.post['Content-Type'] = 'text/plain';

    const res = await axios.delete(`/ponude/${id}`, {
        params:{id},
    });
    console.log(res);

    if (res.status === 200) {
      showAlert(
        'success',
        `Obrisana ponuda!`
      );
      window.setTimeout(() => {
        location.assign(`/ponude`);
      }, 1500);
    }
  } catch (err) {
    console.log(err);

    showAlert('error', err.response.data.message);
  }
};

const vratiPonudu = async (id) => {
  try {
    axios.defaults.headers.post['Content-Type'] = 'text/plain';

    const res = await axios.put(`/ponude/${id}`, {
        params:{id},
    });
    console.log(res);

    if (res.status === 200) {
      showAlert(
        'success',
        `Objavljena ponuda!`
      );
      window.setTimeout(() => {
        location.assign(`/ponude`);
      }, 1500);
    }
  } catch (err) {
    console.log(err);

    showAlert('error', err.response.data.message);
  }
};

const rezerviranjePonude = async ( brojKarata,id,sobe,dodatak, datum) => {
  try {
    axios.defaults.headers.post['Content-Type'] = 'text/plain';

    const res = await axios.post(`/rezervacije/${id}`, {
      brojKarata,
      sobe,
      dodatak,
      datum
    });
    console.log(res)
    if (res.status === 201) {
      showAlert(
        'success',
        `Rezervirana ponuda!`
      ); 
    }
  } catch (err) {
    console.log(err);

    showAlert('error', err.response.data.message);
  }
};
//////////////////////////////
///LISTENERI/////////////////
 
const deletePonuduBtn = $('#deletePonudu');
const vratiPonuduBtn = $('#vratiPonudu');
const rezerviranjeBtn = $('#rezerviranjeBtn');
const kupovanjeBtn = $('#kupovanjeBtn');
 
if (deletePonuduBtn)
deletePonuduBtn.on('click', e => {
    e.preventDefault();
    const id = deletePonuduBtn.data("value");
    brisanjePonude(id);
  });
 
  if (vratiPonuduBtn)
  vratiPonuduBtn.on('click', e => {
    e.preventDefault();
    const id = vratiPonuduBtn.data("value");
    vratiPonudu(id);
  });

  if (rezerviranjeBtn)
  rezerviranjeBtn.on('click', e => {
    e.preventDefault();
    const karte = $('#karte').val();
    const id = rezerviranjeBtn.val();
    let jednosobna = parseInt($('#jednosobne').val());
    let dvosobna = parseInt($('#dvosobne').val());
    let trosobna = parseInt($('#trosobne').val());
    
    if(!jednosobna){
      jednosobna = 0;

    }
    if(!dvosobna){
      dvosobna = 0;

    }
    if(!trosobna){
      trosobna = 0;

    }
    if(karte != (jednosobna + dvosobna*2 + trosobna*3)){
      showAlert('error', "Broj osoba po sobama, i broj karata se ne podudaraju!");
      $("kreranjeRezervacijeForma")[0].reset();
      return;
    }
    if(karte<=0  || jednosobna<0 || dvosobna<0 || trosobna<0){
      showAlert('error', "Broj karata nije validan!");
      $("kreranjeRezervacijeForma")[0].reset();
      return;
    }
    const dodatak = jednosobna*parseInt($('#dodatak').val());;
    const sobe = `Jednosobnih: ${jednosobna} - Dvosobne: ${dvosobna} - Trosobna: ${trosobna}`;

    let datum =  $('#datum').val() ;
      rezerviranjePonude(karte,id, sobe, dodatak, datum);

  });
 

  if (kupovanjeBtn)
  kupovanjeBtn.on('click', e => {
    e.preventDefault();
    const karte = $('#karte').val();
    const id = rezerviranjeBtn.val();
    let jednosobna = parseInt($('#jednosobne').val());
    let dvosobna = parseInt($('#dvosobne').val());
    let trosobna = parseInt($('#trosobne').val());

    if(!jednosobna){
      jednosobna = 0;

    }
    if(!dvosobna){
      dvosobna = 0;

    }
    if(!trosobna){
      trosobna = 0;

    }
    if(karte != (jednosobna + dvosobna*2 + trosobna*3)){
      showAlert('error', "Broj osoba po sobama, i broj karata se ne podudaraju!");
      $("kreranjeRezervacijeForma")[0].reset();
      return;
    }
    if(karte<=0  || jednosobna<0 || dvosobna<0 || trosobna<0){
      showAlert('error', "Broj karata nije validan!");
      $("kreranjeRezervacijeForma")[0].reset();
      return;
    }
    const dodatak = jednosobna*parseInt($('#dodatak').val());;
    const sobe = `Jednosobnih: ${jednosobna} - Dvosobne: ${dvosobna} - Trosobna: ${trosobna}`;
    let datum =  $('#datum').val() ;
    console.log(id, karte, dodatak, sobe, datum, undefined)
    kupovanjePonude(id, karte, dodatak, sobe, datum, undefined);
  });


  $(".prikaz-slika-ponud").owlCarousel({
    loop:true,
    margin:30,
    responsiveClass:true,
    responsive:{
        0:{
            items:1,
            nav:true
        },
    }
});