import { clearInputs, setInputs } from "../../common/js/util.js?v=@build.timestamp@";

document.addEventListener("DOMContentLoaded", () => {
    console.log("/3D/js/shape.js が読み込まれました");

    const shapeSelect = document.getElementById("shapeType");
    const cuboidParams = document.getElementById("cuboidParams");
    const sphereParams = document.getElementById("sphereParams");
    const nextBtn = document.getElementById("nextBtn");
    const backBtn = document.getElementById("backBtn");

    // 図形選択切り替え
    shapeSelect.addEventListener("change", () => {
        const shape = shapeSelect.value;
        cuboidParams.classList.add("hidden");
        sphereParams.classList.add("hidden");

        if (shape === "cuboid") {
            cuboidParams.classList.remove("hidden");
        } else if (shape === "sphere") {
            sphereParams.classList.remove("hidden");
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

        if (shape === "cuboid") {
            const x = document.getElementById("cuboidX").value;
            const y = document.getElementById("cuboidY").value;
            const z = document.getElementById("cuboidZ").value;
            const w = document.getElementById("cuboidWidth").value;
            const h = document.getElementById("cuboidHeight").value;
            const d = document.getElementById("cuboidDepth").value;

            if (!x || !y || !z || !w || !h || !d) {
                alert("すべての値を入力してください");
                return;
            }
            if (w <= 0 || h <= 0 || d <= 0) {
                alert("幅, 高さ, 奥行き は 0 より大きい必要があります");
                return;
            }

            sessionStorage.setItem("x", Number(x));
            sessionStorage.setItem("y", Number(y));
            sessionStorage.setItem("z", Number(z));
            sessionStorage.setItem("width", Number(w));
            sessionStorage.setItem("height", Number(h));
            sessionStorage.setItem("depth", Number(d));

            console.log("========== [画面遷移] shape.html -> trans-matrix.html ==========");
            console.log("[shape.js] 保存した直方体データ (JS Object):", { x, y, z, w, h, d });
            window.location.href = "trans-matrix.html";
            setInputs(cuboidParams, [0, 0, 0, 1, 1, 1]);
        } else if (shape === "sphere") {
            const cx = document.getElementById("sphereCx").value;
            const cy = document.getElementById("sphereCy").value;
            const cz = document.getElementById("sphereCz").value;
            const rx = document.getElementById("sphereRx").value;
            const ry = document.getElementById("sphereRy").value;
            const rz = document.getElementById("sphereRz").value;

            if (!cx || !cy || !cz || !rx || !ry || !rz) {
                alert("すべての値を入力してください");
                return;
            }
            if (rx <= 0 || ry <= 0 || rz <= 0) {
                alert("rx, ry, rz は 0 より大きい必要があります");
                return;
            }

            sessionStorage.setItem("cx", Number(cx));
            sessionStorage.setItem("cy", Number(cy));
            sessionStorage.setItem("cz", Number(cz));
            sessionStorage.setItem("rx", Number(rx));
            sessionStorage.setItem("ry", Number(ry));
            sessionStorage.setItem("rz", Number(rz));

            console.log("========== [画面遷移] shape.html -> trans-matrix.html ==========");
            console.log("[shape.js] 保存した球体データ (JS Object):", { cx, cy, cz, rx, ry, rz });
            window.location.href = "trans-matrix.html";
            setInputs(sphereParams, [0, 0, 0, 1, 1, 1]);
        }
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
    const inputs = document.querySelectorAll('#cuboidParams input, #sphereParams input');
    inputs.forEach(input => {
        input.addEventListener('input', updatePreview);
    });

    /**
     * 現在の入力値から頂点座標を計算し、Plotlyで3Dプレビューを描画する
     */
    function updatePreview() {
        const shape = shapeSelect.value;

        let traceData = {
            x: [], y: [], z: [],
            type: "scatter3d",
            mode: "lines",
            name: "プレビュー",
            line: {
                color: "#333333", // プレビュー用の色
                width: 2
            }
        };

        if (shape === "cuboid") {
            const x = Number(document.getElementById("cuboidX").value) || 0;
            const y = Number(document.getElementById("cuboidY").value) || 0;
            const z = Number(document.getElementById("cuboidZ").value) || 0;
            const w = Number(document.getElementById("cuboidWidth").value) || 0;
            const h = Number(document.getElementById("cuboidHeight").value) || 0;
            const d = Number(document.getElementById("cuboidDepth").value) || 0;

            // 直方体の8頂点
            const pts = [
                { x: x, y: y, z: z },
                { x: x + w, y: y, z: z },
                { x: x + w, y: y + h, z: z },
                { x: x, y: y + h, z: z },
                { x: x, y: y, z: z + d },
                { x: x + w, y: y, z: z + d },
                { x: x + w, y: y + h, z: z + d },
                { x: x, y: y + h, z: z + d }
            ];

            const edges = [
                [0, 1], [1, 2], [2, 3], [3, 0],  // 前面
                [4, 5], [5, 6], [6, 7], [7, 4],  // 背面
                [0, 4], [1, 5], [2, 6], [3, 7]   // 前後を繋ぐ
            ];

            for (const [i, j] of edges) {
                // 左手系 (Z軸を手前/奥とするため、描画時は反転させる draw.js に合わせる)
                traceData.x.push(pts[i].x, pts[j].x, null);
                traceData.y.push(pts[i].y, pts[j].y, null);
                traceData.z.push(-pts[i].z, -pts[j].z, null);
            }

        } else if (shape === "sphere") {
            const cx = Number(document.getElementById("sphereCx").value) || 0;
            const cy = Number(document.getElementById("sphereCy").value) || 0;
            const cz = Number(document.getElementById("sphereCz").value) || 0;
            const rx = Number(document.getElementById("sphereRx").value) || 0;
            const ry = Number(document.getElementById("sphereRy").value) || 0;
            const rz = Number(document.getElementById("sphereRz").value) || 0;

            const latitudes = 12;
            const longitudes = 24;
            const pts = [];

            // 頂点の生成処理
            for (let i = 0; i <= latitudes; i++) {
                const theta = i * Math.PI / latitudes;
                const sinTheta = Math.sin(theta);
                const cosTheta = Math.cos(theta);

                for (let j = 0; j <= longitudes; j++) {
                    const phi = j * 2 * Math.PI / longitudes;
                    const sinPhi = Math.sin(phi);
                    const cosPhi = Math.cos(phi);

                    pts.push({
                        x: cx + rx * sinTheta * cosPhi,
                        y: cy + ry * cosTheta,
                        z: cz + rz * sinTheta * sinPhi
                    });
                }
            }

            // 緯線を描画
            for (let i = 0; i <= latitudes; i++) {
                for (let j = 0; j <= longitudes; j++) {
                    const idx = i * (longitudes + 1) + j;
                    const p = pts[idx];
                    traceData.x.push(p.x);
                    traceData.y.push(p.y);
                    traceData.z.push(-p.z); // 左手系
                }
                traceData.x.push(null); traceData.y.push(null); traceData.z.push(null);
            }

            // 経線を描画
            for (let j = 0; j <= longitudes; j++) {
                for (let i = 0; i <= latitudes; i++) {
                    const idx = i * (longitudes + 1) + j;
                    const p = pts[idx];
                    traceData.x.push(p.x);
                    traceData.y.push(p.y);
                    traceData.z.push(-p.z);
                }
                traceData.x.push(null); traceData.y.push(null); traceData.z.push(null);
            }
        } else {
            // 図形未選択時は空のデータを描画
            traceData.x = [];
            traceData.y = [];
            traceData.z = [];
        }

        // --- 3D軸（X, Y, Z）の描画用トレースを生成 (draw.js 互換) ---
        const previewArea3D = document.getElementById("previewArea3D");

        let currentCamera = {
            eye: { x: 1.6, y: 0.4, z: -0.5 },
            up: { x: 0, y: 1, z: 0 }
        };
        let xAxisRange, yAxisRange, zAxisRange;
        let maxAbs = 1;

        if (previewArea3D && previewArea3D.layout && previewArea3D.layout.uirevision === shape) {
            // すでに描画済みの場合、視点とスケール環境は維持する
            const scene = previewArea3D.layout.scene;
            if (scene) {
                if (scene.camera) currentCamera = scene.camera;
                if (scene.xaxis && scene.xaxis.range) xAxisRange = scene.xaxis.range;
                if (scene.yaxis && scene.yaxis.range) yAxisRange = scene.yaxis.range;
                if (scene.zaxis && scene.zaxis.range) zAxisRange = scene.zaxis.range;
            }
        }

        // --- 軸の長さ（maxAbs）は常に現在の物体の大きさに合わせて再計算する ---
        const allXs = traceData.x.filter(v => v !== null);
        const allYs = traceData.y.filter(v => v !== null);
        const allZs = traceData.z.filter(v => v !== null);

        let maxX = 1, maxY = 1, maxZ = 1;

        if (allXs.length > 0) {
            maxX = Math.max(...allXs.map(Math.abs));
            maxY = Math.max(...allYs.map(Math.abs));
            maxZ = Math.max(...allZs.map(Math.abs));
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

        const makeLine = (name, color, x, y, z) => ({
            type: "scatter3d", mode: "lines",
            name: name, showlegend: true, hoverinfo: "skip",
            x: x, y: y, z: z,
            line: { color: color, width: 3 }
        });

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

        const makeLabel = (name, color, px, py, pz) => ({
            type: "scatter3d", mode: "text",
            showlegend: false, hoverinfo: "skip",
            x: [px], y: [py], z: [pz],
            text: [name],
            textposition: "middle center",
            textfont: { color: color, size: 14, family: "Arial Black" }
        });

        const axisTraces = [
            // X軸
            makeLine("X軸", "#d00000", [-negX, posX], [0, 0], [0, 0]),
            makeArrow("X", "#d00000", posX, 0, 0, 1, 0, 0, posX),
            makeLabel("X", "#d00000", posX * 1.12, 0, 0),
            // Y軸
            makeLine("Y軸", "#00a000", [0, 0], [-negY, posY], [0, 0]),
            makeArrow("Y", "#00a000", 0, posY, 0, 0, 1, 0, posY),
            makeLabel("Y", "#00a000", 0, posY * 1.12, 0),
            // Z軸 (左手系: -z が正方向)
            makeLine("Z軸", "#0060d0", [0, 0], [0, 0], [negZ, -posZ]),
            makeArrow("Z", "#0060d0", 0, 0, -posZ, 0, 0, -1, posZ),
            makeLabel("Z", "#0060d0", 0, 0, -posZ * 1.12)
        ];

        const layout = {
            scene: {
                xaxis: { title: "", gridcolor: "#e0e0e0", showspikes: false },
                yaxis: { title: "", gridcolor: "#e0e0e0", showspikes: false },
                zaxis: { title: "", gridcolor: "#e0e0e0", showspikes: false },
                camera: currentCamera,
                aspectmode: "data" // 描画内容に応じて軸スケールを追従させる
            },
            showlegend: true,
            legend: { x: 0, y: 1.05, orientation: "h" },
            margin: { l: 0, r: 0, t: 30, b: 0 },
            paper_bgcolor: "#ffffff",
            uirevision: shape,
            autosize: true          // 要素のCSS幅に自動追従
        };

        if (xAxisRange) layout.scene.xaxis.range = xAxisRange;
        if (yAxisRange) layout.scene.yaxis.range = yAxisRange;
        if (zAxisRange) layout.scene.zaxis.range = zAxisRange;

        const config = {
            scrollZoom: true,
            displayModeBar: false,
            responsive: true
        };

        Plotly.react("previewArea3D", [traceData, ...axisTraces], layout, config);
    }
});
