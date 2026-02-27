import { clearInputs, setInputs, formatTransformEntry } from "../../common/js/util.js";

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
                if (Number.isNaN(tx) || Number.isNaN(ty)) {
                    alert("Tx, Ty を入力してください");
                    return;
                }
                if (tx === 0 && ty === 0) {
                    alert("Tx, Ty を 0 に設定しても変化しません");
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
                    alert("Sx, Sy を入力してください");
                    return;
                }
                if (sx <= 0 || sy <= 0) {
                    alert("Sx, Sy は 0 より大きい必要があります");
                    return;
                }
                if (sx === 1 && sy === 1) {
                    alert("Sx, Sy を 1 に設定しても変化しません");
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
                    alert("角度(Theta)を入力してください");
                    return;
                }
                if (theta === 0) {
                    alert("角度(Theta)を 0 に設定しても変化しません");
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
                            alert("すべての行列の値を入力してください");
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
        const queue = JSON.parse(sessionStorage.getItem("transformQueue") || "[]");
        console.log("========== [画面遷移] trans-matrix.html -> confirm.html ==========");
        console.log("[trans-matrix.js] 引き継ぐ変換行列キュー (パース済 JS Array):", queue);
        location.href = "./confirm.html";
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

            const entry = formatTransformEntry(t, index);
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
