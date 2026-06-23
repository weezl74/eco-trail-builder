import React from "react";

interface Props {
  woolColor: string;
  accessories?: string[];
  className?: string;
}

const NelsonAvatar: React.FC<Props> = ({ accessories = [], className = "" }) => {
  const has = (id: string) => accessories.includes(id);

  return (
    <div className={"relative " + className}>
      {/* BODY */}
      <img src="/profile/body-base-nohead.svg" alt="" className="absolute inset-0 w-full h-full" />

      {/* HEAD */}
      <img src="/profile/head-nelson-base.svg" alt="" className="absolute inset-0 w-full h-full" />

      {/* GLASSES */}
      {has("glasses") && <img src="/glasses-basic.svg" alt="" className="absolute inset-0 w-full h-full" />}

      {/* HATS */}
      {has("cap") && <img src="/hat-cap.svg" alt="" className="absolute inset-0 w-full h-full" />}

      {has("pirateHat") && <img src="/hat-pirate.svg" alt="" className="absolute inset-0 w-full h-full" />}
    </div>
  );
};

export default NelsonAvatar;
``;
