import cookie from 'js-cookie';

export function clearCookies() {
  Object.keys(cookie.get()).map(key => {
    cookie.remove(key);
  })
}
