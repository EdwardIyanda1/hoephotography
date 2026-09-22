import { useEffect, useRef, useState } from "react";
export default function PhotoEditor({ file, onSave, onCancel, busy }) {
  const canvas = useRef(null),
    [image, setImage] = useState(null),
    [rotation, setRotation] = useState(0),
    [brightness, setBrightness] = useState(100),
    [contrast, setContrast] = useState(100),
    [crop, setCrop] = useState("original"),
    [error, setError] = useState("");
  useEffect(() => {
    const url = URL.createObjectURL(file),
      img = new Image();
    img.onload = () => setImage(img);
    img.onerror = () => setError("This photo could not be opened.");
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);
  function draw(target, preview = false) {
    if (!image) return;
    let sw = image.width,
      sh = image.height;
    const ratio = crop === "square" ? 1 : crop === "portrait" ? 4 / 5 : null;
    if (ratio) {
      if (sw / sh > ratio) sw = sh * ratio;
      else sh = sw / ratio;
    }
    const swapped = rotation % 180 !== 0;
    let w = swapped ? sh : sw,
      h = swapped ? sw : sh;
    const scale = preview ? Math.min(1, 1000 / Math.max(w, h)) : 1;
    target.width = Math.round(w * scale);
    target.height = Math.round(h * scale);
    const ctx = target.getContext("2d");
    ctx.translate(target.width / 2, target.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.drawImage(
      image,
      (image.width - sw) / 2,
      (image.height - sh) / 2,
      sw,
      sh,
      (-sw * scale) / 2,
      (-sh * scale) / 2,
      sw * scale,
      sh * scale,
    );
  }
  useEffect(() => {
    draw(canvas.current, true);
  }); // Canvas reflects the current controls; no state is changed here.
  async function save() {
    try {
      const full = document.createElement("canvas");
      draw(full);
      const blob = await new Promise((resolve) =>
        full.toBlob(resolve, "image/jpeg", 0.94),
      );
      if (!blob) throw new Error("Could not export photo");
      await onSave(
        new File([blob], file.name.replace(/\.[^.]+$/, "") + "-edited.jpg", {
          type: "image/jpeg",
        }),
      );
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <section className="portal-card">
      <h2>Edit photo</h2>
      <p>Edits create a JPEG copy. Your original local file is preserved.</p>
      <canvas ref={canvas} className="photo-canvas" />
      <fieldset disabled={busy}>
        <div className="portal-grid">
          <label className="portal-field">
            Crop
            <select value={crop} onChange={(e) => setCrop(e.target.value)}>
              <option value="original">Original frame</option>
              <option value="square">Square, centre crop</option>
              <option value="portrait">4:5, centre crop</option>
            </select>
          </label>
          <label className="portal-field">
            Brightness: {brightness}%
            <input
              type="range"
              min="50"
              max="150"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
            />
          </label>
          <label className="portal-field">
            Contrast: {contrast}%
            <input
              type="range"
              min="50"
              max="150"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
            />
          </label>
        </div>
        <div className="portal-actions">
          <button onClick={() => setRotation((rotation + 90) % 360)}>
            Rotate 90°
          </button>
          <button disabled={!image} className="primary" onClick={save}>
            Upload edited copy
          </button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </fieldset>
      <p role="alert">{error}</p>
    </section>
  );
}
