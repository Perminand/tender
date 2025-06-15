package ru.perminov.tender.model.company;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.UUID;

@Entity
@Setter
@Getter
@EqualsAndHashCode(exclude = "id")
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class CompanyAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String postalCode;

    private String country;

    private String region;

    private String city;

    private String street;

    private String houseNumber;

    private String apartmentNumber;

    private String additionalInfo;
}
