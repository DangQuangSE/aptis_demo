# Kế Hoạch Refactor Frontend — APTIS Listening App

> **Tác giả**: Senior FE Review  
> **Ngày**: 2026-05-30  
> **Branch hiện tại**: `feat/reading-fix`  
> **Mục tiêu**: Loại bỏ code trùng lặp, xây dựng component library dùng chung, tách logic ra khỏi UI  
> **Ràng buộc bất biến**: Data của từng question KHÔNG được thay đổi trong suốt quá trình refactor

---

## 0. Ràng Buộc Bất Biến — Data Integrity

> **Nguyên tắc vàng**: Refactor chỉ được phép thay đổi **cách hiển thị** và **cách tổ chức code**. Tuyệt đối không được thay đổi **data của question**, **logic tính correctKey**, hay **cách lưu answer của user**.

### 0.1 Sơ Đồ Data Flow Hiện Tại

```
JSON files (public/)
      │
      ▼
  page.js / ReadingPractice.js / GrammarPractice.js
  [startPartPractice / loadData]
  ─ đọc raw JSON
  ─ format thành question objects chuẩn
  ─ SHUFFLE options (Part 2, Part 4 Listening)
  ─ tính correctKey dựa trên vị trí sau shuffle
      │
      ▼
  questions[] / partData[]              (state — READONLY sau khi set)
      │
      ▼
  selectedAnswers  { [questionId]: "A"|"B"|"C" }   (user input)
  checkedResults   { [questionId]: true }           (đã kiểm tra)
  visitedIds       { [questionId]: true }            (đã ghé thăm)
      │
      ▼
  QuestionContent / GrammarQuestionCard / VocabPartCard / ReadingPart*
  [CHỈ được đọc data, KHÔNG được sửa]
```

### 0.2 Cấu Trúc Data Từng Module (KHÔNG được thay đổi)

#### Listening — Part 1 (Single Question)
```js
{
  id: "p1_0",               // KHÔNG đổi scheme ID
  partNumber: 1,
  audioUrl: "https://...",
  questionText: "...",
  options: [                // KHÔNG re-shuffle trong component
    { key: "A", text: "..." },
    { key: "B", text: "..." },
    { key: "C", text: "..." },
  ],
  correctKey: "B",          // KHÔNG recompute ở component
  transcript: "...",
  displayHeading: "Question 1 of 13",
}
```

#### Listening — Part 2 (Multi Question, có shuffle)
```js
{
  id: "p2_0",
  partNumber: 2,
  audioUrl: "...",
  topic: "...",
  isMultiQuestion: true,
  subQuestions: [           // KHÔNG đảo thứ tự
    {
      id: "p2_0_0",         // KHÔNG đổi scheme ID
      questionText: "Person 1",
      correctKey: "C",      // đã tính từ shuffled position — KHÔNG recompute
      options: [            // đã được shuffle 1 lần duy nhất khi load
        { key: "A", text: "..." },
        ...{ key: "F", text: "..." },
      ],
    },
  ],
}
```

#### Listening — Part 4 (Multi Question, có shuffle)
```js
// Tương tự Part 2 nhưng options chỉ có A/B/C
// correctKey tính từ shuffledOpts.indexOf(correctText) — KHÔNG recompute
```

#### Grammar — Question Node
```js
// Wrapper node trong questions[]:
{
  id: "g_q_1",              // từ q.id trong JSON gốc
  type: "grammar",
  displayLabel: "1",
  qData: { /* raw grammar object */ },
}
// qData KHÔNG được sửa đổi
```

#### Grammar — Vocab Node
```js
{
  id: "v_part_1",
  type: "vocab",
  partNum: 1,
  displayLabel: "26",
  qData: { /* raw vocab part object */ },
}
```

#### Reading — Mỗi topic trong partData[]
```js
// Mỗi part có schema riêng từ JSON, KHÔNG format lại trong component
// Part 1: { title, instructions, questions: [{id, text, options, correctAnswer}] }
// Part 2: { title, instructions, sentences: [{id, text}], correctOrder: [...] }
// Part 3: { title, passage, questions: [{id, question, options, correct}] }
// Part 4: { title, paragraphs: [...], headings: [...], correctMatching: {...} }
```

