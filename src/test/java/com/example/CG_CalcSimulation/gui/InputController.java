package com.example.CG_CalcSimulation.gui;

import com.example.CG_CalcSimulation.InputDataModel;

import javafx.scene.Parent;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.Pane;

public class InputController {

    private BorderPane root;

    // 入力データ保持用（dimension, shapeType, params, matrix...）
    private InputDataModel model;

    // 各Pane
    private DimensionPane dimensionPane;

    public InputController() {
        root = new BorderPane();
        model = new InputDataModel();

        dimensionPane = new DimensionPane(this, model);
//        shapeSelectPane = new ShapeSelectPane(this, model);
//        shapeParamPane = new ShapeParamPane(this, model);
//        transformPane = new TransformPane(this, model);
//        confirmPane = new ConfirmPane(this, model);
//        drawingPane = new DrawingPane();

        // 最初の画面
        switchPane(dimensionPane);
    }

    public void switchPane(Pane nextPane) {
        root.setCenter(nextPane);
    }

    public Parent getView() {
        return root;
    }
}
