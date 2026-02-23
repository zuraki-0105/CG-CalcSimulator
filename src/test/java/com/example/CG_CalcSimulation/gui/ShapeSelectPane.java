package com.example.CG_CalcSimulation.gui;

import com.example.CG_CalcSimulation.InputDataModel;

import javafx.geometry.Insets;
import javafx.scene.control.Button;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Label;
import javafx.scene.layout.VBox;

public class ShapeSelectPane extends VBox {

    public static String selectedShape = "rectangle";

    public ShapeSelectPane(InputController controller, InputDataModel model) {
    	setSpacing(20);
        setPadding(new Insets(20));

        Label title = new Label("Select Shape");

        // ▼ プルダウン
        ComboBox<String> combo = new ComboBox<>();
        combo.getItems().addAll("Rectangle", "Circle/Ellipse");
        combo.setValue("Rectangle"); // デフォルト

        // Next ボタン
        Button nextBtn = new Button("Next");
        nextBtn.setOnAction(e -> {
            String shape = combo.getValue();
            if(shape.equals("Circle/Ellipse")) model.setShapeType("Circle/Ellipse");
            else model.setShapeType(shape);
            
            // 図形に応じて ShapeParamPane へ遷移
            controller.switchPane(new ShapeParamPane(controller, model));
        });
        
        
        // Back ボタン
        Button backBtn = new Button("Back");
        backBtn.setOnAction(e -> {
            controller.switchPane(new DimensionPane(controller, model));
        });

        getChildren().addAll(title, combo, nextBtn, backBtn);
    } 
}

