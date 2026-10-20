import { useEffect, useRef } from "react";

/** HUD-style cursor: dot + lagging ring with live coordinates; grows over links. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches) return;
    document.documentElement.classList.add("has-cursor");
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, raf = 0;
    const move = (e: MouseEvent) => {
      x = e.clientX; y = e.clientY;
      const hot = (e.target as HTMLElement).closest("a,button,img,video,[role=button]");
      ring.current?.classList.toggle("hot", !!hot);
    };
    const loop = () => {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      if (dot.current) dot.current.style.transform = `translate(${x}px,${y}px)`;
      if (ring.current) ring.current.style.transform = `translate(${rx}px,${ry}px)`;
      if (label.current) label.current.textContent = `${String(Math.round(x)).padStart(4, "0")} · ${String(Math.round(y)).padStart(4, "0")}`;
      raf = requestAnimationFrame(loop);
    };
    addEventListener("mousemove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => { removeEventListener("mousemove", move); cancelAnimationFrame(raf); document.documentElement.classList.remove("has-cursor"); };
  }, []);

  return (
    <div className="cursor-layer" aria-hidden="true">
      <div ref={ring} className="cursor-ring"><span ref={label} className="cursor-label mono" /></div>
      <div ref={dot} className="cursor-dot" />
    </div>
  );
}
