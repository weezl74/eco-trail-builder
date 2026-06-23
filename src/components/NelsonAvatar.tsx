import React from "react";

interface Props {
  woolColor: string;
  accessories?: string[];
  className?: string;
}

const NelsonAvatar: React.FC<Props> = ({ woolColor = "#e8d9b8", accessories = [], className = "" }) => {
  const has = (id: string) => accessories.includes(id);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Z1 BODY BASE (no wool, no limbs) */}
      <img
        src="/body-base.svg"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1 }}
      />

      {/* Z2 WOOL COLOUR (mask) */}
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
          zIndex: 2,
        }}
      />

      {/* Z3 LIMBS (arms + legs on top of wool) */}
      <img
        src="/body-limbs.svg"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 3 }}
      />

      {/* Z4 HEAD */}
      <img
        src="/profile/head-nelson-base.svg"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 4 }}
      />

      {/* Z5 GLASSES */}
      {has("glasses") && (
        <img
          src="/glasses-basic.svg"
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 5 }}
        />
      )}

      {has("starGlasses") && (
        <img
          src="/glasses-star.svg"
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 5 }}
        />
      )}

      {/* Z6 HATS */}
      {has("cap") && (
        <img
          src="/hat-cap.svg"
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 6 }}
        />
      )}

      {has("pirateHat") && (
        <img
          src="/hat-pirate.svg"
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 6 }}
        />
      )}

      {has("sunhat") && (
        <img
          src="/hat-sun.svg"
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 6 }}
        />
      )}
    </div>
  );
};

export default NelsonAvatar;
