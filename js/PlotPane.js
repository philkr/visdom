/**
 * Copyright 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const Pane = require('./Pane');
const SG = require("ml-savitzky-golay-generalized");

class PlotPane extends React.Component {
  _paneRef = null;
  _plotlyRef = null;
  _width = null;
  _height = null;

  componentDidMount() {
    this.newPlot();
  }
  state: State = {
    blur: 0,
  }
  componentDidUpdate(prevProps, prevState) {
    this.newPlot();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.contentID !== nextProps.contentID) {
      return true;
    }
    else if (this.props.h !== nextProps.h || this.props.w !== nextProps.w) {
      return true;
    }
    else if (this.props.isFocused !== nextProps.isFocused) {
      return true;
    }
    else if (this.blur !== nextState.blur) {
      return true;
    }
    return false;
  }

  newPlot = () => {
    this.state.blur_change = false;
    var filtered_data = this.props.content.data.map((d) => {
      // The window size is an odd number 5 <= sz <= d.y.length
      var sz = 2*Math.min(this.state.blur, Math.floor((d.y.length-3)/2))+3;
      var r = Object.assign({}, d);
      if (sz >= 5)
        r.y = SG(d.y, d.x, {windowSize:sz, derivative: 0, polynomial:3});
      return r;
    });
    Plotly.newPlot(
      this.props.contentID,
      filtered_data,
      this.props.content.layout,
      {showLink: true, linkText: ' ', displaylogo: false}
    )
  }

  handleDownload = () => {
    Plotly.downloadImage(this._plotlyRef, {
      format: 'svg',
      filename: this.props.contentID,
    });
  }

  resize = () => {
    this.componentDidUpdate();
  }
  
  change_blur = (v) => {
    if (this.state.blur !== v) {
      this.setState({blur: v});
    }
  }

  render() {
    return (
      <Pane
        {...this.props}
        handleDownload={this.handleDownload}
        ref={(ref) => this._paneRef = ref}>
        <div
          id={this.props.contentID}
          style={{height: '100%', width: '100%'}}
          className="plotly-graph-div"
          ref={(ref) => this._plotlyRef = ref}
        />
        <div className="blur">
          <input type="range" min="0" max="100"
            value={this.state.blur}
            onChange={(e) => this.change_blur(e.target.value)}
            id={this.props.contentID+"_blur"}
          />
        </div>
      </Pane>
    )
  }
}

module.exports = PlotPane;
