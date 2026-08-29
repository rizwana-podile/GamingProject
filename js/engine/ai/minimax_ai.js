/**
 * Aetheria Engine - Minimax Strategy AI Engine with Alpha-Beta Pruning
 * Game tree search for turn-based strategy games, hex tactics, and Snake AI bots.
 */

class MinimaxAI {
  static getBestMove(gameState, maxDepth, evaluateFn, getPossibleMovesFn, applyMoveFn, undoMoveFn) {
    let bestScore = -Infinity;
    let bestMove = null;

    const possibleMoves = getPossibleMovesFn(gameState);

    for (const move of possibleMoves) {
      applyMoveFn(gameState, move);
      const score = MinimaxAI.alphaBeta(gameState, maxDepth - 1, -Infinity, Infinity, false, evaluateFn, getPossibleMovesFn, applyMoveFn, undoMoveFn);
      undoMoveFn(gameState, move);

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return { move: bestMove, score: bestScore };
  }

  static alphaBeta(gameState, depth, alpha, beta, isMaximizing, evaluateFn, getPossibleMovesFn, applyMoveFn, undoMoveFn) {
    if (depth === 0 || gameState.isTerminal) {
      return evaluateFn(gameState);
    }

    const possibleMoves = getPossibleMovesFn(gameState);

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of possibleMoves) {
        applyMoveFn(gameState, move);
        const evalScore = MinimaxAI.alphaBeta(gameState, depth - 1, alpha, beta, false, evaluateFn, getPossibleMovesFn, applyMoveFn, undoMoveFn);
        undoMoveFn(gameState, move);

        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break; // Beta cutoff
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of possibleMoves) {
        applyMoveFn(gameState, move);
        const evalScore = MinimaxAI.alphaBeta(gameState, depth - 1, alpha, beta, true, evaluateFn, getPossibleMovesFn, applyMoveFn, undoMoveFn);
        undoMoveFn(gameState, move);

        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break; // Alpha cutoff
      }
      return minEval;
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MinimaxAI;
}
