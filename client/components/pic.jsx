import React from 'react';

class Pic extends React.Component {
  constructor(props) {
    super(props);
  }
  getDeleteBtn() {
    return this.props.deletable ? (
      <div className="btn btn-default btn-sm" onClick={this.props.delete}>
        <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
      </div>
    ) : null;
  }
  render() {
    let likeClass = this.props.liked
      ? 'liked btn btn-default btn-sm'
      : 'like btn btn-default btn-sm';
    const hideOnLoading = this.props.loading ? ' c-hide' : '';
    const showOnLoading = this.props.loading ? '' : ' c-hide';
    const disabledOnLoading = this.props.loading ? ' disabled' : '';
    const dOLfn = this.props.userPicsDisabled;
    if (!this.props.likeable) likeClass += ' disabled';
    const picHeight = this.props.height + 'px';
    return (
      <div className="grid-item">
        <div className="main-img">
          <img
            style={{ height: picHeight }}
            src={this.props.imgUrl}
            onError={this.props.imgReplacer}
          ></img>
          <p>{this.props.description}</p>
        </div>
        <div className="info">
          <a href="#" onClick={dOLfn ? null : this.props.getUserPics}>
            <img
              src={this.props.ownerImg}
              title={this.props.username}
              onError={this.props.idReplacer}
            ></img>
          </a>
          {this.getDeleteBtn()}
          <div
            className={likeClass + disabledOnLoading}
            onClick={this.props.likeable ? this.props.like : null}
          >
            <span
              className={'glyphicon glyphicon-star' + hideOnLoading}
              aria-hidden="true"
            ></span>
            <span
              className={'glyphicon glyphicon-hourglass' + showOnLoading}
              aria-hidden="true"
            ></span>
            &nbsp;{this.props.likes ? this.props.likes : '0'}
          </div>
        </div>
      </div>
    );
  }
}

export default Pic;
