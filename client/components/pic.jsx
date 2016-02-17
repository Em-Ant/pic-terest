var React = require('react');
var appUrl = window.location.origin;

module.exports = React.createClass({
  render: function() {
    var likeClass = this.props.liked ? "liked btn btn-default btn-sm" : 'btn btn-default btn-sm';
    if(!this.props.likeable) likeClass+= ' disabled';
    var deleteBtn = this.props.deletable
      ? <div className="btn btn-default btn-sm"
        onClick={this.props.delete}>
          <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
        </div>
      : null;
    return (
      <div className="grid-item">
        <div className="main-img">
          <img src={this.props.imgUrl} onError={this.props.imgReplacer}></img>
          <p>{this.props.description}</p>
        </div>
        <div className="info">
          <a href="#" onClick={this.props.getUserPics}>
            <img src={this.props.ownerImg} title={this.props.username}></img>
          </a>
          {deleteBtn}
          <div
            className={likeClass}
            onClick={this.props.likeable ? this.props.like : null}>
            <span className="glyphicon glyphicon-heart-empty" aria-hidden="true"></span> {this.props.likes ? this.props.likes : "0"}
          </div>
        </div>
      </div>
    )
  }
})
