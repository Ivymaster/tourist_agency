/* eslint-disable */

import { showAlert } from './alerts.js';

 const ponudaFilterForm = $('#ponudaFormFilter');
 
 Handlebars.registerHelper('subString', function(predanaRijec, pocetak, kraj) {
    var krajnjaRijec = predanaRijec.toString().substring(pocetak, kraj);
   return new Handlebars.SafeString(krajnjaRijec)
 });
 
 Handlebars.registerHelper('specificElement', function(niz, pozicijaElementa) {
   var element = niz[pozicijaElementa];
  return new Handlebars.SafeString(element)
 });

 Handlebars.registerHelper('prikazSlobodnihMjesta', function(datumi, slobodni) {
  for(let el in datumi){
    if(new Date(datumi[el])>=new Date()){
      return new Handlebars.SafeString(slobodni[el]);
    }
  }
  return new Handlebars.SafeString(slobodni[0]);
});


Handlebars.registerHelper('datumPonudeNaPrikazuPonuda', function(datumi) {
  for(let el in datumi){
    if(new Date(datumi[el])>=new Date()){
      return new Handlebars.SafeString(datumi[el]);
    }
  }
  return new Handlebars.SafeString(datumi[datumi.length-1]);
}); 
/////////////////////////////////////////
/// SIGN UP //////////////////////
const pretragaPonuda = async (
  query, pocetniDatum, krajnjiDatum, pocetnaCijena, krajnjaCijena
) => {
  try {
    //axios.defaults.headers.post['Content-Type'] = 'text/plain';
 
    const res = await axios.get(`/ponude/pretraga?query=${query}&pocetniDatum=${pocetniDatum}&krajnjiDatum=${krajnjiDatum}&pocetnaCijena=${pocetnaCijena}&krajnjaCijena=${krajnjaCijena}`);
    console.log(res)
    let ponude = res.data.data.data;
     document.querySelector("#sve-ponude").innerHTML = "";
    let template=  $("#ponude-template").html();
    var templateScript = Handlebars.compile(template);
    var html = templateScript({ponude});
    document.querySelector("#sve-ponude").insertAdjacentHTML('beforeend', html);
 

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
    let pocetnaCijena = $('#pocetnaCijena-FilterForma').val();
    let krajnjaCijena = $('#krajnjaCijena-FilterForma').val();

    if(pocetniDatum==""){
        pocetniDatum = "1999-01-01";
    }
    if(krajnjiDatum==""){
        krajnjiDatum = "9999-01-01";
    }
    if(pocetnaCijena==""){
        pocetnaCijena = "0";
    }
    if(krajnjaCijena==""){
        krajnjaCijena = "999999999";
    }
    pretragaPonuda(query, pocetniDatum, krajnjiDatum, pocetnaCijena, krajnjaCijena)
  });


 