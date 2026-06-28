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
          background: "#0b1020",
          padding: 18,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "7px solid #080b12",
            background: "#1a2340",
          }}
        >
          <div
            style={{
              width: 40,
              height: 28,
              border: "6px solid #080b12",
              borderBottom: "0",
              marginBottom: -6,
            }}
          />

          <div
            style={{
              width: 100,
              height: 104,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "8px solid #080b12",
              background: "#f4b942",
            }}
          >
            <div
              style={{
                width: 52,
                height: 58,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "6px solid #080b12",
                background: "#ffd978",
                color: "#0b1020",
                fontSize: 39,
                fontWeight: 900,
              }}
            >
              L
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}