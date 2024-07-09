import React, { useContext, useEffect } from "react";
import { AppContext } from "../Provider";
import { ReactComponent as SelectedIcon } from "../images/circle-selected.svg";
import { ReactComponent as SelectedIconWhite } from "../images/circle-selected-white.svg";
import { motion, useAnimation } from "framer-motion";

const clickTransition = {
  inactive: { backgroundColor: "rgba(33, 36, 43, 1)" },
  active: {
    backgroundColor: "rgba(33, 36, 43, 0)",
    transition: { duration: 1 },
  },
};

const portfolioIconTransition = {
  rest: { opacity: 0, visibility: "hidden" },
  display: {
    opacity: 1,
    visibility: "visible",
  },
  move: {
    left: "90px",
    top: "290px",
    transition: { duration: 1.5 },
  },
  easeOut: {
    opacity: 0,
    transition: { duration: 1 },
  },
};

function Portfolio(props) {
  const { app, portfolios } = useContext(AppContext);
  const portfolioIconControls = useAnimation();

  const { isActive, portfolio } = props;

  const select = (sku) => {
    portfolios.select(sku);
  };

  const getToTalNumberOfRobots = () => {
    let total = 0;
    if (portfolio && portfolio.robots) {
      if (portfolio.robots.baseline) total += portfolio.robots.baseline.length;
      if (portfolio.robots.intermediate)
        total += portfolio.robots.intermediate.length;
      if (portfolio.robots.aggressive)
        total += portfolio.robots.aggressive.length;
    }

    return total;
  };

  useEffect(() => {
    if (app.tour === 1.1 && isActive) {
      const animation = async () => {
        await portfolioIconControls.start("display");
        await portfolioIconControls.start("move");
        app.reloadSimulationDataInTour(1);
        await portfolioIconControls.start("easeOut");
      };

      animation();
    }
    // eslint-disable-next-line
  }, [app.tour]);

  return (
    <div
      className={
        "rounded-3xl mt-5 lg:mt-3 " + (isActive ? "background-plan-active" : "")
      }
    >
      <motion.div
        initial="inactive"
        variants={clickTransition}
        animate={isActive ? "active" : "inactive"}
        className="flex rounded-3xl border border-gray-500 select-none cursor-pointer py-3 px-6 ' +
          'lg:pr-10 h-24 items-center bg-theme-gray-900"
        key={portfolio.sku}
        onClick={() => {
          select(portfolio.sku);
        }}
      >
        <div className="flex items-center">
          <div
            className={
              "relative rounded-full w-12 h-12 " +
              (isActive ? "bg-green-200" : "bg-theme-gray-700")
            }
          >
            {isActive ? (
              <>
                <div className="absolute z-20 w-12 h-12 p-1">
                  <SelectedIcon />
                </div>
                {app.tour >= 1 && app.tour < 2 && (
                  <motion.div
                    initial="rest"
                    variants={portfolioIconTransition}
                    animate={portfolioIconControls}
                    className="fixed z-30 w-12 h-12 p-1"
                  >
                    <SelectedIconWhite />
                  </motion.div>
                )}
              </>
            ) : null}
          </div>
        </div>
        <div className={"pl-5 flex-grow " + (isActive ? "text-black" : "")}>
          <h3 className="font-bold text-left pb-2 text-sm xs:text-base">
            {portfolio.title}
          </h3>
          <div
            className={
              "flex text-xxs xs:text-xs " +
              (isActive ? "" : "text-theme-gray-700")
            }
          >
            <div
              className={
                "font-bold " + (isActive ? "text-black" : "text-white")
              }
            >
              {" "}
              {`${getToTalNumberOfRobots()} Robots:`}
            </div>
            <div className="pl-1">
              {portfolio.robots && portfolio.robots.baseline
                ? portfolio.robots.baseline.length
                : 0}{" "}
              Active /
            </div>
            <div className="pl-1">
              {portfolio.robots && portfolio.robots.intermediate
                ? portfolio.robots.intermediate.length
                : 0}{" "}
              Ambitious /
            </div>
            <div className="pl-1">
              {portfolio.robots && portfolio.robots.aggressive
                ? portfolio.robots.aggressive.length
                : 0}{" "}
              Aggressive
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Portfolio;
