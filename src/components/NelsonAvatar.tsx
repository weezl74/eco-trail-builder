import React from "react";
import TintedSheepBody from "./TintedSheepBody";

interface Props {
  woolColor: string;
  accessories?: string[];
  head?: "nelson" | "barb";
  className?: string;
}

// ✅ Decide which head to show
const getHeadFile = (head: string, accessories: string[]) => {
  if (head !== "nelson") return "/head-nelson-base.svg";

  if (accessories.includes("mohawk")) {
    return "/head-nelson-mohawk.svg";
  }

  if (accessories.includes("bowtie")) {
    return "/head-nelson-bowtie.svg";
  }

  return "/head-nelson-base.svg";
};

const NelsonAvatar: React.FC<Props> = ({ woolColor, accessories = [], head = "nelson", className }) => {
  const has = (id: string) => accessories.includes(id);

  return (
    <div className={`relative ${className ?? ""}`}>
      {/* ✅ BODY (tinted) */}
      <TintedSheepBody
        color={woolColor}
        className="absolute inset-0 w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
      />

      {/* ✅ HEAD */}
      <img
        src={getHeadFile(head, accessories)}
        alt="sheep head"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ objectFit: "contain", zIndex: 2 }}
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
