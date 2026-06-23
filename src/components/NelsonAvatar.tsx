
import React from "react";

interface Props {
  woolColor: string;
  accessories?: string[];
  head?: "nelson" | "barb";
  className?: string;
}

// ✅ HEAD FILE
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

      {/* ✅ FIX WHITE BORDER */}
      <div className="relative w-full h-full overflow-hidden -translate-x-[6%] -translate-y-[2%]">

        {/* ✅ COLOUR LAYER */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: woolColor,
            WebkitMask: "url(/body-mask.svg) center / contain no-repeat",
            mask: "url(/body-mask.svg) center / contain no-repeat",
            zIndex: 1,
          }}
        />

        {/* ✅ BODY DETAIL (NOW PARTIALLY TRANSPARENT) */}
        /body-base-nohead.svg

        {/* ✅ HEAD (FIXED JSX STRUCTURE) */}
        {getHeadFile(head, alt=""
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ objectFit: "contain", zIndex: 3 }}
        />

        {/* ✅ GLASSES */}
        {has("glasses") && (
          /glasses-basic.svg
        )}

        {has("starGlasses") && (
          /glasses-star.svg
        )}

        {/* ✅ HATS */}
        {has("cap") && (
          /hat-cap.svg
        )}

        {has("pirateHat") && (
          /hat-pirate.svg
        )}

        {has("sunhat") && (
          /hat-sun.svg
        )}
      </div>
    </div>
  );
};

export default NelsonAvatar;
