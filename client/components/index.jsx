var React = require('react');
var ReactDOM = require('react-dom');
var css = require('../style/index.scss');
var Ajax = new (require('../js/ajax-functions.js'));

var $ = jQuery = require('jquery');
require('bootstrap');

var Masonry = require('react-masonry-component');

var Pic = require('./pic.jsx');
var Nav = require('./navbar.jsx');

var appUrl = window.location.origin;

var App = React.createClass({
  componentDidMount: function () {
    var self = this;
    Ajax.ajaxRequest('get', appUrl + '/api/user', function(user) {
      if(user.status !== 'unauthenticated') {
        self.setState({
          user: user,
          loggedIn: true
        })
      } else {
        self.setState({
          user: {twitter:{username: 'guest'}},
          loggedIn: false
        });
      }
      self.getAllPics();
    });
  },
  getAllPics: function() {
    var self = this;
    this.setState({pics:[], loading:true});
    Ajax.ajaxRequest('get', appUrl + '/api/pics', function(data) {
      self.setState({pics: data, page: 'all', loading: false});
    });
  },
  getUserPicsbyId: function(id, cb) {
    Ajax.ajaxRequest('get', appUrl + '/api/pics/' + id, function(data) {
      cb(data);
    }.bind(this));
  },
  getUserPics: function(index) {
    this.setState({pics:[], loading:true});
    var id = this.state.pics[index].ownerId._id;
    this.getUserPicsbyId(id, function(pics) {
      this.setState({pics: pics, page: 'user', loading: false});
    }.bind(this));
  },
  createPic: function (url, desc) {
    if(!url) return
    desc = desc || 'a pic by @' + this.state.user.twitter.username;
    Ajax.ajaxRequest('post', appUrl + '/api/pics',  function(d) {
      var pics = this.state.pics;
      pics.unshift(d);
      this.setState({pics: pics});
    }.bind(this), null, {url: url, description: desc})
  },
  likeHandler: function(index) {
    var self = this;
    var id = this.state.pics[index]._id;
    var liked = (this.state.pics[index].likers.indexOf(this.state.user._id) !== -1)
    var verb = liked ? 'put' : 'post';
    this.setState({picLoading: index});
    Ajax.ajaxRequest(verb, appUrl + '/api/pics/' + id, function(d){
      var pics = self.state.pics;
      if(liked) {
        var i = d.likers.indexOf(self.state.user._id);
        d.likers.splice(i,1);
        pics[index].likers = d.likers;
      } else {
        d.likers.push(self.state.user._id);
        pics[index].likers = d.likers;
      }
      self.setState({pics: pics, picLoading: undefined});
    })
  },
  deletePic: function(index) {
    var self = this;
    var id = this.state.pics[index]._id;
    Ajax.ajaxRequest('delete', appUrl + '/api/pics/' + id, function(d){
      var pics = self.state.pics;
      pics.splice(index,1);
      self.setState({pics: pics});
    })
  },
  getInitialState : function () {
    return {user: {twitter:{}}, page: 'all', pics:[]}
  },
  imgReplacer: function(e) {
    e.target.src = appUrl + '/img/placeholder.png';
  },
  setPage: function  (page) {
    var self = this;
    switch (page) {
      case 'all' :
        this.getAllPics();
        break;
      case 'myPics':
        var id = this.state.user._id;
        this.getUserPicsbyId(id, function(pics) {
          self.setState({pics: pics, page: 'myPics'});
        });
        break;
      default:
        break;
    }
  },
  render: function () {
    var hide = this.state.loading ? '' : ' c-hide';
    var self = this;
    var pics = this.state.pics.map(function(p, i) {
      return (
        <Pic
          key={i}
          imgUrl={p.url}
          description={p.description}
          ownerImg={p.ownerId.twitter.imageUrl}
          likeable={self.state.loggedIn }
          username={'@'+p.ownerId.twitter.username}
          getUserPics={self.getUserPics.bind(null,i)}
          liked={p.likers.indexOf(self.state.user._id) !== -1}
          deletable={self.state.loggedIn && self.state.page === 'myPics' && p.ownerId._id === self.state.user._id}
          likes={p.likers.length}
          like={self.likeHandler.bind(null,i)}
          delete={self.deletePic.bind(null,i)}
          imgReplacer={self.imgReplacer}
          loading={self.state.picLoading === i}/>
        )
      });
    return (
      <div>
        <Nav
          submit={this.createPic}
          loggedIn={this.state.loggedIn}
          page={this.state.page}
          setPage={this.setPage}/>
        <div className="container">
          <div className={'preloader' + hide}>
            <img src="/img/preloader.gif"/>
          </div>
          <Masonry
            className={'grid'}
            options={
            {
              // options
              itemSelector: '.grid-item',
              columnWidth: 200,
              fitWidth: true
            }
          }>
            {pics}
          </Masonry>
        </div>
      </div>

    )
  }
});

ReactDOM.render(<App/>, document.getElementById('appView'));
