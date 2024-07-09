import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../Provider";
import { ReactComponent as LoadingIcon } from "../images/tail-spin.svg";
import Portfolio from "./Portfolio";

function Portfolios() {
  const { portfolios } = useContext(AppContext);

  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    if (!portfolios.all.length) {
      portfolios.getPortfoliosAndAddons();
    }
    // eslint-disable-next-line
  }, [portfolios.loaded]);

  // Automatically select the first portfolio on page load
  useEffect(() => {
    if (isFirstLoad && portfolios.loaded && portfolios.all.length > 0) {
      portfolios.select(portfolios.all[0].sku);
      setIsFirstLoad(false);
    }
  }, [portfolios, isFirstLoad]);

  return (
    <div>
      {!portfolios.loaded && (
        <div className="flex items-center justify-center py-10">
          <LoadingIcon className="w-8" />
        </div>
      )}
      {portfolios.all.map((portfolio) => {
        let isActive = portfolio.sku === portfolios.selected;
        return (
          <Portfolio
            key={portfolio.sku}
            isActive={isActive}
            portfolio={portfolio}
          />
        );
      })}
    </div>
  );
}

export default Portfolios;
