package com.example.CG_CalcSimulation.api;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.CG_CalcSimulation.matrix3.Matrix3;
import com.example.CG_CalcSimulation.matrix3.Matrix3Util;
import com.example.CG_CalcSimulation.matrix3.Point2D;
import com.example.CG_CalcSimulation.matrix3.Transform;
import com.example.CG_CalcSimulation.shape.Rectangle;

import com.example.CG_CalcSimulation.matrix4.Matrix4;
import com.example.CG_CalcSimulation.matrix4.Matrix4Util;
import com.example.CG_CalcSimulation.matrix4.Point3D;
import com.example.CG_CalcSimulation.matrix4.Transform3D;
import com.example.CG_CalcSimulation.shape3D.Cuboid;
import com.example.CG_CalcSimulation.shape3D.Sphere;

@RestController
@RequestMapping("/api")
public class CgController {

    // ===== 2D API ===== //
    @PostMapping("/2d/compose-matrix")
    public Map<String, double[][]> composeMatrix(@RequestBody List<TransformCommand> commands) {
        Matrix3[] matrices = new Matrix3[commands.size()];
        for (int i = 0; i < commands.size(); i++) {
            matrices[i] = toMatrix3(commands.get(i));
        }
        Matrix3 composed = Matrix3Util.makeTransMatrix(matrices);
        return Collections.singletonMap("matrix", composed.toArray());
    }

    /**
     * 図形 + 変換リストを受け取り、描画用の座標データを返す
     *
     * - 矩形: 4頂点（代表点方式）
     * - 楕円/円: 64点（点群方式）
     */
    @PostMapping("/2d/draw")
    public DrawResponse draw(@RequestBody DrawRequest req) {

        // 合成変換行列を計算
        Matrix3 M = Matrix3Util.identity();
        if (req.getTransforms() != null && !req.getTransforms().isEmpty()) {
            Matrix3[] matrices = new Matrix3[req.getTransforms().size()];
            for (int i = 0; i < req.getTransforms().size(); i++) {
                matrices[i] = toMatrix3(req.getTransforms().get(i));
            }
            M = Matrix3Util.makeTransMatrix(matrices);
        }

        List<Point2D> original;
        List<Point2D> transformed;

        switch (req.getShapeType()) {
            case "rectangle": {
                // 矩形: 4頂点を代表点方式で処理
                Point2D base = new Point2D(req.getX(), req.getY());
                Rectangle rect = new Rectangle(req.getWidth(), req.getHeight(), base);
                original = rect.getVertexes();

                // 変換後の頂点
                transformed = new ArrayList<>();
                for (Point2D p : original) {
                    transformed.add(M.apply(p));
                }
                break;
            }

            case "ellipse": {
                // 楕円/円: パラメトリック方程式で64点を生成（点群方式）
                double cx = req.getX();
                double cy = req.getY();
                double a = req.getA();
                double b = req.getB();
                int numPoints = 64;

                original = new ArrayList<>();
                transformed = new ArrayList<>();

                for (int i = 0; i < numPoints; i++) {
                    double t = 2.0 * Math.PI * i / numPoints;
                    double px = cx + a * Math.cos(t);
                    double py = cy + b * Math.sin(t);
                    Point2D p = new Point2D(px, py);
                    original.add(p);
                    transformed.add(M.apply(p));
                }
                break;
            }

            default:
                throw new IllegalArgumentException("Unknown shape type: " + req.getShapeType());
        }

        return new DrawResponse(req.getShapeType(), original, transformed);
    }

    /**
     * TransformCommand → Matrix3 変換
     */
    private Matrix3 toMatrix3(TransformCommand cmd) {
        switch (cmd.getType()) {
            case "translation":
                return Transform.translation(cmd.getTx(), cmd.getTy());
            case "scale":
                return Transform.scale(cmd.getSx(), cmd.getSy());
            case "rotation":
                return Transform.rotation(cmd.getThetaDeg());
            case "custom":
                return Transform.custom(cmd.getMatrix());
            default:
                throw new IllegalArgumentException("Unknown transform type: " + cmd.getType());
        }
    }

