package com.example.CG_CalcSimulation.main;
import java.util.ArrayList;
import java.util.List;

import com.example.CG_CalcSimulation.matrix3.Matrix3;
import com.example.CG_CalcSimulation.matrix3.Matrix3Util;
import com.example.CG_CalcSimulation.matrix3.Point2D;
import com.example.CG_CalcSimulation.matrix3.ShapeTransformer;
import com.example.CG_CalcSimulation.matrix3.Transform;
import com.example.CG_CalcSimulation.shape.Circle;
import com.example.CG_CalcSimulation.shape.Ellipse;
import com.example.CG_CalcSimulation.shape.Rectangle;
import com.example.CG_CalcSimulation.shape.Shapes;

public class Test {
	public static List<Shapes> test1(){
		
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
		
		List<Shapes> beforeAndAfter = new ArrayList<Shapes>();
		beforeAndAfter.add(rec1);
		beforeAndAfter.add(rec2);
		
		return beforeAndAfter;
		
	}
	
	public static List<Shapes> test2() {
		Ellipse ell = new Ellipse(new Point2D(0, 0), 2, 1, 0);
		Matrix3 em1 = Transform.translation(5, 3);
//		Matrix3 em2 = Transform.rotaition(30);
		Matrix3 em3 = Transform.scale(1, 2);
		Matrix3 em = Matrix3Util.makeTransMatrix(em1, em3);
		ell.printVertexes();
		System.out.println("e="+ell.getType());
		Shapes ellTr = ShapeTransformer.transformCopy(ell, em);
		System.out.println("es="+ellTr.getType());
		ellTr.printVertexes();
		
		List<Shapes> beforeAndAfter = new ArrayList<Shapes>();
		beforeAndAfter.add(ell);
		beforeAndAfter.add(ellTr);
		
		return beforeAndAfter;
	}
	
	public static List<Shapes> test3() {
		Circle cir = new Circle(new Point2D(0, 0), 1);
		Matrix3 m1 = Transform.translation(2, 1);
		Matrix3 m2 = Transform.rotation(60);
		Matrix3 m3 = Transform.scale(2, 1);
		
		Matrix3 mtr = Matrix3Util.makeTransMatrix(m1, m2, m3);
		Shapes trCir = ShapeTransformer.transformCopy(cir, mtr);
		
		System.out.println("cir="+cir.getType());
		cir.printVertexes();
		System.out.println("tr="+trCir.getType());
		trCir.printVertexes();
		
		List<Shapes> beforeAndAfter = new ArrayList<Shapes>();
		beforeAndAfter.add(cir);
		beforeAndAfter.add(trCir);
		
		return beforeAndAfter;
	}
}
