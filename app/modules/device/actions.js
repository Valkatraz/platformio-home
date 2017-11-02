/**
 * Copyright (c) 2017-present PlatformIO Plus <contact@pioplus.com>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { createAction } from '../../store/actions';


export const LOAD_LOCAL_DEVICES = 'LOAD_LOCAL_DEVICES';

export const loadLocalDevices = () => createAction(LOAD_LOCAL_DEVICES);