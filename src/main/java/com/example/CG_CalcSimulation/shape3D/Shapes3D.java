package com.example.CG_CalcSimulation.shape3D;

import java.util.ArrayList;
import java.util.List;

import com.example.CG_CalcSimulation.matrix4.Point3D;

public abstract class Shapes3D {
    protected List<Point3D> vertexes = new ArrayList<Point3D>();

    public List<Point3D> getVertexes() {
        return this.vertexes;
    }

    public void setVertexes(List<Point3D> newVertices) {
        this.vertexes = newVertices;
    }

    public abstract String getType();

    public abstract Shapes3D copy();

    public void printVertexes() {
        System.out.println(vertexes.size() + " vertexes of " + getType() + " :");
        for (Point3D p : vertexes) {
            System.out.print(p + " ");
        }
        System.out.print("\n");
    }

    @Override
    public String toString() {
        return getType() + " : " + vertexes.toString();
    }
}
