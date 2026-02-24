package com.example.CG_CalcSimulation.matrix4;

import com.example.CG_CalcSimulation.util.ValidationUtil;

public class Transform3D {

    // 平行移動行列
    public static Matrix4 translation(double tx, double ty, double tz) {
        double[][] values = {
                { 1, 0, 0, tx },
                { 0, 1, 0, ty },
                { 0, 0, 1, tz },
                { 0, 0, 0, 1 }
        };
        return new Matrix4(values);
    }

    // 拡大縮小行列
    public static Matrix4 scale(double sx, double sy, double sz) {
        ValidationUtil.requirePositive(sx, "sx");
        ValidationUtil.requirePositive(sy, "sy");
        ValidationUtil.requirePositive(sz, "sz");
        double[][] values = {
                { sx, 0, 0, 0 },
                { 0, sy, 0, 0 },
                { 0, 0, sz, 0 },
                { 0, 0, 0, 1 }
        };
        return new Matrix4(values);
    }

    // X軸回転行列
    public static Matrix4 rotationX(double deg) {
        double cos = Math.cos(Math.toRadians(deg));
        double sin = Math.sin(Math.toRadians(deg));

        double[][] values = {
                { 1, 0, 0, 0 },
                { 0, cos, -sin, 0 },
                { 0, sin, cos, 0 },
                { 0, 0, 0, 1 }
        };
        return new Matrix4(values);
    }

    // Y軸回転行列
    public static Matrix4 rotationY(double deg) {
        double cos = Math.cos(Math.toRadians(deg));
        double sin = Math.sin(Math.toRadians(deg));

        double[][] values = {
                { cos, 0, sin, 0 },
                { 0, 1, 0, 0 },
                { -sin, 0, cos, 0 },
                { 0, 0, 0, 1 }
        };
        return new Matrix4(values);
    }

    // Z軸回転行列
    public static Matrix4 rotationZ(double deg) {
        double cos = Math.cos(Math.toRadians(deg));
        double sin = Math.sin(Math.toRadians(deg));

        double[][] values = {
                { cos, -sin, 0, 0 },
                { sin, cos, 0, 0 },
                { 0, 0, 1, 0 },
                { 0, 0, 0, 1 }
        };
        return new Matrix4(values);
    }

    // 任意の行列
    public static Matrix4 custom(double[][] values) {
        return new Matrix4(values);
    }
}
