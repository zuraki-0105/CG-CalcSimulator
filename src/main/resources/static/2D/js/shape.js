import { clearInputs, setInputs } from "../../common/js/util.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("/2d/js/shape.jsが読み込まれました");
    const shapeSelect = document.getElementById("shapeType");
    const rectParams = document.getElementById("rectParams");
    const ellipseParams = document.getElementById("ellipseParams");
    const nextBtn = document.getElementById("nextBtn");
    const backBtn = document.getElementById("backBtn");



    // 図形選択切り替え
    shapeSelect.addEventListener("change", () => {
        const shape = shapeSelect.value;
        rectParams.classList.add("hidden");
        ellipseParams.classList.add("hidden");

        if (shape === "rectangle") {
            rectParams.classList.remove("hidden");
        }

        if (shape === "ellipse") {
            ellipseParams.classList.remove("hidden");
        }

        // 図形が切り替わったらプレビューを更新
        updatePreview();
    });

    nextBtn.addEventListener("click", () => {
        const shape = shapeSelect.value;
        if (!shape) {
            alert("図形の種類を選択してください");
            return;
        }

        sessionStorage.setItem("shapeType", shape);

        if (shape === "rectangle") {
            const x = rectX.value;
            const y = rectY.value;
            const w = rectWidth.value;
            const h = rectHeight.value;

            if (!x || !y || !w || !h) {
                alert("すべての値を入力してください");
                return;
            }
            if (w <= 0 || h <= 0) {
                alert("幅, 高さ は 0 より大きい必要があります");
                return;
            }

            sessionStorage.setItem("x", Number(x));
            sessionStorage.setItem("y", Number(y));
            sessionStorage.setItem("width", parseFloat(w));
            sessionStorage.setItem("height", parseFloat(h));

            console.log("========== [画面遷移] shape.html -> trans-matrix.html ==========");
            console.log("[shape.js] 保存した矩形データ (JS Object):", { x, y, w, h });
            setInputs(rectParams, [0, 0, 1, 1]);
        }

        if (shape === "ellipse") {
            const ellipseX = document.getElementById("ellipseX");
            const ellipseY = document.getElementById("ellipseY");
            const ellipseA = document.getElementById("ellipseA");
            const ellipseB = document.getElementById("ellipseB");

            const x = ellipseX.value;
            const y = ellipseY.value;
            const a = ellipseA.value;
            const b = ellipseB.value;

            if (!x || !y || !a || !b) {
                alert("すべての値を入力してください");
                return;
            }
            if (a <= 0 || b <= 0) {
                alert("a, b は 0 より大きい必要があります");
                return;
            }

            sessionStorage.setItem("x", Number(x));
            sessionStorage.setItem("y", Number(y));
            sessionStorage.setItem("a", Number(a));
            sessionStorage.setItem("b", parseFloat(b));

            console.log("========== [画面遷移] shape.html -> trans-matrix.html ==========");
            console.log("[shape.js] 保存した楕円データ (JS Object):", { x, y, a, b });
            setInputs(ellipseParams, [0, 0, 1, 1]);
        }

        location.href = "./trans-matrix.html";
    });

    backBtn.addEventListener("click", () => {
        if (history.length > 1) {
            history.back();
        } else {
            location.href = "/index.html";
        }
    });

    // プレビューの初期描画
    updatePreview();

    // 入力値が変わるたびにプレビューを更新するイベントリスナーを設定
    const inputs = document.querySelectorAll('#rectParams input, #ellipseParams input');
    inputs.forEach(input => {
        input.addEventListener('input', updatePreview);
    });

    /**
     * 現在の入力値から頂点座標を計算し、Plotlyでプレビューを描画する
     */
    function updatePreview() {
        const shape = shapeSelect.value;
        let xData = [];
        let yData = [];

        if (shape === "rectangle") {
            const x = Number(document.getElementById("rectX").value) || 0;
            const y = Number(document.getElementById("rectY").value) || 0;
            const w = Number(document.getElementById("rectWidth").value) || 0;
            const h = Number(document.getElementById("rectHeight").value) || 0;

            // 四角形の4頂点（＋閉じるための開始点）
            xData = [x, x + w, x + w, x, x];
            yData = [y, y, y + h, y + h, y];

        } else if (shape === "ellipse") {
            const cx = Number(document.getElementById("ellipseX").value) || 0;
            const cy = Number(document.getElementById("ellipseY").value) || 0;
            const a = Number(document.getElementById("ellipseA").value) || 0;
            const b = Number(document.getElementById("ellipseB").value) || 0;

            // 楕円の円周上の点（分割数36）
            const segments = 36;
            for (let i = 0; i <= segments; i++) {
                const theta = (2 * Math.PI * i) / segments;
                xData.push(cx + a * Math.cos(theta));
                yData.push(cy + b * Math.sin(theta));
            }
        }

        const trace = {
            x: xData,
            y: yData,
            mode: "lines",
            name: "プレビュー",
            line: {
                color: "#2c7aefff", // プレビュー用の色（青系）
                width: 2
            }
        };

        // --- 描画スケール（表示範囲）を全体像の1.8倍に広げる処理 ---
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (let i = 0; i < xData.length; i++) {
            const x = xData[i];
            const y = yData[i];
            if (x === null || y === null || isNaN(x) || isNaN(y)) continue;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }
        if (minX === Infinity) { minX = -1; maxX = 1; minY = -1; maxY = 1; }

        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;
        const spanX = (maxX - minX) === 0 ? 2 : (maxX - minX);
        const spanY = (maxY - minY) === 0 ? 2 : (maxY - minY);

        const rx = spanX * 1.8; // 1.8倍
        const ry = spanY * 1.8;

        const previewArea = document.getElementById("previewArea");
        let xRange = [cx - rx, cx + rx];
        let yRange = [cy - ry, cy + ry];

        // すでに描画済みで図形タイプが同じ場合は、現在の視点・スケール（レンジ）を引き継ぐ
        if (previewArea && previewArea.layout && previewArea.layout.uirevision === shape) {
            if (previewArea.layout.xaxis && previewArea.layout.xaxis.range) {
                xRange = previewArea.layout.xaxis.range;
            }
            if (previewArea.layout.yaxis && previewArea.layout.yaxis.range) {
                yRange = previewArea.layout.yaxis.range;
            }
        }

        const layout = {
            xaxis: {
                range: xRange,
                zeroline: true, zerolinewidth: 2, zerolinecolor: "#333",
                gridcolor: "#e0e0e0",
                scaleanchor: "y", scaleratio: 1, // 縦横比固定
                exponentformat: "none", hoverformat: ".3~f"
            },
            yaxis: {
                range: yRange,
                zeroline: true, zerolinewidth: 2, zerolinecolor: "#333",
                gridcolor: "#e0e0e0",
                exponentformat: "none", hoverformat: ".3~f"
            },
            annotations: [
                {   // X軸ラベル（y=0の直線上、右端）
                    xref: "x domain", yref: "y",
                    x: 1, y: 0,
                    text: "<b>x</b>", font: { size: 16, color: "#000" },
                    showarrow: false,
                    xanchor: "left", yanchor: "middle",
                    xshift: 10 // 少し外側にずらす
                },
                {   // Y軸ラベル（x=0の直線上、上端）
                    xref: "x", yref: "y domain",
                    x: 0, y: 1,
                    text: "<b>y</b>", font: { size: 16, color: "#000" },
                    showarrow: false,
                    xanchor: "center", yanchor: "bottom",
                    yshift: 10 // 少し外側にずらす
                }
            ],
            dragmode: "pan",
            hovermode: "closest",
            showlegend: false,
            margin: { l: 60, r: 30, t: 30, b: 60 },
            plot_bgcolor: "#fafafa",
            paper_bgcolor: "#ffffff",
            uirevision: shape
        };

        const config = {
            scrollZoom: true,
            displayModeBar: false, // プレビューなのでツールバーは非表示
            responsive: true
        };

        // Plotly.react は既存のグラフを高速に更新する（無ければ新規作成）
        Plotly.react("previewArea", [trace], layout, config);
    }
});