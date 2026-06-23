
import React from "react";

interface Props {
  woolColor: string;
  accessories?: string[];
  head?: "nelson" | "barb";
  className?: string;
}

// ✅ HEAD (correct path)
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
  accessories = [],
  head = "nelson",
  className,
}) => {
  const has = (id: string) => accessories.includes(id);

  return (
    <div className={`relative ${className ?? ""}`}>

      {/* ✅ BODY (TEMPORARY — just show SVG to confirm everything works) */}
      /body-base-nohead.svg

      {/* ✅ HEAD */}
      {getHeadFile(head,        alt="sheep head"
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: "contain", zIndex: 2 }}
        draggable={false}
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
  );
};

export default NelsonAvatar;
