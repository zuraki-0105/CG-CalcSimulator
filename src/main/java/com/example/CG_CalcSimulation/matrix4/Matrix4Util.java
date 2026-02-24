package com.example.CG_CalcSimulation.matrix4;

import org.ejml.data.DMatrixRMaj;
import org.ejml.dense.row.CommonOps_DDRM;

public class Matrix4Util {

    // 行列を操作の順番に掛けていって、変換行列を生成
    public static Matrix4 makeTransMatrix(Matrix4... transes) {
        Matrix4 mat = Matrix4Util.identity();
        for (Matrix4 m : transes) {
            mat = mat.multiply(m);
        }
        return mat;
    }

    // 単位行列生成
    public static Matrix4 identity() {
        DMatrixRMaj id = CommonOps_DDRM.identity(4);
        return new Matrix4(id);
    }
}
