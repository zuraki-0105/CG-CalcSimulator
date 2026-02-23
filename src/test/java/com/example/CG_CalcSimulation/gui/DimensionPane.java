package com.example.CG_CalcSimulation.gui;

import com.example.CG_CalcSimulation.InputDataModel;

import javafx.geometry.Insets;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.RadioButton;
import javafx.scene.control.ToggleGroup;
import javafx.scene.layout.VBox;

public class DimensionPane extends VBox {

//    private InputController controller;
//    private InputDataModel model;

    public DimensionPane(InputController controller, InputDataModel model) {
//        this.controller = controller;
//        this.model = model;

        setSpacing(20);
        setPadding(new Insets(20));

        Label title = new Label("Select Dimension");

        // ラジオボタン
        ToggleGroup tg = new ToggleGroup();

        RadioButton rb2D = new RadioButton("2D");
        rb2D.setToggleGroup(tg);
        rb2D.setSelected(true);     // デフォルトを2D

        RadioButton rb3D = new RadioButton("3D");
        rb3D.setToggleGroup(tg);

        // Nextボタン
        Button nextBtn = new Button("Next");
        nextBtn.setOnAction(e -> {
            String selected = rb2D.isSelected() ? "2D" : "3D";

            // モデルに保存
            model.setDimension(selected);
            
            // 次の画面へ遷移
            if(selected.equals("2D")) {
            	controller.switchPane(new ShapeSelectPane(controller, model));
            }
            
        });

        getChildren().addAll(title, rb2D, rb3D, nextBtn);
    }
}
