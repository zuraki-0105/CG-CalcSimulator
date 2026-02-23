package com.example.CG_CalcSimulation.main;

import com.example.CG_CalcSimulation.gui.DrawingPane;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.stage.Stage;

public class MainTest extends Application{
	
	@Override
	public void start(Stage stage){
		try {
			DrawingPane root = new DrawingPane(Test.test2().get(0), Test.test2().get(1));
			
			Scene scene = new Scene(root, 600, 400);
			
			stage.setTitle("CG計算テスト表示");
			stage.setScene(scene);
			stage.show();
			
		} catch (Exception e) {
			System.err.println("=== ERROR ===");
			System.err.println(e.getClass().getSimpleName() + ": " + e.getMessage());
			e.printStackTrace(System.err);
		}
		
	}
	
	public static void main(String[] args) {
		launch(args);
	}
}
