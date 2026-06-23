import React from "react";

interface Props {
  accessories?: string[];
  head?: "nelson" | "barb";
  className?: string;
}

// ✅ Decide which head to show
const getHeadFile = (head: string, accessories: string[]) => {
  if (head !== "nelson") return "/profile/head-nelson-base.svg";

  if (accessories.includes("mohawk")) {
    return "/profile/head-nelson-mohawk.svg";
  }

  if (accessories.includes("bowtie")) {
    return "/profile/head-nelson-bowtie.svg";
  }

  return "/profile/head-nelson-base.svg";
};

const NelsonAvatar: React.FC<Props> = ({ accessories = [], head = "nelson", className }) => {
  const has = (id: string) => accessories.includes(id);

  return (
    <div className={`relative ${className ?? ""} flex items-center justify-center`}>
      {/* ✅ VISUAL OFFSET (adjust if needed) */}
      <div className="relative w-full h-full -translate-x-[6%]">
        {/* ✅ BODY */}
        <img
          src="/profile/body-base-nohead.svg"
          alt=""
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ objectFit: "contain", zIndex: 1 }}
          draggable={false}
        />

        {/* ✅ HEAD */}
        <img
          src={getHeadFile(head, accessories)}
          alt=""
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ objectFit: "contain", zIndex: 2 }}
          draggable={false}
        />

        {/* ✅ GLASSES */}
        {has("glasses") && (
          <img
            src="/profile/glasses-basic.svg"
            alt=""
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ objectFit: "contain", zIndex: 3 }}
          />
        )}

        {has("starGlasses") && (
          <img
            src="/profile/glasses-star.svg"
            alt=""
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ objectFit: "contain", zIndex: 3 }}
          />
        )}

        {/* ✅ HATS */}
        {has("cap") && (
          <img
            src="/profile/hat-cap.svg"
            alt=""
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ objectFit: "contain", zIndex: 4 }}
          />
        )}

        {has("pirateHat") && (
          <img
            src="/profile/hat-pirate.svg"
            alt=""
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ objectFit: "contain", zIndex: 4 }}
          />
        )}

        {has("sunhat") && (
          <img
            src="/profile/hat-sun.svg"
            alt=""
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ objectFit: "contain", zIndex: 4 }}
          />
        )}
      </div>
    </div>
  );
};

export default NelsonAvatar;
