package br.com.senac.cinema;

import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

/**
 * Permite que o arquivo WAR seja iniciado por um servidor externo (Tomcat).
 * Quando executado diretamente (main), continua usando o Tomcat embutido.
 */
public class ServletInitializer extends SpringBootServletInitializer {

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(CinemaApplication.class);
    }
}
