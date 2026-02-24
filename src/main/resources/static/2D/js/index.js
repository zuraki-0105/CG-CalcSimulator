document.addEventListener("DOMContentLoaded", () => {
    console.log("/2d/js/index.jsが読み込まれました");
    const nextBtn = document.getElementById("nextBtn");

    nextBtn.addEventListener("click", () => {
        const selected = document.querySelector('input[name="dimension"]:checked');

        if (!selected) {
            alert("Select a dimension");
            return;
        }

        const dimension = selected.value;
        sessionStorage.setItem("dimension", dimension);

        if (dimension === "2D") {
            console.log("2Dが選択されました");
            location.href = "./2D/html/shape.html";
        } else {
            console.log("3Dが選択されました");
            location.href = "./3D/html/shape.html";
        }
    });
});
