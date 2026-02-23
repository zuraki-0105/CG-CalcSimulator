package com.example.CG_CalcSimulation.gui;

import java.util.ArrayList;
import java.util.List;

import com.example.CG_CalcSimulation.matrix3.Point2D;
import com.example.CG_CalcSimulation.shape.Circle;
import com.example.CG_CalcSimulation.shape.Ellipse;
import com.example.CG_CalcSimulation.shape.Shapes;

import javafx.scene.canvas.Canvas;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;

public class DrawingPane extends Pane {
	
	private Canvas canvas;
	private GraphicsContext gc;
	
	private Shapes before, after;
	private List<Point2D> befoVertex, aftVertex;
	
	// 画面上の中心（パン操作で変化）
	private double offsetX = 0;
	private double offsetY = 0;

	// ドラッグ開始位置
	private double dragStartX;
	private double dragStartY;
	
	private int W = 800;
	private int H = 600;
	
	public DrawingPane() {
		
	}
	public DrawingPane(Shapes before, Shapes after) {
		this.before = before; //Ellipse
		this.after = after; //Circle
		this.befoVertex = before.getVertexes();
		this.aftVertex = after.getVertexes();
		
		canvas = new Canvas(W, H);
		gc = canvas.getGraphicsContext2D();// pen
		this.getChildren().add(canvas);
		drawAll();
		
		
		// ----- パン操作 -----
		canvas.setOnMousePressed(e -> {
			dragStartX = e.getX();
			dragStartY = e.getY();
		});
		
		canvas.setOnMouseDragged(e -> {
			double dx = e.getX() - dragStartX;
			double dy = e.getY() - dragStartY;
			
			offsetX += dx;
			offsetY += dy;
			
			dragStartX = e.getX();
			dragStartY = e.getY();
			
			// 再描画
			drawAll();
		});
		
	}
	
	private void drawAll() {
		gc.clearRect(0, 0, W, H);
		
		// スケールと中心を計算
		ChangeScaleCalc tr = calcPoints(after);
		
		// 軸 → 線 → 点 の順に描画
		drawAxis(tr);
		switch(before.getType()) {
			case "Rectangle" :
				drawLines(befoVertex, tr);
				drawPoints(befoVertex, tr);
				break;
				
			case "Circle" :
				drawCircle((Circle) before, tr);
				drawPoints(befoVertex, tr);
				break;
				
			case "Ellipse" :
				drawEllipse((Ellipse) before, tr);
				drawPoints(befoVertex, tr);
				break;
				
			default : throw new IllegalArgumentException("Unsupported shape type: " + this.before.getType());
		}
		
		switch(after.getType()) {
			case "Rectangle" :
				drawLines(aftVertex, tr);
				drawPoints(aftVertex, tr);
				break;
				
			case "Circle" :
				drawCircle((Circle) after, tr);
				drawPoints(aftVertex, tr);
				break;
				
			case "Ellipse" :
				drawEllipse((Ellipse) after, tr);
				drawPoints(aftVertex, tr);
				break;
				
			default : throw new IllegalArgumentException("Unsupported shape type: " + this.before.getType());
		}
 	}
	
	private static class ChangeScaleCalc {
		double scale;
		double centerX;
		double centerY;
		double cx; // 点群の中心x
		double cy; // 点群の中心y
		
		ChangeScaleCalc(double scale, double centerX, double centerY, double cx, double cy) {
			this.scale = scale;
			this.centerX = centerX;
			this.centerY = centerY;
			this.cx = cx;
			this.cy = cy;
		}
	}
	
	// 代表の図形を基準にスケーリング
	private ChangeScaleCalc calcPoints(Shapes shape) {
		List<Point2D> pts = new ArrayList<Point2D>();
		for (Point2D p : shape.getVertexes()) {
			pts.add(new Point2D(p.x, p.y));
		}
		
		if(shape.getType().equals("Circle")) {
			double r = ((Circle) shape).getRadius();
			Point2D o = pts.get(0);
			pts.add(new Point2D(o.x + r, o.y));
			pts.add(new Point2D(o.x, o.y - r));
			pts.add(new Point2D(o.x - r, o.y));
			pts.add(new Point2D(o.x, o.y + r));
		} 
		else if(shape.getType().equals("Ellipse")) {
			double a = ((Ellipse) shape).getA();
			double b = ((Ellipse) shape).getB();
			Point2D o = pts.get(0);
			pts.add(new Point2D(o.x + a, o.y));
			pts.add(new Point2D(o.x, o.y - b));
			pts.add(new Point2D(o.x - a, o.y));
			pts.add(new Point2D(o.x, o.y + b));
		}
		// --- ① min/max 計算 ---
		double minX = Double.MAX_VALUE, maxX = -Double.MAX_VALUE;
		double minY = Double.MAX_VALUE, maxY = -Double.MAX_VALUE;
		
		for (Point2D p : pts) {
			minX = Math.min(minX, p.x);
			maxX = Math.max(maxX, p.x);
			minY = Math.min(minY, p.y);
			maxY = Math.max(maxY, p.y);
		}
		
		// --- ② スケール自動計算 ---
		double rangeX = maxX - minX;
		double rangeY = maxY - minY;
		
		double scaleX = (W * 0.2) / rangeX;
		double scaleY = (H * 0.2) / rangeY;
		
		double scale = Math.min(scaleX, scaleY);
		
		
		// --- ③ 中心移動（数学 → Canvas）---
		double cx = (maxX + minX) / 2;
		double cy = (maxY + minY) / 2;
		
		double centerX = W / 2;
		double centerY = H / 2;
		
		return new ChangeScaleCalc(scale, centerX, centerY, cx, cy);
	}
	
