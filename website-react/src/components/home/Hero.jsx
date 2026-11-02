import PropertySearch from "../PropertySearch";

export default function Hero({ data }) {
  const videoSrc = data?.hero_video || "/videos/emaar.mp4";

  return (
    <section className="relative h-screen w-full flex-col items-center flex">
      {/* Background Video */}
      <video
        key={videoSrc}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* Property Search Bar Component */}
      <PropertySearch placeholder={data?.hero_search_placeholder} />
    </section>
  );
}