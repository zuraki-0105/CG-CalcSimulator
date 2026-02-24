import { toTransformCommands3D } from "/common/js/util.js";

document.addEventListener("DOMContentLoaded", () => {
    const canvasBefore = document.getElementById("drawCanvasBefore");
    const ctxBefore = canvasBefore.getContext("2d");

    const canvasAfter = document.getElementById("drawCanvasAfter");
    const ctxAfter = canvasAfter.getContext("2d");

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
            [ctxBefore, ctxAfter].forEach(ctx => {
                ctx.font = "16px sans-serif";
                ctx.fillText("描画データの取得に失敗しました", 20, 30);
            });
        }
    }

    function drawShapes(data) {
        const original = data.original;      // 3D points
        const transformed = data.transformed; // 3D points

        // --- 変換前キャンバスの描画 ---
        // 斜投影用の 2D座標に変換: X2D = X - Z * 0.4, Y2D = Y - Z * 0.4 (斜め奥に伸びる表現)
        const projOblique = p => ({ x: p.x - p.z * 0.4, y: p.y - p.z * 0.4 });
        const obliquePoints = original.map(projOblique);

        const viewBefore = computeView(obliquePoints, canvasBefore.width, canvasBefore.height);
        drawGrid(ctxBefore, viewBefore, canvasBefore);
        ctxBefore.strokeStyle = "#999";
        ctxBefore.lineWidth = 2;
        ctxBefore.setLineDash([6, 4]); // 破線
        drawCuboidWireframe(ctxBefore, obliquePoints, viewBefore);

        // --- 変換後キャンバスの描画 ---
        // XY平面への正投影: X2D = X, Y2D = Y
        // 仕様: "入力されたZ値に基づいたx-y座標面に投影した結果"
        // Zの深さについては正投影であるため影響をもたせない (x,yをそのまま使用)
        const projOrtho = p => ({ x: p.x, y: p.y });
        const orthoPoints = transformed.map(projOrtho);
        const viewAfter = computeView(orthoPoints, canvasAfter.width, canvasAfter.height);
        drawGrid(ctxAfter, viewAfter, canvasAfter);
        ctxAfter.strokeStyle = "#d9534f"; // 赤実線
        ctxAfter.lineWidth = 2;
        ctxAfter.setLineDash([]);
        drawCuboidWireframe(ctxAfter, orthoPoints, viewAfter);
    }

    function drawCuboidWireframe(ctx, cvsMathPts, view) {
        if (!cvsMathPts || cvsMathPts.length !== 8) return;

        const cvsPts = cvsMathPts.map(p => toCanvas(p, view));

        // 直方体の辺 (インデックスペア)
        const edges = [
            // 前面
            [0, 1], [1, 2], [2, 3], [3, 0],
            // 背面
            [4, 5], [5, 6], [6, 7], [7, 4],
            // 前後を繋ぐ
            [0, 4], [1, 5], [2, 6], [3, 7]
        ];

        ctx.beginPath();
        for (let [i, j] of edges) {
            ctx.moveTo(cvsPts[i].x, cvsPts[i].y);
            ctx.lineTo(cvsPts[j].x, cvsPts[j].y);
        }
        ctx.stroke();
    }

    function computeView(points, canvasW, canvasH) {
        const margin = 40;
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        for (const p of points) {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
        }

        const rangeX = maxX - minX || 1;
        const rangeY = maxY - minY || 1;

        const scaleX = (canvasW - 2 * margin) / rangeX;
        const scaleY = (canvasH - 2 * margin) / rangeY;
        const scale = Math.min(scaleX, scaleY);

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        return { scale, centerX, centerY, canvasW, canvasH, minX, maxX, minY, maxY };
    }

    function toCanvas(point, view) {
        // 数学座標(Y上向き) -> Canvas座標(Y下向き)
        const cx = view.canvasW / 2 + (point.x - view.centerX) * view.scale;
        const cy = view.canvasH / 2 - (point.y - view.centerY) * view.scale;
        return { x: cx, y: cy };
    }

    function drawGrid(ctx, view, canvas) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const rawStep = (view.maxX - view.minX) / 8;
        const step = niceStep(rawStep);

        ctx.strokeStyle = "#e0e0e0";
        ctx.lineWidth = 0.5;
        ctx.setLineDash([]);

        const startX = Math.floor(view.minX / step) * step;
        for (let x = startX; x <= view.maxX + step; x += step) {
            const from = toCanvas({ x: x, y: view.minY - step }, view);
            const to = toCanvas({ x: x, y: view.maxY + step }, view);
            ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
        }

        const startY = Math.floor(view.minY / step) * step;
        for (let y = startY; y <= view.maxY + step; y += step) {
            const from = toCanvas({ x: view.minX - step, y: y }, view);
            const to = toCanvas({ x: view.maxX + step, y: y }, view);
            ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
        }

        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1;

        const xAxisFrom = toCanvas({ x: view.minX - step, y: 0 }, view);
        const xAxisTo = toCanvas({ x: view.maxX + step, y: 0 }, view);
        ctx.beginPath(); ctx.moveTo(xAxisFrom.x, xAxisFrom.y); ctx.lineTo(xAxisTo.x, xAxisTo.y); ctx.stroke();

        const yAxisFrom = toCanvas({ x: 0, y: view.minY - step }, view);
        const yAxisTo = toCanvas({ x: 0, y: view.maxY + step }, view);
        ctx.beginPath(); ctx.moveTo(yAxisFrom.x, yAxisFrom.y); ctx.lineTo(yAxisTo.x, yAxisTo.y); ctx.stroke();

        ctx.fillStyle = "#333";
        ctx.font = "12px monospace";
        ctx.textAlign = "center";
        for (let x = startX; x <= view.maxX + step; x += step) {
            if (Math.abs(x) < 1e-9) continue;
            const p = toCanvas({ x: x, y: 0 }, view);
            ctx.fillText(formatNum(x), p.x, p.y + 16);
        }

        ctx.textAlign = "right";
        for (let y = startY; y <= view.maxY + step; y += step) {
            if (Math.abs(y) < 1e-9) continue;
            const p = toCanvas({ x: 0, y: y }, view);
            ctx.fillText(formatNum(y), p.x - 6, p.y + 4);
        }

        const origin = toCanvas({ x: 0, y: 0 }, view);
        ctx.textAlign = "right";
        ctx.fillText("O", origin.x - 6, origin.y + 16);

        // X軸ラベル (右端)
        ctx.textAlign = "left";
        ctx.fillStyle = "#000000"; // 真っ黒に変更
        ctx.font = "bold 14px monospace";
        // 描画位置をさらに内側に寄せる (-28ピクセル), ちょっと上へ (-4ピクセル)
        const xLabelPos = toCanvas({ x: view.maxX + step, y: 0 }, view);
        ctx.fillText("x", xLabelPos.x - 28, xLabelPos.y - 4);

        // Y軸ラベル (上端)
        ctx.textAlign = "center";
        // 描画位置を少し下側に寄せる (+16ピクセル)
        const yLabelPos = toCanvas({ x: 0, y: view.maxY + step }, view);
        ctx.fillText("y", yLabelPos.x + 12, yLabelPos.y + 16);
    }

    function niceStep(raw) {
        if (raw <= 0) return 1;
        const exp = Math.floor(Math.log10(raw));
        const fraction = raw / Math.pow(10, exp);
        let nice;
        if (fraction <= 1.5) nice = 1;
        else if (fraction <= 3.5) nice = 2;
        else if (fraction <= 7.5) nice = 5;
        else nice = 10;
        return nice * Math.pow(10, exp);
    }

    function formatNum(n) {
        if (Number.isInteger(n)) return n.toString();
        return n.toFixed(1);
    }
});
