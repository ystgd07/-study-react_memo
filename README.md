# DOM과 Virtual DOM의 렌더링 성능 비교 분석

일반적인 DOM 조작과 React의 Virtual DOM(VDOM) 방식을 사용한 렌더링 성능의 차이를 비교하고, 각각의 장단점과 최적화 방법을 분석합니다.

---

## 📌 목차

- [배경](#배경)
- [실험 설정](#실험-설정)
- [실험 코드 예제](#실험-코드-예제)
  - [일반 DOM (Vanilla JS)](#일반-dom-vanilla-js)
  - [React (Virtual DOM)](#react-virtual-dom)
- [관찰 및 결과](#관찰-및-결과)
- [최적화 기법](#최적화-기법)
- [결론](#결론)

---

## 🚩 배경

### 🔹 일반 DOM 조작
직접 DOM API를 이용하여 요소를 업데이트하면, 많은 요소가 변경될 때 브라우저의 레이아웃 계산과 리페인트 비용이 증가할 수 있습니다.

### 🔹 React의 Virtual DOM
React는 상태가 변경되면 메모리상에서 가벼운 DOM 복사본(VDOM)을 생성합니다. 이전 VDOM과 새로운 VDOM을 비교(diff)하여 실제 DOM에 최소한의 변경만 적용합니다.

- 장점: 복잡한 UI나 빈번한 업데이트 시 불필요한 DOM 조작을 줄여줍니다.
- 단점: diffing 작업에 의한 추가적인 오버헤드가 있습니다.

---

## 🎯 실험 설정

- **목적**: 200행 × 20열 테이블에서 100개의 랜덤 셀을 업데이트할 때, 실제 DOM 업데이트 완료까지의 시간을 측정합니다.

- **측정 지표**:
  - Interaction to Next Paint (INP)
  - DOM 업데이트 소요 시간 비교

---

## 📋 실험 코드 예제

### 일반 DOM (Vanilla JS, index.html)
버튼 클릭 시 100개 셀 업데이트 후 `requestAnimationFrame`을 이용하여 완료 시점을 측정합니다.

```javascript
requestAnimationFrame(() => {
  const duration = performance.now() - startTime;
  document.getElementById('result').textContent =
    `DOM Update Duration: ${duration.toFixed(2)}ms`;
});
```

### React (Virtual DOM, App.jsx)
동일한 방식으로 업데이트 완료 시점을 측정하며, 최적화(useMemo+Grid) 이전/이후의 차이를 분석합니다.

```jsx
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

---

## 📊 관찰 및 결과

### 일반 DOM을 사용한 Update INP 측정
![image](https://github.com/user-attachments/assets/981a1a65-4c2b-4043-8660-5fd6885be9c0)

### React VDOM 방식의 Update INP 측정(최적화 이전)
![image](https://github.com/user-attachments/assets/bb5a6a78-ceab-407b-a6b9-fdfdaa64d854)

- 예상과 달리 일반 DOM과 React VDOM 방식 사이의 성능 차이는 크지 않았습니다.
- React가 diff 작업 오버헤드로 인해 오히려 성능이 다소 낮은 경우도 있었습니다.

> **이유 분석**
>
> React는 상태 변경 시 테이블 전체를 새롭게 복사하여 참조가 바뀌고 전체 컴포넌트를 재렌더링합니다. 이로 인해 불필요한 diff 작업 및 전체 컴포넌트 렌더링 오버헤드가 발생.



---

## 🚀 최적화 기법

React의 장점을 활용하여 성능을 최적화할 수 있는 대표적인 방법은 다음과 같다.

- **컴포넌트 분리 및 선택적 렌더링**: 이벤트 발생 시 필요한 컴포넌트만 선택적으로 렌더링하여 성능 향상 가능
- **가상화(Virtualization)**: 대량의 데이터를 처리할 때 화면에 보이는 부분만 렌더링하여 성능을 크게 개선 가능 (예: react-window, react-virtualized)
- Vannila JS도 가상화를 구현 가능 하지만 React 생태계의 라이브러리를 활용한 선언적 프로그래밍으로 효율적으로 구현 및 관리가 가능 

---

## 🎓 결론

- 단순하고 일회성의 업데이트는 일반 DOM이 오히려 더 효율적일 수 있다.
- 하지만 복잡한 UI 구조나 특정 컴포넌트만 업데이트하는 상황에서는 React(Virtual DOM)가 코드 관리와 성능 측면에서 더욱 효율적.
- VDOM을 활용하기 때문에 DOM을 조작하는 것 보다 성능이 빠르다는 것은 잘못 된 접근, 인터렉티브한 다양한 요구사항에 대해 효율적으로 개발할 수 있도록 돕는 역할이라고 하는 것이 맞다고 생각. 
  
결국, 상황에 맞는 도구를 선택하고 적절한 최적화 기법을 활용하는 것이 가장 중요 할 것 같다. 
