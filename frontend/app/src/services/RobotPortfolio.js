const axios = require('axios');

const service = {
  getRobotPortfolioContent: () => {
    return axios.get( 'https://eminibots.com/wp-json/storefront/v1/view/robot-portfolio');
  }
}
export default service;