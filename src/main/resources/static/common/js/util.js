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
            case "reflection":
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
            const matrixText = "{ " + t.matrix.map(row => row.map(v => Number(v.toFixed(3))).join(", ")).join("\n  ") + " }";
            return { text: `${num}: 任意行列<br>${matrixText}<br>`, isHtml: true };
        }
        case "reflection": {
            const matrixText = "{ " + t.matrix.map(row => row.map(v => Number(v.toFixed(3))).join(", ")).join("\n  ") + " }";
            return { text: `${num}: 鏡映変換<br>${matrixText}<br>`, isHtml: true };
        }
        default:
            return { text: `${num}: ${t.type}`, isHtml: false };
    }
}

/**
 * 3D用のフロントエンド変換キューをサーバーの TransformCommand3D 形式に変換する
 */
export function toTransformCommands3D(queue) {
    return queue.map(t => {
        switch (t.type) {
            case "translation":
                return { type: "translation", tx: t.tx, ty: t.ty, tz: t.tz };
            case "scale":
                return { type: "scale", sx: t.sx, sy: t.sy, sz: t.sz };
            case "rotationX":
                return { type: "rotationX", thetaDeg: t.theta };
            case "rotationY":
                return { type: "rotationY", thetaDeg: t.theta };
            case "rotationZ":
                return { type: "rotationZ", thetaDeg: t.theta };
            case "custom":
                return { type: "custom", matrix: t.matrix };
            default:
                return t;
        }
    });
}

/**
 * 3D用の変換キューの内容をテキストとして整形して返す
 */
export function formatTransformEntry3D(t, index) {
    const num = index + 1;
    switch (t.type) {
        case "translation":
            return { text: `${num}: 平行移動 (${t.tx}, ${t.ty}, ${t.tz})`, isHtml: false };
        case "scale":
            return { text: `${num}: 拡大縮小 (${t.sx}, ${t.sy}, ${t.sz})`, isHtml: false };
        case "rotationX":
            return { text: `${num}: X軸回転 (${t.theta}°)`, isHtml: false };
        case "rotationY":
            return { text: `${num}: Y軸回転 (${t.theta}°)`, isHtml: false };
        case "rotationZ":
            return { text: `${num}: Z軸回転 (${t.theta}°)`, isHtml: false };
        case "custom": {
            const matrixText = "{ " + t.matrix.map(row => row.join(", ")).join("\n  ") + " }";
            return { text: `${num}: 任意行列(4x4)<br>${matrixText}<br>`, isHtml: true };
        }
        default:
            return { text: `${num}: ${t.type}`, isHtml: false };
    }
}
