import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/footer";
import VisualEditor from "@/components/VisualEditor";
import LiveReloadListener from "@/components/LiveReloadListener";
import { getSiteContent } from "@/services/cmsService";
import HomePage from "@/pages/HomePage";
import PropertyPage from "@/pages/PropertyPage";
import CustomPage from "@/pages/CustomPage";

export default function App() {
  const [cmsData, setCmsData] = useState(null);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    const params = new URLSearchParams(location.search);
    const isPreview =
      params.get("preview") === "true" ||
      params.get("preview") === "staged" ||
      params.get("editor") === "true";

    getSiteContent(isPreview).then((data) => {
      if (isMounted) {
        setCmsData(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [location.search]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#111111]">
      <Header settings={cmsData?.settings} headerData={cmsData?.sections?.header} />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage cmsData={cmsData} />} />
          <Route path="/properties/:slug" element={<PropertyPage />} />
          <Route path="/:slug" element={<CustomPage cmsData={cmsData} />} />
          <Route path="*" element={<CustomPage cmsData={cmsData} />} />
        </Routes>
      </div>
      <Footer settings={cmsData?.settings} footerData={cmsData?.sections?.footer} />
      <VisualEditor />
      <LiveReloadListener />
    </div>
  );
}
