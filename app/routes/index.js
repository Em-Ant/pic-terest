const { Router } = require('express');
const passport = require('passport');

const AppHandler = require('../controllers/appHandler.js');
const configPassport = require('../config/passport');

const app = Router();

configPassport(passport);

app.use(passport.initialize());
app.use(passport.session());

const path = process.cwd();

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.json({ status: 'forbidden' });
  }
}

const appHandler = new AppHandler();

app.get('/img/:id', appHandler.getImg);

app.route('/api/user').get(function (req, res) {
  if (req.user) {
    res.json(req.user);
  } else {
    res.json({ status: 'unauthenticated' });
  }
});

app
  .route('/api/pics')
  .get(appHandler.getAllPics)
  .post(isLoggedIn, appHandler.addPic);

app
  .route('/api/pics/:id')
  // get all user pics. :id is user id
  .get(appHandler.getUserPics)
  // Like a pic. :id is photo id
  .post(isLoggedIn, appHandler.likePic)
  .put(isLoggedIn, appHandler.unlikePic)
  // Delete a pic. :id is photo id
  .delete(isLoggedIn, appHandler.deletePic);

app.route('/auth/twitter').get(passport.authenticate('twitter'));

app.route('/auth/twitter/callback').get(
  passport.authenticate('twitter', {
    successRedirect: '/',
    failureRedirect: '/',
  })
);

app.route('/logout').get(function (req, res) {
  req.logout();
  res.redirect('/login');
});

app.route('/*').get(function (req, res) {
  res.sendFile(path + '/client/public/index.html');
});

module.exports = app;
