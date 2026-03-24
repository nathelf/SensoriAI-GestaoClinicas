package com.sensoriai.gestao;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Ponto de entrada da aplicação SensoriAI Gestão de Clínicas.
 *
 * @SpringBootApplication é um atalho que ativa três coisas:
 *   - @Configuration: essa classe pode definir beans (componentes gerenciados pelo Spring)
 *   - @EnableAutoConfiguration: Spring detecta e configura automaticamente o que estiver no classpath
 *   - @ComponentScan: Spring varre o pacote atual e subpacotes procurando componentes (@Controller, @Service, etc.)
 */
@SpringBootApplication
public class GestaoClinicasApplication {

    public static void main(String[] args) {
        SpringApplication.run(GestaoClinicasApplication.class, args);
    }
}
