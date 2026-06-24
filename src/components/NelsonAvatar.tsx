import React from "react";

interface Props {
  woolColor: string;
  accessories?: string[];
  className?: string;
}

const NelsonAvatar: React.FC<Props> = ({ woolColor = "#e8d9b8", accessories = [], className = "" }) => {
  const has = (id: string) => accessories.includes(id);

  return (
    <div className={"relative " + className}>
      <div className="relative w-full h-full overflow-hidden">
        {/* BODY BASE */}
        <img
          src="/profile/body-base-nohead.svg"
          alt=""
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ objectFit: "contain", zIndex: 1 }}
        />

        {/* WOOL COLOUR MASK */}
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

        {/* HEAD */}
        <img
          src="/profile/head-nelson-base.svg"
          alt=""
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ objectFit: "contain", zIndex: 3 }}
        />

        {/* GLASSES */}
        {has("glasses") && (
          <img
            src="/glasses-basic.svg"
            alt=""
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ objectFit: "contain", zIndex: 4 }}
          />
        )}

        {has("starGlasses") && (
          <img
            src="/glasses-star.svg"
            alt=""
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ objectFit: "contain", zIndex: 4 }}
          />
        )}

        {/* HATS */}
        {has("cap") && (
          <img
            src="/hat-cap.svg"
            alt=""
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ objectFit: "contain", zIndex: 5 }}
          />
        )}

        {has("pirateHat") && (
          <img
            src="/hat-pirate.svg"
            alt=""
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ objectFit: "contain", zIndex: 5 }}
          />
        )}

        {has("sunhat") && (
          <img
            src="/hat-sun.svg"
            alt=""
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ objectFit: "contain", zIndex: 5 }}
          />
        )}
      </div>
    </div>
  );
};

export default NelsonAvatar;
