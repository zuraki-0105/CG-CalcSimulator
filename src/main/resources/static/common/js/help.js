/**
 * ヘルプボタン共通スクリプト
 * 各ページの?ボタンをクリックするとヘルプポップアップを開閉する。
 * ポップアップ外クリックで閉じる。
 */
(function () {
    document.addEventListener('DOMContentLoaded', function () {
        const btn = document.getElementById('helpBtn');
        const popup = document.getElementById('helpPopup');
        if (!btn || !popup) return;

        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            popup.classList.toggle('active');
        });

        document.addEventListener('click', function () {
            popup.classList.remove('active');
        });

        popup.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    });
})();
