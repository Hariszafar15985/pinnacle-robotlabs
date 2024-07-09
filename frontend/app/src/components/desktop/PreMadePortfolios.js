import React, { useContext } from "react";

import Portfolios from "../Portfolios";
import Addons from "../Addons";
import { motion } from "framer-motion";
import { AppContext } from "../../Provider";
import RobotPortfolioModal from "../RobotPortfolioModal.js";

function PreMadePortfolios() {
  const { app } = useContext(AppContext);
  const tourActiveTransition = {
    active: { scale: 1.1 },
    deactive: { scale: 1.0 },
  };

  const getFrameClass = () => {
    let className = "px-6 pt-8 py-2 z-30 ";

    if (app.tour === 1) {
      className += "bg-gray-700 relative";
    }

    return className;
  };

  const getAddonFrameClass = () => {
    let className = "px-6 py-0.5";
    if (app.tour === 2) {
      return className + " bg-gray-700 relative z-30 ";
    } else {
      return className + " ";
    }
  };

  function toggleRobotPortfolioModal() {
    app.setShowRobotPortfolioModal(!app.showRobotPortfolioModal);
  }

  return (
    <div>
      {app.showRobotPortfolioModal && <RobotPortfolioModal />}
      <motion.div
        className={getFrameClass()}
        animate={app.tour === 1 ? "active" : "deactive"}
        variant={tourActiveTransition}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg">Pre Made Portfolios</h3>
          <div
            className="text-center inline-flex bg-blue-500 rounded-l-full rounded-r-full px-4 py-2 font-bold cursor-pointer capitalize text-xs mr-2"
            onClick={toggleRobotPortfolioModal}
          >
            {`Compare Portfolios & Add-ons`}
          </div>
        </div>
        <Portfolios />
      </motion.div>
      <div className={getAddonFrameClass()}>
        <Addons />
      </div>
    </div>
  );
}

export default PreMadePortfolios;
