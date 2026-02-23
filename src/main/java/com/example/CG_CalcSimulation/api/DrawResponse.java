package com.example.CG_CalcSimulation.api;

import java.util.List;
import com.example.CG_CalcSimulation.matrix3.Point2D;

public class DrawResponse {

    private String shapeType;
    private List<Point2D> original;
    private List<Point2D> transformed;

    public DrawResponse() {
    }

    public DrawResponse(String shapeType, List<Point2D> original, List<Point2D> transformed) {
        this.shapeType = shapeType;
        this.original = original;
        this.transformed = transformed;
    }

    // ===== Getter & Setter ===== //

    public String getShapeType() {
        return shapeType;
    }

    public void setShapeType(String shapeType) {
        this.shapeType = shapeType;
    }

    public List<Point2D> getOriginal() {
        return original;
    }

    public void setOriginal(List<Point2D> original) {
        this.original = original;
    }

    public List<Point2D> getTransformed() {
        return transformed;
    }

    public void setTransformed(List<Point2D> transformed) {
        this.transformed = transformed;
    }
}
