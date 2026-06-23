import React from "react";

interface Props {
  woolColor: string;
  accessories?: string[];
}

const NelsonAvatar: React.FC<Props> = ({ woolColor, accessories = [] }) => {
  const has = (id: string) => accessories.includes(id);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Z1 BODY BASE */}
      <img src="/body-base.svg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />

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
        }}
      />

      {/* Z3 LIMBS */}
      <img src="/body-limbs.svg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />

      {/* Z4 HEAD */}
      <img
        src="/profile/head-nelson-base.svg"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />

      {/* Z5 GLASSES */}
      {has("glasses") && (
        <img
          src="/glasses-basic.svg"
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
      )}

      {/* Z6 HAT */}
      {has("cap") && (
        <img src="/hat-cap.svg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      )}
    </div>
  );
};

export default NelsonAvatar;
