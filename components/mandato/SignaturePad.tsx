"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  onChange: (dataUrl: string | null) => void;
  className?: string;
};

export default function SignaturePad({ onChange, className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);

  const getCtx = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    return { canvas, ctx };
  };

  const resize = useCallback(() => {
    const pair = getCtx();
    if (!pair) return;
    const { canvas, ctx } = pair;
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * ratio);
    canvas.height = Math.floor(rect.height * ratio);
    ctx.scale(ratio, ratio);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = "#2F175F";
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const emit = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL("image/png"));
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pair = getCtx();
    if (!pair) return;
    drawing.current = true;
    pair.canvas.setPointerCapture(e.pointerId);
    const { x, y } = pos(e);
    pair.ctx.beginPath();
    pair.ctx.moveTo(x, y);
    setEmpty(false);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const pair = getCtx();
    if (!pair) return;
    const { x, y } = pos(e);
    pair.ctx.lineTo(x, y);
    pair.ctx.stroke();
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    emit();
  };

  const clear = () => {
    const pair = getCtx();
    if (!pair) return;
    const { canvas, ctx } = pair;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setEmpty(true);
    onChange(null);
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-primary)]">
          Firma del representante legal
        </p>
        <button
          type="button"
          onClick={clear}
          className="text-xs font-medium text-[var(--foreground)] opacity-70 hover:opacity-100 underline"
        >
          Borrar firma
        </button>
      </div>
      <p className="text-xs text-[var(--foreground)] opacity-70 mb-2">
        Dibuja con el ratón o el dedo
      </p>
      <div className="relative rounded-xl border-2 border-[var(--brand-primary)]/25 bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-40 touch-none cursor-crosshair"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
        {empty && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-medium text-[var(--foreground)]/25">
            Firma aquí
          </span>
        )}
      </div>
    </div>
  );
}
