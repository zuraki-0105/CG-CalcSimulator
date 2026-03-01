import { toTransformCommands, formatTransformEntry } from "../../common/js/util.js?v=@build.timestamp@";

document.addEventListener("DOMContentLoaded", () => {
    console.log("/2d/js/confirm.js が読み込まれました");

    renderShapeInfo();
    renderTransformList();
    fetchAndRenderComposedMatrix();

    document.getElementById("backBtn").addEventListener("click", () => {
        history.back();
    });

    document.getElementById("sendBtn").addEventListener("click", () => {
        // The variable 'projType' is not defined in the provided context.
        // Assuming it should be retrieved or defined here for the intended change.
        // For now, I will add the lines as requested, but 'projType' will be undefined.
        const projType = sessionStorage.getItem("projectionType") || "perspective"; // Placeholder for projType

        sessionStorage.setItem("projectionType", projType);
        console.log("========== [画面遷移] confirm.html -> draw.html ==========");
        console.log("[confirm.js] 保存した投影設定 (JS Object):", { projType });
        location.href = "./draw.html?v=@build.timestamp@";
    });

    function renderShapeInfo() {
        const div = document.getElementById("shapeInfo");

        const shapeType = sessionStorage.getItem("shapeType");

        let html = "";

        if (shapeType === "rectangle") {
            html = `Rectangle
  基準点(x, y) = (${sessionStorage.getItem("x")}, ${sessionStorage.getItem("y")})
  幅           = ${sessionStorage.getItem("width")}
  高さ         = ${sessionStorage.getItem("height")}`;
        }

        if (shapeType === "ellipse") {
            const x = Number(sessionStorage.getItem("x"));
            const y = Number(sessionStorage.getItem("y"));
            const a = Number(sessionStorage.getItem("a"));
            const b = Number(sessionStorage.getItem("b"));

            if (a === b) {
                html = `Circle
  中点(x, y) = (${x}, ${y})
  半径 r     = ${a}`;
            } else {
                html = `Ellipse
  中点(x, y) = (${x}, ${y})
  長半径 a   = ${a}
  短半径 b   = ${b}`;
            }

        }

        div.innerHTML = html;
    }

    function renderTransformList() {
        const listElem = document.getElementById("transformList");
        const queue = JSON.parse(sessionStorage.getItem("transformQueue") || "[]");

        queue.forEach((t, index) => {
            const li = document.createElement("li");
            const entry = formatTransformEntry(t, index);

            if (entry.isHtml) {
                li.innerHTML = entry.text;
            } else {
                li.textContent = entry.text;
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

        const commands = toTransformCommands(queue);

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
                "[ " + row.map(v => {
                    let str = v.toFixed(4);
                    if (str === "-0.0000") str = "0.0000";
                    return str.padStart(10);
                }).join("  ") + " ]"
            );
            div.textContent = "M =\n" + lines.join("\n");

        } catch (err) {
            console.error("合成行列の取得に失敗:", err);
            div.textContent = "行列の計算に失敗しました";
        }
    }

});
