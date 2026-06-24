
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
console.log("Accessories:", accessories);
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>

      {/* Z1 BODY BASE */}
      /body-base.svg

      {/* Z2 WOOL COLOUR */}
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
      /body-limbs.svg

   
{/* Z4 HEAD ✅ FIXED */}
<img
  src={getHeadFile(accessories)}
  alt=""
  style={{
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%"
  }}
/>


      {/* GLASSES */}
      {has("glasses") && (
        /glasses-basic.svg
      )}

      {has("starGlasses") && (
        /glasses-star.svg
      )}

      {/* HATS */}
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
