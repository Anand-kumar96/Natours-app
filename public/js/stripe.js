/*eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_PUBLIC_KEY);

export const bookTour = async tourId => {
  //1 Get checkout session from API
  try {
    const session = await axios({
      method: 'GET',
      url: `/api/v1/bookings/checkout-session/${tourId}`
    });
    // 2 create Checkout form + charge a credit card
    window.location.replace(session.data.session.url);
    // redirectToCheckout not longer exist
    // await stripe.redirectToCheckout({
    //   sessionId: session.data.id
    // });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
