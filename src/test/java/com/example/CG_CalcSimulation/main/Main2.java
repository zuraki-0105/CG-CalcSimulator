package com.example.CG_CalcSimulation.main;

import com.example.CG_CalcSimulation.matrix3.Matrix3;
import com.example.CG_CalcSimulation.matrix3.Matrix3Util;
import com.example.CG_CalcSimulation.matrix3.Point2D;
import com.example.CG_CalcSimulation.matrix3.ShapeTransformer;
import com.example.CG_CalcSimulation.matrix3.Transform;
import com.example.CG_CalcSimulation.shape.Ellipse;
import com.example.CG_CalcSimulation.shape.Shapes;

public class Main2 {

	public static void main(String[] args) {

		Ellipse e = new Ellipse(new Point2D(0, 0), 2, 1, 45);
		Matrix3 em1 = Transform.rotation(45);
		Matrix3 em2 = Transform.scale(2, 1);
		Matrix3 em = Matrix3Util.makeTransMatrix(em1, em2);
		e.printVertexes();
		System.out.println("e=" + e.getType());
		Shapes es = ShapeTransformer.transformCopy(e, em);
		System.out.println("es=" + es.getType());
		es.printVertexes();
	}

}
