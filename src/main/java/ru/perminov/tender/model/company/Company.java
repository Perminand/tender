package ru.perminov.tender.model.company;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.validator.constraints.UniqueElements;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID uuid;

    @Column(nullable = false, unique = true)
    private String inn;

    @Column(nullable = false)
    private String kpp;

    @Column(nullable = false, unique = true)
    private String ogrn;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    private String test;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_id")
    private CompanyType type;

    private String director;

    private String phone;

    private String email;

    private String bankName;

    @Column(unique = true)
    private String bankAccount;

    private String correspondentAccount;

    private String bik;

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ContactPerson> contactPersons = new ArrayList<>();

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Company company = (Company) o;
        return uuid != null && uuid.equals(company.uuid);
    }

    @Override
    public int hashCode() {
        return getUuid() != null ? getUuid().hashCode() : 0;
    }

    @Override
    public String toString() {
        return "Company{" +
                "uuid=" + uuid +
                ", inn='" + inn + '\'' +
                ", kpp='" + kpp + '\'' +
                ", ogrn='" + ogrn + '\'' +
                ", name='" + name + '\'' +
                ", address='" + address + '\'' +
                ", type=" + type +
                ", director='" + director + '\'' +
                ", phone='" + phone + '\'' +
                ", email='" + email + '\'' +
                ", bankName='" + bankName + '\'' +
                ", bankAccount='" + bankAccount + '\'' +
                ", correspondentAccount='" + correspondentAccount + '\'' +
                ", bik='" + bik + '\'' +
                ", contactPersons=" + contactPersons +
                '}';
    }
}
