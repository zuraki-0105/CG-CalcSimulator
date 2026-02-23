package com.example.CG_CalcSimulation.gui;

import java.util.ArrayList;
import java.util.List;

import com.example.CG_CalcSimulation.InputDataModel;
import com.example.CG_CalcSimulation.TransformCommand;
import com.example.CG_CalcSimulation.matrix3.Matrix3;
import com.example.CG_CalcSimulation.matrix3.Matrix3Util;
import com.example.CG_CalcSimulation.matrix3.Point2D;
import com.example.CG_CalcSimulation.matrix3.ShapeTransformer;
import com.example.CG_CalcSimulation.matrix3.Transform;
import com.example.CG_CalcSimulation.shape.Circle;
import com.example.CG_CalcSimulation.shape.Ellipse;
import com.example.CG_CalcSimulation.shape.Rectangle;
import com.example.CG_CalcSimulation.shape.Shapes;

import javafx.geometry.Insets;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ScrollPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;

public class ConfirmPane extends VBox {
	
	private InputDataModel model;

    public ConfirmPane(InputController controller, InputDataModel model) {
    	this.model = model;
    	
    	setSpacing(15);
        setPadding(new Insets(20));

        Label title = new Label("Confirm Your Inputs");
        title.setStyle("-fx-font-size: 16px; -fx-font-weight: bold;");
        
        // ============ Dimension ============
        VBox dimBox   = new VBox(1, makeRow("Dimension   :  ", model.getDimension()));

        // ============ Shape Type ============
        String shape = model.getShapeType();
        if(shape.equals("Circle/Ellipse")) {
        	shape = (Math.abs(model.getSemiMajorA() - model.getSemiMinorB()) < 1e-16)
        	? "Circle" : "Ellipse";
        }
        VBox shapeBox = new VBox(1, makeRow("Shape Type  :  ", shape));

        // ============ Shape Parameters ============
        VBox shapeParamBox = new VBox(5);
        shapeParamBox.getChildren().add(new Label("Shape Parameters :  "));
//        System.out.println(model.getShapeType());
        
        switch (model.getShapeType()) {

            case "Rectangle":
            	
                shapeParamBox.getChildren().add(makeRow("Base X  :", "  "+model.getBase().x));
                shapeParamBox.getChildren().add(makeRow("Base Y  :", "  "+model.getBase().y));
                shapeParamBox.getChildren().add(makeRow("Width   :", "  "+model.getWidth()));
                shapeParamBox.getChildren().add(makeRow("Height  :", "  "+model.getHeight()));

                break;

            case "Circle/Ellipse":
            	
            	shapeParamBox.getChildren().add(makeRow("Center X             :", "  "+model.getCenter().x));
                shapeParamBox.getChildren().add(makeRow("Center Y             :", "  "+model.getCenter().y));
                shapeParamBox.getChildren().add(makeRow("Semi-Major Axis (a)  :", "  "+model.getSemiMajorA()));
                shapeParamBox.getChildren().add(makeRow("Semi-Minor Axis (b)  :", "  "+model.getSemiMinorB()));
                break;
        }

        // ============ Transform Commands ============
        VBox transformBox = new VBox(5);
        transformBox.getChildren().add(new Label("Transform Commands:"));

        for (TransformCommand cmd : model.getTransformCommands()) {

            switch (cmd.getType()) {

                case "translate":
                    transformBox.getChildren().add(
                    	boldLabel("  Translate (" + cmd.getTx() + ", " + cmd.getTy() + ")")
                    );
                    break;

                case "scale":
                    transformBox.getChildren().add(
                        boldLabel("  Scale (" + cmd.getSx() + ", " + cmd.getSy() + ")")
                    );
                    break;

                case "rotate":
                    transformBox.getChildren().add(
                        boldLabel("  Rotate " + cmd.getThetaDeg() + " deg")
                    );
                    break;
            }
        }

        // ============ 最終変換行列（まだ非表示） ============
        Label matrixLabel = new Label("Final transformation matrix  :");
        Matrix3 finalMat = calcMatrix();
        VBox finalMatVox = new VBox();
        finalMatVox.getChildren().add((boldLabel(finalMat.toString())));

        // ============ Buttons ============
        Button backBtn = new Button("Back");
        backBtn.setOnAction(e -> {
        	model.getTransformCommands().clear();
        	controller.switchPane(new TransformPane(controller, model));
        });

        Button nextBtn = new Button("Transform");
        nextBtn.setOnAction(e -> {
            // Matrix3 による変換
            controller.switchPane(new DrawingPane(transShape().get(0), transShape().get(1)));
        });
        
        VBox content = new VBox(15);
        content.getChildren().addAll(
            title,
            dimBox,
            shapeBox,
            shapeParamBox,
            transformBox,
            matrixLabel,
            finalMatVox,
            nextBtn,
            backBtn
        );

        ScrollPane scroll = new ScrollPane(content);
        scroll.setFitToWidth(true);
        
        getChildren().add(scroll);
    }
    
    private Label boldLabel(Object value) {
        Label lbl = new Label(String.valueOf(value));
        lbl.setStyle("-fx-font-weight: bold;");
        return lbl;
    }
    
    private HBox makeRow(String label, Object value) {
        Label l1 = new Label(label);
        Label l2 = new Label(String.valueOf(value));
        l2.setStyle("-fx-font-weight: bold;");

        HBox row = new HBox(10); // 行内のスペース
        row.getChildren().addAll(l1, l2);

        return row;
    }
    
    private Matrix3 calcMatrix() {
    	Matrix3 mat = Matrix3Util.identity();
    	
    	for(TransformCommand cmd : model.getTransformCommands()) {
    		if(cmd.getType().equals("translate")) {
    			Matrix3 m = Transform.translation(cmd.getTx(), cmd.getTy());
    			mat = mat.multiply(m);
    		} 
    		else if(cmd.getType().equals("scale")) {
    			Matrix3 m = Transform.scale(cmd.getSx(), cmd.getSy());
    			mat = mat.multiply(m);
    		} 
    		else if(cmd.getType().equals("rotate")) {
    			Matrix3 m = Transform.rotation(cmd.getThetaDeg());
    			mat = mat.multiply(m);
    		}
    	}
    	
    	return mat;
    }
    
    private List<Shapes> transShape(){
    	List<Shapes> beforeAndAfter = new ArrayList<Shapes>();
    	
    	switch (model.getShapeType()) {
    	
			case "Rectangle":
				Point2D base = model.getBase();
				double w = model.getWidth();
				double h = model.getHeight();
				
				Rectangle beforeRec = new Rectangle(w, h, base);
				Rectangle afterRec = (Rectangle) ShapeTransformer.transformCopy(beforeRec, calcMatrix());
				beforeAndAfter.add(beforeRec);
				beforeAndAfter.add(afterRec);
				
				break;
			
			case "Circle/Ellipse":
				Point2D center = model.getCenter();
				double a = model.getSemiMajorA();
				double b = model.getSemiMinorB();
				
				if(Math.abs(a - b) < 1e-16) {
					Circle beforeCir = new Circle(center, a);
					Shapes afterCir = ShapeTransformer.transformCopy(beforeCir, calcMatrix());
					beforeAndAfter.add(beforeCir);
					beforeAndAfter.add(afterCir);
				}
				else {
					Ellipse beforeEll = new Ellipse(center, a, b, 0);
					Shapes afterEll = ShapeTransformer.transformCopy(beforeEll, calcMatrix());
					beforeAndAfter.add(beforeEll);
					beforeAndAfter.add(afterEll);
				}
				
				break;
		}
		
		return beforeAndAfter;
		
	}
    
  }


