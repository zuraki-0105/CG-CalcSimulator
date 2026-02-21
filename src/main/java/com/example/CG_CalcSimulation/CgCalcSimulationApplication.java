package com.example.CG_CalcSimulation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;

import java.awt.Desktop;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

@SpringBootApplication
public class CgCalcSimulationApplication {

	public static void main(String[] args) {
		SpringApplication.run(CgCalcSimulationApplication.class, args);
	}

	@EventListener({ ApplicationReadyEvent.class })
	@Profile("local") // Added this annotation
	public void applicationReadyEvent() {
		System.out.println("Application started in local mode ... launching browser now"); // Modified this line
		browse("http://localhost:8080");
	}

	public static void browse(String url) {
		if (Desktop.isDesktopSupported()) {
			Desktop desktop = Desktop.getDesktop();
			try {
				desktop.browse(new URI(url));
			} catch (IOException | URISyntaxException e) {
				e.printStackTrace();
			}
		} else {
			Runtime runtime = Runtime.getRuntime();
			try {
				runtime.exec("rundll32 url.dll,FileProtocolHandler " + url);
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}
}
