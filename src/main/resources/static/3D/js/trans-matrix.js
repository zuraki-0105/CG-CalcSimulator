import { clearInputs, setInputs, formatTransformEntry3D } from "../../common/js/util.js?v=@build.timestamp@";

document.addEventListener("DOMContentLoaded", () => {
    console.log("/3D/js/trans-matrix.js が読み込まれました");

    const transformSelect = document.getElementById("transformType");

    const translationParams = document.getElementById("translationMatrix");
    const scaleParams = document.getElementById("scaleMatrix");
    const rotationXParams = document.getElementById("rotationXMatrix");
    const rotationYParams = document.getElementById("rotationYMatrix");
    const rotationZParams = document.getElementById("rotationZMatrix");
    const customParams = document.getElementById("customMatrix");

    const addBtn = document.getElementById("addBtn");
    const listElem = document.getElementById("transformList");
    const nextBtn = document.getElementById("nextBtn");
    const backBtn = document.getElementById("backBtn");

    let transformQueue = [];
    sessionStorage.setItem("transformQueue", JSON.stringify(transformQueue));

    addBtn.addEventListener("click", () => {
        const transform = transformSelect.value;
        if (!transform) {
            alert("変換の種類を選択してください");
            return;
        }

        let entry = null;

        switch (transform) {
            case "translation": {
                const tx = document.getElementById("tx").valueAsNumber;
                const ty = document.getElementById("ty").valueAsNumber;
                const tz = document.getElementById("tz").valueAsNumber;
                if (Number.isNaN(tx) || Number.isNaN(ty) || Number.isNaN(tz)) {
                    alert("Tx, Ty, Tz を入力してください");
                    return;
                }
                if (tx === 0 && ty === 0 && tz === 0) {
                    alert("Tx, Ty, Tz を 0 に設定しても変化しません");
                    return;
                }
                entry = { type: "translation", tx, ty, tz };
                clearInputs(translationParams);
                setInputs(translationParams, [0, 0, 0]);
                break;
            }

            case "scale": {
                const sx = document.getElementById("sx").valueAsNumber;
                const sy = document.getElementById("sy").valueAsNumber;
                const sz = document.getElementById("sz").valueAsNumber;
                if (Number.isNaN(sx) || Number.isNaN(sy) || Number.isNaN(sz)) {
                    alert("Sx, Sy, Sz を入力してください");
                    return;
                }
                if (sx <= 0 || sy <= 0 || sz <= 0) {
                    alert("Sx, Sy, Sz は 0 より大きい必要があります");
                    return;
                }
                if (sx === 1 && sy === 1 && sz === 1) {
                    alert("Sx, Sy, Sz を 1 に設定しても変化しません");
                    return;
                }
                entry = { type: "scale", sx, sy, sz };
                clearInputs(scaleParams);
                setInputs(scaleParams, [1, 1, 1]);
                break;
            }

            case "rotationX": {
                const theta = document.getElementById("thetaX").valueAsNumber;
                if (Number.isNaN(theta) || theta === 0) {
                    alert("有効な角度(X)を入力してください");
                    return;
                }
                entry = { type: "rotationX", theta };
                clearInputs(rotationXParams);
                setInputs(rotationXParams, [0]);
                break;
            }

            case "rotationY": {
                const theta = document.getElementById("thetaY").valueAsNumber;
                if (Number.isNaN(theta) || theta === 0) {
                    alert("有効な角度(Y)を入力してください");
                    return;
                }
                entry = { type: "rotationY", theta };
                clearInputs(rotationYParams);
                setInputs(rotationYParams, [0]);
                break;
            }

            case "rotationZ": {
                const theta = document.getElementById("thetaZ").valueAsNumber;
                if (Number.isNaN(theta) || theta === 0) {
                    alert("有効な角度(Z)を入力してください");
                    return;
                }
                entry = { type: "rotationZ", theta };
                clearInputs(rotationZParams);
                setInputs(rotationZParams, [0]);
                break;
            }

            case "custom": {
                const matrix = [];
                for (let i = 0; i < 4; i++) {
                    const row = [];
                    for (let j = 0; j < 4; j++) {
                        const v = document.getElementById(`m${i}${j}`).valueAsNumber;
                        if (Number.isNaN(v)) {
                            alert("すべての行列の値を入力してください");
                            return;
                        }
                        row.push(v);
                    }
                    matrix.push(row);
                }
                entry = { type: "custom", matrix };
                clearInputs(customParams);
                setInputs(customParams, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
                break;
            }
        }

        if (entry) {
            transformQueue.push(entry);
            sessionStorage.setItem("transformQueue", JSON.stringify(transformQueue));
            console.log("[trans-matrix.js] キューに追加した変換行列 (JS Object):", entry);
            console.log("[trans-matrix.js] 現在の保存キュー (JSON文字列):", JSON.stringify(transformQueue));
            renderList();
        }
    });

    transformSelect.addEventListener("change", () => {
        const transform = transformSelect.value;
        translationParams.classList.add("hidden");
        scaleParams.classList.add("hidden");
        rotationXParams.classList.add("hidden");
        rotationYParams.classList.add("hidden");
        rotationZParams.classList.add("hidden");
        customParams.classList.add("hidden");

        switch (transform) {
            case "translation": translationParams.classList.remove("hidden"); break;
            case "scale": scaleParams.classList.remove("hidden"); break;
            case "rotationX": rotationXParams.classList.remove("hidden"); break;
            case "rotationY": rotationYParams.classList.remove("hidden"); break;
            case "rotationZ": rotationZParams.classList.remove("hidden"); break;
            case "custom": customParams.classList.remove("hidden"); break;
        }
    });

    nextBtn.addEventListener("click", () => {
        const queue = JSON.parse(sessionStorage.getItem("transformQueue") || "[]");
        console.log("========== [画面遷移] trans-matrix.html -> confirm.html ==========");
        console.log("[trans-matrix.js] 引き継ぐ変換行列キュー (パース済 JS Array):", queue);
        window.location.href = "confirm.html";
    });

    backBtn.addEventListener("click", () => {
        if (history.length > 1) {
            history.back();
        } else {
            location.href = "./shape.html";
        }
    });

    function renderList() {
        listElem.innerHTML = "";
        transformQueue.forEach((t, index) => {
            const li = document.createElement("li");
            const textSpan = document.createElement("span");
            textSpan.classList.add("transform-text");

            const entry = formatTransformEntry3D(t, index);
            if (entry.isHtml) {
                textSpan.innerHTML = entry.text;
            } else {
                textSpan.textContent = entry.text;
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
});
