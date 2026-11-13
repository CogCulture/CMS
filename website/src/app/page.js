import { notFound } from "next/navigation";
import ScrollStage from "@/components/ScrollStage";
import Hero from "@/components/home/Hero";
import HeroSearch from "@/components/home/HeroSearch";
import LaunchStack from "@/components/home/LaunchStack";
import DevelopmentsRail from "@/components/home/DevelopmentsRail";
import { getPage } from "@/services/pageService";
import CommunitiesCollage from "@/components/home/CommunitiesCollage";
import ShowcaseMosaic from "@/components/home/ShowcaseMosaic";
import LegacyStats from "@/components/home/LegacyStats";
import PressRail from "@/components/home/PressRail";
import ConverseCta from "@/components/home/ConverseCta";


// generateMetadata jaisa tha waisa

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }) {
  const sParams = await searchParams;
  const isPreview = sParams?.preview === "true" || sParams?.preview === "staged" || sParams?.editor === "true";
  const page = await getPage("home", { isPreview });
  if (!page) notFound();

  const componentMap = {
    hero: (
      <Hero key="hero" data={page.hero}>
        <HeroSearch data={page.search} />
      </Hero>
    ),
    launches: <LaunchStack key="launches" data={page.launches} />,
    developments: <DevelopmentsRail key="developments" data={page.developments} />,
    underDevelopment: <DevelopmentsRail key="underDevelopment" data={page.underDevelopment} />,
    communitiesIntro: <LaunchStack key="communitiesIntro" data={page.communitiesIntro} />,
    communities: <CommunitiesCollage key="communities" data={page.communities} />,
    propertiesIntro: <LaunchStack key="propertiesIntro" data={page.propertiesIntro} />,
    showcase: <ShowcaseMosaic key="showcase" data={page.showcase} />,
    legacy: <LegacyStats key="legacy" data={page.legacy} />,
    press: <PressRail key="press" data={page.press} />,
    converse: <ConverseCta key="converse" data={page.converse} />,
  };

  const defaultOrder = [
    { id: "hero", visible: true },
    { id: "launches", visible: true },
    { id: "developments", visible: true },
    { id: "underDevelopment", visible: true },
    { id: "communitiesIntro", visible: true },
    { id: "communities", visible: true },
    { id: "propertiesIntro", visible: true },
    { id: "showcase", visible: true },
    { id: "legacy", visible: true },
    { id: "press", visible: true },
    { id: "converse", visible: true },
  ];

  const orderList = Array.isArray(page.sections_order) && page.sections_order.length > 0
    ? page.sections_order
    : defaultOrder;

  return (
    <ScrollStage>
      {orderList.map((item) => {
        if (item.visible === false) return null;
        return componentMap[item.id] || null;
      })}
    </ScrollStage>
  );
}