# SE_WebAppbackend

# Description

This is the REST-API created for serving the [KisaanSeva](https://kisanseva.vercel.app/) Web-App. This uses npm modules to run the server.

# Requirements

The node modules inside the package.json are to be installed to be able to run project.
For the installation of node use:-

    $ sudo apt install nodejs
    $ sudo apt install npm


# Installation

## development server

      $ git clone https://github.com/Sherlock2505/SE_WebApp_Backend.git
      $ cd SE_WebApp_Backend
      $ npm install --save
      $ npm start

use localhost:3000 as the base-url to make requests.

## production server

use [BASE_URL](https://https://fathomless-tundra-87077.herokuapp.com) as base-url to make requests

# Usage

The following are the major requests that can be made to server
* Sign In - {BASE_URL}/{user_type}/create
* Login - {BASE_URL}/{user_type}/login
* Sell crop - {BASE_URL}/crops/sell
* filter crop using queries - {BASE_URL}/crops/filter?crop_type=&crop_variety=&price_max=&price_min=&pincode=&qty_max&qty_min=&sold=
* Search query for crops - {BASE_URL}/crops/search?term="put serach term here"
* On sale and sold view dashboard routes for farmers own crops - {BASE_URL}/crops/view?sold={true/false}
* Modal view of crop - {BASE_URL}/crops/view/:id

{user_type} = [farmer, dealer]

# Upcoming features

* Blogs
* Favourite blogs
* Price comparison in Market
* Analytics of sale
* Live Chat with experts

# Credits

  [DEEP MAHESHWARI](https://github.com/Sherlock2505)      
  [NIKHIL M](https://github.com/officialynik)
