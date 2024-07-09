import { useContext, useEffect, useRef } from "react";

import CommissionModal from "components/CommissionModal";
import RobotPortfolioModal from "components/RobotPortfolioModal/";
import { AppContext } from "../../Provider";
import Chart from "../Chart";
import CustomPortfolios from "../CustomPortfolios";
import MessageModal from "../MessageModal";
import SignalInfoModal from "../SignalInfoModal";
import Statistics from "../Statistics.js";
import Header from "./Header";
import Settings from "./Settings";

function Desktop() {
    const {
        app,
        robots,
    } = useContext(AppContext);
    const rightPanelRef = useRef(null);

    useEffect(() => {
        if (app.portfolioType === "custom")
            app.setShowMessageModal(app.simulationDataLoading);
        // eslint-disable-next-line
    }, [app.simulationDataLoading, app.portfolioType]);

    useEffect(() => {
        if (robots.error)
            app.setShowMessageModal('Error occurred, please reload.');
        // eslint-disable-next-line
    }, [robots.error]);

    useEffect(() => {
        if (!robots.loaded) app.setShowMessageModal('Loading data, please wait.');
        else app.setShowMessageModal('');
        // eslint-disable-next-line
    }, [robots.loaded]);

    useEffect(() => {
        if (app.error)
            app.setShowMessageModal('Error occurred, please retry.');
        // eslint-disable-next-line
    }, [app.error]);

    useEffect(() => {
        app.getInstrumentData();
        app.getCommissionData();
        // eslint-disable-next-line
    }, []);

    const renderOverlays = () => {
        if (app.showMessageModal) {
            return (
                <div className="w-full h-full absolute z-10 bg-black bg-opacity-50 top-0 left-0"></div>
            );
        }

        if (app.portfolioType === "preMade") {
            return (
                <>
                    {((app.tour >= 1 && app.tour !== 1.1 && app.tour !== 3) ||
                        app.showRobotPortfolioModal) && (
                            <div className="w-full h-full absolute z-10 bg-black bg-opacity-50 top-0 left-0"></div>
                        )}
                    {app.tour === 1.1 ||
                        (app.tour === 3 && (
                            <div className="w-full h-full absolute z-10 bg-transparent bg-opacity-50 top-0 left-0"></div>
                        ))}
                </>
            );
        }

        if (app.portfolioType === "custom") {
            return (
                <>
                    {((app.tour >= 1 && app.tour !== 3) || app.showRobotModal || app.showSignalInfoModal || app.showRobotPortfolioModal || app.showCommissionModal) && (
                        <div className="w-full h-full absolute z-10 bg-black bg-opacity-50 top-0 left-0"></div>
                    )}
                    {app.tour === 3 && (
                        <div className="w-full h-full absolute z-10 bg-transparent bg-opacity-50 top-0 left-0"></div>
                    )}
                </>
            );
        }
    };

    return (
        <div className="relative">
            {robots.loaded && app.showSignalInfoModal && (
                <SignalInfoModal type={app.showSignalInfoModal} />
            )}
            {robots.loaded && app.showRobotPortfolioModal && (
                <RobotPortfolioModal />
            )}
            {app.commissionData && app.showCommissionModal && (
                <CommissionModal />
            )}
            {!!app.showMessageModal && <MessageModal message={app.showMessageModal} />}
            <Header />
            <div className="flex bg-brand-bg">
                <div className="w-3/5 2xl:w-[70%] px-[1.5rem]">
                    <div className="desktop-left-stat-height">
                        <div className="pt-[1rem]">
                            <div className="w-full relative z-10 bg-brand-navy chart-contract-container py-[1rem] pr-[1.5rem] pl-[1rem]">
                                <div className="z-20 flex align-items justify-end">
                                    <Settings />
                                </div>
                                {!app.simulationDataLoading && (
                                    <Chart chartData={app.chartData} chartType={app.chartType} chartSubtype={app.chartSubtype} selectedRobots={robots.selectedRobots} />
                                )}
                                {app.simulationDataLoading && (
                                    <Chart chartData={[]} />
                                )}
                                <div className="flex justify-between relative w-full z-10">
                                    <div className="text-[0.7rem]">* Click and drag in the chart to zoom in.</div>
                                    {app.chartType === "cumulative-net-profit" && (
                                        <div className="text-right">
                                            <h4 className="text-[0.9rem]">Total Net Profit</h4>
                                            <h1 className="text-[1.6rem]">
                                                $
                                                <span className="font-bold">
                                                    {app.simulationData.length ? app.simulationData[0][1] : (0).toFixed(2)}
                                                </span>
                                            </h1>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="bg-grey-bg">
                            <div className="desktop-left-data-table-high overflow-auto">
                                <Statistics />
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    className={`${app.tour === 2 ? "z-20" : ""
                        } relative w-2/5 2xl:w-[30%] bg-grey-bg right-panel-height`}
                >
                    <div
                        id="rightPanel"
                        ref={rightPanelRef}
                        className="h-full overflow-y-scroll"
                    >
                        <div className="px-[1rem] pt-[1rem]">
                            <CustomPortfolios />
                        </div>
                    </div>
                </div>
            </div>
            {renderOverlays()}
        </div>
    );
}

export default Desktop;
