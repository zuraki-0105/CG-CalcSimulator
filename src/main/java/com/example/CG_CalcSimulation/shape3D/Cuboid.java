package com.example.CG_CalcSimulation.shape3D;

import java.util.ArrayList;
import java.util.List;

import com.example.CG_CalcSimulation.matrix4.Point3D;
import com.example.CG_CalcSimulation.util.ValidationUtil;

public class Cuboid extends Shapes3D {
    private double width; // 幅 (x方向)
    private double height; // 高さ (y方向)
    private double depth; // 奥行き (z方向)
    private Point3D origin; // 基準点 (例: 左下奥など)

    public Cuboid(double width, double height, double depth, Point3D origin) {
        ValidationUtil.requirePositive(width, "width");
        ValidationUtil.requirePositive(height, "height");
        ValidationUtil.requirePositive(depth, "depth");
        // requireValidPoint for Point3D should be added to ValidationUtil later
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.origin = origin;
        initVertices(width, height, depth, origin);
    }

    public Cuboid(List<Point3D> vertexes) {
        this.vertexes = vertexes;
        if (vertexes != null && vertexes.size() > 0) {
            this.origin = new Point3D(vertexes.get(0).x, vertexes.get(0).y, vertexes.get(0).z);
        }
    }

    private void initVertices(double w, double h, double d, Point3D org) {
        // z = org.z (前面)
        vertexes.add(new Point3D(org.x, org.y, org.z)); // 0: 左下前
        vertexes.add(new Point3D(org.x + w, org.y, org.z)); // 1: 右下前
        vertexes.add(new Point3D(org.x + w, org.y + h, org.z)); // 2: 右上前
        vertexes.add(new Point3D(org.x, org.y + h, org.z)); // 3: 左上前

        // z = org.z + d (背面)
        vertexes.add(new Point3D(org.x, org.y, org.z + d)); // 4: 左下後
        vertexes.add(new Point3D(org.x + w, org.y, org.z + d)); // 5: 右下後
        vertexes.add(new Point3D(org.x + w, org.y + h, org.z + d)); // 6: 右上後
        vertexes.add(new Point3D(org.x, org.y + h, org.z + d)); // 7: 左上後
    }

    public double getWidth() {
        return width;
    }

    public double getHeight() {
        return height;
    }

    public double getDepth() {
        return depth;
    }

    public Point3D getOrigin() {
        return origin;
    }

    @Override
    public String getType() {
        return "Cuboid";
    }

    @Override
    public Shapes3D copy() {
        List<Point3D> copied = new ArrayList<>();
        for (Point3D p : vertexes) {
            copied.add(new Point3D(p.x, p.y, p.z));
        }
        return new Cuboid(copied);
    }
}