### 0.3 Danh Sách Rủi Ro Cụ Thể Khi Refactor

| Rủi ro | Nguyên nhân | Cách phòng tránh |
|--------|-------------|------------------|
| **shuffleArray gọi lại trong component** | Part 2/4 Listening shuffle options khi load — nếu component re-render gọi shuffle lại, correctKey sẽ sai | Shuffle CHỈ trong `startPartPractice` (page.js). Component con chỉ nhận `options[]` đã shuffle, không tự shuffle |
| **correctKey bị recompute sai** | Part 4 tính `ck = shuffledOpts.indexOf(correctText)` — nếu options bị đảo thứ tự khi truyền qua props thì correctKey cũ sẽ trỏ nhầm | Truyền nguyên object `subQuestion` qua props, không destructure rồi reassemble |
| **questionId scheme bị đổi** | `selectedAnswers[q.id]` và `checkedResults[q.id]` dùng ID để track — nếu ID scheme đổi, answer bị mất | Giữ nguyên `id` generation: `p1_${idx}`, `p2_${topicIdx}_${i}`, `p3_...`, `p4_...` |
| **selectedAnswers bị reset ngoài ý muốn** | Tách component con nhưng quên pass setter, dẫn đến component tự tạo state local | State `selectedAnswers`, `checkedResults` phải luôn sống ở parent (page.js / GrammarPractice / ReadingPractice) |
| **Reading Part 2 sentence order bị mất** | Part 2 có state sắp xếp thứ tự câu — nếu tách component mà clone array không đúng, thứ tự reset | Truyền `sentences` state và setter xuống ReadingPart2, không cho component tự init |
| **autoShowAnswer bypass correctKey** | Khi `autoShowAnswer = true`, code dùng `q.correctKey` trực tiếp — nếu component tự tính lại, có thể sai | Luôn dùng `q.correctKey` từ object, không tính lại trong component |

### 0.4 Nguyên Tắc Bắt Buộc Khi Tách Component

```
ĐƯỢC PHÉP (safe):
  ✅ Tách UI rendering ra component con
  ✅ Truyền data object nguyên vẹn qua props (không sửa)
  ✅ Truyền callback (onAnswer, onCheck) xuống component con
  ✅ Tính style/class từ trạng thái (isSelected, isChecked, isCorrect)
  ✅ Đọc q.correctKey để hiển thị feedback

KHÔNG ĐƯỢC PHÉP (nguy hiểm):
  ❌ Gọi shuffleArray() bên trong component con
  ❌ Tính lại correctKey trong component con
  ❌ Tạo state local cho selectedAnswer trong component con
  ❌ Đổi schema của question object (thêm/xóa field)
  ❌ Clone và mutate options array trong component
  ❌ Reset answers khi component unmount/remount
```

### 0.5 Checklist Bắt Buộc Sau Mỗi Lần Tách Component

Trước khi commit, verify từng điểm sau bằng tay:

- [ ] **Part 2 Listening**: Chọn đáp án cho subQ1 → navigate sang question khác → quay lại → đáp án vẫn còn
- [ ] **Part 4 Listening**: Check đáp án → icon ✓/✗ hiển thị đúng với correctKey
- [ ] **Grammar Full mode**: Trả lời câu 1 → chuyển sang câu vocab → quay lại câu 1 → đáp án vẫn còn
- [ ] **Reading Part 2**: Kéo câu lên/xuống → navigate sidebar → quay lại → thứ tự vẫn giữ
- [ ] **autoShowAnswer ON**: Tất cả câu hiển thị đáp án đúng từ `correctKey` (không bị "undefined" hay "A" mặc định)
- [ ] **Page reload**: Data load lại từ JSON, không bị stale cache gây sai correctKey

---

## 1. Chẩn Đoán Hiện Trạng

### 1.1 Vấn đề cốt lõi

