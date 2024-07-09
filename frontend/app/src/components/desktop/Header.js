import { useContext } from "react";

import { AppContext } from "Provider";

import Arrow from "images/green-arrow-help.svg";
import RobotLabLogo from "images/logo-Dec-2023.svg";

function Header(props) {
    const { app } = useContext(AppContext);

    const goToHome = () => {
        window.location = "https://ninjacators.com/";
    };

    const goToHelp = () => {
        window.open("https://ninjacators.com/algobotportfolioanalyzer/", '_blank');
    };

    const onVersionSelect = (ver) => {
        app.setCurrentVersion(ver);
    };

    return (
        <div className="h-[3.75rem] items-center flex bg-brand-navy">
            <div className="w-3/5 2xl:w-[70%] px-[1.6rem] py-5 flex justify-between items-center">
                <img alt="" src={RobotLabLogo} className="h-[2.45rem] w-auto mr-auto cursor-pointer" onClick={goToHome} />
                <div className="flex items-center">
                    <div><img alt="" src={Arrow} className="h-[2.2rem] w-auto mr-[0.6rem]" /></div>
                    <div className="w-[17.35rem] h-[2.6rem] bg-[#CEDE3F] rounded-[10rem] px-[1.5rem] py-[0.5rem] text-[0.7rem] font-bold text-center text-[#263850] flex items-center cursor-pointer" onClick={goToHelp}>Watch Video Series How To Use The Algo-Bot Portfolio Builder & Analyzer.</div>
                </div>
            </div>
            <div className="w-2/5 2xl:w-[30%] h-full flex items-end text-[0.8rem] font-bold">
                <div
                    className={`py-[0.8rem] px-[1.75rem] ${app.currentVersion === 'normal' ? 'bg-grey-bg rounded-t-[0.8rem]' : 'cursor-pointer'}`}
                    onClick={() => onVersionSelect('normal')}
                >
                    Robot Lab
                </div>
                <div
                    className={`py-[0.8rem] px-[1.75rem] ${app.currentVersion === 'pro' ? 'bg-grey-bg rounded-t-[0.8rem]' : 'cursor-pointer'}`}
                    onClick={() => onVersionSelect('pro')}
                >
                    Robot Portfolio Lab PRO
                </div>
            </div>
        </div>
    );
}

export default Header;
