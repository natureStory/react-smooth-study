import React, { useState } from "react";
import "./App.css";
import { Container, Draggable } from "react-smooth-dnd";

const handleRemoveAndAdd = ({
  arr,
  currentDeepNum,
  targetDeepNum,
  currentParent = {},
  targetParent,
  target,
  targetIndex,
  handleType,
}) => {
  if (currentDeepNum === targetDeepNum) {
    const tempArr = [...arr];
    switch (handleType) {
      case "add":
        if (targetParent?.id === currentParent?.id) {
          tempArr.splice(targetIndex, 0, target);
        }
        break;
      case "sub":
        if (targetParent?.id === currentParent?.id) {
          tempArr.splice(targetIndex, 1);
        }
        break;
      default:
    }
    return tempArr;
  } else {
    return arr.map((item) => {
      return {
        ...item,
        children: handleRemoveAndAdd({
          arr: item.children || [],
          currentDeepNum: currentDeepNum + 1,
          currentParent: item,
          targetParent,
          targetDeepNum,
          target,
          targetIndex,
          handleType,
        }),
      };
    });
  }
};

// 这个代码有问题，会可能是找到元素之前或者本身
// const findTargetBrother = (
//   arr,
//   targetParent,
//   currentParent,
//   targetIndex,
//   targetDeepNum,
//   currentDeepNum = 0
// ) => {
//   if (targetParent) {
//     if (targetDeepNum === currentDeepNum) {
//       if (targetParent === currentParent) {
//         return arr[targetIndex - 1];
//       }
//     } else {
//       return arr
//         .map((item) =>
//           findTargetBrother(
//             item.children || [],
//             targetParent,
//             item,
//             targetIndex,
//             targetDeepNum,
//             currentDeepNum + 1
//           )
//         )
//         .filter((item) => item)[0];
//     }
//   } else {
//     // 没有 targetParent，则目标为第 0 层
//     return arr[targetIndex - 1];
//   }
// };

const applyDrag = (arr, dragResult) => {
  const {
    removedIndex,
    removedDeepNum,
    removeParent,
    addedIndex,
    addedDeepNum,
    addParent,
    payload,
  } = dragResult;
  if (removedIndex === null && addedIndex === null) return arr;

  let result = [...arr];

  // const targetBrother = findTargetBrother(
  //   arr,
  //   addParent,
  //   null,
  //   addedIndex,
  //   addedDeepNum
  // );

  result = handleRemoveAndAdd({
    arr: result,
    currentDeepNum: 0,
    targetDeepNum: removedDeepNum,
    currentParent: null,
    targetParent: removeParent,
    target: payload,
    targetIndex: removedIndex,
    handleType: "sub",
  });
  result = handleRemoveAndAdd({
    arr: result,
    currentDeepNum: 0,
    targetDeepNum: addedDeepNum,
    currentParent: null,
    targetParent: addParent,
    target: payload,
    targetIndex: addedIndex,
    handleType: "add",
  });
  return result;
};

let lastImperfectDropE = { addedIndex: null, removedIndex: null };
function App() {
  const [dataSource, setDataSource] = useState([
    {
      id: 1,
      label: "111111111111111",
      children: [
        {
          id: 2,
          label: "222222222222222222",
          children: [
            {
              id: 3,
              label: "33333333333333",
              children: [],
            },
            {
              id: 33,
              label: "33-33333333333333",
              children: [],
            },
          ],
        },
        {
          id: 22,
          label: "2-222222222222222222",
          children: [
            {
              id: 32,
              label: "3-33333333333333",
              children: [],
            },
          ],
        },
      ],
    },
    {
      id: 4,
      label: "4444444444444444",
      children: [
        {
          id: 5,
          label: "5555555555555555",
          children: [
            {
              id: 6,
              label: "66666666666666",
              children: [],
            },
          ],
        },
      ],
    },
    {
      id: 7,
      label: "777777777777",
      children: [],
    },
  ]);

  const containerOnDrop = (e, parent, deepNum) => {
    const { removedIndex, addedIndex } = e;
    if (removedIndex !== null && addedIndex !== null) {
      lastImperfectDropE = {
        ...lastImperfectDropE,
        ...e,
        removedDeepNum: deepNum,
        removeParent: parent,
        addedDeepNum: deepNum,
        addParent: parent,
      };
    } else if (removedIndex !== null) {
      lastImperfectDropE = {
        ...lastImperfectDropE,
        ...e,
        addedIndex: lastImperfectDropE.addedIndex,
        removedDeepNum: deepNum,
        removeParent: parent,
      };
    } else if (addedIndex !== null) {
      lastImperfectDropE = {
        ...lastImperfectDropE,
        ...e,
        removedIndex: lastImperfectDropE.removedIndex,
        addedDeepNum: deepNum,
        addParent: parent,
      };
    }
    if (
      lastImperfectDropE.addedIndex !== null &&
      lastImperfectDropE.removedIndex !== null
    ) {
      setDataSource(applyDrag(dataSource, lastImperfectDropE));
      lastImperfectDropE = { addedIndex: null, removedIndex: null };
    }
  };

  const createDataElement = (parent, list, deepNum = 0) => {
    return (
      <Container
        groupName="1"
        getChildPayload={(index) => list[index]}
        onDrop={(e) => containerOnDrop(e, parent, deepNum)}
        getGhostParent={() => document.body}
      >
        {list.map((item) => {
          if (!item.children?.length) {
            // return (
            //   <Draggable key={item.id}>
            //     <div className="draggable-item">{item.label}</div>
            //   </Draggable>
            // );
            // todo: 待研究
            return (
              <Draggable key={item.id}>
                <div className="draggable-item">
                  <Container
                    groupName="1"
                    getChildPayload={(index) => list[index]}
                    onDrop={(e) => containerOnDrop(e, item, deepNum + 1)}
                  >
                    {item.label}
                  </Container>
                </div>
              </Draggable>
            );
          } else {
            return (
              <Draggable key={item.id}>
                <div
                  style={{
                    padding: "20px 20px",
                    marginTop: "2px",
                    marginBottom: "2px",
                    border: "1px solid rgba(0,0,0,.125)",
                    backgroundColor: "#fff",
                    cursor: "move",
                  }}
                >
                  <h4 style={{ textAlign: "center" }}>{item.label}</h4>
                  <div style={{ cursor: "default" }}>
                    {createDataElement(item, item.children, deepNum + 1)}
                  </div>
                </div>
              </Draggable>
            );
          }
        })}
      </Container>
    );
  };

  return <div className="App">{createDataElement(null, dataSource)}</div>;
}

export default App;
