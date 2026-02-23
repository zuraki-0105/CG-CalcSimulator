package com.example.CG_CalcSimulation.gui;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.stage.Stage;

public class MainApp extends Application {

    @Override
    public void start(Stage stage) throws Exception {

        InputController controller = new InputController();

        Scene scene = new Scene(controller.getView(), 800, 600);
        stage.setScene(scene);
        stage.setTitle("CG Calc GUI");
        stage.show();
    }

    public static void main(String[] args) {
    	System.out.println("MainApp Start");
        launch(args);
    }
}

