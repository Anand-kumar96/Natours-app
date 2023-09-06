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

  - [Demo](#Demo)
  - [Description](#Description)
  - [Demonstration](#Demonstration)
  - [How To Use](#how-to-use)
  - [API Usage](#api-usage) 
  - [Build With](#build-with)
  - [Setup-Installation-Requirements](#Setup-Installation-Requirements)
  - [Deployment](#deployment)
  - [To-do](#to-do)
  - [Known Bugs](#known-Bugs)
  - [Useful resources](#useful-resources)
  - [Author](#author)

## Overview
### Demo 
Live demo (Feel free to visit) 👉🏻 : https://natours-9d20.onrender.com

### Description

This is web based live App of Tour Booking. This project combines both front-end and back-end technologies to create a seamless user experience and efficient management of tour-related data. Below is a detailed description of the key components and features of a tour booking full-stack project.
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
 
## Demonstration 🖥️
#### Sign-up Page :
![Sign-up](https://github.com/Anand-kumar96/Natours-app/assets/106487247/9f2cc60a-0005-4ce4-9709-9b96558ca0d9.gif)

#### Sign-in Page :
![Sign-in](https://github.com/Anand-kumar96/Natours-app/assets/106487247/fa3f12df-5b01-4574-9ed2-ed5a3267657f.gif)

#### Home Page :
![Home-Page](https://github.com/Anand-kumar96/Natours-app/assets/106487247/6fa4ff48-f725-4060-a123-d6a88a43c998.gif)

#### Tour Details :
![tourOverviewonline-video-cutterc](https://user-images.githubusercontent.com/58518192/72606859-a0b78900-3949-11ea-8f0d-ef44c789957b.gif)

#### Payment Process :
![paymentprocess-1-ycnhrceamp4-7fW](https://user-images.githubusercontent.com/58518192/72606973-d9eff900-3949-11ea-9a2e-f84a6581bef3.gif)

#### Booked Tours :
![rsz_bookedtours](https://user-images.githubusercontent.com/58518192/72607747-6a7b0900-394b-11ea-8b9f-5330531ca2eb.png)

#### User Profile :
![rsz_userprofile](https://user-images.githubusercontent.com/58518192/72607635-44edff80-394b-11ea-8943-64c48f6f19aa.png)

#### Admin Profile :
![rsz_adminprofile](https://user-images.githubusercontent.com/58518192/72607648-4d463a80-394b-11ea-972f-a73160cfaa5b.png)

