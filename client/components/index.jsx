var React = require('react');
var ReactDOM = require('react-dom');
var Ajax = new (require('../js/ajax-functions.js'))();

var $ = (jQuery = require('jquery'));
require('../style/index.scss');
require('bootstrap');
var Masonry = require('react-masonry-component');

var Pic = require('./pic.jsx');
var Nav = require('./navbar.jsx');

var appUrl = window.location.origin;

function isAllScrollDown() {
  var s = $(window).scrollTop(),
    d = $(document).height(),
    c = $(window).height();

  var scrollPercent = s / (d - c);
  return d === c || scrollPercent === 1;
}

function setEndScrollListener(cb) {
  setTimeout(function() {
    if (isAllScrollDown()) return cb();
    $(window).on('scroll', function() {
      if (isAllScrollDown()) cb();
    });
  }, 500);
}

function removeEndScrollListener() {
  $(window).off('scroll');
}

var App = React.createClass({
  componentDidMount: function() {
    var self = this;
    Ajax.ajaxRequest('get', appUrl + '/api/user', function(user) {
      if (user.status !== 'unauthenticated') {
        self.setState({
          user: user,
          loggedIn: true,
          pics: []
        });
      } else {
        self.setState({
          user: { twitter: { username: 'guest' } },
          loggedIn: false,
          pics: []
        });
      }
      self.getAllPics();
    });
  },
  getAllPics: function(append) {
    var self = this;
    var offset = append ? this.state.pics.length : 0;
    var limit = 20;
    var picsUrl =
      appUrl + '/api/pics?limit=' + limit + (offset ? '&offset=' + offset : '');
    this.setState({ loading: true });
    removeEndScrollListener();
    Ajax.ajaxRequest('get', picsUrl, function(data) {
      var pics = append ? self.state.pics.concat(data) : data;
      self.setState({ pics: pics, page: 'all', loading: false });
      if (data.length && data.length === limit)
        setEndScrollListener(self.getAllPics.bind(self, true));
    });
  },
  getUserPicsbyId: function(id, cb) {
    Ajax.ajaxRequest(
      'get',
      appUrl + '/api/pics/' + id,
      function(data) {
        cb(data);
      }.bind(this)
    );
  },
  getUserPics: function(index) {
    removeEndScrollListener();
    this.setState({ pics: [], loading: true });
    var id = this.state.pics[index].ownerId._id;
    this.getUserPicsbyId(
      id,
      function(pics) {
        this.setState({ pics: pics, page: 'user', loading: false });
      }.bind(this)
    );
  },
  createPic: function(url, desc) {
    if (!url) return;
    desc = desc || 'a pic by @' + this.state.user.twitter.username;
    Ajax.ajaxRequest(
      'post',
      appUrl + '/api/pics',
      function(d) {
        var pics = this.state.pics.map(function(p) {
          return p;
        });
        pics.unshift(d);
        this.setState({ pics: pics });
      }.bind(this),
      null,
      { webUrl: url, description: desc }
    );
  },
  likeHandler: function(index) {
    var self = this;
    var id = this.state.pics[index]._id;
    var liked =
      this.state.pics[index].likers.indexOf(this.state.user._id) !== -1;
    var verb = liked ? 'put' : 'post';
    this.setState({ picLoading: index });
    Ajax.ajaxRequest(verb, appUrl + '/api/pics/' + id, function(d) {
      var pics = self.state.pics;
      if (liked) {
        var i = d.likers.indexOf(self.state.user._id);
        d.likers.splice(i, 1);
        pics[index].likers = d.likers;
      } else {
        d.likers.push(self.state.user._id);
        pics[index].likers = d.likers;
      }
      if (!self.state.loading) {
        self.setState({ pics: pics, picLoading: undefined });
      }
    });
  },
  deletePic: function(index) {
    var self = this;
    var id = this.state.pics[index]._id;
    Ajax.ajaxRequest('delete', appUrl + '/api/pics/' + id, function() {
      var pics = self.state.pics;
      pics.splice(index, 1);
      self.setState({ pics: pics });
    });
  },
  getInitialState: function() {
    return { user: { twitter: {} }, page: 'all', pics: [] };
  },
  imgReplacer: function(e) {
    e.target.src = appUrl + '/img/placeholder.png';
  },
  idReplacer: function(e) {
    e.target.src = appUrl + '/img/twitter-egg-icon.png';
  },
  setPage: function(page) {
    var self = this;
    switch (page) {
      case 'all':
        this.getAllPics();
        break;
      case 'myPics':
        var id = this.state.user._id;
        this.getUserPicsbyId(id, function(pics) {
          self.setState({ pics: pics, page: 'myPics' });
        });
        break;
      default:
        break;
    }
  },
  render: function() {
    var hide = this.state.loading ? '' : ' c-hide';
    var self = this;
    var pics = this.state.pics.map(function(p, i) {
      return (
        <Pic
          key={i}
          imgUrl={appUrl + p.url}
          height={p.height || 180}
          description={p.description}
          ownerImg={p.ownerId.twitter.imageUrl}
          likeable={self.state.loggedIn}
          username={'@' + p.ownerId.twitter.username}
          getUserPics={self.getUserPics.bind(null, i)}
          liked={p.likers.indexOf(self.state.user._id) !== -1}
          deletable={
            self.state.loggedIn &&
            (self.state.user.isAdmin ||
              (self.state.page === 'myPics' &&
                p.ownerId._id === self.state.user._id))
          }
          likes={p.likers.length}
          like={self.likeHandler.bind(null, i)}
          delete={self.deletePic.bind(null, i)}
          imgReplacer={self.imgReplacer}
          idReplacer={self.idReplacer}
          loading={self.state.picLoading === i}
          userPicsDisabled={self.state.picLoading !== undefined}
        />
      );
    });
    return (
      <div>
        <Nav
          submit={this.createPic}
          loggedIn={this.state.loggedIn}
          page={this.state.page}
          setPage={this.setPage}
          setPageDisabled={self.state.picLoading !== undefined}
        />
        <div className="container">
          <Masonry
            className={'grid'}
            options={{
              // options
              itemSelector: '.grid-item',
              columnWidth: 200,
              fitWidth: true
            }}
          >
            {pics}
          </Masonry>
          <div className={'loader' + hide} />
        </div>
      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById('appView'));
