import { useContext, useMemo } from "react";

import { AppContext } from "Provider";
import { ReactComponent as CheckIcon } from "../images/checkmark.svg";
import { ReactComponent as CashFlowAggressiveIcon } from "../images/premadePortfolios/cash-flow-aggressive.svg";
import { ReactComponent as CashFlowConservativeIcon } from "../images/premadePortfolios/cash-flow-conservative.svg";
import { ReactComponent as CashFlowModerateIcon } from "../images/premadePortfolios/cash-flow-moderate.svg";
import { ReactComponent as DiversifiedIcon } from "../images/premadePortfolios/diversified.svg";
import { ReactComponent as MiniHedgeFundIcon } from "../images/premadePortfolios/mini-hedge-fund.svg";
import { ReactComponent as MixedUSIndexFtIcon } from "../images/premadePortfolios/mixed-us-index-ft.svg";
import { ReactComponent as WarChestAggressiveIcon } from "../images/premadePortfolios/war-chest-aggressive.svg";
import { ReactComponent as WarChestConservativeIcon } from "../images/premadePortfolios/war-chest-conservative.svg";
import { ReactComponent as WarChestModerateIcon } from "../images/premadePortfolios/war-chest-moderate.svg";

function PremadePortfolio(props) {
    const { portfolio } = props;

    const { app, robots } = useContext(AppContext);

    const isSelected = useMemo(() => {
        for (let id of robots.selectedPremadePortfolios) {
            if (id === portfolio.id) return true;
        }
        return false;
    }, [portfolio.id, robots.selectedPremadePortfolios]);

    const onPortfolioSelect = () => {
        robots.selectPremadePortfolio(portfolio);
        app.setTriggerApiCall(true);
    }

    const getIcon = () => {
        switch (portfolio.name) {
            case "Cash Flow Moderate":
                return <CashFlowModerateIcon className="w-[4.9rem] h-auto" />
            case "Cash Flow Conservative":
                return <CashFlowConservativeIcon className="w-[4.9rem] h-auto" />
            case "Cash Flow Aggressive":
                return <CashFlowAggressiveIcon className="w-[4.9rem] h-auto" />
            case "War Chest Moderate":
                return <WarChestModerateIcon className="w-[4.3rem] h-auto" />
            case "War Chest Conservative":
                return <WarChestConservativeIcon className="w-[4.3rem] h-auto" />
            case "War Chest Aggressive":
                return <WarChestAggressiveIcon className="w-[4.3rem] h-auto" />
            case "Mixed US Index Futures":
                return <MixedUSIndexFtIcon className="w-[4.3rem] h-auto" />
            case "Diversified":
                return <DiversifiedIcon className="w-[4.3rem] h-auto" />
            case "Mini Hedge Fund":
                return <MiniHedgeFundIcon className="w-[4.3rem] h-auto" />
            default:
                return <CashFlowModerateIcon className="w-[4.9rem] h-auto" />
        }
    }

    return (
        <div
            onClick={() => onPortfolioSelect()}
            className={
                "relative overflow-visible h-40 xl:h-[9.5rem] rounded-2xl py-[0.5rem] cursor-pointer select-none " +
                (isSelected ? "bg-[#263850] border" : "bg-[#16131B]"
                )
            }
            style={{ borderColor: isSelected ? '#CEDE3F' : '' }}
        >
            <div className="flex flex-col px-[0.5rem] pb-[0.5rem]">
                <div className="flex justify-between items-center">
                    <div className={`w-[1.2rem] h-[1.2rem] p-1 rounded-full ${isSelected ? "" : "bg-gray-500"}`} style={{ backgroundColor: isSelected ? '#CEDE3F' : '' }}>
                        <CheckIcon />
                    </div>
                </div>
                <div className="flex flex-col justify-center items-center relative z-10 mt-[1.2rem] mb-[0.5rem]">
                    {getIcon()}
                    <span className="max-h-[0.9rem] break-words w-3/4 mt-[0.4rem] font-bold text-center text-[0.6rem] text-white">
                        {portfolio.name}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default PremadePortfolio;
