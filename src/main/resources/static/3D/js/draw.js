import { toTransformCommands3D } from "../../common/js/util.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("/3D/js/draw.js が読み込まれました (Plotly版)");

    const zText = document.getElementById("targetZText");
    const projTypeText = document.getElementById("projTypeText");

    document.getElementById("backBtn").addEventListener("click", () => {
        history.back();
    });

    document.getElementById("resetBtn").addEventListener("click", () => {
        sessionStorage.clear();
        window.location.href = "../../index.html";
    });

    fetchDrawData();

    async function fetchDrawData() {
        const shapeType = sessionStorage.getItem("shapeType");
        const queue = JSON.parse(sessionStorage.getItem("transformQueue") || "[]");
        const projZ = Number(sessionStorage.getItem("projectionZ") || 1);
        const projType = sessionStorage.getItem("projectionType") || "parallel";
        const perspD = Number(sessionStorage.getItem("perspectiveD") || 5);

        zText.textContent = projZ;
        projTypeText.textContent = projType === "perspective" ? "透視投影" : "平行投影";

        const req = { shapeType: shapeType };

        if (shapeType === "cuboid") {
            req.x = Number(sessionStorage.getItem("x"));
            req.y = Number(sessionStorage.getItem("y"));
            req.z = Number(sessionStorage.getItem("z"));
            req.width = Number(sessionStorage.getItem("width"));
            req.height = Number(sessionStorage.getItem("height"));
            req.depth = Number(sessionStorage.getItem("depth"));
        } else if (shapeType === "sphere") {
            req.x = Number(sessionStorage.getItem("cx"));
            req.y = Number(sessionStorage.getItem("cy"));
            req.z = Number(sessionStorage.getItem("cz"));
            req.rx = Number(sessionStorage.getItem("rx"));
            req.ry = Number(sessionStorage.getItem("ry"));
            req.rz = Number(sessionStorage.getItem("rz"));
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
            drawShapes(data, projType, projZ, perspD);

        } catch (err) {
            console.error("描画データの取得に失敗:", err);
            document.getElementById("plotBefore").textContent = "描画データの取得に失敗しました";
            document.getElementById("plotAfter").textContent = "描画データの取得に失敗しました";
        }
    }

    function drawShapes(data, projType, projZ, perspD) {
        const original = data.original;      // 3D points [{x,y,z}, ...]
        const transformed = data.transformed; // 3D points

        // --- 変換前: Plotly scatter3d でワイヤーフレーム表示 (左手系: Z軸反転) ---
        const shapeType = sessionStorage.getItem("shapeType");
        let traceWire;
        if (shapeType === "sphere") {
            traceWire = buildSphereTrace3D(original, "変換前", "#333333");
        } else {
            traceWire = buildCuboidTrace3D(original, "変換前", "#333333");
        }

        // 三次元座標軸を描画（原点を貫通する X赤, Y緑, Z青 の軸線）
        const axisTraces = buildAxisTraces3D(original);

        plot3DChart("plotBefore", [traceWire, ...axisTraces]);

        // --- 変換後: 投影タイプに応じて切替 (2D) ---
        let projectedPts;
        if (projType === "perspective") {
            // 世界座標系におけるカメラ(視点)の絶対座標を取得
            const camX = Number(sessionStorage.getItem("cameraX") || 0);
            const camY = Number(sessionStorage.getItem("cameraY") || 0);
            const camZ = Number(sessionStorage.getItem("cameraZ") || -4);

            // 視点 E(camX, camY, camZ) → 投影面 z = projZ へ投影する
            projectedPts = transformed.map(p => {
                // 視点から対象の頂点までのZ方向の距離
                const dz = p.z - camZ;

                // 視点から投影面までのZ方向の距離
                const d = projZ - camZ;

                // 対象が視点と同じZ座標にある（dz == 0）場合は特異点として扱う
                if (Math.abs(dz) < 1e-9) {
                    return { x: p.x * 1e6, y: p.y * 1e6 }; // 画面外へ飛ばす
                }

                // 相似比 scale = 投影面までの距離 / 対象頂点までの距離
                const scale = d / dz;

                return {
                    x: camX + (p.x - camX) * scale,
                    y: camY + (p.y - camY) * scale
                };
            });
        } else {
            // 平行投影（正投影）: Z を無視して X,Y をそのまま使う
            projectedPts = transformed.map(p => ({ x: p.x, y: p.y }));
        }

        let traceAfterWireframe;
        if (sessionStorage.getItem("shapeType") === "sphere") {
            traceAfterWireframe = buildSphereTrace2D(projectedPts, "変換後", "#d9534f", "solid");
        } else {
            traceAfterWireframe = buildCuboidTrace2D(projectedPts, "変換後", "#d9534f", "solid");
        }
        plot2DChart("plotAfter", [traceAfterWireframe]);
    }

    /**
     * 直方体の8頂点から、3D scatter3d トレースを生成する
     * 左手系: Z軸は反転して描画 (z_plot = -z)
     */
    function buildCuboidTrace3D(pts, name, color) {
        if (!pts || pts.length !== 8) {
            return { x: [], y: [], z: [], type: "scatter3d", mode: "lines", name };
        }

        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0],  // 前面
            [4, 5], [5, 6], [6, 7], [7, 4],  // 背面
            [0, 4], [1, 5], [2, 6], [3, 7]   // 前後を繋ぐ
        ];

        const xs = [], ys = [], zs = [];

        for (const [i, j] of edges) {
            // 左手系: z を反転して描画
            xs.push(pts[i].x, pts[j].x, null);
            ys.push(pts[i].y, pts[j].y, null);
            zs.push(-pts[i].z, -pts[j].z, null);
        }

        return {
            type: "scatter3d",
            mode: "lines",
            name: name,
            x: xs,
            y: ys,
            z: zs,
            line: { color: color, width: 4 }
        };
    }

    /**
     * 直方体の8頂点から、2D scatter トレースを生成する (null区切り)
     */
    function buildCuboidTrace2D(pts, name, color, dash) {
        if (!pts || pts.length !== 8) return { x: [], y: [], mode: "lines", name };

        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0],
            [4, 5], [5, 6], [6, 7], [7, 4],
            [0, 4], [1, 5], [2, 6], [3, 7]
        ];

        const xs = [], ys = [];
        for (const [i, j] of edges) {
            xs.push(pts[i].x, pts[j].x, null);
            ys.push(pts[i].y, pts[j].y, null);
        }

        return {
            x: xs, y: ys,
            mode: "lines", name: name,
            line: { color: color, width: 2, dash: dash }
        };
    }

    function buildAxisTraces3D(pts) {
        let maxAbs = 1;
        for (const p of pts) {
            maxAbs = Math.max(maxAbs, Math.abs(p.x), Math.abs(p.y), Math.abs(p.z));
        }
        const posLen = Math.ceil(maxAbs * 1.5);   // +方向の長さ
        const negLen = Math.ceil(maxAbs * 0.5);   // -方向（短め）

        // 軸の線分トレース（凡例に表示）
        const makeLine = (name, color, x, y, z) => ({
            type: "scatter3d", mode: "lines",
            name: name, showlegend: true, hoverinfo: "skip",
            x: x, y: y, z: z,
            line: { color: color, width: 3 }
        });

        // 矢印（cone）トレース: 正方向先端にラベル付き
        const makeArrow = (name, color, px, py, pz, ux, uy, uz) => ({
            type: "cone",
            showlegend: false, hoverinfo: "text", hovertext: name,
            x: [px], y: [py], z: [pz],
            u: [ux], v: [uy], w: [uz],
            sizemode: "absolute", sizeref: posLen * 0.08,
            anchor: "tail",
            colorscale: [[0, color], [1, color]],
            showscale: false
        });

        // 軸名ラベル
        const makeLabel = (name, color, px, py, pz) => ({
            type: "scatter3d", mode: "text",
            showlegend: false, hoverinfo: "skip",
            x: [px], y: [py], z: [pz],
            text: [name],
            textfont: { color: color, size: 14, family: "Arial Black" }
        });

        // 左手系なので Z の描画座標は反転 (-z)
        return [
            // X軸
            makeLine("x軸", "#d00000", [-negLen, posLen], [0, 0], [0, 0]),
            makeArrow("X", "#d00000", posLen, 0, 0, 1, 0, 0),
            makeLabel("X", "#d00000", posLen * 1.12, 0, 0),
            // Y軸
            makeLine("y軸", "#00a000", [0, 0], [-negLen, posLen], [0, 0]),
            makeArrow("Y", "#00a000", 0, posLen, 0, 0, 1, 0),
            makeLabel("Y", "#00a000", 0, posLen * 1.12, 0),
            // Z軸 (左手系: 表示上 -z が正方向)
            makeLine("z軸", "#0060d0", [0, 0], [0, 0], [negLen, -posLen]),
            makeArrow("Z", "#0060d0", 0, 0, -posLen, 0, 0, -1),
            makeLabel("Z", "#0060d0", 0, 0, -posLen * 1.12)
        ];
    }

    /**
     * Plotly 3D チャートを描画する
     */
    function plot3DChart(divId, traces) {
        const layout = {
            scene: {
                xaxis: { title: "x", gridcolor: "#e0e0e0", showspikes: false },
                yaxis: { title: "y", gridcolor: "#e0e0e0", showspikes: false },
                zaxis: { title: "z", gridcolor: "#e0e0e0", showspikes: false },
                camera: {
                    // X=手前, Y=上, Z=右 の見え方にする
                    eye: { x: 1.6, y: 0.4, z: -0.5 },
                    up: { x: 0, y: 1, z: 0 }
                },
                aspectmode: "data"
            },
            showlegend: true,
            legend: { x: 0, y: 1.05, orientation: "h" },
            margin: { l: 0, r: 0, t: 30, b: 0 },
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

    /**
     * Plotly 2D チャートを描画する
     */
    function plot2DChart(divId, traces) {
        const layout = {
            xaxis: {
                zeroline: true, zerolinewidth: 2, zerolinecolor: "#333",
                gridcolor: "#e0e0e0",
                scaleanchor: "y", scaleratio: 1
            },
            yaxis: {
                zeroline: true, zerolinewidth: 2, zerolinecolor: "#333",
                gridcolor: "#e0e0e0"
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

    /**
     * 球体の頂点群から、3D scatter3d トレースを生成する
     * 経線・緯線を結ぶワイヤーフレームを作成する
     */
    function buildSphereTrace3D(pts, name, color) {
        if (!pts || pts.length === 0) {
            return { x: [], y: [], z: [], type: "scatter3d", mode: "lines", name };
        }

        const xs = [], ys = [], zs = [];
        const latitudes = 12; // javaの実装と一致させる
        const longitudes = 24;

        // 緯線を描画（各緯度について経度方向に1周）
        for (let i = 0; i <= latitudes; i++) {
            for (let j = 0; j <= longitudes; j++) {
                const idx = i * (longitudes + 1) + j;
                const p = pts[idx];
                xs.push(p.x);
                ys.push(p.y);
                zs.push(-p.z); // 左手系
            }
            // 線の区切り
            xs.push(null); ys.push(null); zs.push(null);
        }

        // 経線を描画（各経度について緯度方向を結ぶ）
        for (let j = 0; j <= longitudes; j++) {
            for (let i = 0; i <= latitudes; i++) {
                const idx = i * (longitudes + 1) + j;
                const p = pts[idx];
                xs.push(p.x);
                ys.push(p.y);
                zs.push(-p.z);
            }
            // 線の区切り
            xs.push(null); ys.push(null); zs.push(null);
        }

        return {
            type: "scatter3d",
            mode: "lines",
            name: name,
            x: xs,
            y: ys,
            z: zs,
            line: { color: color, width: 2 }
        };
    }

    /**
     * 球体の頂点群から、2D scatter トレースを生成する
     */
    function buildSphereTrace2D(pts, name, color, dash) {
        if (!pts || pts.length === 0) return { x: [], y: [], mode: "lines", name };

        const xs = [], ys = [];
        const latitudes = 12;
        const longitudes = 24;

        // 緯線
        for (let i = 0; i <= latitudes; i++) {
            for (let j = 0; j <= longitudes; j++) {
                const idx = i * (longitudes + 1) + j;
                const p = pts[idx];
                xs.push(p.x);
                ys.push(p.y);
            }
            xs.push(null); ys.push(null);
        }

        // 経線
        for (let j = 0; j <= longitudes; j++) {
            for (let i = 0; i <= latitudes; i++) {
                const idx = i * (longitudes + 1) + j;
                const p = pts[idx];
                xs.push(p.x);
                ys.push(p.y);
            }
            xs.push(null); ys.push(null);
        }

        return {
            x: xs, y: ys,
            mode: "lines", name: name,
            line: { color: color, width: 1.5, dash: dash }
        };
    }
});
