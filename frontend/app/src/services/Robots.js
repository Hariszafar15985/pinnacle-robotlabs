import Poll from "../helpers/poll";

const axios = require("axios");

const service = {
    get: () => {
        return axios.get(
            process.env.REACT_APP_USERS_SERVICE_URL + "/robot/"
        );
    },

    getProBots: () => {
        return axios.get(
            process.env.REACT_APP_USERS_SERVICE_URL + "/robot/?pro=true"
        );
    },

    getTrendingRobots: () => {
        return axios.get(
            process.env.REACT_APP_USERS_SERVICE_URL + "/robot/trend/"
        );
    },

    getPremadePortfolios: () => {
        return axios.get(
            process.env.REACT_APP_USERS_SERVICE_URL + "/portfolio/"
        );
    },

    getSimulationData: (months, robots, commissionData) => {
        const data = {
            months: parseInt(months+1, 10),
            robots,
            levels: commissionData
        };

        const initialFn = () =>
            axios.post(
                process.env.REACT_APP_USERS_SERVICE_URL + `/robot/simulate/`,
                data
            );

        const secondaryFn = (taskId) => {
            return axios.get(
                process.env.REACT_APP_USERS_SERVICE_URL + `/task/${taskId}/`
            );
        };

        const fnCondition = (res) => !res.data.all_trades;

        return Poll(initialFn, secondaryFn, fnCondition, 2000);
    },

    getInstruments: () => {
        return axios.get(
            process.env.REACT_APP_USERS_SERVICE_URL + "/robot/instruments/"
        );
    },

    getCategories: () => {
        return axios.get(
            process.env.REACT_APP_USERS_SERVICE_URL + "/robot/categories/"
        );
    },

    getCommission: () => {
        return axios.get(
            process.env.REACT_APP_USERS_SERVICE_URL + "/robot/commission/"
        );
    },
};
export default service;
