import React from "react";

interface Props {
  woolColor?: string;
  accessories?: string[];
  head?: string;
  className?: string;
}

export default function NelsonAvatar({ className }: Props) {
  return (
    <div className={className} style={{ position: "relative" }}>
      <img src="/profile/body-base-nohead.svg" alt="" style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
