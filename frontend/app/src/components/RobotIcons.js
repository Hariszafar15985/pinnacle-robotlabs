import { ReactComponent as AfterParty } from "../images/robots/after party.svg";
import { ReactComponent as AverageJoeCool } from "../images/robots/average joe cool.svg";
import { ReactComponent as BackToTheFutures } from "../images/robots/back to the futures.svg";
import { ReactComponent as BreakDancer } from "../images/robots/break dancer.svg";
import { ReactComponent as BreakUnicorn } from "../images/robots/breakout unicorn.svg";
import { ReactComponent as BrunchRanger } from "../images/robots/brunch ranger.svg";
import { ReactComponent as ChaosTheory } from "../images/robots/chaos theory.svg";
import { ReactComponent as CountertrendMajestro } from "../images/robots/countertrend majestro.svg";
import { ReactComponent as EarlyBirdie } from "../images/robots/early birdie.svg";
import { ReactComponent as EnergizerBunny } from "../images/robots/energizer bunny.svg";
import { ReactComponent as Equalizer } from "../images/robots/equalizer.svg";
import { ReactComponent as EternalEdge } from "../images/robots/eternal edge.svg";
import { ReactComponent as GoldenParachute } from "../images/robots/golden parachute.svg";
import { ReactComponent as IronMan } from "../images/robots/iron man.svg";
import { ReactComponent as LowVolatilityRider } from "../images/robots/low volatility rider.svg";
import { ReactComponent as MemeSqueezer } from "../images/robots/meme squeezer.svg";
import { ReactComponent as MidasTouch } from "../images/robots/midas touch.svg";
import { ReactComponent as MotherGusher } from "../images/robots/mother gusher.svg";
import { ReactComponent as NaturalEinstein } from "../images/robots/natural einstein.svg";
import { ReactComponent as PullbackArtist } from "../images/robots/pullback artist.svg";
// import { ReactComponent as RobotIcon } from "../images/robots/robot-icon.svg";
import { ReactComponent as BigBang } from "../images/robots/big-bang.svg";
import { ReactComponent as Compositon } from "../images/robots/compositon.svg";
import { ReactComponent as JohnSmith } from "../images/robots/john-smith.svg";
import { ReactComponent as MrBrown } from "../images/robots/mr-brown.svg";
import { ReactComponent as Putzmeister } from "../images/robots/putzmeister.svg";
import { ReactComponent as SigmundFreud } from "../images/robots/sigmund freud.svg";
import { ReactComponent as SleepWalker } from "../images/robots/sleep-walker.svg";
import { ReactComponent as SleeperCell } from "../images/robots/sleeper cell.svg";
import { ReactComponent as Spike } from "../images/robots/spike.svg";
import { ReactComponent as StandardJumper } from "../images/robots/standard-jumper.svg";
import { ReactComponent as SteadyEddy } from "../images/robots/steady eddy.svg";
import { ReactComponent as StraightNoChaser } from "../images/robots/straight no chaser.svg";
import { ReactComponent as TechTitan } from "../images/robots/tech titan.svg";
import { ReactComponent as TrendStalker } from "../images/robots/trend stalker.svg";
import { ReactComponent as Unipeg } from "../images/robots/unipeg.svg";
import { ReactComponent as WildCatter } from "../images/robots/wild catter.svg";

import { ReactComponent as AfterHoursIcon } from "../images/robots/After-Hours.svg";
import { ReactComponent as LiquidityIcon } from "../images/robots/Liquidity.svg";
import { ReactComponent as PowerIcon } from "../images/robots/Power.svg";
import { ReactComponent as RainMakerIcon } from "../images/robots/Rain-Maker.svg";
import { ReactComponent as ScalpingIcon } from "../images/robots/Scalping.svg";

import { ReactComponent as DefaultRobotIcon } from "../images/robots/default-robot.svg";


