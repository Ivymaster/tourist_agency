const multer = require("multer");
const sharp = require("sharp");
const User = require("../models/User");
const Rezervacija = require("../models/rezervacijaModel");
const Ponuda = require("../models/ponudaModel");
const catchAsync = require("../utils/catchAsync");
const { ponudaForma } = require("./ponudaController");

exports.zaradaPoMjesecima = catchAsync(async (req, res, next) => {
  let pocetniDatum = new Date("1999-01-01");
  let krajnjiDatum = new Date("2999-01-01");

  if (req.query.datumKreacije) {
    pocetniDatum = new Date(req.query.datumKreacije.gte);
    krajnjiDatum = new Date(req.query.datumKreacije.lte);
  }
  console.log(pocetniDatum);
  let rezervacije = await Rezervacija.aggregate([
    {
      $match: {
        status: "placeno",
        datumPlacanja: {
          $lte: krajnjiDatum,
          $gte: pocetniDatum,
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$datumPlacanja" },
        },
        datumKreacije: { $first: "$datumKreacije" },
        datumPlacanja: { $first: "$datumPlacanja" },
        brojRezervacija: { $sum: 1 },
        zarada: { $sum: "$cijena" },
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        datumPlacanja: 1,
      },
    },
  ]);
  let ponudeZarada = await Rezervacija.aggregate([
    {
      $match: {
        status: "placeno",
        datumPlacanja: {
          $lte: krajnjiDatum,
          $gte: pocetniDatum,
        },
      },
    },
    {
      $group: {
        _id: "$ponuda",
        ponuda: { $first: "$ponuda" },
        zarada: { $sum: "$cijena" },
      },
    },
    {
      $lookup: {
        from: "ponudas",
        localField: "ponuda",
        foreignField: "_id",
        as: "inventory_docs",
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        datumKreacije: 1,
      },
    },
  ]);

  /*let mjeseciZarada = await Rezervacija.aggregate([
        {
          $match: {
            status : "obrisano"
        },
      }, 
      {
        $group: {
            _id: {
                $dateToString: { format: "%Y-%m",  date: '$datumKreacije'  },
            },
            datumKreacije:  {$first: "$datumKreacije"}, 
            brojRezervacija: { $sum: 1 },
            zarada: { $sum: "$cijena" },
        },
      },
      {
        $project: {
          _id: 0
        }
      },
      {
          $sort: {
              datumKreacije: 1,
          }
      }
      ]); */

  let rezervacije2 = await Rezervacija.aggregate([
    {
      $match: {
        status: "placeno",
        datumPlacanja: {
          $lte: krajnjiDatum,
          $gte: pocetniDatum,
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m", date: "$datumPlacanja" },
        },
        datumPlacanja: { $first: "$datumPlacanja" },
        brojRezervacija: { $sum: 1 },
        zarada: { $sum: "$cijena" },
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        datumPlacanja: 1,
      },
    },
  ]);

  rezervacije = JSON.stringify(rezervacije);
  ponudeZarada = JSON.stringify(ponudeZarada);
  rezervacije2 = JSON.stringify(rezervacije2);

  res.status(200).render("statistika", {
    rezervacije,
    ponudeZarada,
    rezervacije2,
    status: req.status,
  });
});
