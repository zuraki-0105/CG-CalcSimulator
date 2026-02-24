package com.example.CG_CalcSimulation.api;

import java.util.List;
import com.example.CG_CalcSimulation.matrix4.Point3D;

public class DrawResponse3D {
    private String shapeType;
    private List<Point3D> original;
    private List<Point3D> transformed;
    private Double projectionZ;

    public DrawResponse3D() {
    }

    public DrawResponse3D(String shapeType, List<Point3D> original, List<Point3D> transformed, Double projectionZ) {
        this.shapeType = shapeType;
        this.original = original;
        this.transformed = transformed;
        this.projectionZ = projectionZ;
    }

    public String getShapeType() {
        return shapeType;
    }

    public void setShapeType(String shapeType) {
        this.shapeType = shapeType;
    }

    public List<Point3D> getOriginal() {
        return original;
    }

    public void setOriginal(List<Point3D> original) {
        this.original = original;
    }

    public List<Point3D> getTransformed() {
        return transformed;
    }

    public void setTransformed(List<Point3D> transformed) {
        this.transformed = transformed;
    }

    public Double getProjectionZ() {
        return projectionZ;
    }

    public void setProjectionZ(Double projectionZ) {
        this.projectionZ = projectionZ;
    }
}
