import { useContext } from "react";
import { AppContext } from "../Provider";
import { ReactComponent as LoadingIcon } from "../images/tail-spin.svg"; // ES6

const cellWithout$ = [
    "Profit factor",
    "Sharpe ratio",
    "Sortino ratio",
    "Ulcer index",
    "R squared",
    "Probability",
    "Total # of trades",
    "Percent profitable",
    "# of winning trades",
    "# of losing trades",
    "# of even trades",
    "Ratio avg. win / avg. loss",
    "Max. consec. winners",
    "Max. consec. losers",
    "Avg. # of trades per day",
    "Avg. time in market",
    "Avg. bars in trade",
    "Max. time to recover",
    "Longest flat period",
    "Total slippage",
    "Avg. # Trades / Quarter",
];

function Statistics(props) {
    const { app } = useContext(AppContext);

    const cellValue = (cellName, value) => {
        if (cellName === 'Percent profitable') return `${(value * 100).toFixed(2)}%`;
        return cellWithout$.includes(cellName) ? value : "$" + value;
    };

    return (
        <div
            className="pt-4 px-4 pb-8 rounded-3xl lg:rounded-none rounded-b-none bg-grey-bg text-xs
        flex fixed lg:static w-full left-0 bottom-12 z-20 h-2/3-screen lg:h-auto"
        >
            <div className="text-left max-h-2/3-screen w-full overflow-auto lg:max-h-full">
                {app.simulationDataLoading && app.portfolioType !== "custom" && (
                    <div className="flex items-center justify-center py-10">
                        <LoadingIcon className="w-8" />
                    </div>
                )}

                {!app.simulationDataLoading && !app.simulationData.length && (
                    <div>
                        No data yet, please choose portfolio, contract type to start
                        simulation
                    </div>
                )}
                {!app.simulationDataLoading && app.simulationData.length > 0 && (
                    <>
                        <div>
                            <span className="text-xs text-gray-400">
                                Trading futures involves substantial risk of loss and is not suitable for everyone. Past performance is not necessarily Indicative of future results.{" "}
                                <a
                                    href="https://ninjacators.com/legal/earnings-income-disclaimer/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline text-xxs"
                                >
                                    VIEW FULL RISK DISCLAIMER
                                </a>
                            </span>
                        </div>
                        <table className="text-left w-full">
                            <thead>
                                <tr className="lg:text-lg">
                                    <td className="font-bold py-1 lg:py-2">Performance</td>
                                    <td className="font-bold">All Trades</td>
                                    <td className="font-bold">Long</td>
                                    <td className="font-bold">Short</td>
                                </tr>
                            </thead>
                            <tbody>
                                {app.simulationData.map((line, index) => {
                                    return (
                                        <tr
                                            className={index % 2 === 0 ? "bg-darker-grey" : ""}
                                            key={index}
                                        >
                                            <td className="pr-4 py-1.5 lg:py-2 whitespace-nowrap">
                                                <span
                                                    className={`${[0, 5, 6].includes(index)
                                                        ? `blue-highlighted p-0.5`
                                                        : ""
                                                        }`}
                                                >
                                                    {line[0]}
                                                </span>
                                            </td>
                                            <td className="pr-4 whitespace-nowrap">
                                                <span
                                                    className={`${[0, 5, 6].includes(index)
                                                        ? `blue-highlighted p-0.5`
                                                        : ""
                                                        }`}
                                                >
                                                    {cellValue(line[0], line[1])}
                                                </span>
                                            </td>
                                            <td className="pr-4 whitespace-nowrap">
                                                <span
                                                    className={`${[0, 5, 6].includes(index)
                                                        ? `blue-highlighted p-0.5`
                                                        : ""
                                                        }`}
                                                >
                                                    {cellValue(line[0], line[2])}
                                                </span>
                                            </td>
                                            <td className="pr-4 whitespace-nowrap">
                                                <span
                                                    className={`${[0, 5, 6].includes(index)
                                                        ? `blue-highlighted p-0.5`
                                                        : ""
                                                        }`}
                                                >
                                                    {cellValue(line[0], line[3])}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <div className="text-xs text-gray-400 px-4">
                            <div className="mt-6 mb-3">
                                Trading futures involves substantial risk of loss and is not suitable for everyone. Never trade with money you can't afford to lose. The hypothetical results shown on this page are not necessarily indicative of future results.{" "}
                                <a
                                    href="https://ninjacators.com/legal/earnings-income-disclaimer/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline text-xxs"
                                >
                                    VIEW FULL RISK DISCLAIMER
                                </a>
                            </div>
                            <div>
                                To calculate the all shown results, the algo-bots use a combination of historical and real-time data provided by IQ feed. All results for the e-micro/micro trading products, prior to its release in may 2019, such as the e-micro S&P 500 and e-micro NASDAQ 100, were calculated based on the trading result of the underlying full-size e-mini contract divided by ten. All trading results shown do not take any reinvesting (compounding) into consideration and are calculated on a nominal per contract basis. Furthermore, to calculate trading commissions, we assume the commission structure offered by NinjaTrader® brokerage can adjust on the commission menu on this page. Please contact your broker to find out about your personalized commission cost.
                            </div>
                            <br />
                            <div>
                                <a
                                    href="https://ninjacators.com/legal/terms-of-use/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline"
                                >Terms of Use</a>&nbsp;|&nbsp;
                                <a
                                    href="https://ninjacators.com/legal/privacy-policy/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline"
                                >Privacy Policy</a>&nbsp;|&nbsp;
                                <a
                                    href="https://ninjacators.com/legal/earnings-income-disclaimer/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline"
                                >Risk & Earnings Disclaimer</a>
                            </div>
                            <br />
                            <div>
                                Copyright 2023 RobotLab.com. All Rights Reserved.<br />
                                NINJACATORS LLC | 228 PARK AVE S | NEW YORK | NY, 10003 | USA
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Statistics;
