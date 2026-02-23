package com.example.CG_CalcSimulation;

import java.util.List;

public class DrawRequest {

    private String shapeType; // "rectangle" or "ellipse"

    // 矩形パラメータ
    private Double x;
    private Double y;
    private Double width;
    private Double height;

    // 楕円パラメータ
    private Double a; // 長半径
    private Double b; // 短半径

    // 変換リスト
    private List<TransformCommand> transforms;

    // ===== Getter & Setter ===== //

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

    public Double getA() {
        return a;
    }

    public void setA(Double a) {
        this.a = a;
    }

    public Double getB() {
        return b;
    }

    public void setB(Double b) {
        this.b = b;
    }

    public List<TransformCommand> getTransforms() {
        return transforms;
    }

    public void setTransforms(List<TransformCommand> transforms) {
        this.transforms = transforms;
    }
}
