import { notification } from 'antd';
import { env } from './tools';
import { clearCookies } from './storage';

export function parseJSON(response) {
  return response.json();
}

export function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  if (env.isDev && response.type === 'opaqueredirect') {
    return devCookieReslover(response.url);
  }
  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

function devCookieReslover(url) {
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.onload = () => { location.reload() };
  document.body.append(iframe);
  notification.info({ message: '正在同步cookie...' });
}

export function checkLogin(response) {
  if(response && response.code === 201){
    notification.warning({ message: '登录超时，请重新登录' });
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        location.href = response.redirectUrl;
        resolve(response);
      }, 3000);
      clearCookies();
    });
  }
  return response;
}

export function getResult(res) {
  if(res && res.result) {
    return { data: res.result }
  }

  throw res;
}

export function successJudge({ success = false, msg = null }) {
  if(success)
    return { success }
  return { msg }
}

export const presetsWithResultGetter = [checkStatus, parseJSON, checkLogin, getResult];
export const presetsWithSuccessJudge = [checkStatus, parseJSON, checkLogin, successJudge];

export default [checkStatus, parseJSON, checkLogin];