| Vấn đề | Mức độ | File bị ảnh hưởng |
|--------|--------|-------------------|
| Option card styling lặp lại 5+ lần | Nghiêm trọng | `QuestionContent.js`, `GrammarQuestionCard.js`, `VocabPartCard.js` |
| Toggle switch HTML lặp lại 4+ lần | Nghiêm trọng | `page.js`, `GrammarPractice.js`, `ReadingPractice.js` |
| Card grid pattern lặp lại 3 lần | Cao | `HomeDashboard.js` |
| Sidebar navigation lặp lại 3 lần | Cao | `SidebarMatrix.js`, `GrammarPractice.js`, `ReadingPractice.js` |
| Header practice lặp lại 3 lần | Cao | `page.js`, `GrammarPractice.js`, `ReadingPractice.js` |
| File quá lớn (>600 dòng) | Trung bình | `page.js` (1420), `ReadingPractice.js` (1052), `GrammarPractice.js` (957), `QuestionContent.js` (627) |
| Inline styles lồng nhau phức tạp | Trung bình | Toàn bộ codebase |
| Color/style tokens không tập trung | Trung bình | Rải rác inline styles |

### 1.2 Thống kê code trùng lặp ước tính

```
Option card coloring logic:   ~30 lines × 5 = ~150 lines duplicate
Toggle switch UI:             ~60 lines × 4 = ~240 lines duplicate
Card grid patterns:           ~70 lines × 3 = ~210 lines duplicate
Sidebar navigation:           ~80 lines × 2 = ~160 lines duplicate
Practice header:              ~50 lines × 3 = ~150 lines duplicate
─────────────────────────────────────────────────────────────
Tổng ước tính:                               ~910 lines có thể loại bỏ
```

---

## 2. Kiến Trúc Thư Mục Mới

```
src/
├── app/
│   ├── api/grade-reading/route.js
│   ├── globals.css
│   ├── layout.js
│   └── page.js                    (trim xuống <400 lines)
│
├── components/                    (common — dùng cho mọi module)
│   ├── ui/                        ← MỚI: Pure UI primitives
│   │   ├── ToggleSwitch.js
│   │   ├── OptionCard.js
│   │   ├── SelectDropdown.js
│   │   ├── ConfirmModal.js        (giữ nguyên, đã tốt)
│   │   └── Toast.js               (giữ nguyên)
│   │
│   ├── layout/                    ← MỚI: Layout shells
│   │   ├── PracticeHeader.js
│   │   └── PracticeLayout.js
│   │
│   ├── navigation/                ← MỚI: Navigation patterns
│   │   └── QuestionSidebar.js     (thay thế SidebarMatrix.js)
│   │
│   ├── AudioPlayer.js             (giữ nguyên)
│   ├── Icons.js                   (giữ nguyên)
│   └── PartSelection.js           (giữ nguyên)
│
├── components_listening/          (domain-specific: listening)
│   ├── QuestionContent.js         (trim xuống ~200 lines)
│   └── parts/                     ← MỚI: Tách theo part
│       ├── Part1Question.js
│       ├── Part2Question.js
│       └── Part3Question.js
│
├── components_reading/            (domain-specific: reading)
│   ├── ReadingPractice.js         (trim xuống ~400 lines)
│   ├── ReadingResult.js           (giữ nguyên)
│   └── parts/                     ← MỚI
│       ├── ReadingPart1.js
│       ├── ReadingPart2.js
│       ├── ReadingPart3.js
│       └── ReadingPart4.js
│
├── components_gv/                 (domain-specific: grammar/vocab)
│   ├── HomeDashboard.js           (trim xuống ~300 lines)
│   ├── GrammarPractice.js         (trim xuống ~500 lines)
│   ├── GrammarQuestionCard.js     (trim xuống ~100 lines)
│   └── VocabPartCard.js           (trim xuống ~150 lines)
│
└── utils/
    ├── helpers.js                 (giữ + bổ sung)
    ├── styleHelpers.js            ← MỚI: Style utility functions
    └── constants.js               ← MỚI: Shared constants & tokens
```

---

## 3. Chi Tiết Từng Refactor

---

### 3.1 `src/utils/constants.js` — Design Tokens & Shared Constants

**Ưu tiên: PHẢI LÀM TRƯỚC** (các bước sau phụ thuộc vào file này)

**Vấn đề hiện tại**: Màu sắc cứng (`#006590`, `#58CC02`, `#ba1a1a`) rải rác trong 10+ file. Thay đổi brand color phải sửa hàng chục chỗ.

