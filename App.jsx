import React, {
  useState,
  useLayoutEffect,
  useCallback,
  useMemo,
  memo,
} from "react";
import { FixedSizeList as List, FixedSizeGrid as Grid } from "react-window";

// 테이블 크기 설정 200 * 20 4000개의 샐 생성
const ROWS = 200;
const COLS = 20;
const CELL_WIDTH = 100;
const CELL_HEIGHT = 35;

// 개별 셀 컴포넌트 - 메모이제이션 적용
const Cell = memo(({ data, rowIndex, columnIndex, style }) => {
  const cellValue = data[rowIndex][columnIndex];

  return (
    <div
      style={{
        ...style,
        border: "1px solid #000",
        padding: "5px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {cellValue}
    </div>
  );
});

// 초기 테이블 데이터 생성
const createInitialTable = () =>
  Array.from({ length: ROWS }, (_, i) =>
    Array.from({ length: COLS }, (_, j) => `${i}-${j}`)
  );

export default function App() {
  const [tableData, setTableData] = useState(createInitialTable());
  const [updateStart, setUpdateStart] = useState(null);
  const [duration, setDuration] = useState(null);

  // 업데이트 함수 메모이제이션
  const updateCells = () => {
    setUpdateStart(performance.now());

    setTableData((prevTable) => {
      // 새 테이블 객체 생성
      const newTable = prevTable.map((row) => [...row]);

      // 100개의 랜덤 셀만 업데이트
      for (let k = 0; k < 100; k++) {
        const randomRow = Math.floor(Math.random() * ROWS);
        const randomCol = Math.floor(Math.random() * COLS);
        newTable[randomRow][randomCol] =
          "Updated " + Math.floor(Math.random() * 1000);
      }

      return newTable;
    });
  };

  // 업데이트 후 성능 측정
  useLayoutEffect(() => {
    if (updateStart !== null) {
      requestAnimationFrame(() => {
        const dur = performance.now() - updateStart;
        setDuration(dur);
        setUpdateStart(null);
      });
    }
  }, [tableData, updateStart]);

  // 가상화된 테이블을 위한 ItemData 메모이제이션
  const itemData = useMemo(() => tableData, [tableData]);

  return (
    <div>
      <button onClick={updateCells}>Update Cells</button>
      {duration && <div>React Update Duration: {duration.toFixed(2)}ms</div>}

      <div
        style={{
          height: 600,
          width: COLS * CELL_WIDTH,
          border: "1px solid #ccc",
        }}
      >
        <Grid
          columnCount={COLS}
          columnWidth={CELL_WIDTH}
          height={600}
          rowCount={ROWS}
          rowHeight={CELL_HEIGHT}
          width={COLS * CELL_WIDTH}
          itemData={itemData}
        >
          {Cell}
        </Grid>
      </div>
    </div>
  );
}
