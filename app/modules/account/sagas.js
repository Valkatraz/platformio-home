/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-disable no-constant-condition */

import * as actions from './actions';
import * as selectors from './selectors';

import { call, put, select, takeLatest } from 'redux-saga/effects';
import { deleteEntity, updateEntity } from '../../store/actions';
import { notifyError, notifySuccess } from '../core/actions';

import { apiFetchData } from '../../store/api';
import { message } from 'antd';


const CORE_API_EXCEPTION_PREFIX = '[API] ';


function showAPIErrorMessage(output) {
  output = output.replace(/[\\r\\n]+\'/, '').trim();
  const pos = output.indexOf(CORE_API_EXCEPTION_PREFIX);
  return message.error(pos !== -1 ? output.substr(pos + CORE_API_EXCEPTION_PREFIX.length) : output);
}

function* watchLoadAccountInfo() {
  yield takeLatest(actions.LOAD_ACCOUNT_INFO, function*({extended}) {
    let data = yield select(selectors.selectAccountInfo);
    if (data && (!extended || data.groups)) {
      return;
    }
    try {
      const args = ['account', 'show', '--json-output'];
      if (!extended) {
        args.push('--offline');
      }
      data = yield call(apiFetchData, {
        query: 'core.call',
        params: [args]
      });
    } catch (err) {}
    yield put(updateEntity('accountInfo', data || {}));
  });
}

function* watchLoginAccount() {
  yield takeLatest(actions.LOGIN_ACCOUNT, function*({username, password, onEnd}) {
    try {
      yield call(apiFetchData, {
        query: 'core.call',
        params: [['account', 'login', '--username', username, '--password', password]]
      });
      yield put(deleteEntity(/^accountInfo/));
    } catch (err) {
      if (err && err.data) {
        return showAPIErrorMessage(err.data);
      }
      return yield put(notifyError('Could not log in PIO Account', err));
    } finally {
      if (onEnd) {
        yield call(onEnd);
      }
    }
  });
}

function* watchLogoutAccount() {
  yield takeLatest(actions.LOGOUT_ACCOUNT, function*() {
    try {
      yield put(updateEntity('accountInfo', {}));
      yield call(apiFetchData, {
        query: 'core.call',
        params: [['account', 'logout']]
      });
    } catch (err) {
      if (err && err.data) {
        return showAPIErrorMessage(err.data);
      }
      return yield put(notifyError('Could not log out PIO Account', err));
    }
  });
}

function* watchRegisterAccount() {
  yield takeLatest(actions.REGISTER_ACCOUNT, function*({username, onEnd}) {
    let err = null;
    try {
      yield call(apiFetchData, {
        query: 'core.call',
        params: [['account', 'register', '--username', username]]
      });
      yield put(notifySuccess('Congrats!', 'Please check your email for the further instructions.'));
    } catch (err_) {
      err = err_;
      if (err && err.data) {
        return showAPIErrorMessage(err.data);
      }
      return yield put(notifyError('Could not create PIO Account', err));
    } finally {
      if (onEnd) {
        yield call(onEnd, err);
      }
    }
  });
}

function* watchForgotAccount() {
  yield takeLatest(actions.FORGOT_ACCOUNT, function*({username, onEnd}) {
    let err = null;
    try {
      yield call(apiFetchData, {
        query: 'core.call',
        params: [['account', 'forgot', '--username', username]]
      });
      yield put(notifySuccess('Congrats!', 'If this account is registered, we will send the further instructions to your email.'));
    } catch (err_) {
      err = err_;
      if (err && err.data) {
        return showAPIErrorMessage(err.data);
      }
      return yield put(notifyError('Could not forgot password for PIO Account', err));
    } finally {
      if (onEnd) {
        yield call(onEnd, err);
      }
    }
  });
}

function* watchPasswordAccount() {
  yield takeLatest(actions.PASSWORD_ACCOUNT, function*({oldPassword, newPassword, onEnd}) {
    let err = null;
    try {
      yield call(apiFetchData, {
        query: 'core.call',
        params: [['account', 'password', '--old-password', oldPassword, '--new-password', newPassword]]
      });
      yield put(notifySuccess('Congrats!', 'Successfully updated password!'));
    } catch (err_) {
      err = err_;
      if (err && err.data) {
        return showAPIErrorMessage(err.data);
      }
      return yield put(notifyError('Could not change password for PIO Account', err));
    } finally {
      if (onEnd) {
        yield call(onEnd, err);
      }
    }
  });
}

function* watchTokenAccount() {
  yield takeLatest(actions.SHOW_ACCOUNT_TOKEN, function*({password, regenerate, onEnd}) {
    try {
      const args = ['account', 'token', '--json-output', '--password', password];
      if (regenerate) {
        args.push('--regenerate');
      }
      const data = yield call(apiFetchData, {
        query: 'core.call',
        params: [args]
      });
      yield put(updateEntity('accountToken', data.result || null));
    } catch (err) {
      if (err && err.data) {
        return showAPIErrorMessage(err.data);
      }
      return yield put(notifyError('Could not fetch PIO Account token', err));
    } finally {
      if (onEnd) {
        yield call(onEnd);
      }
    }
  });
}

export default [
  watchLoadAccountInfo,
  watchLoginAccount,
  watchLogoutAccount,
  watchRegisterAccount,
  watchForgotAccount,
  watchPasswordAccount,
  watchTokenAccount
];