```js
// src/utils/constants.js

export const COLORS = {
  primary:          "#006590",
  primaryLight:     "#1cb0f6",
  primaryBg:        "rgba(28,176,246,0.05)",
  success:          "#58CC02",
  successBg:        "rgba(88,204,2,0.08)",
  error:            "#ba1a1a",
  errorBg:          "rgba(186,26,26,0.06)",
  neutral:          "#bdc8d2",
  neutralText:      "#1b1c1c",
  surfaceWhite:     "white",
};

export const OPTION_STATE_STYLES = {
  default:   { bg: COLORS.surfaceWhite, border: COLORS.neutral, color: COLORS.neutralText },
  selected:  { bg: COLORS.primaryBg,   border: COLORS.primary,  color: COLORS.neutralText },
  correct:   { bg: COLORS.successBg,   border: COLORS.success,  color: COLORS.neutralText },
  wrong:     { bg: COLORS.errorBg,     border: COLORS.error,    color: COLORS.neutralText },
};

export const SIDEBAR_PAGE_SIZE = 25;
export const SIDEBAR_COLS     = 5;
```

---

### 3.2 `src/utils/styleHelpers.js` — Pure Style Functions

**Vấn đề hiện tại**: Logic tính màu option card lặp lại 5+ lần (~30 lines mỗi lần).

```js
// src/utils/styleHelpers.js
import { OPTION_STATE_STYLES } from "./constants";

/**
 * Trả về style object cho option card dựa vào trạng thái.
 * Dùng thay cho 30 dòng if/else rải rác trong QuestionContent, GrammarQuestionCard, VocabPartCard.
 */
export function getOptionCardStyle(isSelected, isChecked, isCorrect) {
  if (!isChecked) {
    return isSelected ? OPTION_STATE_STYLES.selected : OPTION_STATE_STYLES.default;
  }
  if (isCorrect)  return OPTION_STATE_STYLES.correct;
  if (isSelected) return OPTION_STATE_STYLES.wrong;
  return OPTION_STATE_STYLES.default;
}

/**
 * Màu badge câu hỏi trong sidebar navigation.
 */
export function getQuestionBadgeStyle(state) {
  // state: "active" | "correct" | "wrong" | "answered" | "default"
  const map = {
    active:   { bg: "#006590", color: "white",   border: "#006590"  },
    correct:  { bg: "#58CC02", color: "white",   border: "#58CC02"  },
    wrong:    { bg: "#ba1a1a", color: "white",   border: "#ba1a1a"  },
    answered: { bg: "#e8f4fa", color: "#006590", border: "#006590"  },
    default:  { bg: "white",   color: "#5c6b7a", border: "#bdc8d2"  },
  };
  return map[state] ?? map.default;
}
```

---

### 3.3 `src/components/ui/ToggleSwitch.js` — Toggle Component

**Vấn đề hiện tại**: ~60 dòng HTML/style lặp lại 4 lần = 240 dòng thừa.

**Locations cần migrate**:
- `page.js` — 4 toggle settings (hiển thị đáp án, tự động...)
- `GrammarPractice.js` — toggle chế độ auto-answer
- `ReadingPractice.js` — toggle chế độ auto-answer

```jsx
// src/components/ui/ToggleSwitch.js
import { COLORS } from "../../utils/constants";

export default function ToggleSwitch({ checked, onChange, label, disabled = false }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }}>
      <div
        onClick={() => !disabled && onChange(!checked)}
        style={{
          width: 32, height: 18, borderRadius: 9,
          background: checked ? COLORS.primary : "#cbd5e0",
          position: "relative", transition: "background 0.2s",
          flexShrink: 0,
        }}
      >
        <div style={{
          position: "absolute",
          width: 14, height: 14, borderRadius: "50%",
          background: "white",
          top: 2, left: checked ? 16 : 2,
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }} />
      </div>
      {label && <span style={{ fontSize: 13, color: COLORS.neutralText }}>{label}</span>}
    </label>
  );
}
```

