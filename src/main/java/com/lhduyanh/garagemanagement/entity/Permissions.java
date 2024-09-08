package com.lhduyanh.garagemanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@Entity
public class Permissions {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(nullable = false)
    String name;

    @Column(nullable = false, unique = true)
    String permissionKey;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "function_id")
    Functions function;

    @ManyToMany(mappedBy = "permissions")
    private Set<Role> roles;

//    @PreRemove
//    private void preRemove() {
//        // Xóa permission trong bảng role_permission trước khi xóa permission
//        for (Role role : roles) {
//            role.getPermissions().remove(this);
//        }
//    }
}
