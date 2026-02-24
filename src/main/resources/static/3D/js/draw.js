import { toTransformCommands3D } from "/common/js/util.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("/3D/js/draw.js が読み込まれました (Plotly版)");

    const zText = document.getElementById("targetZText");

    document.getElementById("backBtn").addEventListener("click", () => {
        history.back();
    });

    document.getElementById("resetBtn").addEventListener("click", () => {
        sessionStorage.clear();
        window.location.href = "/";
    });

    fetchDrawData();

    async function fetchDrawData() {
        const shapeType = sessionStorage.getItem("shapeType");
        const queue = JSON.parse(sessionStorage.getItem("transformQueue") || "[]");
        const projZ = Number(sessionStorage.getItem("projectionZ") || 0);

        zText.textContent = projZ;

        const req = { shapeType: shapeType };

        if (shapeType === "cuboid") {
            req.x = Number(sessionStorage.getItem("x"));
            req.y = Number(sessionStorage.getItem("y"));
            req.z = Number(sessionStorage.getItem("z"));
            req.width = Number(sessionStorage.getItem("width"));
            req.height = Number(sessionStorage.getItem("height"));
            req.depth = Number(sessionStorage.getItem("depth"));
        }

        req.transforms = toTransformCommands3D(queue);
        req.projectionZ = projZ;

        try {
            const res = await fetch("/api/3d/draw", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(req)
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            drawShapes(data);

        } catch (err) {
            console.error("描画データの取得に失敗:", err);
            document.getElementById("plotBefore").textContent = "描画データの取得に失敗しました";
            document.getElementById("plotAfter").textContent = "描画データの取得に失敗しました";
        }
    }

    function drawShapes(data) {
        const original = data.original;      // 3D points [{x,y,z}, ...]
        const transformed = data.transformed; // 3D points

        // --- 変換前: 斜投影で立体感を表現 ---
        const projOblique = p => ({ x: p.x - p.z * 0.4, y: p.y - p.z * 0.4 });
        const obliquePts = original.map(projOblique);
        const traceBeforeWireframe = buildCuboidTrace(obliquePts, "変換前", "#999999", "dash");
        plotChart("plotBefore", [traceBeforeWireframe]);

        // --- 変換後: XY平面への正投影 ---
        const projOrtho = p => ({ x: p.x, y: p.y });
        const orthoPts = transformed.map(projOrtho);
        const traceAfterWireframe = buildCuboidTrace(orthoPts, "変換後", "#d9534f", "solid");
        plotChart("plotAfter", [traceAfterWireframe]);
    }

    /**
     * 直方体の8頂点から、12辺をnull区切りで1トレースにまとめる
     */
    function buildCuboidTrace(pts, name, color, dash) {
        if (!pts || pts.length !== 8) return { x: [], y: [], mode: "lines", name };

        // 直方体の辺 (インデックスペア)
        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0],  // 前面
            [4, 5], [5, 6], [6, 7], [7, 4],  // 背面
            [0, 4], [1, 5], [2, 6], [3, 7]   // 前後を繋ぐ
        ];

        const xs = [];
        const ys = [];

        for (const [i, j] of edges) {
            xs.push(pts[i].x, pts[j].x, null); // null で線を区切る
            ys.push(pts[i].y, pts[j].y, null);
        }

        return {
            x: xs,
            y: ys,
            mode: "lines",
            name: name,
            line: { color: color, width: 2, dash: dash }
        };
    }

    /**
     * Plotly でチャートを描画する共通関数
     */
    function plotChart(divId, traces) {
        const layout = {
            xaxis: {
                title: "x",
                zeroline: true,
                zerolinewidth: 2,
                zerolinecolor: "#333",
                gridcolor: "#e0e0e0",
                scaleanchor: "y",
                scaleratio: 1
            },
            yaxis: {
                title: "y",
                zeroline: true,
                zerolinewidth: 2,
                zerolinecolor: "#333",
                gridcolor: "#e0e0e0"
            },
            dragmode: "pan",
            hovermode: "closest",
            showlegend: true,
            legend: { x: 0, y: 1.12, orientation: "h" },
            margin: { l: 60, r: 30, t: 30, b: 60 },
            plot_bgcolor: "#fafafa",
            paper_bgcolor: "#ffffff"
        };

        const config = {
            scrollZoom: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ["lasso2d", "select2d"],
            displaylogo: false
        };

        Plotly.newPlot(divId, traces, layout, config);
    }
});
