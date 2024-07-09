import React, { useContext } from "react";
import "swiper/swiper-bundle.min.css";

import ChartGreen from "../images/robot-chart-green.svg";
import ChartPurple from "../images/robot-chart-purple.svg";
import ChartRed from "../images/robot-chart-red.svg";
import { ReactComponent as CloseIcon } from "../images/tour/close.svg";
import { AppContext } from "../Provider";
import RobotIcons from "./RobotIcons";

function RobotsModal(props) {
    const { app } = useContext(AppContext);

    // const LIST_TAGS = {
    //   "s&amp;p500_e-mini_&amp;_micros": "S&P 500 E-Mini & Micros",
    // };

    const getIcon = (robotTitle) => {
        let key = robotTitle.toLowerCase();
        let icon =
            typeof RobotIcons[key] !== "undefined"
                ? RobotIcons[key]
                : RobotIcons["fallback"];
        return icon();
    };

    const deactive = () => {
        app.setShowRobotModal(false);
    };

    return (
        <div
            className="h-screen animated fadeIn faster fixed left-0 top-0 flex overflow-auto
       justify-center items-center inset-0 z-50 outline-none focus:outline-none bg-no-repeat bg-center bg-cover"
            id="modal-id"
        >
            <div className="fixed z-40 md:w-1/3 sm:w-full h-5/6 rounded-lg shadow-lg">
                <CloseIcon
                    className="absolute z-50 -top-4 -right-2.5 cursor-pointer"
                    onClick={deactive}
                />
                <div className="fixed overflow-auto z-30 md:w-1/3 sm:w-full h-5/6 rounded-lg shadow-lg robot-display items-center justify-center">
                    <h1 className="text-3xl mt-6 mb-1 mx-10 font-semibold baseline-color">
                        Active Robots
                    </h1>
                    <h4 className="text-sm mx-10 font-semibold">
                        {`Avg. USD Trade <$100`}
                    </h4>
                    {props.baseline.map(function (robot) {
                        return (
                            <div
                                key={robot.name}
                                className="grid grid-cols-6 2xl:grid-cols-8 3xl:grid-cols-6 gap-4 my-6 mx-10"
                            >
                                <div className="relative col-span-2 2xl:col-span-2 3xl:col-span-1 bg-theme-blue-950 rounded-2xl overflow-hidden">
                                    <div className="flex flex-col px-2 pb-4">
                                        <div className="pt-3 flex flex-col justify-center items-center relative z-10">
                                            {getIcon(robot.name)}
                                        </div>
                                    </div>
                                    <img
                                        src={ChartGreen}
                                        alt=""
                                        className="absolute max-w-none -left-1 -bottom-10"
                                        style={{ width: "110%" }}
                                    />
                                </div>
                                <div className="col-span-4 2xl:col-span-6 3xl:col-span-5">
                                    <h3 className="text-xl font-semibold baseline-color">
                                        {robot.name}
                                    </h3>
                                    <p className="text-xs pt-2">{robot.description}</p>
                                </div>
                            </div>
                        );
                    })}
                    <hr className="mx-10 border-1 border-solid border-gray-50 border-opacity-20 rounded-lg" />
                    <h1 className="text-3xl mt-6 mb-1 mx-10 font-semibold inter-color">
                        Ambitious Robots
                    </h1>
                    <h4 className="text-sm mx-10 font-semibold">
                        {`Avg. USD Trade $100 - $200`}
                    </h4>
                    {props.intermediate.map(function (robot) {
                        return (
                            <div
                                key={robot.name}
                                className="grid grid-cols-6 2xl:grid-cols-8 3xl:grid-cols-6 gap-4 my-6 mx-10"
                            >
                                <div className="relative col-span-2 2xl:col-span-2 3xl:col-span-1 bg-theme-blue-950 rounded-2xl overflow-hidden">
                                    <div className="flex flex-col px-2 pb-4">
                                        <div className="text-2xl pt-3 flex flex-col justify-center items-center relative z-10">
                                            {getIcon(robot.name)}
                                        </div>
                                    </div>
                                    <img
                                        src={ChartPurple}
                                        alt=""
                                        className="absolute max-w-none -left-1 -bottom-10"
                                        style={{ width: "110%" }}
                                    />
                                </div>
                                <div className="col-span-4 2xl:col-span-6 3xl:col-span-5">
                                    <h3 className="text-xl font-semibold inter-color">
                                        {robot.name}
                                    </h3>
                                    <p className="text-xs pt-2">{robot.description}</p>
                                </div>
                            </div>
                        );
                    })}
                    <hr className="mx-10 border-1 border-solid border-gray-50 border-opacity-20 rounded-lg" />
                    <h1 className="text-3xl mt-6 mb-1 mx-10 font-semibold aggressive-color">
                        Aggressive Robots
                    </h1>
                    <h4 className="text-sm mx-10 font-semibold">
                        {`Avg. USD Trade >$100`}
                    </h4>
                    {props.aggressive.map(function (robot) {
                        return (
                            <div
                                key={robot.name}
                                className="grid grid-cols-6 2xl:grid-cols-8 3xl:grid-cols-6 gap-4 my-6 mx-10"
                            >
                                <div className="relative col-span-2 2xl:col-span-2 3xl:col-span-1 bg-theme-blue-950 rounded-2xl overflow-hidden">
                                    <div className="flex flex-col px-2 pb-4">
                                        <div className="pt-3 flex flex-col justify-center items-center relative z-10">
                                            {getIcon(robot.name)}
                                        </div>
                                    </div>
                                    <img
                                        src={ChartRed}
                                        alt=""
                                        className="absolute max-w-none -left-1 -bottom-10"
                                        style={{ width: "110%" }}
                                    />
                                </div>
                                <div className="col-span-4 2xl:col-span-6 3xl:col-span-5">
                                    <h3 className="text-xl font-semibold aggressive-color">
                                        {robot.name}
                                    </h3>
                                    <p className="text-xs pt-2">{robot.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default RobotsModal;
