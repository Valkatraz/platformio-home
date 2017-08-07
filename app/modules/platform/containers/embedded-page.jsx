/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as actions from '../actions';

import { EMBEDDED_INPUT_FILTER_KEY, selectEmbeddedFilter, selectVisibleEmbeddedPlatforms } from '../selectors';
import { openUrl, revealFile } from '../../core/actions';

import { INPUT_FILTER_DELAY } from '../../../config';
import PlatformsList from '../components/platforms-list';
import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { goTo } from '../../core/helpers';
import { lazyUpdateInputValue } from '../../../store/actions';


class PlatformEmbeddedPage extends React.Component {

  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.object.isRequired
    ),
    filterValue: PropTypes.string,
    setFilter: PropTypes.func.isRequired,
    loadRegistryPlatforms: PropTypes.func.isRequired,
    showPlatform: PropTypes.func.isRequired,
    showFramework: PropTypes.func.isRequired,
    installPlatform: PropTypes.func.isRequired,
    openUrl: PropTypes.func.isRequired,
    revealFile: PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.loadRegistryPlatforms();
  }

  render() {
    return (
      <div className='page-container'>
        <PlatformsList { ...this.props } />
      </div>
    );
  }

}

// Redux

function mapStateToProps(state, ownProps) {
  return {
    items: selectVisibleEmbeddedPlatforms(state),
    filterValue: selectEmbeddedFilter(state),
    showPlatform: name => goTo(ownProps.history, '/platforms/embedded/show', { name }),
    showFramework: name => goTo(ownProps.history, '/platforms/frameworks/show', { name })
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, actions, {
    openUrl,
    revealFile,
    setFilter: value => dispatch(lazyUpdateInputValue(EMBEDDED_INPUT_FILTER_KEY, value, INPUT_FILTER_DELAY))
  }), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(PlatformEmbeddedPage);