    @PostMapping("/2d/reflection-matrix")
    public ReflectionResponse reflectionMatrix(@RequestBody ReflectionRequest req) {
        double a = req.getA();
        double b = req.getB();
        double c = req.getC();

        if (a == 0 && b == 0) {
            throw new IllegalArgumentException("a と b が共に0の直線は定義できません");
        }

        double tx = 0;
        double ty = 0;

        // X軸との交点を原点へ平行移動するための tx, ty
        // ax + by + c = 0
        if (Math.abs(b) < 1e-9) {
            // y軸に平行 (x = -c/a)
            tx = c / a;
            ty = 0;
        } else if (Math.abs(a) < 1e-9) {
            // x軸に平行 (y = -c/b)
            tx = 0;
            ty = c / b;
        } else {
            // その他の直線 (x切片を使う)
            tx = c / a;
            ty = 0;
        }

        // x軸に重なるようにするための回転角度
        // 方向ベクトルは (b, -a)、その角度は Math.atan2(-a, b)
        // x軸に重ねるには、その逆回転が必要
        double thetaRad = Math.atan2(-a, b);
        double th = Math.toDegrees(thetaRad);

        // 各変換行列 (順に適用)
        // Java側の行列計算は Mat = t2 * r2 * ref * r1 * t1 (コード上は makeTransMatrix に適用順で渡す)
        Matrix3 t1 = Transform.translation(tx, ty);
        Matrix3 r1 = Transform.rotation(-th); // x軸に重ねる回転

        // x軸対称移動
        // Transform.scale は正の値しか受け付けないため、custom 行列を使用
        double[][] refValues = {
                { 1, 0, 0 },
                { 0, -1, 0 },
                { 0, 0, 1 }
        };
        Matrix3 ref = Transform.custom(refValues);

        Matrix3 r2 = Transform.rotation(th); // 元の角度に戻す回転
        Matrix3 t2 = Transform.translation(-tx, -ty); // 元の位置に戻す平行移動

        Matrix3 composed = Matrix3Util.makeTransMatrix(t1, r1, ref, r2, t2);

        // 文字列フォーマット T(tx,ty)→R(th)→Ref(x)→R(-th)→T(-tx,-ty)
        // ※ 要件の(th)は「x軸に重ねるための回転の逆」として表示するため、
        // 実際のthの符号を反転させたものを表示上の回転角とするか、表示通りに当てはめる。
        // ここでは「R(-th)」が元の位置に戻す回転（=R(th)）になるように、
        // 文字列表記上の角度は -th とする。
        String txStr = String.format("%.2f", tx);
        String tyStr = String.format("%.2f", ty);
        String thStr = String.format("%.2f", -th); // 要件の文字列上のth
        String mThStr = String.format("%.2f", th); // 要件の文字列上の-th
        String mTxStr = String.format("%.2f", -tx);
        String mTyStr = String.format("%.2f", -ty);

        // マイナスゼロ(-0.00)の表記揺れ防止
        if (txStr.equals("-0.00"))
            txStr = "0.00";
        if (tyStr.equals("-0.00"))
            tyStr = "0.00";
        if (thStr.equals("-0.00"))
            thStr = "0.00";
        if (mThStr.equals("-0.00"))
            mThStr = "0.00";
        if (mTxStr.equals("-0.00"))
            mTxStr = "0.00";
        if (mTyStr.equals("-0.00"))
            mTyStr = "0.00";

        // 不要な「0の移動」「実質0の回転 (0, 180, -180)」を文字列から除外するための処理
        boolean hasTranslation = !(txStr.equals("0.00") && tyStr.equals("0.00"));
        boolean hasRotation = !(thStr.equals("0.00") || thStr.equals("180.00") || thStr.equals("-180.00"));

        java.util.List<String> steps = new java.util.ArrayList<>();
        if (hasTranslation) {
            steps.add(String.format("T(%s,%s)", txStr, tyStr));
        }
        if (hasRotation) {
            steps.add(String.format("R(%s)", thStr));
        }

        steps.add("Ref(x)");

        if (hasRotation) {
            steps.add(String.format("R(%s)", mThStr));
        }
        if (hasTranslation) {
            steps.add(String.format("T(%s,%s)", mTxStr, mTyStr));
        }

        String text = String.join("→", steps);

        return new ReflectionResponse(text, tx, ty, -th, composed.toArray());
    }

    // ===== 3D API ===== //

    @PostMapping("/3d/compose-matrix")
    public Map<String, double[][]> composeMatrix3D(@RequestBody List<TransformCommand3D> commands) {
        Matrix4[] matrices = new Matrix4[commands.size()];
        for (int i = 0; i < commands.size(); i++) {
            matrices[i] = toMatrix4(commands.get(i));
        }
        Matrix4 composed = Matrix4Util.makeTransMatrix(matrices);
        return Collections.singletonMap("matrix", composed.toArray());
    }

    @PostMapping("/3d/draw")
    public DrawResponse3D draw3D(@RequestBody DrawRequest3D req) {
        Matrix4 M = Matrix4Util.identity();
        if (req.getTransforms() != null && !req.getTransforms().isEmpty()) {
            Matrix4[] matrices = new Matrix4[req.getTransforms().size()];
            for (int i = 0; i < req.getTransforms().size(); i++) {
                matrices[i] = toMatrix4(req.getTransforms().get(i));
            }
            M = Matrix4Util.makeTransMatrix(matrices);
        }

        List<Point3D> original;
        List<Point3D> transformed;

        switch (req.getShapeType()) {
            case "cuboid": {
                Point3D base = new Point3D(req.getX(), req.getY(), req.getZ());
                Cuboid cuboid = new Cuboid(req.getWidth(), req.getHeight(), req.getDepth(), base);
                original = cuboid.getVertexes();

                transformed = new ArrayList<>();
                for (Point3D p : original) {
                    transformed.add(M.apply(p));
                }
                break;
            }
            case "sphere": {
                Point3D base = new Point3D(req.getX(), req.getY(), req.getZ());
                Sphere sphere = new Sphere(req.getRx(), req.getRy(), req.getRz(), base);
                original = sphere.getVertexes();

                transformed = new ArrayList<>();
                for (Point3D p : original) {
                    transformed.add(M.apply(p));
                }
                break;
            }
            default:
                throw new IllegalArgumentException("Unknown shape type 3D: " + req.getShapeType());
        }

        return new DrawResponse3D(req.getShapeType(), original, transformed, req.getProjectionZ());
    }

    private Matrix4 toMatrix4(TransformCommand3D cmd) {
        switch (cmd.getType()) {
            case "translation":
                return Transform3D.translation(cmd.getTx(), cmd.getTy(), cmd.getTz());
            case "scale":
                return Transform3D.scale(cmd.getSx(), cmd.getSy(), cmd.getSz());
            case "rotationX":
                return Transform3D.rotationX(cmd.getThetaDeg());
            case "rotationY":
                return Transform3D.rotationY(cmd.getThetaDeg());
            case "rotationZ":
                return Transform3D.rotationZ(cmd.getThetaDeg());
            case "custom":
                return Transform3D.custom(cmd.getMatrix());
            default:
                throw new IllegalArgumentException("Unknown transform type 3D: " + cmd.getType());
        }
    }
}
