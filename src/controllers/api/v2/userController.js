const multer = require("multer");
const sharp = require("sharp");
const User = require("../../../models/User");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/appError");
const factory = require("../../handlerFactory");

const multerSpremiste = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Predana datoteka mora biti slika", 400), false);
  }
};

const ucitavanje = multer({
  storage: multerSpremiste,
  fileFilter: multerFilter,
});

exports.ucitavanjeKorisnickeSlike = ucitavanje.single("fotografija");

exports.redimenzionisanjeKorisnickeSlike = catchAsync(
  async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `korisnik-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({ quality: 100 })
      .toFile(`public/img/korisnici/${req.file.filename}`);

    next();
  }
);

//////////////////////

/////////////////////////
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Postavljanje podataka za dobijanje podataka o trenutnom korisniku
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );
  }
  const filteredBody = filterObj(
    req.body,
    "ime",
    "prezime",
    "korisnickoIme",
    "email"
  );
  if (req.file) filteredBody.fotografija = req.file.filename;

  const azuriraniKorisnik = await User.findByIdAndUpdate(
    req.user.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      user: azuriraniKorisnik,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getKorisnik = factory.getOne(User);
exports.getAll = factory.getAll(User);

exports.updateKorisnik = factory.updateOne(User);
exports.deleteKorisnik = factory.deleteOne(User);
