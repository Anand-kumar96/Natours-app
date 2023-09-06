<h1 align="center">
  <br>
  <a href="https://natours-9d20.onrender.com/"><img src="https://github.com/Anand-kumar96/Natours-app/blob/main/public/img/logo-green-round.png" alt="Natours" width="200"></a>
  <br>
  Natours
  <br>
</h1>

#### By Anand Kumar
This is an awesome tour booking site built on top of <a href="https://nodejs.org/en/" target="_blank">NodeJS</a>.
## Table of contents

  - [Demo](#Demo-)
  - [Description](#Description-)
  - [Demonstration](#Demonstration-)
  - [How To Use](#how-to-use-)
  - [API Usage](#api-usage-) 
  - [Build With](#build-with-)
  - [Setup-Installation-Requirements](#Setup-Installation-Requirements-)
  - [Deployment](#deployment-)
  - [To-do](#to-do-)
  - [Known Bugs](#known-Bugs-)
  - [Useful resources](#useful-resources-)
  - [Author](#author-)

## Overview 
### Demo 🚀
Live demo (Feel free to visit) 👉🏻 : https://natours-9d20.onrender.com

### Description 📑
&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;This is web based live App of Tour Booking. This project combines both front-end and back-end technologies to create a seamless user experience and efficient management of tour-related data. Below is a detailed description of the key features of  tour booking full-stack project.
#### Key Features 📝
* Authentication and Authorization
  - Implemented secure user authentication and authorization mechanisms to protect user data and ensure the privacy and security of user accounts.
  - Implemented Sign up, Log in, Logout, Update, and reset password functionality.
* User profile
  - Update username, email, password, photo and other information
  - A user can be either be a regular user or an admin or a lead-guide or 
    a guide.
  - When a user signs up, that user by default be a regular user.
  - A user can delete their account But it will still be in database as 
    user will be inactive. but only admin can permanently delete user account. 
* Tour
  - Manage booking, check tour map, check users, reviews and ratings.
  - Tours can be created, updated or deleted by an admin or a lead-guide 
    only.
  - All Tours can be seen by every user.
* Bookings
  - Only regular users can book tours (make a payment).
  - Regular users can not book the same tour twice.
  - Regular users can see all the tours they have booked.
  - An admin user or a lead guide can see every booking on the app.
  - An admin user or a lead guide can delete any booking.
  - An admin user or a lead guide can create a booking (manually, without 
    payment).
  - An admin user or a lead guide can not create a booking for the same 
    user twice.
  - An admin user or a lead guide can edit any booking.
* Reviews
  - Only regular users can write reviews for tours that they have booked.
  - All users can see the reviews of each tour.
  - Regular users can edit and delete their own reviews.
  - Regular users can not review the same tour twice.
  - An admin can delete any review.
* Favorite Tours
  - A regular user can add any of their booked tours to their list of 
    favorite tours.
  - A regular user can remove a tour from their list of favorite tours.
  - A regular user can not add a tour to their list of favorite tours when 
    it is already a favorite.
* Credit card Payment
  - Except admin any user can book any tour via doing credit card payment.
* Email
  - After successful Sign-up user get Welcome email to their registered email of account.
  - User get reset password link to their registered email after clicking forget password.
  - User get booking confirmation to thier registered email after making successful payment.
 
## Demonstration 💻
#### Sign-up Page :
![Sign-up](https://github.com/Anand-kumar96/Natours-app/assets/106487247/0fa43787-1e68-470d-ba47-7f95dfcbeb78.gif)

#### Sign-in Page :
![Sign-in](https://github.com/Anand-kumar96/Natours-app/assets/106487247/56b52d2e-7388-4f0a-801e-9a15c95f2fc5.gif)

#### Home Page :
![Home-Page](https://github.com/Anand-kumar96/Natours-app/assets/106487247/478eb4f9-4f34-432a-9c5c-a2e5a00b127e.gif)

#### Tour Details :
![Tour-details](https://github.com/Anand-kumar96/Natours-app/assets/106487247/41101dca-3cd6-4ad5-a4de-018afb26db80.gif)

#### Payment Process :
![Payment-Process](https://github.com/Anand-kumar96/Natours-app/assets/106487247/95a349b1-a287-4b50-8a58-9cf78a1ff000.gif)

#### Booked Tours :
![Booked-Tours](https://github.com/Anand-kumar96/Natours-app/assets/106487247/d7ebe727-bd26-48c6-ba18-c0fba71d17c0.gif)

#### User Profile :
![User-Profile](https://github.com/Anand-kumar96/Natours-app/assets/106487247/c548c96e-d830-480f-b2b2-bf3e24955409.gif)

#### Admin Profile :
![Admin-Profile](https://github.com/Anand-kumar96/Natours-app/assets/106487247/a93d72cc-96ab-4889-9661-43bb4e641764.gif)

## How To Use 🫠

### Book a tour
* Signup to the site
* Login to the site
* Select tours that you want to book
* Book a tour
* Proceed to the payment checkout page
* Enter shipping address details (Test Mood):
  ```
  - address : Howard Street 
  - city : Hastings
  - Zip Code: 13076
  - State : NewYork
  ```
* Enter the card details (Test Mood):
  ```
  - Card No. : 4242 4242 4242 4242
  - Expiry date: 02 / 25
  - CVV: 224
  ```
* Finished!
  
#### Manage your booking
* Check the tour you have booked on the "Manage Booking" page in your user settings. You'll be automatically redirected to this
  page after you have completed the booking.

#### Update your profile
* You can update your own username, email, profile photo and password.
  
## API Usage 💡
Before using the API, you need to set the environment variables in Postman depending on your environment (development or production). Simply add: 
  ```
  - set Authorization as Bearer Token
  - {{URL}} with your hostname as value (Eg. http://127.0.0.1:5000 or http://www.example.com)
  - {{password}} with your user password as value.
  ```
Check 👉🏻 [Natours API Documentation 💥💥](https://documenter.getpostman.com/view/28574510/2s9Y5Wx3dW) for more info.

<b> Some API Features: </b>
 *  All Tours 👉🏻 https://natours-9d20.onrender.com/api/v1/tours
 *  Tours stats 👉🏻 https://natours-9d20.onrender.com/api/v1/tours/tour-stats
 *  Get Top 5 Cheap Tours 👉🏻 https://natours-9d20.onrender.com/api/v1/tours/top-5-cheap-tours
 *  Get Monthly Plan 👉🏻 https://natours-9d20.onrender.com/api/v1/tours/monthly-plan/2021
 *  Get Tours Within Radius 👉🏻 https://natours-9d20.onrender.com/api/v1/tours/distances/34.111745,-118.113491/unit/mi

## Deployment 🚀
The website is deployed with git into Render. Below are the steps taken:
```
- create an account on [render](https://render.com/) (Ex:Natours-app)
- create a web service and give a name
- select github repository for your Web Service
- Build Command : npm install
- Start Command : node server.js (or your root file)
- Set up Environment Variables
- Add Secret Files
- then deployed.
* Finished!
```


