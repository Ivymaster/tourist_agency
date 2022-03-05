/* eslint-disable */

import { showAlert } from './alerts.js';

let deleteOglasBtn = $('.deleteOglasBtn');
const signUpForm = $('#oglasiFormFilter');


Handlebars.registerHelper('ifDoubleEquals', function(arg1, arg2, arg3, options) {
  return arg1 == arg2 || arg1 == arg3
    ? options.fn(this)
    : options.inverse(this);
});
 /////////////////////////////////////////
/// SIGN UP //////////////////////
const pretragaOglasa = async (status, pocetniDatum, krajnjiDatum) => {
  try {
    //axios.defaults.headers.post['Content-Type'] = 'text/plain';
 
    const res = await axios.get(`/oglasi/podatci?status=${status}&datumKreacije[gte]=${pocetniDatum}&datumKreacije[lte]=${krajnjiDatum}`);
    console.log(res.data)
    let noviOglasi = res.data.data.data;
    for(let i = 0; i<noviOglasi.length; i++){ 
      noviOglasi[i].datumKreacije = noviOglasi[i].datumKreacije.substring(0,10);
      noviOglasi[i].sazetak[0] = noviOglasi[i].sazetak[0].substring(0,150);
      noviOglasi[i].status = res.data.status2;
    }
    document.querySelector("#svi-oglasi").innerHTML = "";
    let template=  $("#oglas-template").html();
    var templateScript = Handlebars.compile(template);
    var html = templateScript({noviOglasi});
    document.querySelector("#svi-oglasi").insertAdjacentHTML('beforeend', html);

    deleteOglasBtn = $('.deleteOglasBtn');
    deleteOglasBtn.on('click', e => {
        e.preventDefault();
        const id = e.currentTarget.value.split("-")[1];
        deleteOglas(id)
        
      });

  } catch (err) {
    console.log(err);

    showAlert('error', err.response.data.message);
  }
};

const deleteOglas = async ( id  ) => {
    try {
      //axios.defaults.headers.post['Content-Type'] = 'text/plain';
   
      const res = await axios.delete(`/oglasi/podatci/${id}`);
       if (res.status === 204) {
        showAlert(
          'success',
          `Obrisan oglas!`
        );
        window.setTimeout(() => {
            let status = "generalni";
             pretragaOglasa(status, "1999-01-01", "9999-01-01"
            );
            
        }, 1500);
      }
        
    } catch (err) {
      console.log(err);
  
      showAlert('error', err.response.data.message);
    }
  };
//////////////////////////////
///LISTENERI/////////////////

if (signUpForm)
  signUpForm.on('submit', e => {
    e.preventDefault();
    let status = $('#status-FilterForma').val();
    let pocetniDatum = $('#pocetniDatum-FilterForma').val();
    let krajnjiDatum = $('#krajnjiDatum-FilterForma').val();
    if(pocetniDatum==""){
      pocetniDatum = "1999-01-01";
  }
  if(krajnjiDatum==""){
      krajnjiDatum = "9999-01-01";
  }
     pretragaOglasa(status, pocetniDatum, krajnjiDatum);
  });



if (deleteOglasBtn)
deleteOglasBtn.on('click', e => {
    e.preventDefault();
    const id = e.currentTarget.value.split("-")[1];
    console.log(id)

     deleteOglas(id)
;  });