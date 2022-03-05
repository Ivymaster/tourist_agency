/* eslint-disable */

import { showAlert } from './alerts.js';
import { kupovanjePonude } from './stripe.js';

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
  if (arg1 === arg2) {
    return options.fn(this);
  }

  return options.inverse(this);
});
Handlebars.registerHelper('datumPonudeNaRezervaciji', function(datumPocetka, datumi) {
  for(let el in datumi){
    if(new Date(datumi[el])>=new Date(datumPocetka)){
      return new Handlebars.SafeString(datumi[el]);
    }
  }
  return new Handlebars.SafeString(datumi[0]);
});
Handlebars.registerHelper('subString', function(predanaRijec, pocetak, kraj) {
  if(!predanaRijec) return false; 
   var krajnjaRijec = predanaRijec.toString().substring(pocetak, kraj);
  return new Handlebars.SafeString(krajnjaRijec)
});
Handlebars.registerHelper('ifGreaterThan', function(arg1, arg2, options) {
  return arg1 > arg2 ? options.fn(this) : options.inverse(this);
});
Handlebars.registerHelper('ifRange', function(arg1, arg2, arg3, options) {
  return arg1 > arg2 && arg1<arg3 ? options.fn(this) : options.inverse(this);
});
/////////////////////////////////////////
/// SIGN UP //////////////////////
const brisanjeRezervacije = async (id) => {
  try {
    axios.defaults.headers.post['Content-Type'] = 'text/plain';

    const res = await axios.delete(`/rezervacije/${id}`, {
        params:{id},
    });
    console.log(res.data);

    if (res.data.status === "success") {
      $(`#${id}`).hide(600);
      showAlert(
        'success',
        `Obrisana rezervacija!`
      );
    }
  } catch (err) {
    console.log(err);

    showAlert('error', err.response.data.message);
  }
};
 
const kreiranjeRecenzije = async (idRezervacije,ocjena, komentar) => {
  try {
    axios.defaults.headers.post['Content-Type'] = 'text/plain';
     const res = await axios.post(`/recenzije`, {
        idRezervacije,
        ocjena,
        komentar
    });
    console.log(res.data.status)
    if (res.data.status === "success") {
       showAlert(
        'success',
        `Dodana recenzija!`
      );
    }
  } catch (err) {
    console.log(err);

    showAlert('error', err.response.data.message);
  }
};

const pretragaRezervacija = async (query, pocetniDatum, krajnjiDatum, status) => {
  try {
    //axios.defaults.headers.post['Content-Type'] = 'text/plain';
 
    const res = await axios.get(`/rezervacije/podatci?query=${query}&datumKreacije[gte]=${pocetniDatum}&datumKreacije[lte]=${krajnjiDatum}&status=${status}`);
    
    let noveRezervacije = res.data.data.data;
    document.querySelector("#sve-rezervacije").innerHTML = "";

    if(noveRezervacije.length > 0){
        // Racunanje totalne cijene svih novih rezervacija
      let totalnaCijena = noveRezervacije.map(el=>{
        return el.cijena+el.dodatak;
      })
      totalnaCijena = totalnaCijena.reduce((a, b) => a + b);
      $("#totalnaCijenaRezervacija").html(totalnaCijena);

      // Ubacivanje novih rezervacija u template
      document.querySelector("#sve-rezervacije").innerHTML = "";
      let template=  $("#rezervacije-template").html();
      var templateScript = Handlebars.compile(template);
      var html = templateScript({noveRezervacije});
      document.querySelector("#sve-rezervacije").insertAdjacentHTML('beforeend', html);

      let brisanjePonudeBtn = $('.brisanjePonudeBtn');
      brisanjePonudeBtn.on('click', e => {
        e.preventDefault();
    
        const id = e.currentTarget.value;
        brisanjeRezervacije(id);
      });
    }else{
      $("#totalnaCijenaRezervacija").html(0);
    }

  } catch (err) {
    console.log(err);

    showAlert('error', err.response.data.message);
  }
};

//////////////////////////////
///LISTENERI/////////////////
 
const brisanjeRezervacijeBtn = $('.brisanjePonudeBtn');
if (brisanjeRezervacijeBtn)
brisanjeRezervacijeBtn.on('click', e => {
    e.preventDefault();
 
    const id = e.currentTarget.value;
    brisanjeRezervacije(id);
  });
  
const kupovinaBtn = $('.kupovanjeSaRezervacijBtn');
if (kupovinaBtn)
kupovinaBtn.on('click', e => {
    e.preventDefault();
    let podatci = e.currentTarget.value;
    podatci = podatci.split("--");
    kupovanjePonude(podatci[0], podatci[1], podatci[2], podatci[3], podatci[4], podatci[5]);

   });

   const recenzijaBtn = $('.recenzijaFormaBtn');
   if (recenzijaBtn)
   recenzijaBtn.on('click', e => {
       e.preventDefault();
       let id = e.currentTarget.value;
       const ocjena = $(`#ocjena-${id}`).val();
       const komentar = $(`#komentar-${id}`).val().trim();
       
       //kreiranjeRecenzije(id,ocjena,komentar);
      });
 
const rezervacijaFormFilter = $('#rezervacijaFormFilter');
if (rezervacijaFormFilter)
rezervacijaFormFilter.on('submit', e => {
    e.preventDefault();
    let query = $('#query-FilterForma').val();
    let status = $('#status-FilterForma').val();
    let pocetniDatum = $('#pocetniDatum-FilterForma').val();
    let krajnjiDatum = $('#krajnjiDatum-FilterForma').val();
    if(pocetniDatum==""){
      pocetniDatum = "1999-01-01";
  }
  if(krajnjiDatum==""){
      krajnjiDatum = "9999-01-01";
  }
     pretragaRezervacija(query, pocetniDatum, krajnjiDatum, status);
  });