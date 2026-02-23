/**
 * 指定した要素配下の input をすべてクリアする
 * @param {HTMLElement|string} root
 */
export function clearInputs(root) {
    const base =
        typeof root === "string"
            ? document.querySelector(root)
            : root;

    if (!base) return;

    base.querySelectorAll("input").forEach(input => {
        input.value = "";
    });
}

/**
 * 指定した要素配下の input に値をセットする
 * @param {HTMLElement|string} root - 対象のルート要素またはセレクター
 * @param {Array<number|string>} values - 各 input にセットする値の配列
 */
export function setInputs(root, values) {
    const base =
        typeof root === "string"
            ? document.querySelector(root)
            : root;

    if (!base) return;

    const inputs = base.querySelectorAll("input");
    inputs.forEach((input, i) => {
        if (i < values.length) {
            input.value = values[i];
        }
    });
}
