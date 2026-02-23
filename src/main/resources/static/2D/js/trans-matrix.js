import { clearInputs, setInputs } from "/common/js/util.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("/2d/js/trans-matrix.js が読み込まれました");

    const transformSelect = document.getElementById("transformType");

    const translationParams = document.getElementById("translationMatrix");
    const scaleParams = document.getElementById("scaleMatrix");
    const rotationParams = document.getElementById("rotationMatrix");
    const customParams = document.getElementById("customMatrix");
    const addBtn = document.getElementById("addBtn");
    const listElem = document.getElementById("transformList");
    const nextBtn = document.getElementById("nextBtn");
    const backBtn = document.getElementById("backBtn");

    let transformQueue = [];
    sessionStorage.setItem("transformQueue", JSON.stringify(transformQueue));

    // // 初期ロード時に復元
    // const saved = sessionStorage.getItem("transformQueue");
    // if (saved) {
    //     transformQueue = JSON.parse(saved);
    //     renderList();
    // }

    addBtn.addEventListener("click", () => {
        const transform = transformSelect.value;
        if (!transform) {
            alert("Select transform type");
            return;
        }

        let entry = null;

        switch (transform) {

            case "translation": {
                const tx = document.getElementById("tx").valueAsNumber;
                const ty = document.getElementById("ty").valueAsNumber;
                if (Number.isNaN(tx) || Number.isNaN(ty)) {
                    alert("Input Tx, Ty");
                    return;
                }
                if (tx === 0 && ty === 0) {
                    alert("Setting both Tx, Ty to \"0\" has no effect.");
                    return;
                }
                entry = { type: "translation", tx, ty };
                clearInputs(translationParams);
                setInputs(translationParams, [0, 0]);
                break;
            }

            case "scale": {
                const sx = document.getElementById("sx").valueAsNumber;
                const sy = document.getElementById("sy").valueAsNumber;
                if (Number.isNaN(sx) || Number.isNaN(sy)) {
                    alert("Input Sx, Sy");
                    return;
                }
                if (sx <= 0 || sy <= 0) {
                    alert("Must Sx, Sy > 0");
                    return;
                }
                if (sx === 1 && sy === 1) {
                    alert("Setting both Sx, Sy to \"1\" has no effect.");
                    return;
                }

                entry = { type: "scale", sx, sy };
                clearInputs(scaleParams);
                setInputs(scaleParams, [1, 1]);
                break;
            }

            case "rotation": {
                const theta = document.getElementById("theta").valueAsNumber;
                if (Number.isNaN(theta)) {
                    alert("Input Theta");
                    return;
                }
                if (theta === 0) {
                    alert("Setting Theta to \"0\" has no effect.");
                    return;
                }
                entry = { type: "rotation", theta };
                clearInputs(rotationParams);
                setInputs(rotationParams, [0]);
                break;
            }

            case "custom": {
                const matrix = [];
                for (let i = 0; i < 3; i++) {
                    const row = [];
                    for (let j = 0; j < 3; j++) {
                        const v = document.getElementById(`m${i}${j}`).valueAsNumber;
                        if (Number.isNaN(v)) {
                            alert("Input all matrix values");
                            return;
                        }
                        row.push(v);
                    }
                    matrix.push(row);
                }
                entry = { type: "custom", matrix };
                clearInputs(customParams);
                setInputs(customParams, [1, 0, 0, 0, 1, 0, 0, 0, 1]);
                break;
            }
        }

        // 追加
        transformQueue.push(entry);
        sessionStorage.setItem("transformQueue", JSON.stringify(transformQueue));

        renderList();






    });

    transformSelect.addEventListener("change", () => {
        const transform = transformSelect.value;

        translationParams.classList.add("hidden");
        scaleParams.classList.add("hidden");
        rotationParams.classList.add("hidden");
        customParams.classList.add("hidden");

        switch (transform) {
            case "translation":
                translationParams.classList.remove("hidden");
                break;
            case "scale":
                scaleParams.classList.remove("hidden");
                break;
            case "rotation":
                rotationParams.classList.remove("hidden");
                break;
            case "custom":
                customParams.classList.remove("hidden");
                break;
        }
    });

    nextBtn.addEventListener("click", () => {
        // 次の画面へ
        location.href = "/2d/html/confirm.html";
    });

    backBtn.addEventListener("click", () => {
        if (history.length > 1) {
            history.back();
        } else {
            location.href = "/2d/html/shape.html";
        }
    });

    function renderList() {
        listElem.innerHTML = "";

        transformQueue.forEach((t, index) => {
            const li = document.createElement("li");

            const textSpan = document.createElement("span");
            textSpan.classList.add("transform-text");

            switch (t.type) {
                case "translation":
                    textSpan.textContent = `${index + 1}: 平行移動 (${t.tx}, ${t.ty})`;
                    break;
                case "scale":
                    textSpan.textContent = `${index + 1}: 拡大縮小 (${t.sx}, ${t.sy})`;
                    break;
                case "rotation":
                    textSpan.textContent = `${index + 1}:  回  転  (${t.theta}°)`;
                    break;
                case "custom":
                    const matrixText = "{ " + t.matrix.map(row => row.join(", ")).join("\n  ") + " }";
                    textSpan.innerHTML = `${index + 1}: 任意行列<br>${matrixText}<br>`;
                    break;
            }

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "削除";
            deleteBtn.classList.add("delete-btn");
            deleteBtn.addEventListener("click", () => {
                transformQueue.splice(index, 1);
                sessionStorage.setItem("transformQueue", JSON.stringify(transformQueue));
                renderList();
            });

            li.appendChild(textSpan);
            li.appendChild(deleteBtn);
            listElem.appendChild(li);
        });
    }

    // function clearInputs(type) {
    //     switch (type) {
    //         case "translation":
    //             document.getElementById("tx").value = "";
    //             document.getElementById("ty").value = "";
    //             break;

    //         case "scale":
    //             document.getElementById("sx").value = "";
    //             document.getElementById("sy").value = "";
    //             break;

    //         case "rotation":
    //             document.getElementById("theta").value = "";
    //             break;

    //         case "custom":
    //             for (let i = 0; i < 3; i++) {
    //                 for (let j = 0; j < 3; j++) {
    //                     document.getElementById(`m${i}${j}`).value = "";
    //                 }
    //             }
    //             break;
    //     }
    // } 

});



