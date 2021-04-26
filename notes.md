Create a post route /chatRequest

get the coaches id by going to req.body(whatever the coaches id is named in the form)

req.user._id- that's the id of the athlete that is logged in

db.collection('chatRequest').save(){information from line 3 & 5}


when the coach is logged in on their page
db.collection('chatRequest').find({coachid of logged in coach (req.user._id)}).toArray( result are all athletes that want to chat with the coach)

use user id to create a chat room

when coach selects which athlete he wants to chat with
route /room/"coachID"+"athleteID"

to create a unique room

once athlete clicks on chat request button, that needs to change to a button that directs the athlete to the chat room: route /room/"coachID"+"athleteID"

on athlete page:
db.collection('chatRequest').find({athlete of logged in athlete (req.user._id)}).toArray( result are all athletes that want to chat with the coach)

const request = [5, 12, 8, 130, 44];

const found = array1.find(element => element > 10)
