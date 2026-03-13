export function calculatePrediction(predHome, predAway, realHome, realAway) {
  // exact score
  if (predHome === realHome && predAway === realAway) {
    return { type: "gold", points: 3 };
  }

  const predDiff = predHome - predAway;
  const realDiff = realHome - realAway;

  // draw
  if (predDiff === 0 && realDiff === 0) {
    return { type: "silver", points: 1 };
  }

  // correct winner
  if ((predDiff > 0 && realDiff > 0) || (predDiff < 0 && realDiff < 0)) {
    return { type: "silver", points: 1 };
  }

  return { type: "none", points: 0 };
}
