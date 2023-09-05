const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../model/bookingModel');
const Tour = require('../model/tourModel');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //1 Get current Book tour
  const tour = await Tour.findById(req.params.tourId);
  //2 create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    //query String
    // success_url: `${req.protocol}://${req.get('host')}/?tour=${
    //   req.params.tourId
    // }&user=${req.user.id}&price=${tour.price}`,/
    success_url: `${req.protocol}://${req.get('host')}/my-tours`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId, // to get access session again
    mode: 'payment',
    shipping_address_collection: {
      allowed_countries: ['US']
    },
    custom_text: {
      shipping_address: {
        message:
          "Please note that we can't guarantee 2-day delivery for PO boxes at this time."
      },
      submit: {
        message: "We'll email you instructions on how to get started."
      }
    },
    line_items: [
      {
        price_data: {
          unit_amount: tour.price * 100,
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${
                tour.imageCover
              }`
            ],
            description: tour.summary
          }
        },
        quantity: 1
      }
    ]
  });
  //3 create session as response
  res.status(200).json({
    status: 'success',
    session
  });
});

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   //This is TEMPORARY , because it is INSECURE: everyone can make new booking without paying
//   // solution => use Webhook after deploying it we will improved it
//   const { tour, user, price } = req.query;
//   if (!tour || !user || !price) return next();
//   await Booking.create({ tour, user, price });
//   res.redirect(req.originalUrl.split('?')[0]);
// });
const createBookingCheckout = async session => {
  const tour = await session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = (await session.line_items[0].price_data.unit_amount) / 100;
  await Booking.create({ tour, user, price });
};

exports.webHookCheckout = async (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }
  console.log('session', event.data.object);
  if (event.type === 'checkout-session-completed') {
    createBookingCheckout(event.data.object);
  }
  res.status(200).json({ received: true });
};
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.CreateBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
