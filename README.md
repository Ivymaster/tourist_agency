# tourist_agency

A web application that enables the work of a fictive online travel agency "E-Turist". Created with the Express development framework and the NodeJS server platform. The APIs used are: SendGrid API (email broker), ZingChart API (for creating graphs), Stripe API (payment access - test mode), Google Map API and MapBox API.

The application offers the administrator (agency owner) the ability to create and modify offers, create and modify notifications, the status of registered users. Users have the status of "tourists" or "employees". The administrator is the generalization of the employee user, the employee is the generalization of the tourist user, and the tourist is the generalization of the unregistered, basic user.

An unregistered user has an insight into the front page, insight into active offers, general ads, the possibility of communicating with the agency by email or through real "chat" communication. By registering, he received the status of "tourist". Acquires the possibility of booking the offer, modification of the same, insight into the created reservations. Get access to your profile.

The administrator has the ability to change the status of the registered user, thus creating a user of the status "employee". They get the authority to inspect the reservations of all users, the possibility of deleting them, if they are not paid. The employee has an insight into the chat room, through which he answers questions from tourists sent via the chat box.

The administrator can "hire" and "fire" users, and change their activity (ie delete and restore the deleted profile). The administrator has the ability to create notifications. The notification can be "general", intended for all registered users, "agency", intended only for employees of the agency, and "specific", intended for certain employees selected by the administrator. Admin has an insight into business statistics, which is shown graphically. Earnings are graphed by days, months and offers. An insight is given about the earnings and the number of tickets sold.

Most views have the search option, whether by date, price, or name. Most of the actions were accompanied by appropriate notifications. The use of third party modules enabled the sanitation of data.

Date: 21/11/2020.g.

Refactoring: from 05/03/2022 - present
