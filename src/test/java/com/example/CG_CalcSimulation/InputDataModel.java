package com.example.CG_CalcSimulation;

import java.util.ArrayList;
import java.util.List;

import com.example.CG_CalcSimulation.matrix3.Point2D;

public class InputDataModel {

    // 1. Dimension（2D/3D）
    private String dimension;


    // 2. Shape Type
    private String shapeType;


    // 3. Rectangle Parameters
    private Point2D base;
    private Double width;
    private Double height;


    // 4. Circle/Ellipse Parameters
    private Point2D center;
    private Double semiMajorA;  // a
    private Double semiMinorB;  // b


    // -------------------------
    // 5. Transform Parameters
    // -------------------------
    private Double translateX;
    private Double translateY;

    private Double scaleX;
    private Double scaleY;

    private Double rotateDeg;  // rotation angle in degree


    // 6. (Optional) Matrix3 (3×3)
    // Web連携のため List<double[]> 形式推奨
    private double[][] matrix3Elements;

    // 各同次行列の保存
    private List<TransformCommand> transformCommands = new ArrayList<TransformCommand>();

    // ========== Constructor ==========
    public InputDataModel() {}


    // ========== Getter & Setter ==========

    public String getDimension() {
        return dimension;
    }

    public void setDimension(String dimension) {
        this.dimension = dimension;
    }

    public String getShapeType() {
        return shapeType;
    }

    public void setShapeType(String shapeType) {
        this.shapeType = shapeType;
    }

    public Point2D getBase() {
        return base;
    }

    public void setBase(Point2D base) {
        this.base = base;
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

    public Point2D getCenter() {
        return center;
    }

    public void setCenter(Point2D center) {
        this.center = center;
    }

    public Double getSemiMajorA() {
        return semiMajorA;
    }

    public void setSemiMajorA(Double semiMajorAxis) {
        this.semiMajorA = semiMajorAxis;
    }

    public Double getSemiMinorB() {
        return semiMinorB;
    }

    public void setSemiMinorB(Double semiMinorAxis) {
        this.semiMinorB = semiMinorAxis;
    }

    public Double getTranslateX() {
        return translateX;
    }

    public void setTranslateX(Double translateX) {
        this.translateX = translateX;
    }

    public Double getTranslateY() {
        return translateY;
    }

    public void setTranslateY(Double translateY) {
        this.translateY = translateY;
    }

    public Double getScaleX() {
        return scaleX;
    }

    public void setScaleX(Double scaleX) {
        this.scaleX = scaleX;
    }

    public Double getScaleY() {
        return scaleY;
    }

    public void setScaleY(Double scaleY) {
        this.scaleY = scaleY;
    }

    public Double getRotateDeg() {
        return rotateDeg;
    }

    public void setRotateDeg(Double rotateDeg) {
        this.rotateDeg = rotateDeg;
    }

    public double[][] getMatrix3Elements() {
        return matrix3Elements;
    }

    public void setMatrix3Elements(double[][] matrix3Elements) {
        this.matrix3Elements = matrix3Elements;
    }
    
    public List<TransformCommand> getTransformCommands() {
        return transformCommands;
    }

    public void setTransformCommands(List<TransformCommand> trcmd) {
        this.transformCommands = trcmd;
    }
}

