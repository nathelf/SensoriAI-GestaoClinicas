package com.sensoriai.gestao.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidade Paciente — representa a tabela "patients" no banco de dados.
 *
 * @Entity: diz ao JPA que essa classe corresponde a uma tabela no banco
 * @Table: especifica o nome real da tabela (caso seja diferente do nome da classe)
 * @Data (Lombok): gera automaticamente getters, setters, toString, equals e hashCode
 * @NoArgsConstructor / @AllArgsConstructor (Lombok): gera construtores
 */
@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Paciente {

    /**
     * @Id: chave primária
     * @GeneratedValue: o banco gera o valor automaticamente
     * UUID é o tipo usado no Supabase por padrão
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "Nome é obrigatório")
    @Column(name = "name", nullable = false)
    private String nome;

    @Email(message = "E-mail inválido")
    @Column(name = "email")
    private String email;

    @Column(name = "phone")
    private String telefone;

    @Column(name = "birth_date")
    private LocalDate dataNascimento;

    @Column(name = "cpf", unique = true)
    private String cpf;

    // Campos específicos para TISS/TUSS (plano de saúde)
    @Column(name = "health_plan_number")
    private String numeroCarteirinha;

    @Column(name = "health_plan_name")
    private String nomePlano;

    @Column(name = "clinic_id", nullable = false)
    private UUID clinicId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "updated_at")
    private LocalDateTime atualizadoEm;

    @PrePersist
    protected void onCreate() {
        criadoEm = LocalDateTime.now();
        atualizadoEm = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        atualizadoEm = LocalDateTime.now();
    }
}
