import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
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
          borderRadius: 36,
          color: "white",
          fontSize: 72,
          fontWeight: 800,
          letterSpacing: -4,
        }}
      >
        AF
      </div>
    ),
    size
  );
}
