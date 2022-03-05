/* eslint-disable */
import { showAlert } from "../alerts.js";

/////////////////////////////////////////
/// LOG IN - OUT //////////////////////
const login = async (userName, password) => {
  try {
    axios.defaults.headers.post["Content-Type"] = "text/plain";

    const res = await axios.post("/api/v2/login", {
      userName,
      password,
    });

    if (res.data.status === "success") {
      showAlert("success", "Sucessufully logged in!");
      setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (err) {
    console.log(err);
    showAlert("error", err.response.data.message);
  }
};

/////////////////////////////////////////////////
// DODAVANJE LISTENERA /////////////////////////
const loginForm = $("#loginForm");

if (loginForm)
  loginForm.on("submit", (e) => {
    e.preventDefault();
    const userName = $("#userName").val();
    const password = $("#password").val();
    login(userName, password);
  });
