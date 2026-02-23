import { clearInputs, setInputs } from "/common/js/util.js";

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

        if(shape === "rectangle") {
            rectParams.classList.remove("hidden");
        }

        if (shape === "ellipse") {
            ellipseParams.classList.remove("hidden");
        }
        
    });

    nextBtn.addEventListener("click", () => {
        const shape = shapeSelect.value;
        if (!shape) {
            alert("Select shape type");
            return;
        }

        sessionStorage.setItem("shapeType", shape);

        if (shape === "rectangle") {
            const x = rectX.value;
            const y = rectY.value;
            const w = rectWidth.value;
            const h = rectHeight.value;

            if (!x || !y || !w || !h) {
                alert("Input all values");
                return;
            }
            if( w <= 0 || h <= 0 ) {
                alert("Must width, height > 0");
                return;
            }

            sessionStorage.setItem("x", Number(x));
            sessionStorage.setItem("y", Number(y));
            sessionStorage.setItem("width", Number(w));
            sessionStorage.setItem("height", Number(h));

            clearInputs(rectParams);
            setInputs(rectParams, [0, 0, 1, 1]);
        }

        if (shape === "ellipse") {
            const x = ellipseX.value;
            const y = ellipseY.value;
            const a = ellipseA.value;
            const b = ellipseB.value;

            if (!x || !y || !a || !b) {
                alert("Input all values");
                return;
            }
            if( a <= 0 || b <= 0 ) {
                alert("Must a, b > 0");
                return;
            }

            sessionStorage.setItem("x", Number(x));
            sessionStorage.setItem("y", Number(y));
            sessionStorage.setItem("a", Number(a));
            sessionStorage.setItem("b", Number(b));

            clearInputs(ellipseParams); 
            setInputs(ellipseParams, [0, 0, 1, 1]);
        }

        location.href = "/2d/html/trans-matrix.html";
    });

    backBtn.addEventListener("click", () => {
        if (history.length > 1) {
          history.back();
        } else {
          location.href = "/index.html";
        }
    });
});