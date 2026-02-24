import { toTransformCommands3D, formatTransformEntry3D } from "/common/js/util.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("/3D/js/confirm.js が読み込まれました");

    renderShapeInfo();
    renderTransformList();
    fetchAndRenderComposedMatrix();

    document.getElementById("backBtn").addEventListener("click", () => {
        history.back();
    });

    document.getElementById("sendBtn").addEventListener("click", () => {
        const projZ = document.getElementById("projectionZ").valueAsNumber;
        if (Number.isNaN(projZ)) {
            alert("投影面のZ値を入力してください");
            return;
        }
        sessionStorage.setItem("projectionZ", projZ);
        location.href = "/3D/html/draw.html";
    });

    function renderShapeInfo() {
        const div = document.getElementById("shapeInfo");
        const shapeType = sessionStorage.getItem("shapeType");
        let html = "";

        if (shapeType === "cuboid") {
            html = `Cuboid
  基準点(x, y, z) = (${sessionStorage.getItem("x")}, ${sessionStorage.getItem("y")}, ${sessionStorage.getItem("z")})
  幅(W), 高さ(H), 奥行き(D) = ${sessionStorage.getItem("width")}, ${sessionStorage.getItem("height")}, ${sessionStorage.getItem("depth")}`;
        }

        div.innerHTML = html;
    }

    function renderTransformList() {
        const listElem = document.getElementById("transformList");
        const queue = JSON.parse(sessionStorage.getItem("transformQueue") || "[]");

        queue.forEach((t, index) => {
            const li = document.createElement("li");
            const entry = formatTransformEntry3D(t, index);

            if (entry.isHtml) {
                li.innerHTML = entry.text;
            } else {
                li.textContent = entry.text;
            }

            listElem.appendChild(li);
        });
    }

    async function fetchAndRenderComposedMatrix() {
        const div = document.getElementById("composedMatrix");
        const queue = JSON.parse(sessionStorage.getItem("transformQueue") || "[]");

        if (queue.length === 0) {
            div.textContent = "変換が追加されていません";
            return;
        }

        const commands = toTransformCommands3D(queue);

        try {
            const res = await fetch("/api/3d/compose-matrix", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(commands)
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const data = await res.json();
            const matrix = data.matrix;

            // 4×4行列を整形して表示
            const lines = matrix.map(row =>
                "[ " + row.map(v => v.toFixed(4).padStart(10)).join("  ") + " ]"
            );
            div.textContent = "M =\n" + lines.join("\n");

        } catch (err) {
            console.error("合成行列の取得に失敗:", err);
            div.textContent = "行列の計算に失敗しました";
        }
    }
});
