// import Poll from "../helpers/poll";

const axios = require("axios");

const service = {
    get: () => {
        return axios.get(
            process.env.REACT_APP_WOO_URL +
            "/wp-json/storefront/v1/subscription-product?type=portfolios"
        );
    },

    getSimulationFields: () => {
        return axios.get(
            process.env.REACT_APP_USERS_SERVICE_URL + "/portfolio/mapping/"
        );
    },

    // getSimulationData: (portfolioSku, addonSkus, numberContract, contract) => {
    //     const data = {
    //         number_of_contract: numberContract,
    //         contract_type: contract,
    //         addon: addonSkus,
    //     };

    //     const initialFn = () =>
    //         axios.post(
    //             process.env.REACT_APP_USERS_SERVICE_URL +
    //             `/portfolio/${portfolioSku}/simulate/`,
    //             data
    //         );

    //     const secondaryFn = (taskId) => {
    //         return axios.get(process.env.REACT_APP_USERS_SERVICE_URL + `/task/${taskId}/`);
    //     };

    //     const fnCondition = (res) => !res.data.all_trades;

    //     return Poll(initialFn, secondaryFn, fnCondition, 2000);
    // },
};

export default service;
