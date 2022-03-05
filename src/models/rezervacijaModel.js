const mongoose = require('mongoose');

const rezervacijaSchema = new mongoose.Schema({
  cijena: {
    type: Number,
    require: [true, 'Rezervacija mora imati cijenu!']
  },
  dodatak: {
    type: Number,
    default: 0,
  },
  datumKreacije: {
    type: Date,
    default: Date.now()
  },
  datumPlacanja: {
    type: Date,
   },
   datumPocetkaPonude: {
    type: Date,
   },
  brojKarata: {
    type: Number,
    required: [true, 'Mora postojati broj karata!']
  },
  ponuda: {
    type: mongoose.Schema.ObjectId,
    ref: 'Ponuda',
    required: [true, 'Rezervacija mora odgovarati određenoj ponudi!']
  },
  korisnik: {
    type: mongoose.Schema.ObjectId,
    ref: 'Korisnik',
    required: [true, 'Rezervacija mora odgovarati određenom korisniku!']
  },
  status: {
    type: String,
    enum: {
      values: ['placeno', 'rezervirano', 'odbaceno', 'obrisano'],
    }},
  sobe: {
    type: String,
    required: [true, 'Mora postojati informacija o sobama!']

  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});
// Virtualno populiranje
rezervacijaSchema.virtual('recenzija', {
  ref: 'Recenzija',
  foreignField: 'rezervacija',
  localField: '_id',
  justOne : true

});
rezervacijaSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'ponuda',
    select: 'naziv brojSlobodnih pocetniDatumi'
  }). populate({
    path: "korisnik",
  });
  next();
});


const Rezervacija = mongoose.model('Rezervacija', rezervacijaSchema);

module.exports = Rezervacija;