**Cách dùng sau refactor**:
```jsx
// Trước (60 dòng):
<div style={{width:"32px", height:"18px", background: autoAnswer ? "#006590" : "#cbd5e0"...}}>
  <div style={{position:"absolute", width:"14px"...}} />
</div>
<span>Tự động chấm</span>

// Sau (1 dòng):
<ToggleSwitch checked={autoAnswer} onChange={setAutoAnswer} label="Tự động chấm" />
```

---

### 3.4 `src/components/ui/OptionCard.js` — Answer Option Card

**Vấn đề hiện tại**: Logic option card với trạng thái selected/correct/wrong lặp lại trong 3+ file.

**Locations cần migrate**:
- `QuestionContent.js` — Part 1, 2, 3 question types
- `GrammarQuestionCard.js` — grammar options
- `VocabPartCard.js` — vocab options

```jsx
// src/components/ui/OptionCard.js
import { getOptionCardStyle } from "../../utils/styleHelpers";

export default function OptionCard({
  label,           // "A", "B", "C"...
  text,
  isSelected,
  isChecked,
  isCorrect,
  onClick,
  showFeedbackIcon = true,
}) {
  const { bg, border, color } = getOptionCardStyle(isSelected, isChecked, isCorrect);
  const showCheck = isChecked && isCorrect;
  const showX     = isChecked && isSelected && !isCorrect;

  return (
    <button
      onClick={onClick}
      disabled={isChecked}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 16px", borderRadius: 12,
        border: `1.5px solid ${border}`,
        background: bg, color,
        width: "100%", textAlign: "left",
        cursor: isChecked ? "default" : "pointer",
        transition: "all 0.15s",
      }}
    >
      <span style={{
        minWidth: 28, height: 28, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        border: `1.5px solid ${border}`, fontSize: 13, fontWeight: 600,
      }}>
        {label}
      </span>
      <span style={{ flex: 1, fontSize: 14 }}>{text}</span>
      {showFeedbackIcon && showCheck && <span style={{ color: "#58CC02" }}>✓</span>}
      {showFeedbackIcon && showX     && <span style={{ color: "#ba1a1a" }}>✗</span>}
    </button>
  );
}
```

---

### 3.5 `src/components/ui/SelectDropdown.js` — Styled Select

**Vấn đề hiện tại**: Pattern dropdown select với style disabled/enabled lặp lại trong `VocabPartCard.js` và `ReadingPractice.js`.

```jsx
// src/components/ui/SelectDropdown.js
export default function SelectDropdown({
  value, options, onChange,
  disabled = false, placeholder = "-- Chọn đáp án --",
  isCorrect, isWrong,     // feedback states
}) {
  let borderColor = "#bdc8d2";
  if (isCorrect) borderColor = "#58CC02";
  if (isWrong)   borderColor = "#ba1a1a";

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      style={{
        border: `1.5px solid ${borderColor}`,
        borderRadius: 8, padding: "6px 10px",
        fontSize: 13, background: "white",
        cursor: disabled ? "default" : "pointer",
        outline: "none", minWidth: 160,
      }}
    >
      <option value="">{placeholder}</option>
      {options.map(opt => (
        <option key={opt.value ?? opt} value={opt.value ?? opt}>
          {opt.label ?? opt}
        </option>
      ))}
    </select>
  );
}
```

---

### 3.6 `src/components/navigation/QuestionSidebar.js` — Unified Sidebar

**Vấn đề hiện tại**: `SidebarMatrix.js` tồn tại nhưng `GrammarPractice.js` và `ReadingPractice.js` có sidebar logic riêng không dùng SidebarMatrix.

**Action**: Xem xét tại sao các file trên không dùng SidebarMatrix, sau đó:
1. Nếu SidebarMatrix thiếu tính năng → mở rộng props của nó
2. Migrate `GrammarPractice` và `ReadingPractice` sang dùng SidebarMatrix
3. Rename thành `QuestionSidebar` để tên rõ ý hơn

```jsx
// Signature mục tiêu:
<QuestionSidebar
  questions={questions}
  currentIndex={currentIdx}
  answers={answers}
  results={checkedResults}
  onJump={handleJump}
  score={score}
  label="câu"       // "câu" hoặc "từ" hay "đoạn"
/>
```

