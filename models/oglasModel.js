// review / rating / createdAt / ref to tour / ref to user
const mongoose = require('mongoose');
const Ponuda = require('./ponudaModel');

const oglasSchema = new mongoose.Schema(
  {
    sadrzaj: [{
        type: String,
     }],
    sazetak: [{
      type: String,
   }],
    naslov: {
      type: String,
      required: [true, 'Oglas mora imati naslov!']
    },
    dokumenti: [String],
    datumKreacije: {
      type: Date,
      default: Date.now
    },
    zaposlenik: {
      type: [mongoose.Schema.ObjectId],
      ref: 'Korisnik',
      default: ""
    },
    zaposlenikTrenutni: {
      type: [mongoose.Schema.ObjectId],
      ref: 'Korisnik',
      default: ""
    },
    status: {
        type: String,
        enum: {
          values: ['generalni', 'agencijski', 'specificni'],
          message: 'Oglas mora imati status!'
        },
        required: [true, 'Oglas mora imati status!']
      },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);



oglasSchema.pre(/^find/, function(next) {
   this.populate({
     path: 'korisnik',
     select: 'korisnickoIme fotografija'
   });
   next();

  });

const Oglas = mongoose.model('Oglas', oglasSchema);

module.exports = Oglas;
