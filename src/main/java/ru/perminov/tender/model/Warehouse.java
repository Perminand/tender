package ru.perminov.tender.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.Objects;
import java.util.UUID;

@Entity
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class Warehouse {
    @Id
    @GeneratedValue
    private UUID id;

    private String name;

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Warehouse warehouse = (Warehouse) o;
        return Objects.equals(id, warehouse.id) && Objects.equals(name, warehouse.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name);
    }
}