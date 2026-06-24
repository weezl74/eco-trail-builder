
import React from "react";

interface Props {
  woolColor: string;
  accessories?: string[];
}

const getHeadFile = (accessories: string[]) => {
  const base = "/profile/";

  if (accessories.includes("mohawk")) {
    return base + "head-nelson-mohawk.svg";
  }

  if (accessories.includes("longbeard")) {
    return base + "head-nelson-longbeard.svg";
  }

  if (accessories.includes("stubble")) {
    return base + "head-nelson-stubble.svg";
  }

  if (accessories.includes("bowtie")) {
    return base + "head-nelson-bowtie.svg";
  }

  return base + "head-nelson-base.svg";
};

const NelsonAvatar: React.FC<Props> = ({ woolColor, accessories = [] }) => {
  const has = (id: string) => accessories.includes(id);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>

      {/* Z1 BODY BASE */}
      <img
        src="/body-base.svg"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />

      {/* Z2 WOOL COLOUR (MASK) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: woolColor,
          WebkitMaskImage: "url(/body-mask.svg)",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          WebkitMaskSize: "contain",
          maskImage: "url(/body-mask.svg)",
          maskRepeat: "no-repeat",
          maskPosition: "center",
          maskSize: "contain",
        }}
      />

      {/* Z3 LIMBS */}
      <img
        src="/body-limbs.svg"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />

      {/* ✅ Z4 HEAD (FIXED ✅) */}
      <img
        src={getHeadFile(accessories)}
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />

      {/* GLASSES */}
      {has("glasses") && (
        <img
          src="/glasses-basic.svg"
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
      )}

      {has("starGlasses") && (
        <img
          src="/glasses-star.svg"
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
      )}

      {/* HATS */}
      {has("cap") && (
        <img
          src="/hat-cap.svg"
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
      )}

      {has("pirateHat") && (
        <img
          src="/hat-pirate.svg"
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
      )}

      {has("sunhat") && (
        <img
          src="/hat-sun.svg"
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
      )}

    </div>
  );
};

export default NelsonAvatar;
