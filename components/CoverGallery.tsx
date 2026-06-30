"use client";

// How many px each image is lifted from the bottom — staggered rhythm
const LIFT = [0, 24, 6, 18, 0, 14, 8, 20];

export function CoverGallery({
  coverImage,
  coverImages,
}: {
  coverImage?: string | null;
  coverImages?: string[];
}) {
  const images = [coverImage, ...(coverImages ?? [])].filter(Boolean) as string[];
  if (!images.length) return null;

  const isSingle = images.length === 1;

  return (
    <div className="overflow-x-auto no-scrollbar -mx-4 px-4 mb-10">
      <div
        className={`flex items-end gap-4 pt-2 pb-4 ${isSingle ? "justify-start" : "justify-start md:justify-center"}`}
        style={{ minWidth: "fit-content" }}
      >
        {images.map((src, i) => {
          const lift = isSingle ? 0 : LIFT[i % LIFT.length];
          const width = i === 0 ? 130 : 96;

          return (
            <div
              key={i}
              className="shrink-0 bg-paper rounded-sm overflow-hidden"
              style={{
                marginBottom: lift,
                width,
                boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                style={{
                  width: "100%",
                  aspectRatio: "9/16",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
