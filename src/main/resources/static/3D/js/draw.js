import { toTransformCommands3D } from "../../common/js/util.js?v=@build.timestamp@";

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

    // ▼ 初期ロード時: API待機中に一瞬表示されるのを防ぐため、即座に設定を読み取って不要なコンテナを非表示にする
    const initShowBefore = sessionStorage.getItem("showDrawBefore") !== "false";
    const initShowAfter3D = sessionStorage.getItem("showDrawAfter3D") !== "false";
    const initShowAfter2D = sessionStorage.getItem("showDrawAfter2D") !== "false";
    document.getElementById("wrapperBefore").style.display = initShowBefore ? "flex" : "none";
    document.getElementById("wrapperAfter3D").style.display = initShowAfter3D ? "flex" : "none";
    document.getElementById("wrapperAfter2D").style.display = initShowAfter2D ? "flex" : "none";

    // 非表示処理後にデータ取得を開始
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
            const requestData = req;
            console.log("========== [Fetch API 送信 (POST)] ==========");
            console.log("[draw.js] サーバーへ送信する JSON (文字列化前 JS Object):", requestData);
            console.log("[draw.js] 実際の送信データ (JSON文字列):", JSON.stringify(requestData));

            const res = await fetch("/api/3d/draw", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData)
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();

            console.log("========== [Fetch API 受信 (レスポンス)] ==========");
            console.log("[draw.js] サーバー・Javaから受け取った JSON (パース済 JS Object):", data);

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

        // 設定の取得 (デフォルトは表示)
        const showDrawBefore = sessionStorage.getItem("showDrawBefore") !== "false";
        const showDrawAfter3D = sessionStorage.getItem("showDrawAfter3D") !== "false";
        const showDrawAfter2D = sessionStorage.getItem("showDrawAfter2D") !== "false";

        // コンテナの表示制御
        document.getElementById("wrapperBefore").style.display = showDrawBefore ? "flex" : "none";
        document.getElementById("wrapperAfter3D").style.display = showDrawAfter3D ? "flex" : "none";
        document.getElementById("wrapperAfter2D").style.display = showDrawAfter2D ? "flex" : "none";

        const shapeType = sessionStorage.getItem("shapeType");

        // --- 変換前: Plotly scatter3d でワイヤーフレーム表示 (左手系: Z軸反転) ---
        if (showDrawBefore) {
            let traceWire;
            if (shapeType === "sphere") {
                traceWire = buildSphereTrace3D(original, "変換前", "#333333");
            } else {
                traceWire = buildCuboidTrace3D(original, "変換前", "#333333");
            }
            const axisTraces = buildAxisTraces3D(original);
            plot3DChart("plotBefore", [traceWire, ...axisTraces]);
        }

        // --- 変換後(3D): Plotly scatter3d (左手系: Z軸反転) ---
        if (showDrawAfter3D) {
            let traceWireAfter3D;
            if (shapeType === "sphere") {
                traceWireAfter3D = buildSphereTrace3D(transformed, "変換後(3D)", "#333333"); // 少し色を変える
            } else {
                traceWireAfter3D = buildCuboidTrace3D(transformed, "変換後(3D)", "#333333");
            }
            const axisTracesAfter3D = buildAxisTraces3D(transformed);
            plot3DChart("plotAfter3D", [traceWireAfter3D, ...axisTracesAfter3D]);
        }

        // --- 変換後: 投影タイプに応じて切替 (2D) ---
        if (showDrawAfter2D) {
            let projectedPts;
            if (projType === "perspective") {
                // 世界座標系におけるカメラ(視点)の絶対座標を取得
                const camX = Number(sessionStorage.getItem("cameraX") || 0);
                const camY = Number(sessionStorage.getItem("cameraY") || 0);
                const camZ = Number(sessionStorage.getItem("cameraZ") || 0);

                // 視点 E(camX, camY, camZ) → 投影面 z = projZ へ投影する
                projectedPts = transformed.map(p => {
                    // 視点から対象の頂点までのZ方向の距離
                    const dz = p.z - camZ;
                    // 視点から投影面までのZ方向の距離
                    const d = projZ - camZ;

                    // 1. 対象が視点と全く同じZ座標にある（dz == 0）場合は投影不能
                    // 2. dz と d の符号が異なる場合（対象がカメラの背後にあり、投影面とは逆方向）も描画対象外とする
                    // （※ d/dz < 0 だと図形が上下左右反転して巨大化するため）
                    if (Math.abs(dz) < 1e-9 || (dz * d < 0)) {
                        return { x: null, y: null }; // Plotly上で線を描画させない（スキップ）
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
                traceAfterWireframe = buildSphereTrace2D(projectedPts, "変換後(2D)", "#d9534f", "solid");
            } else {
                traceAfterWireframe = buildCuboidTrace2D(projectedPts, "変換後(2D)", "#d9534f", "solid");
            }
            plot2DChart("plotAfter", [traceAfterWireframe]);
        }
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
        let maxX = 1, maxY = 1, maxZ = 1;
        if (pts && pts.length > 0) {
            maxX = Math.max(...pts.map(p => Math.abs(p.x)));
            maxY = Math.max(...pts.map(p => Math.abs(p.y)));
            maxZ = Math.max(...pts.map(p => Math.abs(p.z)));
        }
        if (maxX === 0) maxX = 1;
        if (maxY === 0) maxY = 1;
        if (maxZ === 0) maxZ = 1;

        const posX = Math.ceil(maxX * 1.3) || 2;
        const negX = Math.ceil(maxX * 0.5) || 1;
        const posY = Math.ceil(maxY * 1.3) || 2;
        const negY = Math.ceil(maxY * 0.5) || 1;
        const posZ = Math.ceil(maxZ * 1.3) || 2;
        const negZ = Math.ceil(maxZ * 0.5) || 1;

        // 軸の線分トレース（凡例に表示）
        const makeLine = (name, color, x, y, z) => ({
            type: "scatter3d", mode: "lines",
            name: name, showlegend: true, hoverinfo: "skip",
            x: x, y: y, z: z,
            line: { color: color, width: 3 }
        });

        // 矢印（cone）トレース: 正方向先端にラベル付き
        const makeArrow = (name, color, px, py, pz, ux, uy, uz, refLen) => ({
            type: "cone",
            showlegend: false, hoverinfo: "text", hovertext: name,
            x: [px], y: [py], z: [pz],
            u: [ux], v: [uy], w: [uz],
            sizemode: "absolute", sizeref: refLen * 0.08,
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
            makeLine("x軸", "#d00000", [-negX, posX], [0, 0], [0, 0]),
            makeArrow("X", "#d00000", posX, 0, 0, 1, 0, 0, posX),
            makeLabel("X", "#d00000", posX * 1.12, 0, 0),
            // Y軸
            makeLine("y軸", "#00a000", [0, 0], [-negY, posY], [0, 0]),
            makeArrow("Y", "#00a000", 0, posY, 0, 0, 1, 0, posY),
            makeLabel("Y", "#00a000", 0, posY * 1.12, 0),
            // Z軸 (左手系: 表示上 -z が正方向)
            makeLine("z軸", "#0060d0", [0, 0], [0, 0], [negZ, -posZ]),
            makeArrow("Z", "#0060d0", 0, 0, -posZ, 0, 0, -1, posZ),
            makeLabel("Z", "#0060d0", 0, 0, -posZ * 1.12)
        ];
    }

    /**
     * Plotly 3D チャートを描画する
     */
    function plot3DChart(divId, traces) {
        const layout = {
            scene: {
                xaxis: { title: "x", gridcolor: "#e0e0e0", showspikes: false, exponentformat: "none", hoverformat: ".3~f" },
                yaxis: { title: "y", gridcolor: "#e0e0e0", showspikes: false, exponentformat: "none", hoverformat: ".3~f" },
                zaxis: { title: "z", gridcolor: "#e0e0e0", showspikes: false, exponentformat: "none", hoverformat: ".3~f" },
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
            paper_bgcolor: "#ffffff",
            autosize: true          // 要素のCSS幅に自動追従
        };

        const config = {
            scrollZoom: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ["lasso2d", "select2d"],
            displaylogo: false,
            responsive: true        // 外枠サイズ変更時にグラフを自動リサイズ
        };

        // 描画後: コンテナの実サイズで強制リサイズ（Chromeスケーリング・初期タイミングズレを吸収）
        Plotly.newPlot(divId, traces, layout, config).then(() => {
            const el = document.getElementById(divId);
            const wrapper = el.parentElement;

            // ▼ ResizeObserver を使って、親要素のサイズが確定・変動した瞬間にリサイズさせる
            const observer = new ResizeObserver(() => {
                // アニメーションフレーム内で実行し、Chromeの描画負荷とズレを防ぐ
                requestAnimationFrame(() => {
                    Plotly.Plots.resize(el);
                });
            });

            // 親要素（.canvas-wrapper）のサイズ変動を監視スタート
            observer.observe(wrapper);
        });
    }

    /**
     * Plotly 2D チャートを描画する
     */
    function plot2DChart(divId, traces) {
        // --- 描画スケール（表示範囲）を全体像の1.8倍に広げる処理 ---
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const trace of traces) {
            if (!trace.x || !trace.y) continue;
            for (let i = 0; i < trace.x.length; i++) {
                const x = trace.x[i];
                const y = trace.y[i];
                if (x === null || y === null || isNaN(x) || isNaN(y)) continue;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
        if (minX === Infinity) { minX = -1; maxX = 1; minY = -1; maxY = 1; }

        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;
        const spanX = (maxX - minX) === 0 ? 2 : (maxX - minX);
        const spanY = (maxY - minY) === 0 ? 2 : (maxY - minY);

        const rx = spanX * 0.9;
        const ry = spanY * 0.9;

        const layout2D = {
            xaxis: {
                range: [cx - rx, cx + rx],
                zeroline: true, zerolinewidth: 2, zerolinecolor: "#333",
                gridcolor: "#e0e0e0",
                scaleanchor: "y", scaleratio: 1,
                exponentformat: "none", hoverformat: ".3~f"
            },
            yaxis: {
                range: [cy - ry, cy + ry],
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
            showlegend: true,
            legend: { x: 0, y: 1.12, orientation: "h" },
            margin: { l: 60, r: 30, t: 30, b: 60 },
            plot_bgcolor: "#fafafa",
            paper_bgcolor: "#ffffff",
            autosize: true          // 要素のCSS幅に自動追従
        };

        const config2D = {
            scrollZoom: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ["lasso2d", "select2d"],
            displaylogo: false,
            responsive: true        // 外枠サイズ変更時にグラフを自動リサイズ
        };

        // 描画後: コンテナの実サイズで強制リサイズ（Chromeスケーリング・初期タイミングズレを吸収）
        Plotly.newPlot(divId, traces, layout2D, config2D).then(() => {
            const el = document.getElementById(divId);
            const wrapper = el.parentElement;

            // ▼ ResizeObserver を使って、親要素のサイズが確定・変動した瞬間にリサイズさせる
            const observer = new ResizeObserver(() => {
                // アニメーションフレーム内で実行し、Chromeの描画負荷とズレを防ぐ
                requestAnimationFrame(() => {
                    Plotly.Plots.resize(el);
                });
            });

            // 親要素（.canvas-wrapper）のサイズ変動を監視スタート
            observer.observe(wrapper);
        });
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
