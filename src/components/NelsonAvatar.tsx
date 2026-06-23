
import React from "react";
import TintedSheepBody from "./TintedSheepBody";

interface Props {
  woolColor: string;
  accessories?: string[];
  head?: "nelson" | "barb";
  className?: string;
}

// ✅ Map old accessory IDs → new assets
const getHeadFile = (head: string, accessories: string[]) => {
  if (head !== "nelson") return "/profile/head-nelson-base.svg"; // fallback

  if (accessories.includes("mohawk")) {
    return "/profile/head-nelson-mohawk.svg";
  }

  if (accessories.includes("bowtie")) {
    return "/profile/head-nelson-bowtie.svg";
  }

  return "/profile/head-nelson-base.svg";
};

const NelsonAvatar: React.FC<Props> = ({
  woolColor,
  accessories = [],
  head = "nelson",
  className,
}) => {
  const has = (id: string) => accessories.includes(id);

  return (
    <div className={`relative ${className ?? ""}`}>

      {/* ✅ BODY */}
      <TintedSheepBody
        color={woolColor}
        className="absolute inset-0 w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
      />

      {/* ✅ HEAD (composite system) */}
      {getHeadFile(head,="sheep head"
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        style={{ objectFit: "contain", zIndex: 2 }}
        draggable={false}
      />

      {/* ✅ GLASSES */}
      {has("glasses") && (
        /profile/glasses-basic.svg
      )}

      {has("starGlasses") && (
        /profile/glasses-star.svg
      )}

      {/* ✅ HATS */}
      {has("cap") && (
        profile/hat-cap.svg"
          alt=""
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ objectFit: "contain", zIndex: 4 }}
        />
      )}

      {has("pirateHat") && (
        /profile/hat-pirate.svg
      )}

      {has("sunhat") && (
        un.svg"
          alt=""
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ objectFit: "contain", zIndex: 4 }}
        />
      )}

    </div>
  );
};

export default NelsonAvatar;
