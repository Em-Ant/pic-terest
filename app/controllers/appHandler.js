const User = require('../models/users.js');
const Pic = require('../models/pics.js');
const sharp = require('sharp');
const request = require('request');

function handleError(res, err) {
  return res.status(500).send(err);
}

function invalidImage(req, res) {
  const pic = new Pic({
    ownerId: req.user._id,
    url: process.env.APP_URL + 'img/placeholder.png',
    description: 'Invalid Image',
  });
  Pic.populate(pic, { path: 'ownerId' }, function (err, pic) {
    res.json(pic);
  });
}

function AppHandler() {
  this.addPic = function (req, res) {
    const pic = req.body;
    pic.ownerId = req.user._id;
    request({ url: pic.webUrl, encoding: null }, function (
      err,
      response,
      body
    ) {
      if (err) return invalidImage(req, res);
      sharp(body)
        .resize(180)
        .toBuffer(function (err, data, info) {
          if (err) return invalidImage(req, res);

          pic.width = info.width;
          pic.height = info.height;
          pic.format = info.format;
          pic.data = data;
          const newPic = new Pic(pic);
          newPic.url = '/img/' + newPic._id + '.' + newPic.format;
          newPic.save(function (err) {
            if (err) return handleError(res, err);
            Pic.populate(newPic, { path: 'ownerId' }, function (err, pic) {
              if (err) return handleError(res, err);
              pic = pic.toObject();
              pic.data = undefined;
              res.json(pic);
            });
          });
        });
    });
  };

  this.getAllPics = function (req, res) {
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 20;
    Pic.find()
      .skip(offset)
      .limit(limit)
      .sort({ date: -1 })
      .select('-data')
      .populate('ownerId')
      .exec(function (err, pics) {
        if (err) {
          if (err) return handleError(res, err);
        }
        res.json(pics);
      });
  };

  this.getUserPics = function (req, res) {
    Pic.find({ ownerId: req.params.id })
      .populate('ownerId')
      .sort({ date: -1 })
      .exec(function (err, pics) {
        if (err) {
          if (err) return handleError(res, err);
        }
        res.json(pics);
      });
  };

  this.likePic = function (req, res) {
    Pic.findOneAndUpdate(
      { _id: req.params.id },
      { $push: { likers: req.user._id } },
      function (err, pic) {
        if (err) return handleError(res, err);
        res.json(pic);
      }
    );
  };

  this.unlikePic = function (req, res) {
    Pic.findOneAndUpdate(
      { _id: req.params.id },
      { $pull: { likers: req.user._id } },
      function (err, pic) {
        if (err) return handleError(res, err);
        res.json(pic);
      }
    );
  };

  this.deletePic = function (req, res) {
    const query = { _id: req.params.id };
    if (!req.user.isAdmin) {
      query.ownerId = req.user._id;
    }
    Pic.findOneAndRemove({ _id: req.params.id }, function (err, pic) {
      if (err) return handleError(err);
      res.json(pic);
    });
  };

  this.getImg = function (req, res) {
    const id = req.params.id.split('.')[0];
    Pic.findById(id, function (err, pic) {
      if (err) return handleError(res, err);
      res.contentType('image/' + pic.format);
      res.send(pic.data);
    });
  };
}

module.exports = AppHandler;
