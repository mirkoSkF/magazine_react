package it.skillfactory.magazine;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MagazineApplication {

	public static void main(String[] args) {
		SpringApplication.run(MagazineApplication.class, args);
		System.out.println("App in ascolto sulla porta 8096");
	}

}