const RobotIcons = {
    fallback: () => <DefaultRobotIcon className="h-16 lg:h-[3.3rem]" />,
    "midas touch": () => <MidasTouch className="h-16 lg:h-[3.3rem]" />,
    "pullback artist": () => (
        <PullbackArtist className="h-16 lg:h-[3.3rem]" />
    ),
    "countertrend majestro": () => (
        <CountertrendMajestro className="h-16 lg:h-[3.3rem]" />
    ),
    "golden parachute": () => (
        <GoldenParachute className="h-16 lg:h-[3.3rem]" />
    ),
    "break dancer": () => <BreakDancer className="h-16 lg:h-[3.3rem]" />,
    "average joe cool": () => (
        <AverageJoeCool className="h-16 lg:h-[3.3rem]" />
    ),
    "trend stalker": () => <TrendStalker className="h-16 lg:h-[3.3rem]" />,
    "low volatility rider": () => (
        <LowVolatilityRider className="h-16 lg:h-[3.3rem]" />
    ),
    "straight no chaser": () => (
        <StraightNoChaser className="h-16 lg:h-[3.3rem]" />
    ),
    "eternal edge": () => <EternalEdge className="h-16 lg:h-[3.3rem]" />,
    "back to the futures": () => (
        <BackToTheFutures className="h-16 lg:h-[3.3rem]" />
    ),
    "breakout unicorn": () => <BreakUnicorn className="h-16 lg:h-[3.3rem]" />,
    "early birdie": () => <EarlyBirdie className="h-16 lg:h-[3.3rem]" />,
    "after party": () => <AfterParty className="h-16 lg:h-[3.3rem]" />,
    "brunch ranger": () => <BrunchRanger className="h-16 lg:h-[3.3rem]" />,
    "chaos theory": () => <ChaosTheory className="h-16 lg:h-[3.3rem]" />,
    "energizer bunny": () => (
        <EnergizerBunny className="h-16 lg:h-[3.3rem]" />
    ),
    "equalizer": () => <Equalizer className="h-16 lg:h-[3.3rem]" />,
    "iron man": () => <IronMan className="h-16 lg:h-[3.3rem]" />,
    "meme squeezer": () => <MemeSqueezer className="h-16 lg:h-[3.3rem]" />,
    "mother gusher": () => <MotherGusher className="h-16 lg:h-[3.3rem]" />,
    "natural einstein": () => (
        <NaturalEinstein className="h-16 lg:h-[3.3rem]" />
    ),
    "sigmund freud": () => <SigmundFreud className="h-16 lg:h-[3.3rem]" />,
    "sleeper cell": () => <SleeperCell className="h-16 lg:h-[3.3rem]" />,
    "spike": () => <Spike className="h-16 lg:h-[3.3rem]" />,
    "tech titan": () => <TechTitan className="h-16 lg:h-[3.3rem]" />,
    "steady eddy": () => <SteadyEddy className="h-16 lg:h-[3.3rem]" />,
    "wild catter": () => <WildCatter className="h-16 lg:h-[3.3rem]" />,
    "big bang": () => <BigBang className="h-16 lg:h-[3.3rem]" />,
    "compositon": () => <Compositon className="h-16 lg:h-[3.3rem]" />,
    "john smith": () => <JohnSmith className="h-16 lg:h-[3.3rem]" />,
    "mr. brown": () => <MrBrown className="h-16 lg:h-[3.3rem]" />,
    "putzmeister": () => <Putzmeister className="h-16 lg:h-[3.3rem]" />,
    "sleep walker": () => <SleepWalker className="h-16 lg:h-[3.3rem]" />,
    "standard jumper": () => <StandardJumper className="h-16 lg:h-[3.3rem]" />,
    "unipeg": () => <Unipeg className="h-16 lg:h-[3.3rem]" />,

    "Power Signals": () => <PowerIcon className="h-16 lg:h-[3.3rem]" />,
    "Maker Signals": () => <RainMakerIcon className="h-16 lg:h-[3.3rem]" />,
    "International Signals": () => <AfterHoursIcon className="h-16 lg:h-[3.3rem]" />,
    "Liquidity Signals": () => <LiquidityIcon className="h-16 lg:h-[3.3rem]" />,
    "Scalping Signals": () => <ScalpingIcon className="h-16 lg:h-[3.3rem]" />,
};
export default RobotIcons;