---

### 3.7 `src/components/layout/PracticeHeader.js` — Shared Header

**Vấn đề hiện tại**: Header sticky với nút back, toggle settings, timer lặp lại trong `page.js`, `GrammarPractice.js`, `ReadingPractice.js`.

```jsx
// src/components/layout/PracticeHeader.js
export default function PracticeHeader({
  title,
  onBack,
  timer,          // số giây còn lại
  showTimer,
  children,       // slot cho các toggle settings đặc thù của từng module
}) {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "white",
      borderBottom: "1px solid #e8edf2",
      padding: "12px 20px",
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <button onClick={onBack} style={{ /* back button style */ }}>←</button>
      <span style={{ flex: 1, fontWeight: 700 }}>{title}</span>
      {children}
      {showTimer && <TimerDisplay seconds={timer} />}
    </header>
  );
}
```

---

### 3.8 Tách `HomeDashboard.js` — Card Component

**Vấn đề hiện tại**: 3 section trong `HomeDashboard.js` (grammar cards, listening cards, reading cards) dùng cùng card structure nhưng code lặp lại ~70 lines mỗi lần.

```jsx
// Tách ra component nội bộ hoặc file riêng:
// src/components_gv/SubjectCard.js

export default function SubjectCard({ icon, title, description, badge, color, onClick }) {
  return (
    <button
      className="btn-3d"
      onClick={onClick}
      style={{
        borderRadius: 24,
        padding: "20px 16px",
        textAlign: "left",
        background: "white",
        border: `1px solid ${color}22`,
        /* ... */
      }}
    >
      <div style={{ /* icon circle */ background: `${color}22`, borderRadius: "50%" }}>
        {icon}
      </div>
      <div>{title}</div>
      <div style={{ fontSize: 12 }}>{description}</div>
      {badge && <span>{badge}</span>}
    </button>
  );
}
```

---

### 3.9 Tách `ReadingPractice.js` — Part Components

**Vấn đề hiện tại**: File 1052 dòng với 4 render block khổng lồ cho từng part.

```
src/components_reading/
└── parts/
    ├── ReadingPart1.js   (sentence completion — dropdown)
    ├── ReadingPart2.js   (text ordering — move buttons)
    ├── ReadingPart3.js   (passage matching)
    └── ReadingPart4.js   (heading matching)
```

```jsx
// Mỗi Part component nhận interface thống nhất:
<ReadingPart1
  data={currentQuestion}
  answers={answers}
  checked={isChecked}
  onAnswer={handleAnswer}
/>
```

`ReadingPractice.js` sau refactor chỉ còn:
- State management
- Navigation logic
- Timer logic
- Render: `{renderCurrentPart()}`  ← switch ra 4 component nhỏ

---

### 3.10 Tách `QuestionContent.js` — Part Components

**Tương tự**, tách 627 dòng thành:

```
src/components_listening/
└── parts/
    ├── Part1Question.js   (single question)
    ├── Part2Question.js   (multi-question)
    └── Part3Question.js   (statement matching)
```

---

## 4. Roadmap Thực Hiện

### Phase 1 — Foundation (Không breaking change)
*Thực hiện song song, không ảnh hưởng UI*

| Task | File tạo | Effort |
|------|----------|--------|
| Tạo `constants.js` với COLORS, OPTION_STATE_STYLES | `src/utils/constants.js` | 30 min |
| Tạo `styleHelpers.js` với `getOptionCardStyle`, `getQuestionBadgeStyle` | `src/utils/styleHelpers.js` | 30 min |

### Phase 2 — UI Primitives
*Tạo components, chưa migrate*

| Task | File tạo | Effort |
|------|----------|--------|
| Tạo `ToggleSwitch.js` | `src/components/ui/ToggleSwitch.js` | 45 min |
| Tạo `OptionCard.js` | `src/components/ui/OptionCard.js` | 1h |
| Tạo `SelectDropdown.js` | `src/components/ui/SelectDropdown.js` | 30 min |
| Tạo `PracticeHeader.js` | `src/components/layout/PracticeHeader.js` | 1h |
| Tạo `SubjectCard.js` | `src/components_gv/SubjectCard.js` | 30 min |

