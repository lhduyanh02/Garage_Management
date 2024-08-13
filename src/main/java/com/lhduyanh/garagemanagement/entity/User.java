package com.lhduyanh.garagemanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(columnDefinition = "VARCHAR(50)", nullable = true, length = 50)
    private String phone;

    @Column(nullable = false)
    private int gender = -1;

    @Column(nullable = false)
    private int status = 1;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "address_id")
    private Address address;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] avatar;

    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(
            name = "userrole",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private List<Role> roles;
}
