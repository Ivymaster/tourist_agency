/* eslint-disable */

import { showAlert } from './alerts.js';
/////////////////////////////////////////
/// SIGN UP //////////////////////
const izmjenaPonude = async (id,data
) => {
 
  try {
    axios.defaults.headers.post['Content-Type'] = 'text/plain';
     const res = await axios.patch(`/ponude/${id}`, 
         data
    );
 
    if (res.data.status === 'success') {
      showAlert(
        'success',
        `Izmijenjena ponuda!`
      );
      window.setTimeout(() => {
        location.assign(`/ponude/${id}`);
      }, 1500);
    }
  } catch (err) {
    console.log(err);

    showAlert('error', err.response.data.message);
  }
};

//////////////////////////////
///LISTENERI/////////////////
$('#datumi').multiDatesPicker({
    dateFormat: "yy/mm/dd",
}
);

let brojac = $('#drzacBrojaDana').text()-1;
 
const ponudaForm = $('#ponudaForm');
const odabirPozicijeBtn = $('#confirmPosition');
const lokacije = $('#lokacije');

const dodajDan = $('#dodaj-dan');
const obrisiDan = $('#obrisi-dan');


if (dodajDan)
    dodajDan.on('click', e => {
    e.preventDefault();
    brojac=brojac+1;
    $('#adrese').append(`<input class="form-control" type="text" placeholder="Dodaj adrese" value=""
    name="cijena" id="dan-${brojac}" />`);
  });

  if (obrisiDan)
  obrisiDan.on('click', e => {
    e.preventDefault();
    $(`#dan-${brojac}`).remove();
    if(brojac>-1){
        brojac=brojac-1;
    }
  });

var lp = new locationPicker('map', {
    setCurrentPosition: true, // You can omit this, defaults to true
  }, {
    zoom: 15 // You can set any google map options here, zoom defaults to 15
  });

if (odabirPozicijeBtn)
  odabirPozicijeBtn.on('click', e => {
    e.preventDefault();
     var location = lp.getMarkerPosition();
 	lokacije.val(lokacije.val() + "--" + location.lat + "," + location.lng);
  });

if (ponudaForm)
    ponudaForm.on('submit', e => {
    e.preventDefault();
    const id = $('#izmjenaButton').val();
    const naziv = $('#naziv').val();
    const duracija = $('#duracija').val();
    const velicinaGrupe = $('#velicinaGrupe').val();
    const cijena = $('#cijena').val();
    const dodatak = $('#dodatak').val();
    const opis = $('#opis').val().replaceAll("\n", "br>");
    const datumi = $('#datumi').val().replaceAll(", ",",").split(",");
    const lokacije = $('#lokacije').val().split("--");
      console.log(lokacije);
      window.setTimeout(() => { 
      }, 9500);
    let adreseLokacija = [];
     for(let i = 0;i<=brojac;i++){
        adreseLokacija.push($(`#dan-${i}`).val());
    }
 
    let vodici = $('#vodici').val();
 
 
    const form = new FormData();
    form.append('id',id );
    form.append('naziv', naziv);
    form.append('duracija',duracija  );
    form.append('velicinaGrupe',velicinaGrupe );
    form.append('cijena', cijena);
    form.append('dodatak', dodatak);
    form.append('opis', opis );
    form.append('datumi',  JSON.stringify(datumi));
    form.append('kljucneRijeci',  JSON.stringify($('#kljucneRijeci').val().split(", ")));
    form.append('lokacije', JSON.stringify(lokacije));
    form.append('vodici', JSON.stringify(vodici));
    form.append('adreseLokacija', JSON.stringify(adreseLokacija));
    form.append('pocetnaSlika', document.getElementById("pocetnaSlika").files[0]);
    const slike = document.getElementById("slike").files;
 
    for(let i = 0; i<slike.length;i++){
      form.append('slike',slike[i]);
    }
 
      izmjenaPonude(id, form);

  
  });
 
 

 
