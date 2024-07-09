import SwiperCore, { Navigation } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.min.css";

import PremadePortfolio from "./PremadePortfolio";

SwiperCore.use([Navigation]);

function PremadePortfolios(props) {
    const { premadePortfolios } = props;

    return (
        <>
            <Swiper
                direction="horizontal"
                navigation={true}
                mousewheel={true}
                spaceBetween={20}
                slidesPerView={"auto"}
                observer={true}
                observeParents={true}
                parallax={true}
            >
                {premadePortfolios.map((portfolio) => {
                    return (
                        <SwiperSlide className="portfolio-card" key={`${portfolio.id}`}>
                            <PremadePortfolio portfolio={portfolio} />
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </>
    );
}

export default PremadePortfolios;
