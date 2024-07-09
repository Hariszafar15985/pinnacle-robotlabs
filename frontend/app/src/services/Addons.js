const axios = require('axios');

const service = {
  get: () => {
    return axios.get(process.env.REACT_APP_WOO_URL +
      '/wp-json/storefront/v1/subscription-product?type=addon_packs');
  }
}
export default service;