/* eslint-disable */

import { showAlert } from './alerts.js';

 const statForm = $('#dateFormFilter');
 /////////////////////////////////////////
/// SIGN UP //////////////////////
const pretragaStatistike = async (pocetniDatum, krajnjiDatum) => {
  try {
    //axios.defaults.headers.post['Content-Type'] = 'text/plain';
    if(new Date(pocetniDatum) > new Date(krajnjiDatum)){
        throw "Pogrešno unešeni datumi";
    }
    location.assign(`/statistika?datumKreacije[gte]=${pocetniDatum}&datumKreacije[lte]=${krajnjiDatum}`);

     

  } catch (err) {
    console.log(err);

    showAlert('error', err);
  }
};
 
//////////////////////////////
///LISTENERI/////////////////

if (statForm)
    statForm.on('submit', e => {
    e.preventDefault();
    let pocetniDatum = $('#pocetniDatum-FilterForma').val();
    let krajnjiDatum = $('#krajnjiDatum-FilterForma').val();
    if(pocetniDatum==""){
      pocetniDatum = "1999-01-01";
  }
  if(krajnjiDatum==""){
      krajnjiDatum = "9999-01-01";
  }
  pretragaStatistike(pocetniDatum, krajnjiDatum);
  });

 