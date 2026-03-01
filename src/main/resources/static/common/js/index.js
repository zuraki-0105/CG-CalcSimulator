document.addEventListener("DOMContentLoaded", () => {
    console.log("/common/js/index.jsが読み込まれました");
    const nextBtn = document.getElementById("nextBtn");

    nextBtn.addEventListener("click", () => {
        const selected = document.querySelector('input[name="dimension"]:checked');

        if (!selected) {
            alert("次元を選択してください");
            return;
        }

        sessionStorage.clear();
        sessionStorage.setItem("dimension", selected.value);
        console.log("========== [次元選択] ==========");
        console.log("[index.js] 選択された次元:", selected.value);

        if (selected.value === "2D") {
            console.log("2Dが選択されました");
            location.href = "./2D/html/shape.html?v=@build.timestamp@";
        } else {
            console.log("3Dが選択されました");
            location.href = "./3D/html/shape.html?v=@build.timestamp@";
        }
    });
});
