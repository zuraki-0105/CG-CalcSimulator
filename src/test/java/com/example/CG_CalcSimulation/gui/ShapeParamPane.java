package com.example.CG_CalcSimulation.gui;

import com.example.CG_CalcSimulation.InputDataModel;
import com.example.CG_CalcSimulation.matrix3.Point2D;

import javafx.geometry.Insets;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.layout.VBox;

public class ShapeParamPane extends VBox {
	
	private InputDataModel model;
	
	// rectangle 用
    TextField fx = new TextField("0");
    TextField fy = new TextField("0");
    TextField fw = new TextField("1");
    TextField fh = new TextField("1");

    // circle / ellipse 用
    TextField cx = new TextField("0");
    TextField cy = new TextField("0");
    TextField fa = new TextField("1");
    TextField fb = new TextField("1");
    
    private int flag = 0;
    private String shapeType = "";

    public ShapeParamPane(InputController controller, InputDataModel model) {
    	this.model = model;

    	setSpacing(20);
        setPadding(new Insets(20));
        
        
        if(model.getShapeType() != null) {
        	shapeType = model.getShapeType();
        }
        Label title = new Label("Input Shape Parameters: " + shapeType);
        
        getChildren().add(title);

        // ================================
        // shapeType = rectangle
        // ================================
        if (shapeType.equals("Rectangle")) {
            Label lx = new Label("Base X (left-bottom):");
            Label ly = new Label("Base Y (left-bottom):");
            Label lw = new Label("Width:");
            Label lh = new Label("Height:");
            
            getChildren().addAll(lx, fx, ly, fy, lw, fw, lh, fh);
        }
        
        // ================================
        // shapeType = circle/ellipse
        // ================================
         else if(shapeType.equals("Circle/Ellipse")){
            Label lx = new Label("Center X:");
            Label ly = new Label("Center Y:");
            Label la = new Label("Semi-Major Axis (a):");
            Label lb = new Label("Semi-Minor Axis (b):");

            getChildren().addAll(lx, cx, ly, cy, la, fa, lb, fb);
        }
        
        Button nextBtn = new Button("Next");
        nextBtn.setOnAction(e -> {
        	if(flag == 0 && !this.isInputText()) {
        		Label err = new Label("入力不備があります!");
        		err.setStyle("-fx-text-fill: red;");
        		getChildren().add(err);
        		flag++;
        	}
        	
        	try {
        		if (shapeType.equals("Rectangle")) {
                    model.setBase(new Point2D(tryParse(fx.getText()), tryParse(fy.getText())));
                    model.setWidth(tryParse(fw.getText()));
                    model.setHeight(tryParse(fh.getText()));

                } else {
                    model.setCenter(new Point2D(tryParse(cx.getText()), tryParse(cy.getText())));
                    model.setSemiMajorA(tryParse(fa.getText()));
                    model.setSemiMinorB(tryParse(fb.getText()));
                }
			} catch (Exception e2) {
				throw new NullPointerException("入力不備");
			}
            

            controller.switchPane(new TransformPane(controller, model));
        });
        
        Button backBtn = new Button("Back");
        backBtn.setOnAction(e -> {
            controller.switchPane(new ShapeSelectPane(controller, model));
        });

        getChildren().addAll(nextBtn, backBtn);

    }
    // 数値変換用（空でも動く）
    private Double tryParse(String s) {
        try {
            return Double.parseDouble(s);
        } catch (Exception ex) {
            return null;
        }
    }
    
    private boolean isInputText() {
    	if(model.getShapeType().equals("Rectangle")) {
    		if(fx.getText().isEmpty() || fy.getText().isEmpty() ||
    			fw.getText().isEmpty() || fh.getText().isEmpty()) {
    			return false;
    		} else {
    			return true;
    		}
    	}
    	else {
    		if(cx.getText().isEmpty() || cy.getText().isEmpty() ||
        		fa.getText().isEmpty() || fb.getText().isEmpty()) {
        		return false;
        	} else {
        		return true;
        	}
    	}
    }
}

