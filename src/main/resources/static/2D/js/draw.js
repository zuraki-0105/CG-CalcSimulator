import { toTransformCommands } from "../../common/js/util.js?v=@build.timestamp@";

document.addEventListener("DOMContentLoaded", () => {
    console.log("/2d/js/draw.js が読み込まれました (Plotly版)");

    document.getElementById("backBtn").addEventListener("click", () => {
        history.back();
    });

    document.getElementById("resetBtn").addEventListener("click", () => {
        sessionStorage.clear();
        window.location.href = "../../index.html";
    });

    // メイン処理
    fetchDrawData();

    /**
     * sessionStorage からデータを組み立てて、サーバーに送信→描画
     */
    async function fetchDrawData() {
        const shapeType = sessionStorage.getItem("shapeType");
        const queue = JSON.parse(sessionStorage.getItem("transformQueue") || "[]");

        // リクエストデータの構築
        const req = { shapeType: shapeType };

        if (shapeType === "rectangle") {
            req.x = Number(sessionStorage.getItem("x"));
            req.y = Number(sessionStorage.getItem("y"));
            req.width = Number(sessionStorage.getItem("width"));
            req.height = Number(sessionStorage.getItem("height"));
        } else if (shapeType === "ellipse") {
            req.x = Number(sessionStorage.getItem("x"));
            req.y = Number(sessionStorage.getItem("y"));
            req.a = Number(sessionStorage.getItem("a"));
            req.b = Number(sessionStorage.getItem("b"));
        }

        // 変換リスト（共通関数で変換）
        req.transforms = toTransformCommands(queue);

        try {
            console.log("========== [Fetch API 送信 (POST)] ==========");
            console.log("[draw.js] サーバーへ送信する JSON (文字列化前 JS Object):", req);
            console.log("[draw.js] 実際の送信データ (JSON文字列):", JSON.stringify(req));

            const res = await fetch("/api/2d/draw", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(req)
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();

            console.log("========== [Fetch API 受信 (レスポンス)] ==========");
            console.log("[draw.js] サーバー・Javaから受け取った JSON (パース済 JS Object):", data);

            drawShapes(data);

        } catch (err) {
            console.error("描画データの取得に失敗:", err);
            document.getElementById("plotArea").textContent = "描画データの取得に失敗しました";
        }
    }

    /**
     * Plotly で変換前・変換後の図形を描画する
     */
    function drawShapes(data) {
        const original = data.original;
        const transformed = data.transformed;

        // 多角形を閉じるために先頭の点を末尾に追加
        const origClosed = [...original, original[0]];
        const transClosed = [...transformed, transformed[0]];

        // 変換前トレース（グレー破線）
        const traceBefore = {
            x: origClosed.map(p => p.x),
            y: origClosed.map(p => p.y),
            mode: "lines",
            name: "変換前",
            line: {
                color: "#999999",
                width: 2,
                dash: "dash"
            }
        };

        // 変換後トレース（赤実線）
        const traceAfter = {
            x: transClosed.map(p => p.x),
            y: transClosed.map(p => p.y),
            mode: "lines",
            name: "変換後",
            line: {
                color: "#d9534f",
                width: 2
            }
        };

        // --- 描画スケール（表示範囲）を全体像のx倍に広げる処理 ---
        const allPts = [...origClosed, ...transClosed];
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const p of allPts) {
            if (p.x === null || p.y === null || isNaN(p.x) || isNaN(p.y)) continue;
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
        }
        if (minX === Infinity) { minX = -1; maxX = 1; minY = -1; maxY = 1; }

        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;
        const spanX = (maxX - minX) === 0 ? 2 : (maxX - minX);
        const spanY = (maxY - minY) === 0 ? 2 : (maxY - minY);

        const rx = spanX * 1;//ここで調整
        const ry = spanY * 1;

        const layout = {
            xaxis: {
                range: [cx - rx, cx + rx],
                zeroline: true,
                zerolinewidth: 2,
                zerolinecolor: "#333",
                gridcolor: "#e0e0e0",
                scaleanchor: "y",    // x,y 比率を固定
                scaleratio: 1,
                exponentformat: "none",
                hoverformat: ".3~f"
            },
            yaxis: {
                zeroline: true,
                zerolinewidth: 2,
                zerolinecolor: "#333",
                gridcolor: "#e0e0e0",
                exponentformat: "none",
                hoverformat: ".3~f"
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
            dragmode: "pan",        // デフォルトをパンに
            hovermode: "closest",
            showlegend: true,
            legend: { x: 0, y: 1.12, orientation: "h" },
            margin: { l: 60, r: 30, t: 30, b: 60 },
            plot_bgcolor: "#fafafa",
            paper_bgcolor: "#ffffff",
            autosize: true          // 要素のCSS幅に自動追従
        };

        const config = {
            scrollZoom: true,       // マウスホイールでズーム
            displayModeBar: true,
            modeBarButtonsToRemove: ["lasso2d", "select2d"],
            displaylogo: false,
            responsive: true        // 外枠サイズ変更時にグラフを自動リサイズ
        };

        // 描画後: ResizeObserverを使って親要素のサイズ変動監視を開始
        Plotly.newPlot("plotArea", [traceBefore, traceAfter], layout, config).then(() => {
            const el = document.getElementById("plotArea");
            const wrapper = el.parentElement;

            const observer = new ResizeObserver(() => {
                requestAnimationFrame(() => {
                    Plotly.Plots.resize(el);
                });
            });

            observer.observe(wrapper);
        });
    }
});
