import PropertySearch from "../PropertySearch"; // Adjust this path if needed

export default function Hero() {
  return (
    <section className="relative h-screen w-full  flex-col items-center flex">
      
      {/* Background Video */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/videos/emaar.mp4" type="video/mp4" />
      </video>

      {/* Optional: Add a slight dark gradient/overlay so the white search bar stands out over bright videos */}

      {/* Property Search Bar Component */}
      <PropertySearch />
      
    </section>
  );
}