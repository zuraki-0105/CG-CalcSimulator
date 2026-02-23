package com.example.CG_CalcSimulation.api;

public class TransformCommand {

    private String type = ""; // "translate", "scale", "rotate"

    private Double tx = 0d; // translate X
    private Double ty = 0d; // translate Y

    private Double sx = 1d; // scale X
    private Double sy = 1d; // scale Y

    private Double thetaDeg = 0d; // rotation angle (degree)

    private double[][] matrix; // custom matrix (3×3)

    public TransformCommand() {
        // デフォルトコンストラクタ（JSON用）
    }

    // 各種変換ごとの便利コンストラクタ
    public static TransformCommand translate(double tx, double ty) {
        TransformCommand cmd = new TransformCommand();
        cmd.type = "translate";
        cmd.tx = tx;
        cmd.ty = ty;
        return cmd;
    }

    public static TransformCommand scale(double sx, double sy) {
        TransformCommand cmd = new TransformCommand();
        cmd.type = "scale";
        cmd.sx = sx;
        cmd.sy = sy;
        return cmd;
    }

    public static TransformCommand rotate(double thetaDeg) {
        TransformCommand cmd = new TransformCommand();
        cmd.type = "rotate";
        cmd.thetaDeg = thetaDeg;
        return cmd;
    }

    // ===== Getter & Setter ===== //

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
