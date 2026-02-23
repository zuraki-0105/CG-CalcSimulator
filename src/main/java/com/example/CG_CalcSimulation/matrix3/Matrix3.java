package com.example.CG_CalcSimulation.matrix3;

import org.ejml.data.DMatrixRMaj;
import org.ejml.dense.row.CommonOps_DDRM;

public class Matrix3 {
	private DMatrixRMaj matrix;

	public Matrix3(double[][] values) {
		if (values.length != 3 || values[0].length != 3) {
			throw new IllegalArgumentException("3×3行列でなければなりません!");
		}
		this.matrix = new DMatrixRMaj(3, 3);

		for (int i = 0; i < 3; i++) {
			for (int j = 0; j < 3; j++) {
				matrix.set(i, j, values[i][j]);
			}
		}
	}

	public Matrix3(DMatrixRMaj m) {
		if (m.getNumCols() != 3 || m.getNumCols() != 3) {
			throw new IllegalArgumentException("3×3行列でなければなりません!");
		}
		this.matrix = m;
	}

	// 行列掛け算
	public Matrix3 multiply(Matrix3 mat2) {
		DMatrixRMaj result = new DMatrixRMaj(3, 3);
		// CommonOps_DDRM.mult(A, B, C); C = A * B
		// つまり、操作の順番はB→A
		// 今回は matrix → mat2.matrix の順番
		CommonOps_DDRM.mult(mat2.matrix, matrix, result);
		return new Matrix3(result);
	}

	// 行列掛け算の逆方向
	public Matrix3 multiplyReverse(Matrix3 mat2) {
		DMatrixRMaj result = new DMatrixRMaj(3, 3);
		CommonOps_DDRM.mult(matrix, mat2.matrix, result);
		return new Matrix3(result);
	}

	// Point2D p に変換行列matrixを適用
	public Point2D apply(Point2D p) {
		double x = p.x;
		double y = p.y;
		double w = 1.0;

		double newX = matrix.get(0, 0) * x + matrix.get(0, 1) * y + matrix.get(0, 2) * w;
		double newY = matrix.get(1, 0) * x + matrix.get(1, 1) * y + matrix.get(1, 2) * w;

		return new Point2D(newX, newY); // 返還後の座標を返す
	}

	// double[][] 形式で行列データを返す（JSON レスポンス用）
	public double[][] toArray() {
		double[][] result = new double[3][3];
		for (int i = 0; i < 3; i++) {
			for (int j = 0; j < 3; j++) {
				result[i][j] = matrix.get(i, j);
			}
		}
		return result;
	}

	// --- デバッグ表示 ---
	@Override
	public String toString() {

		StringBuilder sb = new StringBuilder();
		sb.append("Matrix3:\n");
		for (int r = 0; r < 3; r++) {
			sb.append("[ ");
			for (int c = 0; c < 3; c++) {
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

	public void printMatrix(int num) {
		matrix.print("%5." + String.format("%d", num) + "f");
		System.out.println();
	}

	public void printMatrix(String format) {
		matrix.print(format);
		System.out.println();
	}
}
