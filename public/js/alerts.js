/* eslint-disable */

export const hideAlert = () => {
  const el = $('#login-message');
  if (el) el.empty();
};

export const showAlert = (type, msg) => {
  hideAlert();
  $('#login-message').prepend(`<div class="alert alert--${type}">${msg}</div>`);
  setTimeout(hideAlert, 5000);
};