import React from "react";

interface Props {
  accessories?: string[];
}

const NelsonAvatar: React.FC<Props> = ({ accessories = [] }) => {
  const has = (id: string) => accessories.includes(id);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* BODY */}
      <img
        src="/profile/body-base-nohead.svg"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />

      {/* HEAD */}
      <img
        src="/profile/head-nelson-base.svg"
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

      {/* HAT */}
      {has("cap") && (
        <img src="/hat-cap.svg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      )}
    </div>
  );
};

export default NelsonAvatar;
