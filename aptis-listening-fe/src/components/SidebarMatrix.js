import React from "react";

export default function SidebarMatrix({
  questions,
  currentIdx,
  selectedAnswers,
  checkedResults,
  visitedIds,
  modes,
  sidebarPage,
  setSidebarPage,
  jumpToQuestion,
  hideHeader,
}) {
  // Helpers to count correct/checked answers dynamically
  const getFlatQuestions = () => {
    const flat = [];
    questions.forEach((q) => {
      if (q.isMultiQuestion) {
        q.subQuestions.forEach((subQ) => {
          flat.push({ ...subQ, parentId: q.id });
        });
      } else {
        flat.push(q);
      }
    });
    return flat;
  };

  const flatQs = getFlatQuestions();
  const totalQuestionsCount = flatQs.length;

  const checkedCount = flatQs.filter((q) => {
    if (modes.autoShowAnswer) {
      return !!visitedIds[q.parentId || q.id];
    }
    return !!checkedResults[q.id];
  }).length;

  const correctCount = flatQs.filter((q) => {
    if (modes.autoShowAnswer) {
      return !!visitedIds[q.parentId || q.id];
    }
    return checkedResults[q.id] && selectedAnswers[q.id] === q.correctKey;
  }).length;

  return (
    <aside
      style={{
        width: "240px",
        flexShrink: 0,
        backgroundColor: "white",
        borderRadius: "16px",
        border: "2px solid #efeded",
        overflow: "hidden",
        position: "sticky",
        top: hideHeader ? "16px" : "68px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
        transition: "top 0.2s ease",
      }}
    >
      {/* Sidebar header */}
      <div
        style={{
          padding: "10px 14px",
          borderBottom: "1.5px solid #efeded",
          backgroundColor: "#f5f3f3",
        }}
      >
        <h2
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: "12px",
            color: "#006590",
            margin: 0,
          }}
        >
          Question List
        </h2>
      </div>

      {/* Question list matrix */}
      <div
        style={{
          padding: "12px",
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "8px",
          maxHeight: hideHeader ? "calc(100vh - 120px)" : "calc(100vh - 170px)",
          overflowY: "auto",
        }}
      >
        {questions
          .slice(sidebarPage * 25, (sidebarPage + 1) * 25)
          .map((item, displayIdx) => {
            const idx = sidebarPage * 25 + displayIdx;
            const isActive = idx === currentIdx;

            let isAnswered = false;
            let isGraded = false;
            let isAutoVisited = false;
            let isCorr = false;
            let isWrong = false;

            if (item.isMultiQuestion) {
              isAnswered = item.subQuestions.every((subQ) => !!selectedAnswers[subQ.id]);
              isGraded = item.subQuestions.every((subQ) => !!checkedResults[subQ.id]);
              isAutoVisited = modes.autoShowAnswer && !!visitedIds[item.id];
              isCorr =
                isAutoVisited ||
                (isGraded &&
                  item.subQuestions.every(
                    (subQ) => selectedAnswers[subQ.id] === subQ.correctKey
                  ));
              isWrong =
                !isAutoVisited &&
                (isGraded &&
                  item.subQuestions.some(
                    (subQ) => selectedAnswers[subQ.id] !== subQ.correctKey
                  ));
            } else {
              isAnswered = !!selectedAnswers[item.id];
              isGraded = !!checkedResults[item.id];
              isAutoVisited = modes.autoShowAnswer && !!visitedIds[item.id];
              isCorr =
                isAutoVisited ||
                (isGraded && selectedAnswers[item.id] === item.correctKey);
              isWrong = !isAutoVisited && isGraded && !isCorr;
            }

            let badgeBg = "#eae8e7",
              badgeCol = "#6e7881";
            const badge = String(idx + 1);

            if (isActive) {
              badgeBg = "#006590";
              badgeCol = "white";
            } else if (isCorr) {
              badgeBg = "#d4f0b8";
              badgeCol = "#2a6000";
            } else if (isWrong) {
              badgeBg = "#ffdad6";
              badgeCol = "#93000a";
            } else if (isAnswered) {
              badgeBg = "#e0f4ff";
              badgeCol = "#004c6e";
            }

            const borderStyle = isActive
              ? "2px solid #006590"
              : "2px solid transparent";

            return (
              <button
                key={item.id}
                onClick={() => jumpToQuestion(idx)}
                className="q-matrix-btn"
                title={item.isMultiQuestion ? `Audio Topic ${idx + 1}` : `Question ${idx + 1}`}
                style={{
                  width: "100%",
                  aspectRatio: "1/1",
                  borderRadius: "8px",
                  background: badgeBg,
                  color: badgeCol,
                  border: borderStyle,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {badge}
              </button>
            );
          })}
      </div>

      {/* Pagination Controls */}
      {questions.length > 25 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            borderTop: "1.5px solid #efeded",
            backgroundColor: "#fbf9f8",
          }}
        >
          <button
            disabled={sidebarPage === 0}
            onClick={() => setSidebarPage((p) => Math.max(0, p - 1))}
            style={{
              border: "none",
              background: "none",
              cursor: sidebarPage === 0 ? "not-allowed" : "pointer",
              color: sidebarPage === 0 ? "#ccc" : "#006590",
              fontWeight: "bold",
              fontSize: "12px",
            }}
          >
            Prev
          </button>
          <span
            style={{
              fontSize: "11px",
              color: "#6e7881",
              fontWeight: 600,
            }}
          >
            {sidebarPage + 1} / {Math.ceil(questions.length / 25)}
          </span>
          <button
            disabled={sidebarPage >= Math.ceil(questions.length / 25) - 1}
            onClick={() =>
              setSidebarPage((p) =>
                Math.min(Math.ceil(questions.length / 25) - 1, p + 1)
              )
            }
            style={{
              border: "none",
              background: "none",
              cursor:
                sidebarPage >= Math.ceil(questions.length / 25) - 1
                  ? "not-allowed"
                  : "pointer",
              color:
                sidebarPage >= Math.ceil(questions.length / 25) - 1
                  ? "#ccc"
                  : "#006590",
              fontWeight: "bold",
              fontSize: "12px",
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Sidebar footer: score summary */}
      <div
        style={{
          padding: "8px 12px",
          borderTop: "1.5px solid #efeded",
          backgroundColor: "#f5f3f3",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            fontWeight: 600,
            color: "#6e7881",
          }}
        >
          {checkedCount}/{totalQuestionsCount} checked
        </span>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "#2a6000",
          }}
        >
          ✓ {correctCount} correct
        </span>
      </div>
    </aside>
  );
}