### Phase 3 — Migrate Grammar & Vocab Module
*Ưu tiên vì module này nhỏ hơn, ít rủi ro*

| Task | File sửa | Effort |
|------|----------|--------|
| Dùng `OptionCard` trong `GrammarQuestionCard.js` | `GrammarQuestionCard.js` | 1h |
| Dùng `OptionCard` + `SelectDropdown` trong `VocabPartCard.js` | `VocabPartCard.js` | 1.5h |
| Dùng `ToggleSwitch` + `PracticeHeader` trong `GrammarPractice.js` | `GrammarPractice.js` | 2h |
| Dùng `SubjectCard` trong `HomeDashboard.js` (3 sections) | `HomeDashboard.js` | 2h |

### Phase 4 — Migrate Listening Module

| Task | File sửa/tạo | Effort |
|------|-------------|--------|
| Tách Part1/2/3 components | `components_listening/parts/` | 3h |
| Dùng `OptionCard` trong `QuestionContent.js` | `QuestionContent.js` | 2h |
| Dùng `PracticeHeader`, `QuestionSidebar` trong `page.js` | `page.js` | 3h |

### Phase 5 — Migrate Reading Module

| Task | File sửa/tạo | Effort |
|------|-------------|--------|
| Tách ReadingPart1/2/3/4 components | `components_reading/parts/` | 4h |
| Dùng `ToggleSwitch`, `SelectDropdown`, `PracticeHeader` trong `ReadingPractice.js` | `ReadingPractice.js` | 3h |

### Phase 6 — Sidebar Unification

| Task | Effort |
|------|--------|
| Audit tại sao GrammarPractice/ReadingPractice không dùng SidebarMatrix | 30 min |
| Mở rộng props SidebarMatrix → rename QuestionSidebar | 2h |
| Migrate tất cả 3 consumers | 2h |

---

## 5. Quy Tắc Cho Team (để không tái phát)

### 5.1 Trước khi code một UI mới, hỏi:
1. Đã có component tương tự trong `src/components/ui/` chưa?
2. Styling này có chia sẻ màu với token trong `constants.js` không?
3. Logic này có dùng ở nhiều hơn 1 chỗ không? → nếu có, đưa vào `utils/`

### 5.2 Hard rules:
- **Không** viết style object màu sắc hardcode (`#006590`, `#58CC02`...) — dùng `COLORS` từ `constants.js`
- **Không** viết toggle switch HTML từ đầu — dùng `<ToggleSwitch />`
- **Không** viết option card coloring logic từ đầu — dùng `<OptionCard />` hoặc `getOptionCardStyle()`
- File component **không** vượt quá **300 dòng** — nếu vượt, tách
- File page/container **không** vượt quá **500 dòng** — nếu vượt, tách

### 5.3 Naming conventions:
```
components/ui/          → Pure UI, không có business logic, dùng được ở mọi module
components/layout/      → Layout shells, slots cho children
components/navigation/  → Navigation patterns
components_listening/   → Domain: listening feature
components_reading/     → Domain: reading feature
components_gv/          → Domain: grammar & vocabulary
utils/helpers.js        → Pure utility functions (format, shuffle...)
utils/styleHelpers.js   → Style calculation functions
utils/constants.js      → Design tokens, shared constants
```

---

## 6. Kiểm Tra Sau Refactor

Sau mỗi Phase, verify:
- [ ] UI không có visual regression (so sánh screenshot trước/sau)
- [ ] Tất cả trạng thái (selected, checked, correct, wrong) hiển thị đúng
- [ ] Mobile responsive không bị vỡ
- [ ] Không có console error mới

---

## 7. Ước Tính Kết Quả

| Metric | Trước | Sau |
|--------|-------|-----|
| Tổng dòng code src/ | ~5,200 | ~3,800 (-27%) |
| File lớn nhất | 1,420 dòng | <500 dòng |
| Components có thể test isolated | 0 | 6+ |
| Thời gian thêm toggle mới | ~20 phút (copy-paste) | ~2 phút (dùng component) |
| Thời gian đổi brand color | ~2 giờ (tìm và thay) | ~5 phút (sửa constants.js) |
