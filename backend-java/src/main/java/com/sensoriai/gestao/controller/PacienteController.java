package com.sensoriai.gestao.controller;

import com.sensoriai.gestao.model.entity.Paciente;
import com.sensoriai.gestao.service.PacienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller de Paciente — define os endpoints REST.
 *
 * @RestController: combina @Controller + @ResponseBody (retorna JSON automaticamente)
 * @RequestMapping: prefixo de todos os endpoints desta classe
 * @RequiredArgsConstructor: injeta o PacienteService automaticamente
 *
 * Com context-path=/api no application.yml, os endpoints ficam:
 *   GET  /api/pacientes
 *   GET  /api/pacientes/{id}
 *   POST /api/pacientes
 *   etc.
 */
@RestController
@RequestMapping("/pacientes")
@RequiredArgsConstructor
public class PacienteController {

    private final PacienteService pacienteService;

    @GetMapping
    public ResponseEntity<List<Paciente>> listar(@RequestParam UUID clinicId) {
        return ResponseEntity.ok(pacienteService.listarPorClinica(clinicId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Paciente> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(pacienteService.buscarPorId(id));
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<Paciente>> buscarPorNome(
            @RequestParam String nome,
            @RequestParam UUID clinicId) {
        return ResponseEntity.ok(pacienteService.buscarPorNome(nome, clinicId));
    }

    @PostMapping
    public ResponseEntity<Paciente> criar(@Valid @RequestBody Paciente paciente) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(pacienteService.criar(paciente));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Paciente> atualizar(
            @PathVariable UUID id,
            @Valid @RequestBody Paciente paciente) {
        return ResponseEntity.ok(pacienteService.atualizar(id, paciente));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        pacienteService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
