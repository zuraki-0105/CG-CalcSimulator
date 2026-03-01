import { clearInputs, setInputs, formatTransformEntry } from "../../common/js/util.js?v=@build.timestamp@";

document.addEventListener("DOMContentLoaded", () => {
    console.log("/2d/js/trans-matrix.js が読み込まれました");

    const transformSelect = document.getElementById("transformType");

    const translationParams = document.getElementById("translationMatrix");
    const scaleParams = document.getElementById("scaleMatrix");
    const rotationParams = document.getElementById("rotationMatrix");
    const customParams = document.getElementById("customMatrix");
    const reflectionParams = document.getElementById("reflectionMatrix");

    const addBtn = document.getElementById("addBtn");
    const listElem = document.getElementById("transformList");
    const nextBtn = document.getElementById("nextBtn");
    const backBtn = document.getElementById("backBtn");

    const previewReflectionBtn = document.getElementById("previewReflectionBtn");
    const previewModal = document.getElementById("previewModal");
    const closePreviewBtn = document.getElementById("closePreviewBtn");
    const previewArea = document.getElementById("previewArea");
    const reflectionStepsText = document.getElementById("reflectionStepsText");

    let transformQueue = [];
    sessionStorage.setItem("transformQueue", JSON.stringify(transformQueue));

    addBtn.addEventListener("click", async () => {
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

            case "reflection": {
                const a = document.getElementById("refA").valueAsNumber;
                const b = document.getElementById("refB").valueAsNumber;
                const c = document.getElementById("refC").valueAsNumber;

                if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(c)) {
                    alert("a, b, c をすべて入力してください");
                    return;
                }
                if (a === 0 && b === 0) {
                    alert("a と b が共に 0 の直線は定義できません");
                    return;
                }

                try {
                    const res = await fetch("/api/2d/reflection-matrix", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ a, b, c })
                    });
                    if (!res.ok) throw new Error("APIエラー");
                    const data = await res.json();

                    entry = { type: "reflection", a, b, c, matrix: data.matrix };
                    clearInputs(reflectionParams);
                    setInputs(reflectionParams, [1, -1, 0]);
                } catch (err) {
                    console.error("鏡映変換APIエラー:", err);
                    alert("鏡映変換の計算に失敗しました");
                    return;
                }
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
        reflectionParams.classList.add("hidden");

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
            case "reflection":
                reflectionParams.classList.remove("hidden");
                break;
        }
    });

    nextBtn.addEventListener("click", () => {
        const queue = JSON.parse(sessionStorage.getItem("transformQueue") || "[]");
        console.log("========== [画面遷移] trans-matrix.html -> confirm.html ==========");
        console.log("[trans-matrix.js] 引き継ぐ変換行列キュー (パース済 JS Array):", queue);
        location.href = "./confirm.html?v=@build.timestamp@";
    });

    backBtn.addEventListener("click", () => {
        if (history.length > 1) {
            history.back();
        } else {
            location.href = "./shape.html?v=@build.timestamp@";
        }
    });

    // --- プレビュー表示制御 ---
    previewReflectionBtn.addEventListener("click", async () => {
        const a = document.getElementById("refA").valueAsNumber;
        const b = document.getElementById("refB").valueAsNumber;
        const c = document.getElementById("refC").valueAsNumber;
        if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(c) || (a === 0 && b === 0)) {
            alert("有効な a, b, c を入力してください");
            return;
        }

        // 1. 直線の計算とテキスト取得
        let reflectionData = null;
        try {
            const res = await fetch("/api/2d/reflection-matrix", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ a, b, c })
            });
            if (!res.ok) throw new Error("APIエラー");
            reflectionData = await res.json();
        } catch (e) {
            alert("APIサーバーと通信できませんでした");
            console.error(e);
            return;
        }

        reflectionStepsText.textContent = reflectionData.text;

        // 2. 図形データ取得
        // shape.js では "shapeType", "x", "y", "width", "height", "a", "b" として別々に保存されている
        const type = sessionStorage.getItem("shapeType");
        if (!type) {
            alert("図形データが見つかりません。戻って図形を選択してください。");
            return;
        }

        const shapeData = {
            type: type,
            params: {
                x: Number(sessionStorage.getItem("x")) || 0,
                y: Number(sessionStorage.getItem("y")) || 0,
                width: Number(sessionStorage.getItem("width")) || 0,
                height: Number(sessionStorage.getItem("height")) || 0,
                a: Number(sessionStorage.getItem("a")) || 0,
                b: Number(sessionStorage.getItem("b")) || 0
            }
        };

        try {
            const res = await fetch("/api/2d/draw", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    shapeType: shapeData.type,
                    x: shapeData.params.x,
                    y: shapeData.params.y,
                    width: shapeData.params.width || 0,
                    height: shapeData.params.height || 0,
                    a: shapeData.params.a || 0,
                    b: shapeData.params.b || 0,
                    transforms: []
                })
            });
            if (!res.ok) throw new Error("描画座標取得失敗");
            const drawData = await res.json();

            // モーダルを先に表示してコンテナ幅を確定させてからPlotly描画
            previewModal.classList.remove("hidden");
            drawPreview(drawData.original, a, b, c);
        } catch (e) {
            console.error("プレビュー描画エラー:", e);
            alert("プレビューの表示に失敗しました");
        }
    });

    closePreviewBtn.addEventListener("click", () => {
        previewModal.classList.add("hidden");
    });

    function drawPreview(shapePoints, a, b, c) {
        const xVals = shapePoints.map(p => p.x);
        const yVals = shapePoints.map(p => p.y);

        // 矩形や円のループを閉じる
        xVals.push(xVals[0]);
        yVals.push(yVals[0]);

        const shapeTrace = {
            x: xVals,
            y: yVals,
            mode: "lines",
            line: { color: "#3b82f6", width: 2 },
            name: "選択図形"
        };

        let minX = Math.min(...xVals) - 5;
        let maxX = Math.max(...xVals) + 5;
        let minY = Math.min(...yVals) - 5;
        let maxY = Math.max(...yVals) + 5;

        // 原点が映るように見栄えを調整
        minX = Math.min(minX, -2);
        maxX = Math.max(maxX, 2);
        minY = Math.min(minY, -2);
        maxY = Math.max(maxY, 2);

        let lineX = [];
        let lineY = [];
        if (Math.abs(b) < 1e-9) {
            // x = -c/a
            const lx = -c / a;
            lineX = [lx, lx];
            lineY = [minY - 10, maxY + 10];
        } else {
            // y = (-a/b)x - c/b
            lineX = [minX - 10, maxX + 10];
            lineY = lineX.map(x => (-a * x - c) / b);
        }

        const lineTrace = {
            x: lineX,
            y: lineY,
            mode: "lines",
            line: { color: "#ef4444", width: 2, dash: "dash" },
            name: "鏡映の軸"
        };

        const layout = {
            margin: { t: 20, r: 20, b: 20, l: 40 },
            xaxis: {
                title: "X",
                zeroline: true,
                zerolinecolor: "#999",
                zerolinewidth: 1,
                gridcolor: "#e2e8f0",
                range: [minX, maxX]
            },
            yaxis: {
                title: "Y",
                scaleanchor: "x",
                scaleratio: 1,
                zeroline: true,
                zerolinecolor: "#999",
                zerolinewidth: 1,
                gridcolor: "#e2e8f0",
                range: [minY, maxY]
            },
            dragmode: "pan",
            showlegend: true,
            legend: { x: 0, y: 1.15, orientation: "h" },
            autosize: true
        };

        const config = {
            scrollZoom: true,
            responsive: true
        };

        Plotly.newPlot(previewArea, [shapeTrace, lineTrace], layout, config);
    }

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
