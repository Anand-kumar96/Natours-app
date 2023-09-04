// console.log('hello from parcel');
/*eslint-disable */
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { signup } from './signup';
import { bookTour } from './stripe';

//DOM element
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const logOutBtn = document.querySelector('.nav__el--logout');
const bookBtn = document.getElementById('book-tour');


//DELEGATION
if (mapBox) {
  const locations = JSON.parse(
    document.getElementById('map').dataset.locations
  );
  displayMap(locations);
}

if (loginForm) {
  document.querySelector('.form').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
  });
}
if (signupForm) {
  signupForm.addEventListener('submit', e => {
    e.preventDefault();
      e.target.querySelector('.btn').textContent = 'Processing...';
    const name = document.querySelector('.signup-name').value;
    const email = document.querySelector('.signup-email').value;
    const password = document.querySelector('.signup-password').value;
    const passwordConfirm = document.querySelector('.signup-confirmPassword')
      .value;
    signup({ name, email, password, passwordConfirm });
    document.querySelector('.signup-name').value = '';
    document.querySelector('.signup-email').value = '';
    document.querySelector('.signup-password').value = '';
    document.querySelector('.signup-confirmPassword').value = '';
  });
}
if (logOutBtn) {
  document.querySelector('.nav__el--logout').addEventListener('click', e => {
    logout();
  });
}

if (userDataForm) {
  document.querySelector('.form-user-data').addEventListener('submit', e => {
    e.preventDefault();
    // using form => form will object
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;
    // const photo = document.getElementById('photo').files[0];
    // updateSettings({ name, email,photo }, 'data');
    updateSettings(form, 'data');
  });
}
// to updatePassword
if (userPasswordForm) {
  document
    .querySelector('.form-user-password')
    .addEventListener('submit', async e => {
      e.preventDefault();
      document.querySelector('.btn--save-password').textContent = 'updating...';
      const passwordCurrent = document.getElementById('password-current').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('password-confirm').value;
      await updateSettings(
        { passwordCurrent, password, passwordConfirm },
        'password'
      );
      document.querySelector('.btn--save-password').textContent =
        'Save password';
      document.getElementById('password-current').value = '';
      document.getElementById('password').value = '';
      document.getElementById('password-confirm').value = '';
    });
}

if (bookBtn) {
  bookBtn.addEventListener('click', e => {
    // data-tour-id -> convert to tourId
    e.target.textContent = 'Processing...';
    const tourId = e.target.dataset.tourId;
    bookTour(tourId);
  });
}
