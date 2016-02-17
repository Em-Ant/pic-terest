'use strict';

var User = require('../models/users.js');
var Pic = require('../models/pics.js');

function handleError(res, err) {
  return res.status(500).send(err);
}

function AppHandler () {

	this.addPic = function (req, res) {
    var pic = req.body;
    pic.ownerId = req.user._id;
    var newPic = new Pic(pic);
    newPic.save(function(err){
      if(err) return handleError(err);
      Pic.populate(newPic, {path: "ownerId"}, function(err, pic) {
        if(err) return handleError(err);
        res.json(pic);
      })
    })
	};

  this.getAllPics = function (req, res) {
    Pic.find()
      .populate('ownerId')
      .sort({date: -1})
      .exec(function(err, pics){
        if(err) {
          if(err) return handleError(err);
        }
        res.json(pics);
      });
  };

  this.getUserPics = function (req, res) {
    Pic.find({ownerId: req.params.id})
      .populate('ownerId')
      .sort({date: -1})
      .exec(function(err, pics){
        if(err) {
          if(err) return handleError(err);
        }
        res.json(pics);
      });
  };

  this.likePic = function (req, res) {
    Pic.findOneAndUpdate({_id: req.params.id}, {$push: {likers: req.user._id}}, function (err, pic) {
      if(err) return handleError(err);
      res.json(pic);
    })
  };

  this.unlikePic = function (req, res) {
    Pic.findOneAndUpdate({_id: req.params.id}, {$pull: {likers: req.user._id}}, function (err, pic) {
      if(err) return handleError(err);
      res.json(pic);
    })
  };

  this.deletePic = function (req, res) {
    Pic.findOneAndRemove({_id: req.params.id}, function(err, pic) {
      if(err) return handleError(err);
      res.json(pic);
    })
  }
}

module.exports = AppHandler;
