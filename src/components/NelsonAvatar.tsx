import React from "react";

interface Props {
  woolColor: string;
  accessories?: string[];
  head?: "nelson" | "barb";
  className?: string;
}

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

const NelsonAvatar: React.FC<Props> = ({
  woolColor = "#ffffff",
  accessories = [],
  head = "nelson",
  className = "",
}) => {
  const has = (id: string) => accessories.includes(id);

  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full h-full overflow-hidden -translate-x-[6%] -translate-y-[2%]">
        {/* ✅ WOOL COLOUR */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: woolColor,
            WebkitMask: "url(/body-mask.svg) center / contain no-repeat",
            mask: "url(/body-mask.svg) center / contain no-repeat",
            zIndex: 1,
          }}
        />

        {/* ✅ BODY DETAIL (FULL STRENGTH, BUT BLENDED) */}
        <img
          src="/body-base-nohead.svg"
          alt=""
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            objectFit: "contain",
            zIndex: 2,
            mixBlendMode: "multiply",
          }}
          draggable={false}
        />

        {/* ✅ HEAD */}
        <img
          src={getHeadFile(head, accessories)}
          alt=""
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ objectFit: "contain", zIndex: 3 }}
          draggable={false}
        />

        {/* ✅ GLASSES */}
        {has("glasses") && (
          <img
            src="/glasses-basic.svg"
            alt=""
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ objectFit: "contain", zIndex: 4 }}
          />
        )}

        {has("starGlasses") && (
          <img
            src="/glasses-star.svg"
            alt=""
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ objectFit: "contain", zIndex: 4 }}
          />
        )}

        {/* ✅ HATS */}
        {has("cap") && (
          <img
            src="/hat-cap.svg"
            alt=""
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ objectFit: "contain", zIndex: 5 }}
          />
        )}

        {has("pirateHat") && (
          <img
            src="/hat-pirate.svg"
            alt=""
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ objectFit: "contain", zIndex: 5 }}
          />
        )}

        {has("sunhat") && (
          <img
            src="/hat-sun.svg"
            alt=""
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ objectFit: "contain", zIndex: 5 }}
          />
        )}
      </div>
    </div>
  );
};

export default NelsonAvatar;
