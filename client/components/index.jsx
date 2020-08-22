import React from 'react';
import ReactDOM from 'react-dom';
import Ajax from '../js/ajax-functions.js';

import '../style/index.scss';
import 'bootstrap';
import Masonry from 'react-masonry-component';

import Pic from './pic.jsx';
import Nav from './navbar.jsx';

const appUrl = window.location.origin;

const ajax = new Ajax();

function isAllScrollDown() {
  const s = $(window).scrollTop(),
    d = $(document).height(),
    c = $(window).height();

  const scrollPercent = s / (d - c);
  return d === c || scrollPercent === 1;
}

function setEndScrollListener(cb) {
  setTimeout(function () {
    if (isAllScrollDown()) return cb();
    $(window).on('scroll', function () {
      if (isAllScrollDown()) cb();
    });
  }, 500);
}

function removeEndScrollListener() {
  $(window).off('scroll');
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user: { twitter: {} }, page: 'all', pics: [] };
    this.getAllPics = this.getAllPics.bind(this);
    this.getUserPicsbyId = this.getUserPicsbyId.bind(this);
    this.getUserPics = this.getUserPics.bind(this);
    this.createPic = this.createPic.bind(this);
    this.deletePic = this.deletePic.bind(this);
    this.likeHandler = this.likeHandler.bind(this);
    this.setPage = this.setPage.bind(this);
  }
  componentDidMount() {
    const self = this;
    ajax.ajaxRequest('get', appUrl + '/api/user', function (user) {
      if (user.status !== 'unauthenticated') {
        self.setState({
          user: user,
          loggedIn: true,
          pics: [],
        });
      } else {
        self.setState({
          user: { twitter: { username: 'guest' } },
          loggedIn: false,
          pics: [],
        });
      }
      self.getAllPics();
    });
  }
  getAllPics(append) {
    const self = this;
    const offset = append ? this.state.pics.length : 0;
    const limit = 20;
    const picsUrl =
      appUrl + '/api/pics?limit=' + limit + (offset ? '&offset=' + offset : '');
    this.setState({ loading: true });
    removeEndScrollListener();
    ajax.ajaxRequest('get', picsUrl, function (data) {
      const pics = append ? self.state.pics.concat(data) : data;
      self.setState({ pics: pics, page: 'all', loading: false });
      if (data.length && data.length === limit)
        setEndScrollListener(self.getAllPics.bind(self, true));
    });
  }
  getUserPicsbyId(id, cb) {
    ajax.ajaxRequest(
      'get',
      appUrl + '/api/pics/' + id,
      function (data) {
        cb(data);
      }.bind(this)
    );
  }
  getUserPics(index) {
    removeEndScrollListener();
    this.setState({ pics: [], loading: true });
    const id = this.state.pics[index].ownerId._id;
    this.getUserPicsbyId(
      id,
      function (pics) {
        this.setState({ pics: pics, page: 'user', loading: false });
      }.bind(this)
    );
  }
  createPic(url, desc) {
    if (!url) return;
    desc = desc || 'a pic by @' + this.state.user.twitter.username;
    ajax.ajaxRequest(
      'post',
      appUrl + '/api/pics',
      function (d) {
        const pics = this.state.pics.map(function (p) {
          return p;
        });
        pics.unshift(d);
        this.setState({ pics: pics });
      }.bind(this),
      null,
      { webUrl: url, description: desc }
    );
  }
  likeHandler(index) {
    const self = this;
    const id = this.state.pics[index]._id;
    const liked =
      this.state.pics[index].likers.indexOf(this.state.user._id) !== -1;
    const verb = liked ? 'put' : 'post';
    this.setState({ picLoading: index });
    ajax.ajaxRequest(verb, appUrl + '/api/pics/' + id, function (d) {
      const pics = self.state.pics;
      if (liked) {
        const i = d.likers.indexOf(self.state.user._id);
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
  }
  deletePic(index) {
    const self = this;
    const id = this.state.pics[index]._id;
    ajax.ajaxRequest('delete', appUrl + '/api/pics/' + id, function () {
      const pics = self.state.pics;
      pics.splice(index, 1);
      self.setState({ pics: pics });
    });
  }
  imgReplacer(e) {
    e.target.src = appUrl + '/img/placeholder.png';
  }
  idReplacer(e) {
    e.target.src = appUrl + '/img/twitter-egg-icon.png';
  }
  setPage(page) {
    const self = this;
    switch (page) {
      case 'all':
        this.getAllPics();
        break;
      case 'myPics':
        const id = this.state.user._id;
        this.getUserPicsbyId(id, function (pics) {
          self.setState({ pics: pics, page: 'myPics' });
        });
        break;
      default:
        break;
    }
  }
  render() {
    const hide = this.state.loading ? '' : ' c-hide';
    const self = this;
    const pics = this.state.pics.map(function (p, i) {
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
              fitWidth: true,
            }}
          >
            {pics}
          </Masonry>
          <div className={'loader' + hide} />
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('appView'));
