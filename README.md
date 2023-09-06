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
  - [API Usage](#api-usage) 
  - [Build With](#build-with)
  - [Setup-Installation-Requirements](#Setup-Installation-Requirements)
  - [Deployment](#deployment)
  - [To-do](#to-do)
  - [Known Bugs](#known-Bugs)
  - [Useful resources](#useful-resources)
  - [Author](#author)

## Overview 
### Demo 🚀
Live demo (Feel free to visit) 👉🏻 : https://natours-9d20.onrender.com

### Description :blue_book:
&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;This is web based live App of Tour Booking. This project combines both front-end and back-end technologies to create a seamless user experience and efficient management of tour-related data. Below is a detailed description of the key features of  tour booking full-stack project.
#### Key Features :memo:
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
 
## Demonstration :computer:
#### Sign-up Page :
![Sign-up](https://github.com/Anand-kumar96/Natours-app/assets/106487247/9f2cc60a-0005-4ce4-9709-9b96558ca0d9.gif)

#### Sign-in Page :
![Sign-in](https://github.com/Anand-kumar96/Natours-app/assets/106487247/fa3f12df-5b01-4574-9ed2-ed5a3267657f.gif)

#### Home Page :
![Home-Page](https://github.com/Anand-kumar96/Natours-app/assets/106487247/6fa4ff48-f725-4060-a123-d6a88a43c998.gif)

#### Tour Details :
![Tour-details](https://github.com/Anand-kumar96/Natours-app/assets/106487247/c8939ec9-3662-41ea-a269-07d3968107c4.gif)

#### Payment Process :
![Payment-Process](https://github.com/Anand-kumar96/Natours-app/assets/106487247/2da50117-cf3e-462f-a9e2-9592b2b4d163.gif)

#### Booked Tours :
![Booked-Tours](https://github.com/Anand-kumar96/Natours-app/assets/106487247/c7156547-e707-474d-9e3d-5097c1c5baa5.gif)

#### User Profile :
![User-Profile](https://github.com/Anand-kumar96/Natours-app/assets/106487247/342390b8-a9d6-4c99-b4e6-05459074fc57)

#### Admin Profile :
![Admin-Profile](https://github.com/Anand-kumar96/Natours-app/assets/106487247/19ddc75b-83e4-446f-81ac-2e48304040c1.gif)

## How To Use 🤔

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
