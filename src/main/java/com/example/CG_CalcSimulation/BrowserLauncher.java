package com.example.CG_CalcSimulation;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.awt.Desktop;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

/**
 * ローカル開発環境でのみ有効になるコンポーネント。
 * Spring Boot の起動完了時にデフォルトブラウザで localhost:8080 を自動的に開く。
 *
 * 有効化するには、プロファイル "local" を指定して起動する必要がある。
 * 例: -Dspring.profiles.active=local
 */
@Component
@Profile("local")
public class BrowserLauncher {

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        System.out.println("Application started in local mode ... launching browser now");
        browse("http://localhost:8080");
    }

    private void browse(String url) {
        if (Desktop.isDesktopSupported()) {
            Desktop desktop = Desktop.getDesktop();
            try {
                desktop.browse(new URI(url));
            } catch (IOException | URISyntaxException e) {
                e.printStackTrace();
            }
        } else {
            try {
                new ProcessBuilder("rundll32", "url.dll,FileProtocolHandler", url).start();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
