/**
 * ?t=btoa(JSON.stringify({key: value}))
 */
import { mapValues, isString, isRegExp, isFunction, cloneDeep, set } from 'lodash';
import { routerRedux } from 'dva/router';
const { push, replace } = routerRedux;

export const TRANSFORM_KEY = 't';

export function createHistoryEffect({ namespace }) {
  const updateLocation = (payload, prevLocation) => ({
    pathname: prevLocation.pathname,
    query: {
      ...prevLocation.query,
      [TRANSFORM_KEY]: transformStringCreator(payload, prevLocation.query),
    },
  });
  return {
    pushHistory: function* ({ payload }, { put, select }) {
      const { locationBeforeTransitions } = yield select(state => state.routing);
      yield put(push(updateLocation(payload, locationBeforeTransitions)));
    },
    replaceHistory: function* ({ payload }, { put, select }) {
      const { locationBeforeTransitions } = yield select(state => state.routing);
      yield put(replace(updateLocation(payload, locationBeforeTransitions)));
    },
  }
}

function transformStringCreator (data = {}, prevQuery = {}) {
  let transform = prevQuery[TRANSFORM_KEY] ? JSON.parse(atob(prevQuery[TRANSFORM_KEY])) : {};
  transform = {
    ...transform,
    ...mapValues(data, val => encodeURIComponent(JSON.stringify(val))),
  };
  return btoa(JSON.stringify(transform));
}

export function transformModelByURI (state, { payload }) {
  if(!payload)
    return state;
  const transform = JSON.parse(atob(payload));
  const keys = Object.keys(transform);
  if(keys.length < 1)
    return state;
  const newState = cloneDeep(state);
  keys.forEach(key => set(newState, key, JSON.parse(decodeURIComponent(transform[key]))));
  return newState;
}

export function URIParamsDecorator (match, initAction, params) {
  return ({ query, pathname }, dispatch, callback) => {
    if(!isString(match) && !isRegExp(match))
      return;
    if(isString(match) && pathname !== match)
      return;
    let regExpMatched = [];
    if(isRegExp(match) && !match.test(pathname))
      return;
    if(isRegExp(match)){
      const ret = pathname.match(match);
      if (!ret) {
        return;
      }
      regExpMatched = ret.slice(1);
    }
    const transform = query[TRANSFORM_KEY];
    if(params && !transform){
      dispatch({
        type: 'replaceHistory',
        payload: params,
      })
      return;
    }
    dispatch({
      type: 'transformModelByURI',
      payload: transform,
    })
    initAction && dispatch({
      type: initAction,
      payload: { regExpMatched },
    });
    isFunction(callback) && callback();
  }
}
