package com.example.CG_CalcSimulation.api;

public class ReflectionResponse {
    private String text;
    private double tx;
    private double ty;
    private double th;
    private double[][] matrix;

    public ReflectionResponse() {
    }

    public ReflectionResponse(String text, double tx, double ty, double th, double[][] matrix) {
        this.text = text;
        this.tx = tx;
        this.ty = ty;
        this.th = th;
        this.matrix = matrix;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public double getTx() {
        return tx;
    }

    public void setTx(double tx) {
        this.tx = tx;
    }

    public double getTy() {
        return ty;
    }

    public void setTy(double ty) {
        this.ty = ty;
    }

    public double getTh() {
        return th;
    }

    public void setTh(double th) {
        this.th = th;
    }

    public double[][] getMatrix() {
        return matrix;
    }

    public void setMatrix(double[][] matrix) {
        this.matrix = matrix;
    }
}
