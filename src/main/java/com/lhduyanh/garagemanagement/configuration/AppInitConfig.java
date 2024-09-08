package com.lhduyanh.garagemanagement.configuration;

import com.lhduyanh.garagemanagement.entity.Account;
import com.lhduyanh.garagemanagement.entity.Role;
import com.lhduyanh.garagemanagement.entity.User;
import com.lhduyanh.garagemanagement.repository.AccountRepository;
import com.lhduyanh.garagemanagement.repository.RoleRepository;
import com.lhduyanh.garagemanagement.repository.UserRepository;
import jakarta.persistence.EntityManager;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AppInitConfig {

    PasswordEncoder passwordEncoder;

    @NonFinal
    static final String ADMIN_EMAIL = "admin"; // @lhduyanh.com
    @NonFinal
    static final String ADMIN_PASSWORD = "admin";

    @Bean
    ApplicationRunner applicationRunner(UserRepository userRepository, AccountRepository accountRepository, RoleRepository roleRepository) {
        log.info("Initializing application.....");
        return args -> {
            if (accountRepository.findByEmail(ADMIN_EMAIL).isEmpty()) {

//                Role adminRole = roleRepository.findByRoleKey("ADMIN")
//                        .orElseGet(() -> roleRepository.save(Role.builder()
//                                .roleKey("ADMIN")
//                                .roleName("Quản trị")
//                                .status(1)
//                                .build()));

////                List<Role> r = roleRepository.findByRoleKey("ADMIN");
//                if (!r.isEmpty()) {
//                    log.info("\n\n\n\nRole get by r: " + r.get(0).getRoleName() + "\n\n\n\n");
//                }
                User user;

                var adminUser = userRepository.findByStatus(9999);
                user = adminUser.orElseGet(() -> User.builder()
                        .name("Quản trị")
                        .gender(1)
                        .status(9999)
                        .build());

                Optional<Role> optionalRole = roleRepository.findByRoleKey("ADMIN");
                if (optionalRole.isPresent()) {
                    Role role = optionalRole.get();

                    var roles = new HashSet<Role>();
                    roles.add(role);

                    user.setRoles(roles);
                    user = userRepository.save(user);
                }

                accountRepository.save(Account.builder()
                                .email(ADMIN_EMAIL)
                                .password(passwordEncoder.encode(ADMIN_PASSWORD))
                                .status(1)
                                .user(user)
                                .build());

                log.warn("\nAdmin user has been created with default password: \"admin\", please change it.\n");

            }
        };
    }
}
