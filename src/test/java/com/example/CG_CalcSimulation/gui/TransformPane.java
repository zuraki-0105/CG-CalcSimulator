package com.example.CG_CalcSimulation.gui;

import com.example.CG_CalcSimulation.InputDataModel;
import com.example.CG_CalcSimulation.TransformCommand;

import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Label;
import javafx.scene.control.ListView;
import javafx.scene.control.TextField;
import javafx.scene.layout.VBox;

public class TransformPane extends VBox {
	

    TextField tx = new TextField();
    TextField ty = new TextField();
    TextField sx = new TextField("1");
    TextField sy = new TextField("1");
    TextField th = new TextField();

    public TransformPane(InputController controller, InputDataModel model) {
    	
        setSpacing(20);
        setAlignment(Pos.CENTER);
        
        
        Label title = new Label("Add Transformation Commands");
        
        // 変換タイプ選択プルダウン
        ComboBox<String> typeCombo = new ComboBox<>();
        typeCombo.getItems().addAll("translate", "scale", "rotate");
        typeCombo.setValue("translate");
        
        // パラメータ入力用の領域（切り替え表示）
        VBox paramBox = new VBox(10);
        
     // 最初は translate を表示
        updateParamBox(paramBox, "translate", tx, ty, sx, sy, th);

        // プルダウン変更時に入力欄を切り替える
        typeCombo.setOnAction(e -> {
            updateParamBox(paramBox, typeCombo.getValue(), tx, ty, sx, sy, th);
        });
        
        
        

        // 変換コマンド一覧（操作キュー）
        ListView<String> cmdListView = new ListView<>();
        
        Label err = new Label("入力不備があります!");
		err.setStyle("-fx-text-fill: red;");
		err.setVisible(false);
		
        // -----------------------------
        // Add ボタン
        // -----------------------------
        Button addBtn = new Button("Add");
        addBtn.setOnAction(e -> {
        	
            String type = typeCombo.getValue();
            TransformCommand cmd = null;
            String msg = "";
            
            
    		 // --- まず入力チェック ---
    	    switch (type) {
    	        case "translate":
    	            if (this.tx.getText().isEmpty() || this.ty.getText().isEmpty()) {
    	                err.setVisible(true);
    	                return;
    	            }
    	            break;

    	        case "scale":
    	            if (this.sx.getText().isEmpty() || this.sy.getText().isEmpty()
    	            		|| parseOrZero(this.sx.getText())<=0 || parseOrZero(this.sy.getText())<=0) {
    	            	err.setVisible(true);
    	                return;
    	            }
    	            break;

    	        case "rotate":
    	            if (this.th.getText().isEmpty()) {
    	            	err.setVisible(true);
    	                return;
    	            }
    	            break;
    	    }

    	    // --- 入力が問題なければエラーを消す ---
    	    err.setVisible(false);
    		
            switch (type) {
            	
                case "translate":
                    double tx = parseOrZero(this.tx.getText());
                    double ty = parseOrZero(this.ty.getText());
                    cmd = TransformCommand.translate(tx, ty);
                    msg = "Translate: (" + tx + ", " + ty + ")";
                    break;

                case "scale":
                    double sx = parseOrZero(this.sx.getText());
                    double sy = parseOrZero(this.sy.getText());
                    cmd = TransformCommand.scale(sx, sy);
                    msg = "Scale: (" + sx + ", " + sy + ")";
                    break;

                case "rotate":
                    double th = parseOrZero(this.th.getText());
                    cmd = TransformCommand.rotate(th);
                    msg = "Rotate: " + th + " deg";
                    break;
            }
            
            // model に追加
            model.getTransformCommands().add(cmd);
            
            // 表示に追加
            cmdListView.getItems().add(msg);

            // 入力欄クリア
            tx.clear();
            ty.clear();
            sx.setText("1");
            sy.setText("1");
            th.clear();
        });


        // 次へボタン
        Button nextBtn = new Button("Next");
        nextBtn.setOnAction(e -> {
            controller.switchPane(new ConfirmPane(controller, model));
        });

        // 戻るボタン
        Button backBtn = new Button("Back");
        backBtn.setOnAction(e -> {
        	model.getTransformCommands().clear();
            controller.switchPane(new ShapeParamPane(controller, model));
        });

        getChildren().addAll(
                title,
                new Label("Select Transform Type:"),
                typeCombo,
                paramBox,
                addBtn,
                err,
                new Label("/*----- Transformation Commands (Queue) -----*/"),
                cmdListView,
                nextBtn,
                backBtn
            );
    }
    
 // 入力欄切り替えロジック
    private void updateParamBox(
            VBox paramBox,
            String type,
            TextField txField,
            TextField tyField,
            TextField sxField,
            TextField syField,
            TextField thField
    ) {
        paramBox.getChildren().clear();

        switch (type) {
            case "translate":
                paramBox.getChildren().addAll(
                    new Label("Translate X (tx):"), txField,
                    new Label("Translate Y (ty):"), tyField
                );
                break;

            case "scale":
                paramBox.getChildren().addAll(
                    new Label("Scale X (sx):"), sxField,
                    new Label("Scale Y (sy):"), syField
                );
                break;

            case "rotate":
                paramBox.getChildren().addAll(
                    new Label("Rotate (degree):"), thField
                );
                break;
        }
    }
    
    private double parseOrZero(String s) {
        try {
            return Double.parseDouble(s);
        } catch (Exception e) {
            return 0.0;
        }
    }
    
   

}

