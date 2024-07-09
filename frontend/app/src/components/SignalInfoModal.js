import React, { useContext } from "react";
import "swiper/swiper-bundle.min.css";

import { AppContext } from "../Provider";
import HotIcon from "../images/hotlist_standalone.png";
import AfterHoursIcon from "../images/robots/After-Hours.svg";
import LiquidityIcon from "../images/robots/Liquidity.svg";
import PowerIcon from "../images/robots/Power.svg";
import RainMakerIcon from "../images/robots/Rain-Maker.svg";
import ScalpingIcon from "../images/robots/Scalping.svg";
import STLDarkLogo from "../images/signal_trader_lab_logo_dark.svg";
import { ReactComponent as CloseIcon } from "../images/tour/close.svg";

function SignalInfoModal(props) {
    const { type } = props;
    const { app } = useContext(AppContext);

    const onClose = () => {
        app.setShowSignalInfoModal(false);
    };

    const renderContent = () => {
        switch (type) {
            case 'power':
                return (
                    <div className="w-full flex items-center">
                        <div className="flex justify-center min-w-[5rem] w-[5rem] h-[5rem] rounded-[1.5rem] bg-[#16131B] mr-[1rem]">
                            <img alt="power-icon" src={PowerIcon} className="w-[3.5rem] h-auto" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-[#FF555B]">
                                Power Signals
                            </h3>
                            <div className="text-[0.9rem] leading-[1.2rem] text-[black]">Ultra reliable 5-min to 1hr U.S Day Trading Signals with RR Edge Rations from 1 to 3x</div>
                        </div>
                    </div>
                )
            case 'maker':
                return (
                    <div className="w-full flex items-center">
                        <div className="flex justify-center min-w-[5rem] w-[5rem] h-[5rem] rounded-[1.5rem] bg-[#16131B] mr-[1rem]">
                            <img alt="power-icon" src={RainMakerIcon} className="w-[3.5rem] h-auto" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-[#52A1FF]">
                                Rain Maker Signals
                            </h3>
                            <div className="text-[0.9rem] leading-[1.2rem] text-[black]">All day, Open to Close runners with RR Edge Rations from 3 to 10x</div>
                        </div>
                    </div>
                )
            case 'scalping':
                return (
                    <div className="w-full flex items-center">
                        <div className="flex justify-center min-w-[5rem] w-[5rem] h-[5rem] rounded-[1.5rem] bg-[#16131B] mr-[1rem]">
                            <img alt="power-icon" src={ScalpingIcon} className="w-[3.5rem] h-auto" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-[#FF8B00]">
                                Scalping Signals
                            </h3>
                            <div className="text-[0.9rem] leading-[1.2rem] text-[black]">Quick 1-min to 15-min account boosters with RR Edge Rations from 0.5 to 2x</div>
                        </div>
                    </div>
                )
            case 'inter':
                return (
                    <div className="w-full flex items-center">
                        <div className="flex justify-center min-w-[5rem] w-[5rem] h-[5rem] rounded-[1.5rem] bg-[#16131B] mr-[1rem]">
                            <img alt="power-icon" src={AfterHoursIcon} className="w-[3.5rem] h-auto" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-[#C352FF]">
                                After Hours / International Session Signals
                            </h3>
                            <div className="text-[0.9rem] leading-[1.2rem] text-[black]">Explosive Nighttime to Pre-market signals with RR Edge Rations from 1 to 10x</div>
                        </div>
                    </div>
                )
            case 'liquidity':
                return (
                    <div className="w-full flex items-center">
                        <div className="flex justify-center min-w-[5rem] w-[5rem] h-[5rem] rounded-[1.5rem] bg-[#16131B] mr-[1rem]">
                            <img alt="power-icon" src={LiquidityIcon} className="w-[3.5rem] h-auto" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-[#2EEF49]">
                                Liquidity Signals
                            </h3>
                            <div className="text-[0.9rem] leading-[1.2rem] text-[black]">Multi-Timeframe Market Structure Swing trade signals with with RR Edge Rations from 3 to 15x</div>
                        </div>
                    </div>
                )
            case 'hot':
                return (
                    <div className="w-full flex items-center">
                        <div className="flex justify-center items-center min-w-[5rem] w-[5rem] h-[5rem] rounded-[1.5rem] bg-[#16131B] mr-[1rem]">
                            <img alt="power-icon" src={HotIcon} className="h-[3.5rem] w-auto" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-[#f19699]">
                                Hot Signals
                            </h3>
                            <div className="text-[0.9rem] leading-[1.2rem] text-[black]">Quickly shows you the 5 Top Performing Signals for the current market conditions over the last 30 trading days, across ALL five A.I.Signal Categories.</div>
                        </div>
                    </div>
                )
            default:
                return (
                    <>
                        <div className="w-full flex items-center mb-[2rem]">
                            <div className="flex justify-center min-w-[5rem] w-[5rem] h-[5rem] rounded-[1.5rem] bg-[#16131B] mr-[1rem]">
                                <img alt="power-icon" src={PowerIcon} className="w-[3.5rem] h-auto" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-[#FF555B]">
                                    Power Signals
                                </h3>
                                <div className="text-[0.9rem] leading-[1.2rem] text-[black]">Ultra reliable 5-min to 1hr U.S Day Trading Signals with RR Edge Rations from 1 to 3x</div>
                            </div>
                        </div>
                        <div className="w-full flex items-center mb-[2rem]">
                            <div className="flex justify-center min-w-[5rem] w-[5rem] h-[5rem] rounded-[1.5rem] bg-[#16131B] mr-[1rem]">
                                <img alt="power-icon" src={RainMakerIcon} className="w-[3.5rem] h-auto" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-[#52A1FF]">
                                    Rain Maker Signals
                                </h3>
                                <div className="text-[0.9rem] leading-[1.2rem] text-[black]">All day, Open to Close runners with RR Edge Rations from 3 to 10x</div>
                            </div>
                        </div>
                        <div className="w-full flex items-center mb-[2rem]">
                            <div className="flex justify-center min-w-[5rem] w-[5rem] h-[5rem] rounded-[1.5rem] bg-[#16131B] mr-[1rem]">
                                <img alt="power-icon" src={ScalpingIcon} className="w-[3.5rem] h-auto" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-[#FF8B00]">
                                    Scalping Signals
                                </h3>
                                <div className="text-[0.9rem] leading-[1.2rem] text-[black]">Quick 1-min to 15-min account boosters with RR Edge Rations from 0.5 to 2x</div>
                            </div>
                        </div>
                        <div className="w-full flex items-center mb-[2rem]">
                            <div className="flex justify-center min-w-[5rem] w-[5rem] h-[5rem] rounded-[1.5rem] bg-[#16131B] mr-[1rem]">
                                <img alt="power-icon" src={AfterHoursIcon} className="w-[3.5rem] h-auto" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-[#C352FF]">
                                    After Hours / International Session Signals
                                </h3>
                                <div className="text-[0.9rem] leading-[1.2rem] text-[black]">Explosive Nighttime to Pre-market signals with RR Edge Rations from 1 to 10x</div>
                            </div>
                        </div>
                        <div className="w-full flex items-center">
                            <div className="flex justify-center min-w-[5rem] w-[5rem] h-[5rem] rounded-[1.5rem] bg-[#16131B] mr-[1rem]">
                                <img alt="power-icon" src={LiquidityIcon} className="w-[3.5rem] h-auto" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-[#2EEF49]">
                                    Liquidity Signals
                                </h3>
                                <div className="text-[0.9rem] leading-[1.2rem] text-[black]">Multi-Timeframe Market Structure Swing trade signals with with RR Edge Rations from 3 to 15x</div>
                            </div>
                        </div>
                    </>
                )
        }
    }

    return (
        <div
            className="h-screen animated fadeIn faster fixed left-0 top-0 flex overflow-auto justify-center items-center inset-0 z-30 outline-none focus:outline-none bg-no-repeat bg-center bg-cover"
            id="signal-info-modal"
            onClick={onClose}
        >
            <div className={`fixed z-40 sm:w-full md:w-1/2 ${type === true ? 'h-3/4' : 'h-[14rem]'} rounded-lg shadow-lg`} onClick={e => e.stopPropagation()}>
                <CloseIcon
                    className="w-[1.5rem] h-[1.5rem] absolute z-50 -top-[0.7rem] -right-[0.7rem] cursor-pointer"
                    onClick={onClose}
                />
                <div className={`fixed overflow-auto z-30 sm:w-full md:w-1/2 ${type === true ? 'h-3/4' : 'h-[14rem]'} rounded-[1rem] shadow-lg bg-[white] items-center justify-center`}>
                    <div className="w-full pl-[4rem] pr-[2rem] py-[2rem]">
                        <div className="w-full flex justify-end mb-[2rem]">
                            <img alt="STL-logo" src={STLDarkLogo} className="w-[10rem] h-auto" />
                        </div>
                        <div className="w-full pr-[8rem]">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignalInfoModal;
