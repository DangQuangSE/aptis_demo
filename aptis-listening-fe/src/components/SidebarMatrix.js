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
  isMobileDrawer = false,
  onClose,
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

  const wrapperStyle = isMobileDrawer
    ? {
        width: "100%",
        backgroundColor: "white",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }
    : {
        width: "240px",
        flexShrink: 0,
        backgroundColor: "#eae8e7",
        borderRadius: "24px",
        border: "1px solid rgba(0, 0, 0, 0.045)",
        padding: "5px",
        overflow: "hidden",
        position: "sticky",
        top: hideHeader ? "16px" : "68px",
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.03)",
        transition: "top 0.2s ease",
      };

  return (
    <div style={wrapperStyle}>
      <div
        style={isMobileDrawer ? {
          display: "flex",
          flexDirection: "column",
          width: "100%",
        } : {
          backgroundColor: "white",
          borderRadius: "19px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
        }}
      >
      {/* Sidebar header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1.5px solid #efeded",
          backgroundColor: "#f5f3f3",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: "13px",
            color: "#006590",
            margin: 0,
          }}
        >
          {isMobileDrawer ? "Question Map" : "Question List"}
        </h2>
        {isMobileDrawer && (
          <button
            onClick={onClose}
            aria-label="Close question map"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
              fontWeight: "bold",
              color: "#6e7881",
              padding: "2px 6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Question list matrix */}
      <div
        style={{
          padding: isMobileDrawer ? "8px" : "12px",
          display: "grid",
          gridTemplateColumns: isMobileDrawer ? "repeat(10, 1fr)" : "repeat(5, 1fr)",
          gap: isMobileDrawer ? "6px" : "8px",
          maxHeight: isMobileDrawer ? "55vh" : (hideHeader ? "calc(100vh - 120px)" : "calc(100vh - 170px)"),
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

             return (
               <button
                 key={item.id}
                 onClick={() => jumpToQuestion(idx)}
                 className="q-matrix-btn spring-transition-fast hover:scale-[1.06] active:scale-[0.92]"
                 title={item.isMultiQuestion ? `Audio Topic ${idx + 1}` : `Question ${idx + 1}`}
                 style={{
                   width: "100%",
                   aspectRatio: "1/1",
                   borderRadius: isMobileDrawer ? "8px" : "12px",
                   background: badgeBg,
                   color: badgeCol,
                   border: "none",
                   boxShadow: isActive ? "0 0 0 2px #006590" : "0 1px 3px rgba(0,0,0,0.02)",
                   display: "flex",
                   alignItems: "center",
                   justifyContent: "center",
                   fontWeight: 700,
                   fontSize: isMobileDrawer ? "11px" : "12px",
                   cursor: "pointer",
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
            display: "flex",
            alignItems: "center",
            gap: "3px",
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          {correctCount} correct
        </span>
      </div>
    </div>
  </div>
);
}
