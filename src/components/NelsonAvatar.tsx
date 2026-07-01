import React from "react";
import raincoatLayer from "@/assets/accessories/raincoat-layer.svg.asset.json";

interface Props {
  woolColor: string;
  accessories?: string[];
  head?: string;
  className?: string;
  /** Horizontal shift % of width. Negative = left. Default 0 (centred). */
  shiftPercent?: number;
}


const getHeadFile = (accessories: string[], head?: string) => {
  const base = "/profile/";

  // Head-altering accessories always take priority — they ARE the head variant.
  if (accessories.includes("mohawk")) return base + "head-nelson-mohawk.svg";
  if (accessories.includes("longBeard")) return base + "head-nelson-longbeard.svg";
  if (accessories.includes("stubble")) return base + "head-nelson-stubble.svg";
  if (accessories.includes("bowtie")) return base + "head-nelson-bowtie.svg";

  if (head === "barb") return base + "head-barb-base.svg";
  return base + "head-nelson-base.svg";
};

const layerStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
  userSelect: "none",
};

const Layer: React.FC<{ src: string; alt?: string; z: number }> = ({ src, alt = "", z }) => (
  <img key={src} src={src} alt={alt} draggable={false} style={{ ...layerStyle, zIndex: z }} />
);


const NelsonAvatar: React.FC<Props> = ({ woolColor, accessories = [], head, className, shiftPercent = 0 }) => {
  const has = (id: string) => accessories.includes(id);

  // The sheep artwork in the SVGs sits ~13% right of centre in a 500x500 viewBox.
  // Compensate here so Nelson APPEARS centred in his container by default.
  const INTRINSIC_OFFSET = -13;
  const totalShift = INTRINSIC_OFFSET + shiftPercent;

  return (
    <div className={className} style={{ position: "relative", aspectRatio: "1 / 1" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateX(${totalShift}%)`,
        }}
      >

        {/* Z1 BODY BASE (headless so the head layer fully swaps) */}
        <Layer src="/profile/body-base-nohead.svg" z={1} />

        {/* Z2 WOOL COLOUR — mask shares the body-base viewBox, so use full-frame alignment. */}
        <div
          style={{
            ...layerStyle,
            zIndex: 2,
            backgroundColor: woolColor,
            WebkitMaskImage: "url(/body-mask.svg)",
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskPosition: "0 0",
            WebkitMaskSize: "100% 100%",
            maskImage: "url(/body-mask.svg)",
            maskRepeat: "no-repeat",
            maskPosition: "0 0",
            maskSize: "100% 100%",
          }}
        />



        {/* Z3 LIMBS */}
        <Layer src="/body-limbs.svg" z={3} />

        {/* Z3.5 RAINCOAT — over body, under head */}
        {has("raincoat") && <Layer src={(raincoatLayer as { url: string }).url} z={3} />}

        {/* Z4 HEAD (variant baked-in) */}
        <Layer src={getHeadFile(accessories, head)} z={4} />

        {/* Z5 GLASSES */}
        {has("glasses") && <Layer src="/profile/acc-glasses.svg" z={5} />}
        {has("starGlasses") && <Layer src="/profile/acc-star-glasses.svg" z={5} />}

        {/* Z6 HATS */}
        {has("cap") && <Layer src="/profile/acc-cap.svg" z={6} />}
        {has("pirateHat") && <Layer src="/profile/acc-pirate-hat.svg" z={6} />}
        {has("sunhat") && <Layer src="/profile/acc-sun-hat.svg" z={6} />}
      </div>
    </div>
  );
};

export default NelsonAvatar;
