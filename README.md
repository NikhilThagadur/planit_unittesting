#HOLIDAY PLANIT

##DESCRIPTION
Holiday PlanIt is a hybrid mobile app that helps a traveler to get suggestions and tips for his travel plans from locals in the area or other users who are in the Holiday PlanIt app community. 
The traveler can then customize his itinerary by picking from the suggestions and tips and choosing the suggestion he likes the most.

##SYSTEM REQUIREMENTS
* Supersonic  (https://academy.appgyver.com/installwizard)
* Angular.js 
* Node.js

##INSTALLATION
    Download this repository:
    $ git clone https://github.com/eecs394-fall15/plan_It.git
    
    
###Cloud Parse database setup 
* Sign up for an account at https://parse.com/
* The parse application is called plan_It. The data can be set in the core section.
The Application ID and the Rest API key can be found in the settings tabs. Use these keys to integrate the Parse database within these two files. 

/app/common/scripts/Parse.js
```
Parse.initialize(application_ID_here, JavaScript_Key_here,Master_Key_here); 
```

/app/common/views/layout.html
```
Parse.initialize(application_ID_here, JavaScript_Key_here);
```

###5 Parse Database Classes
- Denoted by class name and then followed by bullet points of column name, type:

####User
- Use Parse's custom User table

####Events
- title, String
- time, Date
- suggestions, Array
- listLimit, Number
- additional, String
- author, Pointer<_User>
- responders, Array
- isChosen, Boolean
- chosen, Pointer<Suggestions>
- itineraryId, String

####Itinerary
- author, Pointer <_User>
- events, Array
- published, Boolean
- title, String

####Suggestions
- author, Pointer<_User>
- authorId, String
- authors, Array
- eventid, String
- isSaved, Boolean
- itineraryId, String
- published, Boolean
- tips, Array
- title, String

####Tip
- authorId, String
- title, String
- author, Pointer<_User>
- published, Boolean
- itineraryId, String
- eventid, String

#####Install the Appgyver Supersonic Scanner from the App Store on your mobile device

##RUNNING
```
    $ cd plan_It
    $ steroids connect 
```

##DEPLOYMENT
####Sharable Link
From the steroids connect page, navigate to Cloud. Click on "Open Cloud Share Page" under the "Share App" heading
####IOS Debug Adhoc Build
Follow the directions at http://docs.appgyver.com/tooling/build-service/build-settings/building-a-debug-build/
* Note: An IOS developer account is needed

##DESCRIPTION OF CODE
The app is built using AppGyver’s Supersonic framework. The frontend of the app was coded in Angular JS. ParseDB is the cloud database we used. 


For the database syntax, reference: https://parse.com/docs/js/guide
For Appgyver’s apis, reference: http://docs.appgyver.com/supersonic/api-reference/

The app is divided into two modules- common and example. In the common module we have the scripts that are common to the entire app. In the example module we have the views and their corresponding controllers. We interact with the Parse database through these controllers. 

##PLATFORM CONSTRAINTS
* For development, Supersonic’s logger doesn’t always output expected logs 
* For deployment on IOS devices, a developer license is needed 

## KNOWN BUGS NOT FIXED & SPECIFIC LIMITATIONS
* Loading times for database data delay the rate at which different screens populate. 
* There is a different background for Android and IOS since supersonic’s API does not support background changes yet for Android devices
 
##CONTRIBUTORS
###Developers
* [Edgar Vazquez](https://github.com/evz9)
* [Nikhil Thagadur](https://github.com/NikhilThagadur)
* [Jaiveer Kothari](https://github.com/jaiveerkothari)
* [Sophia Lou](https://github.com/sophialou)

###MSIT Team
* Amanda Goh
* Santhi Ratnakaram
* Rahil Kaul

###Coach
* Professor Christopher Riesbeck of Northwestern University for EECS 394



	
