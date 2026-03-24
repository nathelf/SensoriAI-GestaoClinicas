package com.sensoriai.gestao.repository;

import com.sensoriai.gestao.model.entity.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository de Paciente.
 *
 * JpaRepository já fornece gratuitamente:
 *   - findAll(), findById(), save(), deleteById(), count(), etc.
 *
 * Métodos adicionais seguem uma convenção de nomenclatura:
 *   findBy + NomeDoCampo + Condição
 * O Spring gera o SQL automaticamente pelo nome do método.
 */
@Repository
public interface PacienteRepository extends JpaRepository<Paciente, UUID> {

    // SELECT * FROM patients WHERE clinic_id = ?
    List<Paciente> findByClinicId(UUID clinicId);

    // SELECT * FROM patients WHERE email = ? AND clinic_id = ?
    Optional<Paciente> findByEmailAndClinicId(String email, UUID clinicId);

    // SELECT * FROM patients WHERE cpf = ?
    Optional<Paciente> findByCpf(String cpf);

    // SELECT * FROM patients WHERE LOWER(name) LIKE LOWER('%termo%') AND clinic_id = ?
    List<Paciente> findByNomeContainingIgnoreCaseAndClinicId(String nome, UUID clinicId);
}
