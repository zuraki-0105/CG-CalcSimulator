package com.example.CG_CalcSimulation.api;

public class TransformCommand3D {
    private String type = ""; // "translation", "scale", "rotationX", "rotationY", "rotationZ", "custom"

    private Double tx = 0d;
    private Double ty = 0d;
    private Double tz = 0d;

    private Double sx = 1d;
    private Double sy = 1d;
    private Double sz = 1d;

    private Double thetaDeg = 0d;

    private double[][] matrix; // custom matrix (4x4)

    public TransformCommand3D() {
    }

    // getters and setters

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Double getTx() {
        return tx;
    }

    public void setTx(Double tx) {
        this.tx = tx;
    }

    public Double getTy() {
        return ty;
    }

    public void setTy(Double ty) {
        this.ty = ty;
    }

    public Double getTz() {
        return tz;
    }

    public void setTz(Double tz) {
        this.tz = tz;
    }

    public Double getSx() {
        return sx;
    }

    public void setSx(Double sx) {
        this.sx = sx;
    }

    public Double getSy() {
        return sy;
    }

    public void setSy(Double sy) {
        this.sy = sy;
    }

    public Double getSz() {
        return sz;
    }

    public void setSz(Double sz) {
        this.sz = sz;
    }

    public Double getThetaDeg() {
        return thetaDeg;
    }

    public void setThetaDeg(Double thetaDeg) {
        this.thetaDeg = thetaDeg;
    }

    public double[][] getMatrix() {
        return matrix;
    }

    public void setMatrix(double[][] matrix) {
        this.matrix = matrix;
    }
}
