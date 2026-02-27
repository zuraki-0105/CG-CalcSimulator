import { clearInputs, setInputs } from "../../common/js/util.js";

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
});
