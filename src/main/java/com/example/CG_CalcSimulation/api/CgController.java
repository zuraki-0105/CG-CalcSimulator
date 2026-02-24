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
