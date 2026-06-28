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
                    background: "#0b1020",
                    padding: 48,
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
                        border: "18px solid #080b12",
                        background: "#1a2340",
                        boxShadow: "18px 18px 0 #080b12",
                    }}
                >
                    <div
                        style={{
                            width: 100,
                            height: 72,
                            border: "14px solid #080b12",
                            borderBottom: "0",
                            marginBottom: -14,
                        }}
                    />

                    <div
                        style={{
                            width: 242,
                            height: 252,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "16px solid #080b12",
                            background: "#f4b942",
                        }}
                    >
                        <div
                            style={{
                                width: 130,
                                height: 142,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "14px solid #080b12",
                                background: "#ffd978",
                                color: "#0b1020",
                                fontSize: 94,
                                fontWeight: 900,
                                lineHeight: 1,
                            }}
                        >
                            L
                        </div>
                    </div>

                    <div
                        style={{
                            marginTop: 28,
                            color: "#f8edcf",
                            fontSize: 34,
                            fontWeight: 800,
                            letterSpacing: 4,
                        }}
                    >
                        LANTERN
                    </div>
                </div>
            </div>
        ),
        size,
    );
}