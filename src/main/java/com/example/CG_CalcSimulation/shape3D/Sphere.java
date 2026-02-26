package com.example.CG_CalcSimulation.shape3D;

import java.util.ArrayList;
import java.util.List;

import com.example.CG_CalcSimulation.matrix4.Point3D;
import com.example.CG_CalcSimulation.util.ValidationUtil;

public class Sphere extends Shapes3D {
    private double rx; // x軸方向の半径
    private double ry; // y軸方向の半径
    private double rz; // z軸方向の半径
    private Point3D origin; // 中心点(cx, cy, cz)
    private int latitudes = 12; // 緯度の分割数
    private int longitudes = 24; // 経度の分割数

    public Sphere(double rx, double ry, double rz, Point3D origin) {
        ValidationUtil.requirePositive(rx, "rx");
        ValidationUtil.requirePositive(ry, "ry");
        ValidationUtil.requirePositive(rz, "rz");
        this.rx = rx;
        this.ry = ry;
        this.rz = rz;
        this.origin = origin;
        initVertices();
    }

    public Sphere(List<Point3D> vertexes) {
        this.vertexes = vertexes;
        // copy()用なので初期化時に中心点は厳密には復元できないが今回は描画のみのため許容
        if (vertexes != null && !vertexes.isEmpty()) {
            this.origin = new Point3D(0, 0, 0);
        }
    }

    private void initVertices() {
        // 球面のパラメータ方程式を用いて頂点を生成
        // x(θ,φ) = cx + rx * sin(θ) * cos(φ)
        // y(θ,φ) = cy + ry * cos(θ)
        // z(θ,φ) = cz + rz * sin(θ) * sin(φ)
        // θ(緯度角) は 0 から π、φ(経度角) は 0 から 2π

        for (int i = 0; i <= latitudes; i++) {
            double theta = i * Math.PI / latitudes;
            double sinTheta = Math.sin(theta);
            double cosTheta = Math.cos(theta);

            for (int j = 0; j <= longitudes; j++) {
                double phi = j * 2 * Math.PI / longitudes;
                double sinPhi = Math.sin(phi);
                double cosPhi = Math.cos(phi);

                double x = origin.x + rx * sinTheta * cosPhi;
                double y = origin.y + ry * cosTheta;
                double z = origin.z + rz * sinTheta * sinPhi;

                vertexes.add(new Point3D(x, y, z));
            }
        }
    }

    public double getRx() {
        return rx;
    }

    public double getRy() {
        return ry;
    }

    public double getRz() {
        return rz;
    }

    public Point3D getOrigin() {
        return origin;
    }

    @Override
    public String getType() {
        return "Sphere";
    }

    @Override
    public Shapes3D copy() {
        List<Point3D> copied = new ArrayList<>();
        for (Point3D p : vertexes) {
            copied.add(new Point3D(p.x, p.y, p.z));
        }
        return new Sphere(copied);
    }
}
