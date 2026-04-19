export const Gallery = ({ images, alt }: { images: string[]; alt: string }) => {
  if (!images.length) return null;
  if (images.length === 1) {
    return (
      <figure className="my-6">
        <img
          src={images[0]}
          alt={alt}
          loading="lazy"
          className="w-full h-auto object-cover rounded-sm shadow-soft"
        />
      </figure>
    );
  }
  return (
    <div className="my-6 grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`${alt} — ${i + 1}`}
          loading="lazy"
          className={
            "w-full h-56 sm:h-64 object-cover rounded-sm shadow-soft " +
            (i === 0 && images.length >= 3 ? "col-span-2 row-span-2 h-full sm:h-[33rem]" : "")
          }
        />
      ))}
    </div>
  );
};
