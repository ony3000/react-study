import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  let className = 'square';
  if (props.isWinning) {
    className += ' is-winning';
  }
  return (
    <button className={className} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        isWinning={this.props.winningLine.includes(i)}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    const indexes = [0, 1, 2];
    const rowItems = indexes.map((rowIndex) => {
      const columnItems = indexes.map((columnIndex) => {
        const squareIndex = rowIndex * 3 + columnIndex;
        return this.renderSquare(squareIndex);
      });
      return (
        <div key={rowIndex} className="board-row">{columnItems}</div>
      );
    });
    return (
      <div>{rowItems}</div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        position: null,
      }],
      stepNumber: 0,
      focusedStepNumber: null,
      xIsNext: true,
      historyIsAscending: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinningLine(squares).length || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        position: i,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      focusedStepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  reverseHistory() {
    this.setState({
      historyIsAscending: !this.state.historyIsAscending,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winningLine = calculateWinningLine(current.squares);
    let winner;

    if (winningLine.length) {
      winner = current.squares[winningLine[0]];
    }

    const moves = history.map((step, move) => {
      let desc = 'Go to game start';
      if (move) {
        const rowCount = Math.floor(step.position / 3) + 1;
        const columnCount = step.position % 3 + 1;
        desc = `Go to move #${move} (${rowCount}행 ${columnCount}열)`;
      }
      const className = (move === this.state.focusedStepNumber ? 'is-focused' : '');
      return (
        <li
          key={move}
          className={className}
        >
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    if (!this.state.historyIsAscending) {
      moves.reverse();
    }

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else if (this.state.stepNumber === 9) {
      status = 'Draw';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    const toggleMessage = (this.state.historyIsAscending ? '최근' : '과거') + ' 기록을 위로 정렬하기';

    return (
      <div className="game">
        <div className="game-board">
          <Board
            winningLine={winningLine}
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.reverseHistory()}>{toggleMessage}</button>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinningLine(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return lines[i];
    }
  }
  return [];
}
