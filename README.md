# DOM과 VDOM의 랜더링 성능 차이점 Study

일반 DOM 조작과 React의 Virtual DOM(VDOM)을 사용한 방식 간의 랜더링 성능 차이를 비교하고, 각각의 장단점 및 최적화 기법에 대해 분석합니다.

## 목차
- [배경](#배경)
- [실험 설정](#실험-설정)
- [실험 코드 예제](#실험-코드-예제)
  - [일반 DOM (Vanilla JS)](#일반-dom-vanilla-js)
  - [React (Virtual DOM)](#react-virtual-dom)
- [관찰 및 결과](#관찰-및-결과)
- [최적화 기법](#최적화-기법)
- [결론](#결론)

## 배경
- **일반 DOM 조작**:  
  직접 DOM API를 사용해 요소를 업데이트하면, 업데이트 대상이 많은 경우 브라우저의 레이아웃 계산과 리페인트 비용이 증가할 수 있습니다.
  
- **React의 Virtual DOM**:  
  상태 변경 시 메모리 상의 가벼운 DOM 복사본(VDOM)을 생성하고, 이전 VDOM과의 차이를 계산(diffing)한 후 실제 DOM에 최소한의 변경만 반영합니다.  
  이 방식은 복잡한 UI나 빈번한 업데이트에서 불필요한 DOM 조작을 줄이는 장점이 있지만, diff 작업 자체에 추가 오버헤드가 발생할 수 있습니다.

## 예상
- DOM에 대한 빈번한 interaction 발생시, 모든 DOM 요소에대한 Repaint가 발생 **(클라이언트 리소스 ↓)**
- 특정 요소에 대해 랜더링하는 react의 VDOM방식이 상대적으로 효율적일 것이라 예상

## 설정
- **목적**: 200행×20열의 테이블에서 100개의 랜덤 셀을 업데이트하는 시나리오에서, 업데이트 후 실제 DOM에 반영되기까지 걸린 시간을 측정합니다.
- **측정 지표**:  
  - Interaction to Next Paint (업데이트 시작부터 다음 페인트까지 걸린 시간)
  - 일반 DOM 조작과 React(Virtual DOM) 방식의 비교

## 실행

### 일반 DOM (Vanilla JS,index.html)
버튼 클릭 시, 테이블 내 100개의 랜덤 셀을 업데이트하고, `requestAnimationFrame`을 통해 업데이트 완료 시점을 측정.
```
      requestAnimationFrame(() => {
        const duration = performance.now() - startTime;
        document.getElementById('result').textContent =
          `DOM Update Duration: ${duration.toFixed(2)}ms`;
      });
```


### React의 VDom(App.jsx)
같은 방식을 사용(`requestAnimationFrame`)하여, 업데이트 완료 시점을 측정. 최적화(useMemo+Grid) 이전과 이후 차이점 분석 
```
   useLayoutEffect(() => {
    if (updateStart !== null) {
      requestAnimationFrame(() => {
        const dur = performance.now() - updateStart;
        setDuration(dur);
        setUpdateStart(null);
      });
    }
  }, [tableData, updateStart]);

```

### 일반 DOM을 사용한 Update INP 측정
![image](https://github.com/user-attachments/assets/981a1a65-4c2b-4043-8660-5fd6885be9c0)


### React VDOM 방식의 Update INP 측정(최적화 이전)
![image](https://github.com/user-attachments/assets/bb5a6a78-ceab-407b-a6b9-fdfdaa64d854)

### 결과
업데이트 함수 실행 시, 일반 DOM과 React VDOM 방식의 성능지표상 차이점이 별로 없음.
- 오히려 React의 방식이 브라우저 랜더링 속도가 조금 낮은 것을 확인할 수 있다 - diff 수행으로 인한 오버헤드로 예상

### 🙄 무엇 때문에 예상과 다른 성능 지표를 얻을 수 있었을까?
우선 테스트를 수행한 React 코드를 살펴보자
```
    <div>
      <button onClick={updateCells}>Update Cells</button>
      {duration && (
        <div>React Update Duration: {duration.toFixed(2)}ms</div>
      )}
      <table style={{ borderCollapse: 'collapse' }}>
        <tbody>
          {table.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{ border: '1px solid #000', padding: '5px' }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
```

위 코드를 보면 초기 생성된(생성로직은 생략함) Table을 




