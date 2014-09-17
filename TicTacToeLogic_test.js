describe("In TicTacToe ", function() {
  function expectMoveOk(turnIndexBeforeMove, stateBeforeMove, move) {
    expect(isMoveOk({turnIndexBeforeMove: turnIndexBeforeMove,
      stateBeforeMove: stateBeforeMove,
      move: move})).toBe(true);
  }

  function expectIllegalMove(turnIndexBeforeMove, stateBeforeMove, move) {
    expect(isMoveOk({turnIndexBeforeMove: turnIndexBeforeMove,
      stateBeforeMove: stateBeforeMove,
      move: move})).toBe(false);
  }

  it("placing X in 0x0 from initial state is legal", function() {
    expectMoveOk(0, {},
      [{setTurn: {turnIndex : 1}},
        {set: {key: 'board', value: [['X', '', ''], ['', '', ''], ['', '', '']]}},
        {set: {key: 'delta', value: {row: 0, col: 0}}}]);
  });

  it("placing O in 0x1 after X placed X in 0x0 is legal", function() {
    expectMoveOk(1,
      {board: [['X', '', ''], ['', '', ''], ['', '', '']], delta: {row: 0, col: 0}},
      [{setTurn: {turnIndex : 0}},
        {set: {key: 'board', value: [['X', 'O', ''], ['', '', ''], ['', '', '']]}},
        {set: {key: 'delta', value: {row: 0, col: 1}}}]);
  });

  it("X wins by placing X in 2x0 is legal", function() {
    expectMoveOk(0,
      {board: [['X', 'O', ''], ['X', 'O', ''], ['', '', '']], delta: {row: 1, col: 1}},
      [{endMatch: {endMatchScores: [1, 0]}},
            {set: {key: 'board', value: [['X', 'O', ''], ['X', 'O', ''], ['X', '', '']]}},
            {set: {key: 'delta', value: {row: 2, col: 0}}}]);
  });

  it("O wins by placing O in 1x1 is legal", function() {
    expectMoveOk(1,
      {board: [['X', 'X', 'O'], ['X', '', ''], ['O', '', '']], delta: {row: 0, col: 1}},
      [{endMatch: {endMatchScores: [0, 1]}},
            {set: {key: 'board', value: [['X', 'X', 'O'], ['X', 'O', ''], ['O', '', '']]}},
            {set: {key: 'delta', value: {row: 1, col: 1}}}]);
  });

  it("the game ties when there are no more empty cells", function() {
    expectMoveOk(0,
      {board: [['X', 'O', 'X'], ['X', 'O', 'O'], ['O', 'X', '']], delta: {row: 2, col: 0}},
      [{endMatch: {endMatchScores: [0, 0]}},
            {set: {key: 'board', value: [['X', 'O', 'X'], ['X', 'O', 'O'], ['O', 'X', 'X']]}},
            {set: {key: 'delta', value: {row: 2, col: 2}}}]);
  });

  it("null move is illegal", function() {
    expectIllegalMove(0, {}, null);
  });

  it("move without board is illegal", function() {
    expectIllegalMove(0, {}, [{setTurn: {turnIndex : 1}}]);
  });

  it("move without delta is illegal", function() {
    expectIllegalMove(0, {}, [{setTurn: {turnIndex : 1}},
      {set: {key: 'board', value: [['X', '', ''], ['', '', ''], ['', '', '']]}}]);
  });

  it("placing X outside the board (in 3x0) is illegal", function() {
    expectIllegalMove(0, {}, [{setTurn: {turnIndex : 1}},
      {set: {key: 'board', value: [['X', '', ''], ['', '', ''], ['', '', '']]}},
      {set: {key: 'delta', value: {row: 3, col: 0}}}]);
  });

  it("placing X in 0x0 but setTurn to yourself is illegal", function() {
    expectIllegalMove(0, {}, [{setTurn: {turnIndex : 0}},
      {set: {key: 'board', value: [['X', '', ''], ['', '', ''], ['', '', '']]}},
      {set: {key: 'delta', value: {row: 0, col: 0}}}]);
  });

  it("placing X in 0x0 but setting the board wrong is illegal", function() {
    expectIllegalMove(0, {}, [{setTurn: {turnIndex : 1}},
      {set: {key: 'board', value: [['X', 'X', ''], ['', '', ''], ['', '', '']]}},
      {set: {key: 'delta', value: {row: 0, col: 0}}}]);
  });
});
