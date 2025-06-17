package ru.perminov.tender.model.company;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.UUID;

@Entity
@Table(name = "contacts")
@Getter
@Setter
@ToString(exclude = "contactPerson")
@NoArgsConstructor
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    private ContactType contactType;

    private String value;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_person_id", nullable = false)
    private ContactPerson contactPerson;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Contact contact = (Contact) o;
        return id != null && id.equals(contact.id);
    }

    @Override
    public int hashCode() {
        return getId() != null ? getId().hashCode() : 0;
    }
} 