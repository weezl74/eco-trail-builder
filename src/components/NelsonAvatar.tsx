import React from "react";

interface Props {
  woolColor: string;
  accessories?: string[];
  head?: "nelson" | "barb";
  className?: string;
}

// ✅ HEAD FILE (in /public/profile/)
const getHeadFile = (head: string, accessories: string[]) => {
  const base = "/profile/";

  if (head !== "nelson") return base + "head-nelson-base.svg";

  if (accessories.includes("mohawk")) {
    return base + "head-nelson-mohawk.svg";
  }

  if (accessories.includes("bowtie")) {
    return base + "head-nelson-bowtie.svg";
  }

  return base + "head-nelson-base.svg";
};

const NelsonAvatar: React.FC<Props> = ({ woolColor, accessories = [], head = "nelson", className }) => {
  const has = (id: string) => accessories.includes(id);

  return (
    <div className={`relative ${className ?? ""}`}>
      {/* ✅ BODY (CSS MASK — FINAL CORRECT VERSION) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: woolColor || "#ffffff",

          WebkitMaskImage: "url('/body-base-nohead.svg')",
          maskImage: "url('/body-base-nohead.svg')",

          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",

          WebkitMaskPosition: "center",
          maskPosition: "center",

          WebkitMaskSize: "contain",
          maskSize: "contain",

          WebkitMaskMode: "alpha",
          maskMode: "alpha",

          zIndex: 1,
        }}
      />

      {/* ✅ HEAD */}
      <img
        src={getHeadFile(head, accessories)}
        alt="sheep head"
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        style={{ objectFit: "contain", zIndex: 2 }}
        draggable={false}
      />

      {/* ✅ GLASSES */}
      {has("glasses") && (
        <img
          src="/glasses-basic.svg"
          alt=""
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ objectFit: "contain", zIndex: 3 }}
        />
      )}

      {has("starGlasses") && (
        <img
          src="/glasses-star.svg"
          alt=""
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ objectFit: "contain", zIndex: 3 }}
        />
      )}

      {/* ✅ HATS */}
      {has("cap") && (
        <img
          src="/hat-cap.svg"
          alt=""
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ objectFit: "contain", zIndex: 4 }}
        />
      )}

      {has("pirateHat") && (
        <img
          src="/hat-pirate.svg"
          alt=""
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ objectFit: "contain", zIndex: 4 }}
        />
      )}

      {has("sunhat") && (
        <img
          src="/hat-sun.svg"
          alt=""
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ objectFit: "contain", zIndex: 4 }}
        />
      )}
    </div>
  );
};

export default NelsonAvatar;