	private void drawLines(List<Point2D> pts, ChangeScaleCalc tr) {
		gc.setLineWidth(3);
		gc.setFill(Color.BLACK);
		
		for (int i = 0; i < pts.size() - 1; i++) {
			drawLineBetween(pts.get(i), pts.get(i + 1), tr);
		}
		
		// 最後と最初を結んで閉じる
		drawLineBetween(pts.get(pts.size() - 1), pts.get(0), tr);
	}
	
	// --- 頂点同士を線で結ぶ（ポリライン） ---
	private void drawLineBetween(Point2D a, Point2D b, ChangeScaleCalc tr) {
		double ax = (a.x - tr.cx) * tr.scale + tr.centerX + offsetX;
		double ay = -(a.y - tr.cy) * tr.scale + tr.centerY + offsetY;
		double bx = (b.x - tr.cx) * tr.scale + tr.centerX + offsetX;
		double by = -(b.y - tr.cy) * tr.scale + tr.centerY + offsetY;
		
		gc.strokeLine(ax, ay, bx, by);
	}
	
	// --- ④ 描画 ---
	private void drawPoints(List<Point2D> pts, ChangeScaleCalc tr) {
		gc.setFill(Color.RED);
		double diameter = 6d;
		
		for (Point2D p : pts) {
			double sx = (p.x - tr.cx) * tr.scale + tr.centerX + offsetX;
			double sy = -(p.y - tr.cy) * tr.scale + tr.centerY + offsetY;
			gc.fillOval(sx - diameter/2, sy - diameter/2, diameter, diameter);
		}
	}
	
	private void drawCircle(Circle cir, ChangeScaleCalc tr) {
		double cx = (cir.getCenter().x - tr.cx) * tr.scale + tr.centerX + offsetX;
		double cy = -(cir.getCenter().y - tr.cy) * tr.scale + tr.centerY + offsetY;
		
		double r = cir.getRadius() * tr.scale;
		
		gc.setStroke(Color.BLACK);
		gc.setLineWidth(3);
		gc.strokeOval(cx - r, cy - r, r * 2, r * 2);
	}
	
	private void drawEllipse(Ellipse ell, ChangeScaleCalc tr) {
		gc.save();  // 回転があるので座標系を保存
		
		// ---- 楕円中心のスクリーン座標 ----
		double cx = (ell.getCenter().x - tr.cx) * tr.scale + tr.centerX + offsetX;
		double cy = -(ell.getCenter().y - tr.cy) * tr.scale + tr.centerY + offsetY;
		   
		// ---- Canvas 座標系を楕円中心へ移動 ----
		gc.translate(cx, cy);
		
		// ---- 回転角 theta（Ellips クラスは「度」扱いが自然）----
		double angleDeg = Math.toDegrees(ell.getTheta());
		gc.rotate(-angleDeg);  // JavaFXはY軸が下向きなので符号反転
		
		// ---- スケール適用した長半径・短半径 ----
		double rx = ell.getA() * tr.scale;   // 長半径
		double ry = ell.getB() * tr.scale;   // 短半径
		
		// ---- 描画（中心基準で -rx, -ry に置く）----
		gc.setStroke(Color.BLACK);
		gc.setLineWidth(3);
		gc.strokeOval(-rx, -ry, rx * 2, ry * 2);
		
		gc.restore();
	}

	
	private double toScreenX(double x, ChangeScaleCalc tr) {
		return (x - tr.cx) * tr.scale + tr.centerX + offsetX;
	}
	
	private double toScreenY(double y, ChangeScaleCalc tr) {
		return -(y - tr.cy) * tr.scale + tr.centerY + offsetY;
	}
	
	private void drawAxis(ChangeScaleCalc tr) {
		gc.setStroke(Color.GRAY.brighter());
		gc.setLineWidth(1.0);
		
		// ---- x = 0 の縦線 ----
		double x0 = toScreenX(0, tr);
		gc.strokeLine(x0, 0, x0, H);
		
		// ---- y = 0 の横線 ----
		double y0 = toScreenY(0, tr);
		gc.strokeLine(0, y0, W, y0);
	}


}
