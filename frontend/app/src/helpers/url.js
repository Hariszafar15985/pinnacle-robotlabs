export function getQueryParamValue(key) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const value = urlParams.get(key);
  return value;
}
