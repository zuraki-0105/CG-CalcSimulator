import { clearInputs, setInputs } from "../../common/js/util.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("/2d/js/shape.jsが読み込まれました");
    const shapeSelect = document.getElementById("shapeType");
    const rectParams = document.getElementById("rectParams");
    const ellipseParams = document.getElementById("ellipseParams");
    const nextBtn = document.getElementById("nextBtn");
    const backBtn = document.getElementById("backBtn");



    // 図形選択切り替え
    shapeSelect.addEventListener("change", () => {
        const shape = shapeSelect.value;
        rectParams.classList.add("hidden");
        ellipseParams.classList.add("hidden");

        if (shape === "rectangle") {
            rectParams.classList.remove("hidden");
        }

        if (shape === "ellipse") {
            ellipseParams.classList.remove("hidden");
        }

    });

    nextBtn.addEventListener("click", () => {
        const shape = shapeSelect.value;
        if (!shape) {
            alert("図形の種類を選択してください");
            return;
        }

        sessionStorage.setItem("shapeType", shape);

        if (shape === "rectangle") {
            const x = rectX.value;
            const y = rectY.value;
            const w = rectWidth.value;
            const h = rectHeight.value;

            if (!x || !y || !w || !h) {
                alert("すべての値を入力してください");
                return;
            }
            if (w <= 0 || h <= 0) {
                alert("幅, 高さ は 0 より大きい必要があります");
                return;
            }

            sessionStorage.setItem("x", Number(x));
            sessionStorage.setItem("y", Number(y));
            sessionStorage.setItem("width", parseFloat(w));
            sessionStorage.setItem("height", parseFloat(h));

            console.log("========== [画面遷移] shape.html -> trans-matrix.html ==========");
            console.log("[shape.js] 保存した矩形データ (JS Object):", { x, y, w, h });
            setInputs(rectParams, [0, 0, 1, 1]);
        }

        if (shape === "ellipse") {
            const ellipseX = document.getElementById("ellipseX");
            const ellipseY = document.getElementById("ellipseY");
            const ellipseA = document.getElementById("ellipseA");
            const ellipseB = document.getElementById("ellipseB");

            const x = ellipseX.value;
            const y = ellipseY.value;
            const a = ellipseA.value;
            const b = ellipseB.value;

            if (!x || !y || !a || !b) {
                alert("すべての値を入力してください");
                return;
            }
            if (a <= 0 || b <= 0) {
                alert("a, b は 0 より大きい必要があります");
                return;
            }

            sessionStorage.setItem("x", Number(x));
            sessionStorage.setItem("y", Number(y));
            sessionStorage.setItem("a", Number(a));
            sessionStorage.setItem("b", parseFloat(b));

            console.log("========== [画面遷移] shape.html -> trans-matrix.html ==========");
            console.log("[shape.js] 保存した楕円データ (JS Object):", { x, y, a, b });
            setInputs(ellipseParams, [0, 0, 1, 1]);
        }

        location.href = "./trans-matrix.html";
    });

    backBtn.addEventListener("click", () => {
        if (history.length > 1) {
            history.back();
        } else {
            location.href = "/index.html";
        }
    });
});