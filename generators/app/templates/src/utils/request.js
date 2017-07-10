import fetch from 'dva/fetch';
// import fetchJsonp from 'fetch-jsonp';
import qs from 'qs';
import object2FromData from './object-to-formdata';
import { domainFix, apiFix } from './tools';
import defaultPresets, { checkStatus, parseJSON } from './request-presets';

/**
 * webx入参出参编码设置
 * @type {String}
 */
const requestParam = qs.stringify({
  '_input_charset': 'UTF-8',
  '_output_charset': 'UTF-8',
});


/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options) {
  return fetch(url, options)
    .then(checkStatus)
    .then(parseJSON)
    .then((data) => ({ data }))
    .catch((err) => ({ err }));
}

/**
 * Requests a URL using `JSONP`, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [data]    The payload we want to pass to "fetch"
 * @param  {object} [presets] response processors
 * @return {promise}
 */
// export function jsonp(url, data = {}, presets = [parseJSON]) {
//   return fetchJsonp(`${url}?${qs.stringify(data)}`, { timeout: 3000 })
//     .then(res => applyPresets(res, presets))
//     .catch(err => ({ err }));
// }

/**
 * Apply processors on response
 * @param  {response} res     The response we wanna handel
 * @param  {array}    presets Processors
 * @return {promise}
 */
function applyPresets (res, presets = []) {
  return presets.reduce((result, preset) => Promise.resolve(result).then(preset), res);
}

/**
 * Requests a URL using `POST` mothod, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [data]    The payload we want to pass to "fetch"
 * @param  {object} [presets] response processors
 * @return {promise}
 */
export function postApi(url, data = {}, presets = defaultPresets){
  console.info('postApi', url, data);
  url = apiFix(url);
  let formData = object2FromData(data);
  return fetch(`${url}?${requestParam}`, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    body: formData,
    redirect: 'manual',
  })
    .then(res => applyPresets(res, presets))
    .catch(err => ({ err }));
}
