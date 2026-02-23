document.addEventListener("DOMContentLoaded", () => {
    console.log("/2d/js/draw.js が読み込まれました");

    const canvas = document.getElementById("drawCanvas");
    const ctx = canvas.getContext("2d");

    document.getElementById("backBtn").addEventListener("click", () => {
        history.back();
    });

    document.getElementById("resetBtn").addEventListener("click", () => {
        sessionStorage.clear();
        window.location.href = "/";
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

        // 変換リスト（フロントのプロパティ名 → サーバーの TransformCommand に合わせる）
        req.transforms = queue.map(t => {
            switch (t.type) {
                case "translation":
                    return { type: "translation", tx: t.tx, ty: t.ty };
                case "scale":
                    return { type: "scale", sx: t.sx, sy: t.sy };
                case "rotation":
                    return { type: "rotation", thetaDeg: t.theta };
                case "custom":
                    return { type: "custom", matrix: t.matrix };
                default:
                    return t;
            }
        });

        try {
            const res = await fetch("/api/2d/draw", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(req)
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const data = await res.json();
            drawShapes(data);

        } catch (err) {
            console.error("描画データの取得に失敗:", err);
            ctx.font = "16px sans-serif";
            ctx.fillText("描画データの取得に失敗しました", 20, 30);
        }
    }

    /**
     * Canvas に変換前・変換後の図形を描画する
     */
    function drawShapes(data) {
        const original = data.original;
        const transformed = data.transformed;

        // 全ての点からバウンディングボックスを計算して、適切なスケール・オフセットを決める
        const allPoints = [...original, ...transformed];
        const view = computeView(allPoints, canvas.width, canvas.height);

        // グリッド描画
        drawGrid(view);

        // 変換前（グレー破線）
        ctx.strokeStyle = "#999";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        drawPolygon(original, view);

        // 変換後（赤実線）
        ctx.strokeStyle = "#d9534f";
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        drawPolygon(transformed, view);
    }

    /**
     * 多角形（閉じた折れ線）を描画
     */
    function drawPolygon(points, view) {
        if (points.length === 0) return;

        ctx.beginPath();
        const first = toCanvas(points[0], view);
        ctx.moveTo(first.x, first.y);

        for (let i = 1; i < points.length; i++) {
            const p = toCanvas(points[i], view);
            ctx.lineTo(p.x, p.y);
        }

        ctx.closePath();
        ctx.stroke();
    }

    /**
     * 全ての点を含むビュー情報を計算する
     * 数学座標（Y上向き）→ Canvas座標（Y下向き）への変換用
     */
    function computeView(points, canvasW, canvasH) {
        const margin = 40; // ピクセル余白

        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        for (const p of points) {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
        }

        // 範囲が0の場合（全点同じ座標）への対処
        const rangeX = maxX - minX || 1;
        const rangeY = maxY - minY || 1;

        // アスペクト比を維持するスケール
        const scaleX = (canvasW - 2 * margin) / rangeX;
        const scaleY = (canvasH - 2 * margin) / rangeY;
        const scale = Math.min(scaleX, scaleY);

        // 中心をCanvasの中心に持ってくる
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        return {
            scale: scale,
            centerX: centerX,
            centerY: centerY,
            canvasW: canvasW,
            canvasH: canvasH,
            minX: minX,
            maxX: maxX,
            minY: minY,
            maxY: maxY
        };
    }

    /**
     * 数学座標 → Canvas座標 に変換
     * 数学: Y上向き → Canvas: Y下向き
     */
    function toCanvas(point, view) {
        const cx = view.canvasW / 2 + (point.x - view.centerX) * view.scale;
        const cy = view.canvasH / 2 - (point.y - view.centerY) * view.scale;
        return { x: cx, y: cy };
    }

    /**
     * 背景にグリッドと軸を描画
     */
    function drawGrid(view) {
        // 背景を白でクリア
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // グリッド間隔を自動決定
        const rawStep = (view.maxX - view.minX) / 8;
        const step = niceStep(rawStep);

        // グリッド線（薄いグレー）
        ctx.strokeStyle = "#e0e0e0";
        ctx.lineWidth = 0.5;
        ctx.setLineDash([]);

        // 縦線
        const startX = Math.floor(view.minX / step) * step;
        for (let x = startX; x <= view.maxX + step; x += step) {
            const from = toCanvas({ x: x, y: view.minY - step }, view);
            const to = toCanvas({ x: x, y: view.maxY + step }, view);
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
        }

        // 横線
        const startY = Math.floor(view.minY / step) * step;
        for (let y = startY; y <= view.maxY + step; y += step) {
            const from = toCanvas({ x: view.minX - step, y: y }, view);
            const to = toCanvas({ x: view.maxX + step, y: y }, view);
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
        }

        // 軸（黒の実線）
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 1;

        // X軸
        const xAxisFrom = toCanvas({ x: view.minX - step, y: 0 }, view);
        const xAxisTo = toCanvas({ x: view.maxX + step, y: 0 }, view);
        ctx.beginPath();
        ctx.moveTo(xAxisFrom.x, xAxisFrom.y);
        ctx.lineTo(xAxisTo.x, xAxisTo.y);
        ctx.stroke();

        // Y軸
        const yAxisFrom = toCanvas({ x: 0, y: view.minY - step }, view);
        const yAxisTo = toCanvas({ x: 0, y: view.maxY + step }, view);
        ctx.beginPath();
        ctx.moveTo(yAxisFrom.x, yAxisFrom.y);
        ctx.lineTo(yAxisTo.x, yAxisTo.y);
        ctx.stroke();

        // 軸ラベル
        ctx.fillStyle = "#333";
        ctx.font = "12px monospace";
        ctx.textAlign = "center";

        for (let x = startX; x <= view.maxX + step; x += step) {
            if (Math.abs(x) < 1e-9) continue; // 原点はスキップ
            const p = toCanvas({ x: x, y: 0 }, view);
            ctx.fillText(formatNum(x), p.x, p.y + 16);
        }

        ctx.textAlign = "right";
        for (let y = startY; y <= view.maxY + step; y += step) {
            if (Math.abs(y) < 1e-9) continue;
            const p = toCanvas({ x: 0, y: y }, view);
            ctx.fillText(formatNum(y), p.x - 6, p.y + 4);
        }

        // 原点
        const origin = toCanvas({ x: 0, y: 0 }, view);
        ctx.textAlign = "right";
        ctx.fillText("O", origin.x - 6, origin.y + 16);
    }

    /**
     * グリッド間隔を「きれいな数値」に丸める
     */
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

    /**
     * 数値を表示用にフォーマット
     */
    function formatNum(n) {
        if (Number.isInteger(n)) return n.toString();
        return n.toFixed(1);
    }
});
