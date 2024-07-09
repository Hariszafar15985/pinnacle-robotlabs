import SwiperCore, { Navigation } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.min.css";

import Robot from "./Robot";

SwiperCore.use([Navigation]);

function Robots(props) {
    const { robotList, categoryColor, categoryId } = props;

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
                {robotList.map((robot) => {
                    return (
                        <SwiperSlide className={`${robot.instruments?.length < 2 ? 'robot-card-single' : 'robot-card-multiple'}`} key={`${robot.group}-${robot.id}-${robot.name}`}>
                            <Robot robot={robot} categoryId={categoryId} categoryColor={categoryColor} />
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </>
    );
}

export default Robots;
