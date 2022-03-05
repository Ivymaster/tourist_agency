/* eslint-disable */

import { showAlert } from './alerts.js';

 const ponudaFilterForm = $('#korisnikFormFilter');
 
 Handlebars.registerHelper('subString', function(predanaRijec, pocetak, kraj) {
    var krajnjaRijec = predanaRijec.toString().substring(pocetak, kraj);
   return new Handlebars.SafeString(krajnjaRijec)
 });
 
 Handlebars.registerHelper('specificElement', function(niz, pozicijaElementa) {
   var element = niz[pozicijaElementa];
  return new Handlebars.SafeString(element)
 });

 Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});
Handlebars.registerHelper('ifNotEquals', function(arg1, arg2, options) {
  return arg1 != arg2 ? options.fn(this) : options.inverse(this);
});

/*
hbs.registerHelper('ifEquals', function(arg1, arg2, options) {
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});
hbs.registerHelper('ifNotEquals', function(arg1, arg2, options) {
  return arg1 != arg2 ? options.fn(this) : options.inverse(this);
}); */
/////////////////////////////////////////
/// SIGN UP //////////////////////
const pretragaKorisnika = async (
  query, pocetniDatum, krajnjiDatum
) => {
  try {
    //axios.defaults.headers.post['Content-Type'] = 'text/plain';
 
    const res = await axios.get(`/korisnici/pretraga?korisnickoIme=${query}&datumKreacije[gte]=${pocetniDatum}&datumKreacije[lte]=${krajnjiDatum}`);
    console.log(res.data.data.data)
    let korisnici = res.data.data.data;
     document.querySelector("#svi-korisnici").innerHTML = "";
    let template=  $("#korisnici-template").html();
    var templateScript = Handlebars.compile(template);
    var html = templateScript({korisnici});
    document.querySelector("#svi-korisnici").insertAdjacentHTML('beforeend', html);
 

  } catch (err) {
    console.log(err);

    showAlert('error', err.response.data.message);
  }
};

 
//////////////////////////////
///LISTENERI/////////////////

if (ponudaFilterForm)
ponudaFilterForm.on('submit', e => {
    e.preventDefault();
    let query = $('#query-FilterForma').val();
    let pocetniDatum = $('#pocetniDatum-FilterForma').val();
    let krajnjiDatum = $('#krajnjiDatum-FilterForma').val();

    if(pocetniDatum==""){
        pocetniDatum = "1999-01-01";
    }
    if(krajnjiDatum==""){
        krajnjiDatum = "9999-01-01";
    }
    pretragaKorisnika(query, pocetniDatum, krajnjiDatum)
  });


 