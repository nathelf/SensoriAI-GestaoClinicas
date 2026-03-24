package com.sensoriai.gestao.service;

import com.sensoriai.gestao.exception.RecursoNaoEncontradoException;
import com.sensoriai.gestao.model.entity.Paciente;
import com.sensoriai.gestao.repository.PacienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service de Paciente — contém as regras de negócio.
 *
 * @Service: marca como componente de serviço gerenciado pelo Spring
 * @RequiredArgsConstructor (Lombok): gera construtor com todos os campos "final",
 *   que é a forma recomendada de injeção de dependência no Spring moderno.
 * @Transactional: garante que operações de escrita sejam atômicas (tudo ou nada)
 */
@Service
@RequiredArgsConstructor
public class PacienteService {

    private final PacienteRepository pacienteRepository;

    public List<Paciente> listarPorClinica(UUID clinicId) {
        return pacienteRepository.findByClinicId(clinicId);
    }

    public Paciente buscarPorId(UUID id) {
        return pacienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Paciente não encontrado: " + id));
    }

    public List<Paciente> buscarPorNome(String nome, UUID clinicId) {
        return pacienteRepository.findByNomeContainingIgnoreCaseAndClinicId(nome, clinicId);
    }

    @Transactional
    public Paciente criar(Paciente paciente) {
        return pacienteRepository.save(paciente);
    }

    @Transactional
    public Paciente atualizar(UUID id, Paciente dadosAtualizados) {
        Paciente existente = buscarPorId(id);
        existente.setNome(dadosAtualizados.getNome());
        existente.setEmail(dadosAtualizados.getEmail());
        existente.setTelefone(dadosAtualizados.getTelefone());
        existente.setDataNascimento(dadosAtualizados.getDataNascimento());
        existente.setNumeroCarteirinha(dadosAtualizados.getNumeroCarteirinha());
        existente.setNomePlano(dadosAtualizados.getNomePlano());
        return pacienteRepository.save(existente);
    }

    @Transactional
    public void deletar(UUID id) {
        buscarPorId(id); // garante que existe antes de deletar
        pacienteRepository.deleteById(id);
    }
}
