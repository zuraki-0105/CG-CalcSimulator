package com.example.CG_CalcSimulation.matrix4;

import java.util.ArrayList;
import java.util.List;

import com.example.CG_CalcSimulation.shape3D.Cuboid;
import com.example.CG_CalcSimulation.shape3D.Shapes3D;

public class ShapeTransformer3D {

    // 非破壊変換：新しい図形オブジェクトを返す
    @SuppressWarnings("unchecked")
    public static <T extends Shapes3D> T transformCopy(T shape, Matrix4 transformMatrix) {
        List<Point3D> newVertexes = new ArrayList<Point3D>();

        for (Point3D p : shape.getVertexes()) {
            newVertexes.add(transformMatrix.apply(p));
        }

        return (T) switch (shape.getType()) {
            case "Cuboid" -> new Cuboid(newVertexes);
            default -> throw new IllegalArgumentException("Unsupported shape type: " + shape.getType());
        };
    }

    // 破壊的変換：元の図形を書き換える
    public static void transformInPlace(Shapes3D shape, Matrix4 transformMatrix) {
        List<Point3D> newVertexes = new ArrayList<>();

        for (Point3D p : shape.getVertexes()) {
            newVertexes.add(transformMatrix.apply(p));
        }

        shape.setVertexes(newVertexes);
    }
}
