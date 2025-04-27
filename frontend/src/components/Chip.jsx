export default function Chip({ text, color }) {
    const hexToRgba = (hex, opacity) => {
        if (typeof hex !== "string") return "transparent"; // Prevent TypeError
        const bigint = parseInt(hex.replace("#", ""), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;

        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    const validColor = typeof color === "string" && color.startsWith("#") ? color : null;

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                backgroundColor: validColor ? hexToRgba(validColor, 0.08) : "transparent",
                color: validColor || "inherit",
                border: `1px solid ${validColor ? hexToRgba(validColor, 0.12) : "transparent"}`,
                borderRadius : "var(--br)"
            }}
        >
            <p className="chip" style={{ padding: "2px 8px" }}>{ text }</p>
        </div>
    );
}
