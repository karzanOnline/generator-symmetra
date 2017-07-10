import { isFunction } from 'lodash';
import { stringify } from 'qs';

const GOLD_CODE_BASE = '/trip_seller';

export default function sendGoldLog (sectionCode, goldCode, checkCode, params = {}, action = 'OTHER') {
  const goldlog = window.goldlog;
  if(!(goldlog && isFunction(goldlog.record)))
    return;
  goldlog.record([GOLD_CODE_BASE, sectionCode, goldCode].join('.'), action, stringify(params, { encode: false }), checkCode);
}

sendGoldLog.clk = (sectionCode, goldCode, checkCode, params) => sendGoldLog(sectionCode, goldCode, checkCode, params, 'CLK');

sendGoldLog.sld = (sectionCode, goldCode, checkCode, params) => sendGoldLog(sectionCode, goldCode, checkCode, params, 'SLD');

sendGoldLog.exp = (sectionCode, goldCode, checkCode, params) => sendGoldLog(sectionCode, goldCode, checkCode, params, 'EXP');

export function onModEnter (path, desc) {
  sendGoldLog.exp('mod', 'in', 'H1456560437', { path, desc });
}
