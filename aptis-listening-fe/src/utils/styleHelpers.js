import { COLORS } from "./constants";

/**
 * Style cho option card trong module Listening (Part 1 — flat border design).
 * Returns { bg, border, indicator: { bg, border } }
 */
export function getListeningOptionStyle(isSelected, isChecked, isCorrect) {
  let bg = "#fbf9f8";
  let border = COLORS.neutral;
  let indicator = { bg: "transparent", border: COLORS.neutral };

  if (isSelected && !isChecked) {
    bg        = COLORS.primaryBg;
    border    = COLORS.primary;
    indicator = { bg: COLORS.primary, border: COLORS.primary };
  }

  if (isChecked) {
    if (isCorrect) {
      bg        = COLORS.successBg;
      border    = COLORS.success;
      indicator = { bg: COLORS.success, border: COLORS.success };
    } else if (isSelected) {
      bg        = COLORS.errorBg;
      border    = COLORS.error;
      indicator = { bg: COLORS.error, border: COLORS.error };
    } else {
      bg        = "white";
      border    = "#e4e2e2";
      indicator = { bg: "transparent", border: "#e4e2e2" };
    }
  }

  return { bg, border, indicator };
}

/**
 * Style cho select dropdown trong module Listening (Part 2 / Part 3).
 * Dùng APTIS color scheme, alpha nhẹ hơn option card.
 * Returns { bg, border, color }
 */
export function getListeningSelectStyle(hasValue, isChecked, isCorrect) {
  let bg = "white", border = COLORS.neutral, color = COLORS.neutralText;

  if (hasValue && !isChecked) {
    bg     = COLORS.primaryBgLight;
    border = COLORS.primary;
  }

  if (isChecked) {
    if (isCorrect) {
      bg     = COLORS.successBgMd;
      border = COLORS.success;
      color  = COLORS.successText;
    } else if (hasValue) {
      bg     = COLORS.errorBgMd;
      border = COLORS.error;
      color  = COLORS.errorText;
    } else {
      bg     = COLORS.neutralBg;
      border = "#e4e2e2";
    }
  }

  return { bg, border, color };
}

/**
 * Style cho option button trong module Grammar (3D shadow design).
 * Returns { bg, border, shadow, color, keyBg, keyColor }
 */
export function getGrammarOptionStyle(isSelected, isChecked, isCorrect) {
  let bg      = "white";
  let border  = "2px solid #efeded";
  let shadow  = "0 3px 0 #efeded";
  let color   = COLORS.neutralText;
  let keyBg   = "#f0f4f8";
  let keyColor = "#4a5568";

  if (isSelected) {
    bg       = COLORS.grammarBlueBg;
    border   = `2px solid ${COLORS.grammarBlue}`;
    shadow   = `0 3px 0 ${COLORS.grammarBlue}`;
    color    = COLORS.grammarBlueDark;
    keyBg    = "#bbdefb";
    keyColor = COLORS.grammarBlueDark;
  }

  if (isChecked) {
    if (isCorrect) {
      bg       = COLORS.grammarGreenBg;
      border   = `2px solid ${COLORS.grammarGreen}`;
      shadow   = `0 3px 0 ${COLORS.grammarGreenDark}`;
      color    = COLORS.grammarGreenDark;
      keyBg    = "#a5d6a7";
      keyColor = COLORS.grammarGreenDark;
    } else if (isSelected) {
      bg       = COLORS.grammarRedBg;
      border   = `2px solid ${COLORS.grammarRed}`;
      shadow   = `0 3px 0 ${COLORS.grammarRedShadow}`;
      color    = COLORS.grammarRedDark;
      keyBg    = "#ef9a9a";
      keyColor = COLORS.grammarRedDark;
    }
  }

  return { bg, border, shadow, color, keyBg, keyColor };
}

/**
 * Style cho select dropdown trong module Grammar / Vocab.
 * Dùng Grammar blue color scheme.
 * Returns { bg, border, color }
 */
export function getGrammarSelectStyle(hasValue, isChecked, isCorrect) {
  let bg = "white", border = "2px solid #efeded", color = COLORS.neutralText;

  if (hasValue && !isChecked) {
    bg     = COLORS.grammarBlueBg;
    border = `2px solid ${COLORS.grammarBlue}`;
    color  = COLORS.grammarBlueDark;
  }

  if (isChecked) {
    if (isCorrect) {
      bg     = COLORS.grammarGreenBg;
      border = `2px solid ${COLORS.grammarGreen}`;
      color  = COLORS.grammarGreenDark;
    } else {
      bg     = COLORS.grammarRedBg;
      border = `2px solid ${COLORS.grammarRed}`;
      color  = COLORS.grammarRedDark;
    }
  }

  return { bg, border, color };
}
