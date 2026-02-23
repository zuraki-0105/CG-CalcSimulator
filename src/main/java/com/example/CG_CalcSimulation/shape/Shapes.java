package com.example.CG_CalcSimulation.shape;

import java.util.ArrayList;
import java.util.List;

import com.example.CG_CalcSimulation.matrix3.Point2D;

public abstract class Shapes {
	protected List<Point2D> vertexes = new ArrayList<Point2D>();

	public List<Point2D> getVertexes() {
		return this.vertexes;
	}

	public void setVertexes(List<Point2D> newVertices) {
		this.vertexes = newVertices;
	}

	public abstract String getType();

	public abstract Shapes copy();

	public void printVertexes() {
		System.out.println(vertexes.size() + " vertexes of " + getType() + " :");
		for (Point2D p : vertexes) {
			System.out.print(p + " ");
		}
		System.out.print("\n");
	}

	@Override
	public String toString() {
		return getType() + " : " + vertexes.toString();
	}
}
