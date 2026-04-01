import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, rgb(109, 94, 252) 0%, rgb(132, 94, 247) 100%)",
          color: "white",
          fontSize: 180,
          fontWeight: 800,
          letterSpacing: -12,
        }}
      >
        AF
      </div>
    ),
    size
  );
}
