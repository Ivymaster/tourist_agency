const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userShema = new mongoose.Schema({
  userName: {
    type: String,
    unique: true,
    required: [true, "Username is required!"],
  },
  firstName: {
    type: String,
    required: [true, "Firstname is required!"],
  },
  lastName: {
    type: String,
    required: [true, "Lastname is required!"],
  },
  email: {
    type: String,
    required: [true, "Email address is required!"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Email address format is not valid!"],
  },
  photo: String,
  role: {
    type: String,
    enum: {
      values: ["super-admin", "employee", "customer"],
      message: "Invalid user role!",
    },
    required: [true, "Define customer role!"],
    default: "customer",
  },
  password: {
    type: String,
    required: [true, "Password is required!"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Password confirmation is required!"],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (passwordConfirm) {
        return passwordConfirm === this.password;
      },
      message: "Password and confirmation values do not match!",
    },
  },
  passwordChangedAt: Date,
  resetToken: String,
  resetTokenExpiresAt: Date,
  isActive: {
    type: Boolean,
    default: true,
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

/** DOCUMENT MIDDLEWARE */
userShema.pre("save", async function (next) {
  // pasword hashing
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userShema.pre("save", function (next) {
  // updating the date of password change
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
/** END - DOCUMENT MIDDLEWARE */

////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

/** INSTANCE METHODS */
userShema.methods.passwordHashCheck = async function (
  attemptedPassword,
  password
) {
  return await bcrypt.compare(attemptedPassword, password);
};

userShema.methods.isPasswordChangeAtTimestampGreater = function (timestamp) {
  if (this.passwordChangedAt) {
    const passwordChangedAtTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return passwordChangedAtTimestamp > timestamp;
  }
  return false;
};

userShema.methods.createPasswordResetToken = function () {
  const newResetToken = crypto.randomBytes(32).toString("hex");

  this.resetToken = crypto
    .createHash("sha256")
    .update(newResetToken)
    .digest("hex");

  this.resetTokenExpiresAt = Date.now() + 10 * 60 * 1000;

  return newResetToken;
};
/** END - INSTANCE METHODS */

const User = mongoose.model("User", userShema);

module.exports = User;
