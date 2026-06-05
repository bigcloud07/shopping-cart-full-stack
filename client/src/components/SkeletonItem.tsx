export const SkeletonItem = () => {
  return (
    <div style={{ display: "flex", gap: "8px", padding: "8px" }}>
      <div style={{ width: "20px", height: "20px", background: "#e0e0e0" }} />
      <div style={{ width: "100px", height: "100px", background: "#e0e0e0" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ width: "120px", height: "16px", background: "#e0e0e0" }} />
        <div style={{ width: "80px", height: "16px", background: "#e0e0e0" }} />
        <div style={{ width: "60px", height: "32px", background: "#e0e0e0" }} />
      </div>
    </div>
  );
};
