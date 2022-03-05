/* eslint-disable */

import { showAlert } from "../alerts.js";

/////////////////////////////////////////
/// SIGN UP //////////////////////

const registerUser = async (
  userName,
  firstName,
  lastName,
  email,
  password,
  passwordConfirm,
  role
) => {
  try {
    axios.defaults.headers.post["Content-Type"] = "text/plain";

    const res = await axios.post("/api/v2/register", {
      userName,
      firstName,
      lastName,
      email,
      password,
      passwordConfirm,
      role,
    });
    if (res.data.status === "success") {
      showAlert("success", `Welcome ${userName}, thank you for registering!`);
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (err) {
    console.log(err);
    showAlert("error", err.response.data.message);
  }
};

//////////////////////////////
///LISTENERI/////////////////
const registerForm = $("#registerForm");

if (registerForm)
  registerForm.on("submit", (e) => {
    e.preventDefault();
    const userName = $("#userName").val();
    const firstName = $("#firstName").val();
    const lastName = $("#lastName").val();
    const email = $("#email").val();
    const password = $("#password").val();
    const passwordConfirm = $("#passwordConfirm").val();
    const role = $("#role").val();
    console.log(
      userName,
      firstName,
      lastName,
      email,
      password,
      passwordConfirm,
      role
    );
    registerUser(
      userName,
      firstName,
      lastName,
      email,
      password,
      passwordConfirm,
      role
    );
  });
