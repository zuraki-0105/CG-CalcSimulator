package com.example.CG_CalcSimulation.api;

import java.util.List;

public class DrawRequest3D {

    private String shapeType; // "cuboid"

    // Cuboid params
    private Double x;
    private Double y;
    private Double z;
    private Double width;
    private Double height;
    private Double depth;

    // Projection target Z
    private Double projectionZ;

    // Transforms
    private List<TransformCommand3D> transforms;

    public String getShapeType() {
        return shapeType;
    }

    public void setShapeType(String shapeType) {
        this.shapeType = shapeType;
    }

    public Double getX() {
        return x;
    }

    public void setX(Double x) {
        this.x = x;
    }

    public Double getY() {
        return y;
    }

    public void setY(Double y) {
        this.y = y;
    }

    public Double getZ() {
        return z;
    }

    public void setZ(Double z) {
        this.z = z;
    }

    public Double getWidth() {
        return width;
    }

    public void setWidth(Double width) {
        this.width = width;
    }

    public Double getHeight() {
        return height;
    }

    public void setHeight(Double height) {
        this.height = height;
    }

    public Double getDepth() {
        return depth;
    }

    public void setDepth(Double depth) {
        this.depth = depth;
    }

    public Double getProjectionZ() {
        return projectionZ;
    }

    public void setProjectionZ(Double projectionZ) {
        this.projectionZ = projectionZ;
    }

    public List<TransformCommand3D> getTransforms() {
        return transforms;
    }

    public void setTransforms(List<TransformCommand3D> transforms) {
        this.transforms = transforms;
    }
}
