package com.example.CG_CalcSimulation.matrix4;

import org.ejml.data.DMatrixRMaj;
import org.ejml.dense.row.CommonOps_DDRM;

public class Matrix4 {
    private DMatrixRMaj matrix;

    public Matrix4(double[][] values) {
        if (values.length != 4 || values[0].length != 4) {
            throw new IllegalArgumentException("4×4行列でなければなりません!");
        }
        this.matrix = new DMatrixRMaj(4, 4);

        for (int i = 0; i < 4; i++) {
            for (int j = 0; j < 4; j++) {
                matrix.set(i, j, values[i][j]);
            }
        }
    }

    public Matrix4(DMatrixRMaj m) {
        if (m.getNumRows() != 4 || m.getNumCols() != 4) {
            throw new IllegalArgumentException("4×4行列でなければなりません!");
        }
        this.matrix = m;
    }

    // 行列掛け算
    public Matrix4 multiply(Matrix4 mat2) {
        DMatrixRMaj result = new DMatrixRMaj(4, 4);
        CommonOps_DDRM.mult(mat2.matrix, matrix, result);
        return new Matrix4(result);
    }

    // 行列掛け算の逆方向
    public Matrix4 multiplyReverse(Matrix4 mat2) {
        DMatrixRMaj result = new DMatrixRMaj(4, 4);
        CommonOps_DDRM.mult(matrix, mat2.matrix, result);
        return new Matrix4(result);
    }

    // Point3D p に変換行列matrixを適用
    public Point3D apply(Point3D p) {
        double x = p.x;
        double y = p.y;
        double z = p.z;
        double w = 1.0;

        double newX = matrix.get(0, 0) * x + matrix.get(0, 1) * y + matrix.get(0, 2) * z + matrix.get(0, 3) * w;
        double newY = matrix.get(1, 0) * x + matrix.get(1, 1) * y + matrix.get(1, 2) * z + matrix.get(1, 3) * w;
        double newZ = matrix.get(2, 0) * x + matrix.get(2, 1) * y + matrix.get(2, 2) * z + matrix.get(2, 3) * w;

        return new Point3D(newX, newY, newZ);
    }

    // double[][] 形式で行列データを返す（JSON レスポンス用）
    public double[][] toArray() {
        double[][] result = new double[4][4];
        for (int i = 0; i < 4; i++) {
            for (int j = 0; j < 4; j++) {
                result[i][j] = matrix.get(i, j);
            }
        }
        return result;
    }

    // --- デバッグ表示 ---
    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("Matrix4:\n");
        for (int r = 0; r < 4; r++) {
            sb.append("[ ");
            for (int c = 0; c < 4; c++) {
                sb.append(String.format("%5.2f", matrix.get(r, c))).append(" ");
            }
            sb.append("]\n");
        }
        return sb.toString();
    }

    public void printMatrix() {
        matrix.print("%5.1f");
        System.out.println();
    }
}
