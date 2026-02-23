package com.example.CG_CalcSimulation.main;


import com.example.CG_CalcSimulation.matrix3.Matrix3;
import com.example.CG_CalcSimulation.matrix3.Matrix3Util;
import com.example.CG_CalcSimulation.matrix3.Point2D;
import com.example.CG_CalcSimulation.matrix3.ShapeTransformer;
import com.example.CG_CalcSimulation.matrix3.Transform;
import com.example.CG_CalcSimulation.shape.Rectangle;

public class Main {

	public static void main(String[] args) {
		Matrix3 mat1 = Transform.translation(3d/2, 0);
		Matrix3 mat2 = Transform.rotation(Math.toDegrees(Math.acos(3d/Math.sqrt(13))));
		Matrix3 mat3 = Transform.custom(
			new double[][]{
				{1, 0, 0},
				{0, -1, 0},
				{0, 0, 1}
			});
		Matrix3 mat4 = Transform.rotation(Math.toDegrees(-Math.acos(3d/Math.sqrt(13))));
		Matrix3 mat5 = Transform.translation(-3d/2, 0);
//		Matrix3 transfromMatrix = mat1.multiply(mat2).multiply(mat3).multiply(mat4).multiply(mat5);
		Matrix3 transformMatrix = Matrix3Util.makeTransMatrix(mat1, mat2, mat3, mat4, mat5);
		
		transformMatrix.printMatrix("% 5.5f");
		
		
		Rectangle rec1 = new Rectangle(2, 2, new Point2D(0, 0));
		Rectangle rec2 = (Rectangle) ShapeTransformer.transformCopy(rec1, transformMatrix);
		
		rec1.printVertexes();
		rec2.printVertexes();
		
//		double[][] points = {
//		        {0, 2, 2, 0},
//		        {0, 0, 2, 2},
//		        {1, 1, 1, 1}
//		    };
//	
//	
//		double[][] result = new double[3][4];
//		
//		
//		for (int i = 0; i < 4; i++) {
//			Point2D p = new Point2D(points[0][i], points[1][i]);
//			Point2D after = transfromMatrix.apply(p);
//			
//			result[0][i] = after.x;
//			result[1][i] = after.y;
//			result[2][i] = 1;
//		}
//		
//		for (int i = 0; i < 3; i++) {
//			for (int j = 0; j < 4; j++) {
//				System.out.printf("%8.5f ", result[i][j]);
//			}
//			System.out.println();
//		}
	}

}
