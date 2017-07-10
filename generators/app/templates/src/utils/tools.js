import { mapValues } from 'lodash';

const domain = document.domain;
const isDaily = /localhost|daily/.test(domain);
const isDev = process.env.NODE_ENV === 'development';

export function toFieldValue(v){
  return {
    value: v
  }
}

export function toFieldValues(values){
  return mapValues(values, value => ({ value }));
}

export function getFieldValues(fields){
  return mapValues(fields, field => field.value)
}

export function domainFix(url){
  return isDaily
    ? url.replace(/sell\.(alitrip|fliggy)\.com/, 'sell.daily.alitrip.net')
    : url;
}

export function apiFix(url){
  return isDev ? url : url.replace(/\/api\//g, '/');
}

export const env = {
  isDaily,
  isDev,
};
