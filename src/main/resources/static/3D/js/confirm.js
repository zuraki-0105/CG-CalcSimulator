import { toTransformCommands3D, formatTransformEntry3D } from "../../common/js/util.js?v=@build.timestamp@";

document.addEventListener("DOMContentLoaded", () => {
    console.log("/3D/js/confirm.js が読み込まれました");

    renderShapeInfo();
    renderTransformList();
    fetchAndRenderComposedMatrix();

    document.getElementById("backBtn").addEventListener("click", () => {
        history.back();
    });

    // 透視投影オプションの表示切替
    const perspectiveOptions = document.getElementById("perspectiveOptions");
    const updateProjectionOptionsVisibility = () => {
        const isPerspective = document.querySelector('input[name="projectionType"]:checked').value === "perspective";
        perspectiveOptions.style.display = isPerspective ? "block" : "none";
    };

    document.querySelectorAll('input[name="projectionType"]').forEach(radio => {
        radio.addEventListener("change", updateProjectionOptionsVisibility);
    });

    // 初期ロード時にも表示状態を同期
    updateProjectionOptionsVisibility();

    document.getElementById("sendBtn").addEventListener("click", () => {
        const projZ = document.getElementById("projectionZ").valueAsNumber;
        if (Number.isNaN(projZ)) {
            alert("投影面のZ値を入力してください");
            return;
        }
        const projType = document.querySelector('input[name="projectionType"]:checked').value;
        sessionStorage.setItem("projectionZ", projZ);
        sessionStorage.setItem("projectionType", projType);

        if (projType === "perspective") {
            const camX = sessionStorage.getItem("cameraX") || 0;
            const camY = sessionStorage.getItem("cameraY") || 0;
            const camZ = sessionStorage.getItem("cameraZ") || 0;

            sessionStorage.setItem("cameraX", camX);
            sessionStorage.setItem("cameraY", camY);
            sessionStorage.setItem("cameraZ", camZ);

            // 簡単なバリデーション（投影面と同じZ座標は計算不可となるため警告）
            if (Number(camZ) === projZ) {
                alert("視点と投影面のZ値が同じです");
                return;
            }

        }

        location.href = "./draw.html";
    });

    // --- 詳細設定モーダルの制御 ---
    const modal = document.getElementById("settingsModal");
    const openBtn = document.getElementById("openSettingsBtn");
    const closeBtn = document.getElementById("cancelSettingsBtn");
    const saveBtn = document.getElementById("saveSettingsBtn");

    openBtn.addEventListener("click", () => {
        // 現在の投影面Zを表示用に更新
        document.getElementById("modalProjZDisplay").textContent = document.getElementById("projectionZ").value || "未入力";

        // sessionStorageから現在の値を復元
        document.getElementById("cameraX").value = sessionStorage.getItem("cameraX") || 0;
        document.getElementById("cameraY").value = sessionStorage.getItem("cameraY") || 0;
        document.getElementById("cameraZ").value = sessionStorage.getItem("cameraZ") || 0;

        // 描画設定の復元（未設定時はtrueをデフォルトとする）
        document.getElementById("drawBefore").checked = sessionStorage.getItem("showDrawBefore") !== "false";
        document.getElementById("drawAfter3D").checked = sessionStorage.getItem("showDrawAfter3D") !== "false";
        document.getElementById("drawAfter2D").checked = sessionStorage.getItem("showDrawAfter2D") !== "false";

        modal.style.display = "flex";
    });

    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // モーダル外クリックで閉じる
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

    saveBtn.addEventListener("click", () => {
        const x = document.getElementById("cameraX").valueAsNumber;
        const y = document.getElementById("cameraY").valueAsNumber;
        const z = document.getElementById("cameraZ").valueAsNumber;
        const drawBefore = document.getElementById("drawBefore").checked;
        const drawAfter3D = document.getElementById("drawAfter3D").checked;
        const drawAfter2D = document.getElementById("drawAfter2D").checked;

        if (!drawBefore && !drawAfter3D && !drawAfter2D) {
            if (!confirm("描画する図形がすべてOFFになっています。何も描画されませんがよろしいですか？")) {
                return;
            }
        }

        if (Number.isNaN(x) || Number.isNaN(y) || Number.isNaN(z)) {
            alert("視点座標はすべて数値を入力してください");
            return;
        }

        sessionStorage.setItem("cameraX", x);
        sessionStorage.setItem("cameraY", y);
        sessionStorage.setItem("cameraZ", z);

        // 描画設定の保存
        sessionStorage.setItem("showDrawBefore", drawBefore);
        sessionStorage.setItem("showDrawAfter3D", drawAfter3D);
        sessionStorage.setItem("showDrawAfter2D", drawAfter2D);

        console.log("[confirm.js] 追加/更新した詳細設定 (JS Object):", { camX: x, camY: y, camZ: z, drawBefore, drawAfter3D, drawAfter2D });
        modal.style.display = "none";
    });

    function renderShapeInfo() {
        const div = document.getElementById("shapeInfo");
        const shapeType = sessionStorage.getItem("shapeType");
        let html = "";

        if (shapeType === "cuboid") {
            html = `Cuboid
  基準点(x, y, z) = (${sessionStorage.getItem("x")}, ${sessionStorage.getItem("y")}, ${sessionStorage.getItem("z")})
  幅    (X方向)   = ${sessionStorage.getItem("width")}
  高さ  (Y方向)   = ${sessionStorage.getItem("height")}
  奥行き(Z方向)   = ${sessionStorage.getItem("depth")}`;
        } else if (shapeType === "sphere") {
            html = `Sphere
  中心点(Cx, Cy, Cz) = (${sessionStorage.getItem("cx")}, ${sessionStorage.getItem("cy")}, ${sessionStorage.getItem("cz")})
  半径rx (X方向)     = ${sessionStorage.getItem("rx")}
  半径ry (Y方向)     = ${sessionStorage.getItem("ry")}
  半径rz (Z方向)     = ${sessionStorage.getItem("rz")}`;
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
