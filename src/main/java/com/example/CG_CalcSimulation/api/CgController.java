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

@RestController
@RequestMapping("/api/2d")
public class CgController {

    /**
     * 変換コマンドのリストを受け取り、合成変換行列を返す
     */
    @PostMapping("/compose-matrix")
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
    @PostMapping("/draw")
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
}
