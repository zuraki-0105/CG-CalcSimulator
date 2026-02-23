document.addEventListener("DOMContentLoaded", () => {
    console.log("/2d/js/confirm.js が読み込まれました");

    renderShapeInfo();
    renderTransformList();
    fetchAndRenderComposedMatrix();

    document.getElementById("backBtn").addEventListener("click", () => {
        history.back();
    });

    document.getElementById("sendBtn").addEventListener("click", () => {
        location.href = "/2d/html/draw.html";
    });

    function renderShapeInfo() {
        const div = document.getElementById("shapeInfo");

        const shapeType = sessionStorage.getItem("shapeType");

        let html = "";

        if (shapeType === "rectangle") {
            html = `Rectangle
  基準点(x, y) =  (${sessionStorage.getItem("x")}, ${sessionStorage.getItem("y")})
  幅           =  ${sessionStorage.getItem("width")}
  高さ         =  ${sessionStorage.getItem("height")}`;

            // html = `Rectangle<br>  基準点(x, y)  =  (${sessionStorage.getItem("x")}, ${sessionStorage.getItem("y")}),<br>  幅                     =  ${sessionStorage.getItem("width")},<br>  高さ                =  ${sessionStorage.getItem("height")}`;
        }

        if (shapeType === "ellipse") {
            const x = Number(sessionStorage.getItem("x"));
            const y = Number(sessionStorage.getItem("y"));
            const a = Number(sessionStorage.getItem("a"));
            const b = Number(sessionStorage.getItem("b"));

            if (a === b) {
                html = `Circle<br>  中点(x, y)  =  (${x}, ${y}),<br>  半径 r         =  ${a}`;
            } else {
                html = `Ellipse<br>  中点(x, y)  =  (${x}, ${y}),<br>  長半径 a    =  ${a},<br>  短半径 b    =  ${b}`;
            }

        }

        div.innerHTML = html;
    }

    function renderTransformList() {
        const listElem = document.getElementById("transformList");
        const queue = JSON.parse(sessionStorage.getItem("transformQueue") || "[]");

        queue.forEach((t, index) => {
            const li = document.createElement("li");

            switch (t.type) {
                case "translation":
                    li.textContent = `${index + 1}: 平行移動 (${t.tx}, ${t.ty})`;
                    break;
                case "scale":
                    li.textContent = `${index + 1}: 拡大縮小 (${t.sx}, ${t.sy})`;
                    break;
                case "rotation":
                    li.textContent = `${index + 1}: 回転 (${t.theta}°)`;
                    break;
                case "custom":
                    const matrixText =
                        "{ " + t.matrix.map(r => r.join(", ")).join("\n  ") + " }";
                    li.innerHTML = `${index + 1}: 任意行列<br>${matrixText}<br>`;
                    break;
            }

            listElem.appendChild(li);
        });
    }

    /**
     * サーバーに transformQueue を送信し、合成変換行列を取得・表示する
     */
    async function fetchAndRenderComposedMatrix() {
        const div = document.getElementById("composedMatrix");
        const queue = JSON.parse(sessionStorage.getItem("transformQueue") || "[]");

        if (queue.length === 0) {
            div.textContent = "変換が追加されていません";
            return;
        }

        // フロントエンドのプロパティ名をサーバーの TransformCommand に合わせて変換
        const commands = queue.map(t => {
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
            const res = await fetch("/api/2d/compose-matrix", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(commands)
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const data = await res.json();
            const matrix = data.matrix;

            // 3×3行列を整形して表示
            const lines = matrix.map(row =>
                "[ " + row.map(v => v.toFixed(4).padStart(10)).join("  ") + " ]"
            );
            div.textContent = "M =\n" + lines.join("\n");

        } catch (err) {
            console.error("合成行列の取得に失敗:", err);
            div.textContent = "行列の計算に失敗しました";
        }
    }

    function buildRequestData() {
        return {
            dimension: "2D",
            shape: {
                type: sessionStorage.getItem("shapeType"),
                params: {}
            },
            transforms: JSON.parse(sessionStorage.getItem("transformQueue"))
        };
    }

});
