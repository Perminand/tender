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
@ToString
@NoArgsConstructor
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String inn;

    private String kpp;

    private String ogrn;

    private String name;

    private String legalName;

    private String shortName;

    private String address;

    @ManyToOne(fetch = FetchType.LAZY)
    private CompanyType companyType;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private CompanyRole role = CompanyRole.CUSTOMER;

    private String director;

    private String phone;

    private String email;

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CompanyBankAccount> bankAccounts = new ArrayList<>();

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ContactPerson> contactPersons = new ArrayList<>();

    @Column(name = "send_notifications")
    private Boolean sendNotifications = true;

    public void setBankAccounts(List<CompanyBankAccount> bankAccounts) {
        if (bankAccounts != null) {
            this.bankAccounts.clear();
            this.bankAccounts.addAll(bankAccounts);
            this.bankAccounts.forEach(ba -> ba.setCompany(this));
        }
    }

    public void setContactPersons(List<ContactPerson> contactPersons) {
        if (contactPersons != null) {
            this.contactPersons.clear();
            this.contactPersons.addAll(contactPersons);
            this.contactPersons.forEach(cp -> cp.setCompany(this));
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Company company = (Company) o;
        return id != null && id.equals(company.id);
    }

    @Override
    public int hashCode() {
        return getId() != null ? getId().hashCode() : 0;
    }

}
