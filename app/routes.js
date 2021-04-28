module.exports = function(app, passport, db, multer) { // allow us to render the CRUD app files

  //to filter: {division: {$in: ["WPD", "Figure"]}}

  var ObjectId = require('mongodb').ObjectId;

  var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/images/uploads')
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + ".png")
    }
  });
  var upload = multer({storage: storage});
  // normal routes ===============================================================

  app.get('/', function(req, res) {
    res.render('index.ejs');
  });

  // PROFILE SECTIONS =========================


  app.get('/athleteprofile', isLoggedIn, function(req, res) {
    db.collection('connectionRequest').find({athleteID: ObjectId(req.user._id)}).toArray((err, connectionResults) => {
      db.collection('chatRequest').find({athleteID: ObjectId(req.user._id)}).toArray((err, chatReqResults) => {//go to collection, find specific one, place in array
        console.log("chat request results", chatReqResults);
        if (err) return console.log(err)// if the response is an err

        db.collection('users').find({"local.profiletype" : "coach"}).toArray((err, coachResults) => {
          if (err) return console.log(err)
          res.render('athleteProfile.ejs', {
            user : req.user,
            chatRequests : chatReqResults,
            coaches: coachResults,
            connectReqs : connectionResults
          })
        })
      })
    })
  });



  app.get('/coachprofile', isLoggedIn, function(req, res) {


      console.log("This is connection results", connectionResults);
      db.collection('chatRequest').find({coachID: ObjectId(req.user._id)}).toArray((err,
        chatResults) => {//go to collection, find specific one, place in array

          if (err) return console.log(err)// if the response is an err
          console.log();
          db.collection('users').find({"local.profiletype" : "coach"}).toArray((err,
            coachResults) => {

              if (err) return console.log(err)
              res.render('coachDash.ejs', {
                user : req.user,
                chatRequests : chatResults,
                coaches: coachResults
              })
            })
          })
      })


      function browsecoaches(req, res) {
        const filter = {"local.profiletype" : "coach"}
        if(req.body.division){
          filter["local.coachInfo.division"] = {

            "$in": [req.body.division]
          }
        }
        // console.log(ObjectId(req.body.coachID), ObjectId(req.user._id),req.user.local.username);

        db.collection('users').find({$and:[
          filter,
          {connectedUsers: {$nin: [ObjectId(req.user._id)]}}
        ]} ).toArray((err, coachResults) => {
          if (err) return console.log(err)
          // console.log("this is conReqs", conReqResults);
          // console.log(coachResults);
          res.render('browseCoaches.ejs', {
            user : req.user,
            coaches: coachResults

          })

        })//This only renders if an athlete is logged in. Need help setting up a conditional request. Want this page to be public.
      }

      app.post('/browsecoaches', browsecoaches);

      app.get('/browsecoaches', browsecoaches);



      // LOGOUT ==============================
      app.get('/logout', function(req, res) {// get request at logout route, takes in function
        req.logout();//request is running logout method that comes with express
        res.redirect('/');//response is to redirect to root route
      });


      // Coach details DB ===============================================================
      app.post('/coach', (req, res) => { //posting the message request to the DB
        // let divisions = [req.body.division1, req.body.division2,  req.body.division3, req.body.division4, req.body.division5, req.body.division6]
        // divisions = divisions.filter(element => typeof element === "string")
        //
        console.log(req.body);

        db.collection('users').findOneAndUpdate(
          {"_id": ObjectId(req.user._id)},
          {
            $set: {
              "local.coachInfo": {
                website: req.body.website,
                instagram: req.body.instagram,
                facebook: req.body.facebook,
                about: req.body.about,
                gender: req.body.gender,
                division: req.body.division

              }
            }
          }, {"upsert": true}, (err, result) => {// goes into collections and adds the data to these properties
            if (err) return console.log(err)//returns err if response is no good
            console.log('saved to database')
            // refresh profile page to render the updated information
          })

          res.redirect('/coachprofile')

        })


        // Chat Requests ===============================================================

        //get help with replacing :room with actual ID
        app.get('/room/:room', (req,res) => {

          db.collection('chatRequest').find({"status" : "Approved" }).toArray((err, result) => {//go to collection, find specific one, place in array

            if (err) return console.log(err)// if the response is an err
            console.log(result);

            res.render('room.ejs', {

              roomId: result[0].roomID })

            })
          })


          app.post('/chatRequest', (req, res) => { //posting the message request to the DB
            console.log("coach info", req.body);
            console.log("currentAthlete", req.user._id);
            db.collection('chatRequest').save({coachID: ObjectId(req.body.coachID), athleteID: req.user._id, athleteUN: req.user.local.username, roomID:req.body.coachID + req.user._id, status: "pending"}, (err, result) => {// goes into collections and adds the data to these properties
              if (err) return console.log(err)//returns err if response is no good
              console.log('saved to database')
              res.redirect('/athleteprofile')// refresh profile page to render the updated information
            })
          })

          app.put('/acceptedChat', (req, res) => {// request to update inforamtion on the page
            db.collection('chatRequest')
            .findOneAndUpdate({_id: ObjectId(req.body.requestId)}, {//find the properties and updating
              $set: {//changing whaterver property
                status: "Approved"
              }
            }, {
              sort: {_id: -1},//ordering the response in descending order
              upsert: true//create the object if no object/document present
            }, (err, result) => {//respond with error
              if (err) return res.send(err)
              res.send(result)
            })
          })
          app.put('/declinedChat', (req, res) => {// request to update inforamtion on the page
            db.collection('chatRequest')// go into db collection
            .findOneAndUpdate({_id: ObjectId(req.body.requestId)}, {//find the properties and updating
              $set: {//changing whaterver property
                status: "Declined"//from the request data go to thumbup value and adding 1
              }
            }, {
              sort: {_id: -1},//ordering the response in descending order
              upsert: true//create the object if no object/document present
            }, (err, result) => {//respond with error
              if (err) return res.send(err)
              res.send(result)
            })
          })



          // app.put('/messages', (req, res) => {// request to update inforamtion on the page
          //   db.collection('messages')// go into db collection
          //   .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {//find the properties and updating
          //     $set: {//changing whaterver property
          //       thumbUp:req.body.thumbUp + 1 //from the request data go to thumbup value and adding 1
          //     }
          //   }, {
          //     sort: {_id: -1},//ordering the response in descending order
          //     upsert: true//create the object if no object/document present
          //   }, (err, result) => {//respond with error
          //     if (err) return res.send(err)
          //     res.send(result)
          //   })
          // })
          //
          // app.put('/thumbDown', (req, res) => {// request to update inforamtion on the page
          //   db.collection('messages')// go into db collection
          //   .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {//find the properties and updating
          //     $set: {//changing whaterver property
          //       "local.username":req.body.thumbUp - 1//from the request data go to thumbup value and subtracting 1
          //     }
          //   }, {
          //     sort: {_id: -1},//ordering the response in descending order
          //     upsert: true//create the object if no object/document present
          //   }, (err, result) => {//respond with error
          //     if (err) return res.send(err)
          //     res.send(result)
          //   })
          // })

          app.delete('/messages', (req, res) => {
            db.collection('posts').findOneAndDelete({_id: ObjectId(req.body._id)}, (err, result) => {
              if (err) return res.send(500, err)
              res.send('Message deleted!')
            })
          })


          // Connection Requests ===============================================================

          app.post('/connectionRequest', (req, res) => { //posting the message request to the DB
            // console.log("coach info", req.body);
            // console.log("currentAthlete", req.user._id);
            console.log("works",ObjectId(req.body.coachID) );
            db.collection('users').findOneAndUpdate(
              {"_id": ObjectId(req.body.coachID)},
              {$push:{connectedUsers: ObjectId(req.user._id)}}
              , (err, result) => {// goes into collections and adds the data to these properties
                if (err) return console.log(err)//returns err if response is no good
                console.log('saved to database')
                res.redirect('/browsecoaches')// refresh profile page to render the updated information
              })
            })

            app.put('/acceptedConnection', (req, res) => {// request to update inforamtion on the page
              db.collection('connectionRequest')
              .findOneAndUpdate({_id: ObjectId(req.body.requestId)}, {//find the properties and updating
                $set: {//changing whaterver property
                  status: "Approved"
                }
              }, {
                sort: {_id: -1},//ordering the response in descending order
                upsert: true//create the object if no object/document present
              }, (err, result) => {//respond with error
                if (err) return res.send(err)
                res.send(result)
              })
            })
            app.put('/declinedConnection', (req, res) => {// request to update inforamtion on the page
              db.collection('connectionRequest')// go into db collection
              .findOneAndUpdate({_id: ObjectId(req.body.requestId)}, {//find the properties and updating
                $set: {//changing whaterver property
                  status: "Declined"//from the request data go to thumbup value and adding 1
                }
              }, {
                sort: {_id: -1},//ordering the response in descending order
                upsert: true//create the object if no object/document present
              }, (err, result) => {//respond with error
                if (err) return res.send(err)
                res.send(result)
              })
            })


            //=============================================================================
            // AUTHENTICATE (FIRST LOGIN) ==================================================
            // =============================================================================

            // locally --------------------------------
            // LOGIN ===============================
            // show the login form
            app.get('/login', function(req, res) {//get request to login path
              res.render('login.ejs', { message: req.flash('loginMessage') });//rendering page
            });

            // process the login form
            app.post('/login', passport.authenticate('local-login', {
              // successRedirect : '/feed', // redirect to the secure profile section
              failureRedirect : '/login', // redirect back to the signup page if there is an error
              failureFlash : true // allow flash messages
            }), (req, res) => {// request to update inforamtion on the page
              console.log(req.user);
              // req.user.local.profiletype = req.body.profiletype
              // req.user.local.username = req.body.username

              if(req.user.local.profiletype == "coach"){
                res.redirect("/coachprofile")
              }else{
                res.redirect("/athleteprofile")
              }

            });

            // SIGNUP =================================
            // show the signup form
            app.get('/signup', function(req, res) {
              res.render('signup.ejs', { message: req.flash('signupMessage') });
            });



            app.post('/signup', upload.single('imagepath'), passport.authenticate('local-signup', {
              // successRedirect : '/feed', // redirect to the secure profile section
              failureRedirect : '/signup', // redirect back to the signup page if there is an error
              failureFlash : true // allow flash messages
            }),  (req, res) => {// request to update inforamtion on the page
              console.log(req.body);

              req.user.local.profiletype = req.body.profiletype
              req.user.local.username = req.body.username
              req.user.local.firstname = req.body.firstname
              req.user.local.lastname = req.body.lastname
              req.user.local.imagepath = 'images/uploads/' + req.file.filename
              console.log(req.user.local)
              req.user.save()
              if(req.body.profiletype == "coach"){
                res.redirect("/coachprofile")
              }else{
                res.redirect("/athleteprofile")
              }

            });

            // =============================================================================
            // UNLINK ACCOUNTS =============================================================
            // =============================================================================
            // used to unlink accounts. for social accounts, just remove the token
            // for local account, remove email and password
            // user account will stay active in case they want to reconnect in the future

            // local -----------------------------------
            app.get('/unlink/local', isLoggedIn, function(req, res) {
              var user            = req.user;
              user.local.email    = undefined;
              user.local.password = undefined;
              user.save(function(err) {
                res.redirect('/feed');
              });
            });

          };

          // route middleware to ensure user is logged in
          function isLoggedIn(req, res, next) {// 3 params function with condiitonal
            if (req.isAuthenticated())
            return next();

            res.redirect('/');
          }
