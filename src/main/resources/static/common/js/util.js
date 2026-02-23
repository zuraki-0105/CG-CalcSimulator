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

/**
 * フロントエンドの変換キューをサーバーの TransformCommand 形式に変換する
 * @param {Array<Object>} queue - sessionStorage から取得した変換キュー
 * @returns {Array<Object>} サーバー送信用の変換コマンド配列
 */
export function toTransformCommands(queue) {
    return queue.map(t => {
        switch (t.type) {
            case "translation":
                return { type: "translation", tx: t.tx, ty: t.ty };
            case "scale":
                return { type: "scale", sx: t.sx, sy: t.sy };
            case "rotation":
                return { type: "rotation", thetaDeg: t.theta };
            case "custom":
                return { type: "custom", matrix: t.matrix };
            default:
                return t;
        }
    });
}

/**
 * 変換キューの内容をテキストとして整形して返す
 * @param {Object} t - 変換エントリ
 * @param {number} index - 0始まりのインデックス
 * @returns {{ text: string, isHtml: boolean }}
 */
export function formatTransformEntry(t, index) {
    const num = index + 1;
    switch (t.type) {
        case "translation":
            return { text: `${num}: 平行移動 (${t.tx}, ${t.ty})`, isHtml: false };
        case "scale":
            return { text: `${num}: 拡大縮小 (${t.sx}, ${t.sy})`, isHtml: false };
        case "rotation":
            return { text: `${num}:  回  転  (${t.theta}°)`, isHtml: false };
        case "custom": {
            const matrixText = "{ " + t.matrix.map(row => row.join(", ")).join("\n  ") + " }";
            return { text: `${num}: 任意行列<br>${matrixText}<br>`, isHtml: true };
        }
        default:
            return { text: `${num}: ${t.type}`, isHtml: false };
    }
}
