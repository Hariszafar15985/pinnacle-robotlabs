import React, { useContext, useEffect, useState, useCallback } from "react";
import { motion, useAnimation } from "framer-motion";

import { AppContext } from "../Provider";
import useWindowDimensions from "../helpers/windowDimensions";

import { ReactComponent as LoadingIcon } from "../images/tail-spin.svg";
import { ReactComponent as SelectedIcon } from "../images/circle-selected.svg";
import { ReactComponent as SelectedIconWhite } from "../images/circle-selected-white.svg";
import { ReactComponent as CheckIcon } from "../images/checkmark.svg";

const addonIconTransition = {
  rest: {
    opacity: 0,
    visibility: "hidden",
    position: "fixed",
    display: "initial",
  },
  display: {
    opacity: 1,
    visibility: "visible",
    transition: { duration: 0.6 },
  },
  move: {
    left: "90px",
    top: "290px",
    transition: { duration: 1 },
  },
  easeOut: {
    opacity: 0,
    transition: { duration: 0.5 },
  },
};

function Addons() {
  const { app, addons } = useContext(AppContext);
  const addonIconControls = useAnimation();
  const addonIcon2Controls = useAnimation();
  const { height } = useWindowDimensions();

  const [animatedIcon1Style, setAnimatedIcon1Style] = useState({
    display: "none",
  });
  const [animatedIcon2Style, setAnimatedIcon2Style] = useState({
    display: "none",
  });

  const onSelectAddon = (sku) => {
    addons.select(sku);
  };

  const isSelected = (sku) => {
    for (let addonSku of addons.selected) {
      if (addonSku === sku) return true;
    }
    return false;
  };

  const animatedIcon1Ref = useCallback(
    (node) => {
      if (node !== null) {
        let iconRect = node.getBoundingClientRect();
        const updatedStyle = {
          width: `${iconRect.width}px`,
          height: `${iconRect.height}px`,
          left: `${iconRect.left}px`,
          top: `${height >= 810 ? iconRect.top : iconRect.top - 150}px`,
        };
        setAnimatedIcon1Style(updatedStyle);
      }
    },
    [height]
  );

  const animatedIcon2Ref = useCallback(
    (node) => {
      if (node !== null) {
        let iconRect = node.getBoundingClientRect();
        const updatedStyle = {
          width: `${iconRect.width}px`,
          height: `${iconRect.height}px`,
          left: `${iconRect.left}px`,
          top: `${height >= 810 ? iconRect.top : iconRect.top - 150}px`,
        };
        setAnimatedIcon2Style(updatedStyle);
      }
    },
    [height]
  );

  useEffect(() => {
    if (app.portfolioType === "preMade") {
      if (app.tour === 3) {
        const animation1 = async () => {
          await addonIconControls.start("display");
          await addonIconControls.start("move");
          await addonIconControls.start("easeOut");
          app.reloadSimulationDataInTour(2);
        };
        const animation2 = async () => {
          await addonIcon2Controls.start("display");
          await addonIcon2Controls.start("move");
          await addonIcon2Controls.start("easeOut");
          app.reloadSimulationDataInTour(3);
        };
        const animationSequence = async () => {
          await animation1();
          setTimeout(() => {
            animation2();
          }, 1000);
          setTimeout(() => {
            app.setTour(3.1);
          }, 5500);
        };
        animationSequence();
      }
    }
    // eslint-disable-next-line
  }, [app.tour]);

  return (
    <div className="border border-gray-500 py-7 px-6 mt-5 mb-7 rounded-3xl bg-theme-gray-900">
      {!addons.loaded && (
        <div className="flex items-center justify-center py-10">
          <LoadingIcon className="w-8" />
        </div>
      )}
      {addons.loaded && <h3 className="font-bold text-left pb-3">Add-ons</h3>}

      {addons.all.map((addon, index) => {
        let isActive = isSelected(addon.sku);
        return (
          <div
            className="flex items-center py-3 cursor-pointer select-none"
            key={addon.sku}
            onClick={() => {
              onSelectAddon(addon.sku);
            }}
          >
            <div className="flex items-center">
              <div className=" relative rounded-full w-10 h-10 bg-theme-gray-700">
                {isActive ? (
                  <>
                    <div className="absolute z-20 w-10 h-10 p-1">
                      <SelectedIcon width="100%" height="100%" />
                    </div>
                    {app.tour >= 1 && (
                      <motion.div
                        ref={index === 0 ? animatedIcon1Ref : animatedIcon2Ref}
                        initial="rest"
                        variants={addonIconTransition}
                        animate={
                          index === 0 ? addonIconControls : addonIcon2Controls
                        }
                        className="absolute z-30 w-10 h-10 p-1"
                        style={
                          index === 0 ? animatedIcon1Style : animatedIcon2Style
                        }
                      >
                        <SelectedIconWhite width="100%" height="100%" />
                      </motion.div>
                    )}
                  </>
                ) : null}
              </div>
            </div>
            <div className="pl-2 lg:pl-5 mr-auto">
              <h3 className="font-bold text-left text-sm xs:text-base">
                {addon.title}
              </h3>
              <div className="flex text-theme-gray-700 text-xxs xs:text-xs">
                <div className="font-bold text-white">
                  {addon.description.split("/")[0]}
                </div>
                <div className="pl-1">/ {addon.description.split("/")[1]}</div>
              </div>
            </div>
            <div className="flex items-center justify-self-end pl-3 lg:pl-6">
              <div
                className={
                  "rounded-full w-9 h-9 p-2.5 " +
                  (isActive ? "bg-green-300" : "bg-theme-gray-800")
                }
              >
                <CheckIcon
                  className={
                    "fill-current " +
                    (isActive ? "text-white" : "text-theme-gray-700")
                  }
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Addons;
