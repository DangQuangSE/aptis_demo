import React from "react";
import { COLORS } from "../../utils/constants";

/**
 * ToggleSwitch — reusable toggle control.
 * Chỉ render phần control, layout bên ngoài do parent quyết định.
 *
 * Props:
 *   checked  {boolean}
 *   onChange {(newValue: boolean) => void}
 *   size     "md" (36×20, default) | "sm" (32×18) — "sm" dùng cho header inline
 *   color    custom active color, mặc định là COLORS.primary (#006590)
 */
export default function ToggleSwitch({ checked, onChange, size = "md", color }) {
  const isMd     = size !== "sm";
  const width    = isMd ? 36 : 32;
  const height   = isMd ? 20 : 18;
  const knobSize = isMd ? 16 : 14;
  const knobOn   = isMd ? 18 : 16;
  const activeColor = color ?? COLORS.primary;

  return (
    <div
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width,
        height,
        background: checked ? activeColor : COLORS.inactiveBg,
        borderRadius: height / 2,
        position: "relative",
        transition: "background 0.2s",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: knobSize,
          height: knobSize,
          background: "white",
          borderRadius: "50%",
          position: "absolute",
          top: 2,
          left: checked ? knobOn : 2,
          transition: "left 0.2s",
          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
        }}
      />
    </div>
  );
}
