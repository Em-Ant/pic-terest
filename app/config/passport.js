const TwitterStrategy = require('passport-twitter').Strategy;
const User = require('../models/users');
const configAuth = require('./auth');

function updateTwitterPictureAndDone(profile, user, done) {
  if (profile.photos[0].value === user.twitter.imageUrl)
    return done(null, user);
  else {
    user.twitter.imageUrl = profile.photos[0].value;
    user.save(function (err) {
      if (err) {
        throw err;
      }
      return done(null, user);
    });
  }
}

module.exports = function (passport) {
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      if (
        process.env.ENABLE_ADMIN &&
        user.twitter.id === process.env.ADMIN_ID
      ) {
        user = user.toObject();
        user.isAdmin = true;
      }
      done(err, user);
    });
  });

  passport.use(
    new TwitterStrategy(
      {
        consumerKey: configAuth.twitterAuth.consumerKey,
        consumerSecret: configAuth.twitterAuth.consumerSecret,
        callbackURL: configAuth.twitterAuth.callbackURL,
      },
      function (token, refreshToken, profile, done) {
        process.nextTick(function () {
          User.findOne({ 'twitter.id': profile.id }, function (err, user) {
            if (err) {
              return done(err);
            }

            if (user) {
              return updateTwitterPictureAndDone(profile, user, done);
            } else {
              const newUser = new User();

              newUser.twitter.id = profile.id;
              newUser.twitter.username = profile.username;
              newUser.twitter.displayName = profile.displayName;
              newUser.twitter.imageUrl = profile.photos[0].value;

              newUser.save(function (err) {
                if (err) {
                  throw err;
                }

                return done(null, newUser);
              });
            }
          });
        });
      }
    )
  );
};
