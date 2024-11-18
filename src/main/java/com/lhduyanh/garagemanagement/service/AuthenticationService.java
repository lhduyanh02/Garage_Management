package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.*;
import com.lhduyanh.garagemanagement.dto.response.AuthenticationResponse;
import com.lhduyanh.garagemanagement.dto.response.IntrospectResponse;
import com.lhduyanh.garagemanagement.entity.InvalidatedToken;
import com.lhduyanh.garagemanagement.entity.Permissions;
import com.lhduyanh.garagemanagement.entity.Role;
import com.lhduyanh.garagemanagement.entity.User;
import com.lhduyanh.garagemanagement.enums.AccountStatus;
import com.lhduyanh.garagemanagement.enums.RoleStatus;
import com.lhduyanh.garagemanagement.enums.UserStatus;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.repository.AccountRepository;
import com.lhduyanh.garagemanagement.repository.InvalidatedTokenRepository;
import com.lhduyanh.garagemanagement.repository.PermissionRepository;
import com.lhduyanh.garagemanagement.repository.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

import static com.lhduyanh.garagemanagement.configuration.SecurityExpression.getUUIDFromJwt;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AuthenticationService {
    AccountRepository accountRepository;
    UserRepository userRepository;
    InvalidatedTokenRepository invalidatedTokenRepository;
    private final PermissionRepository permissionRepository;

    @NonFinal
    @Value("${app.password-strength}")
    int strength;

    @NonFinal
    @Value("${app.signer-key}")
    String SIGNER_KEY;

    @NonFinal
    @Value("${app.token-valid-duration}")
    Long VALID_DURATION;

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        var account = accountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        if (account.getStatus() <= AccountStatus.NOT_CONFIRM.getCode())
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(strength);

        boolean authenticated = passwordEncoder.matches(request.getPassword(), account.getPassword());
        if(!authenticated) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        var token = generateToken(request.getEmail());

        return AuthenticationResponse.builder()
                .token(token)
                .authenticated(true)
                .build();
    }

    private String generateToken(String email) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(email)
                .issuer("lhduyanh.com")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(VALID_DURATION, ChronoUnit.SECONDS).toEpochMilli()))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", buildScope(email))
                .claim("UUID", buildUUID(email))
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot create token", e);
            throw new RuntimeException(e);
        }
    }

    @Transactional
    public IntrospectResponse introspect(IntrospectRequest request) {
        try{
            var token = request.getToken();
            boolean result = true;
            try {
                verifyToken(token);
                result = true;
            } catch (Exception e) {
                result = false;
            }
            return IntrospectResponse.builder()
                    .valid(result)
                    .build();

        }
        catch (Exception e){
            throw new AppException(ErrorCode.INTROSPECT_EXCEPTION);
        }
    }

    @Transactional
    public IntrospectResponse customerIntrospect(IntrospectRequest request) {
        try{
            var token = request.getToken();
            boolean result = true;
            try {
                verifyToken(token);
                SignedJWT signedJWT = SignedJWT.parse(token);
                String uuid = signedJWT.getJWTClaimsSet().getStringClaim("UUID");

                userRepository.findById(uuid).filter(u -> u.getStatus() >= UserStatus.CONFIRMED.getCode())
                        .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

                result = true;
            } catch (Exception e) {
                result = false;
            }

            return IntrospectResponse.builder()
                    .valid(result)
                    .build();
        }
        catch (Exception e){
            throw new AppException(ErrorCode.INTROSPECT_EXCEPTION);
        }
    }

    @Transactional
    public IntrospectResponse introspectPermissions(String permissionKey) {
        try{
            String uid = getUUIDFromJwt();
            User user = userRepository.findByIdFullInfo(uid)
                    .filter(u -> u.getStatus() >= UserStatus.CONFIRMED.getCode())
                    .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

            if (user.getStatus() == 9999) {
                return IntrospectResponse.builder().valid(true).build();
            }

            Permissions permissions = permissionRepository.findByPermissionKey(permissionKey)
                    .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_EXISTED));

            if (user.getRoles().stream().filter(r -> r.getStatus() == RoleStatus.USING.getCode()).toList().isEmpty()) {
                return IntrospectResponse.builder().valid(false).build();
            }

            Optional<IntrospectResponse> response = user.getRoles().stream()
                    .filter(r -> r.getPermissions().stream()
                            .anyMatch(p -> p.getPermissionKey().equals(permissionKey)))
                    .findFirst()
                    .map(r -> IntrospectResponse.builder().valid(true).build());

            return response.orElse(IntrospectResponse.builder().valid(false).build());
        }
        catch (Exception e){
            e.printStackTrace();
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }

    private String buildScope(String email){
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if(user.getStatus() < UserStatus.CONFIRMED.getCode()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        List<Role> roles = new ArrayList<>(user.getRoles())
                .stream()
                .filter(r -> r.getStatus() == RoleStatus.USING.getCode())
                .toList();
        StringJoiner stringJoiner = new StringJoiner(" ");

        if(!CollectionUtils.isEmpty(roles)){
            roles.forEach(role -> stringJoiner.add(role.getRoleKey()));
        }
        else {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return stringJoiner.toString();
    }

    private String buildUUID(String email){
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Kiểm tra status > 1 và list role enabled not empty
        if (user.getStatus() < UserStatus.CONFIRMED.getCode()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        List<Role> roles = new ArrayList<>(user.getRoles())
                .stream()
                .filter(r -> r.getStatus() == RoleStatus.USING.getCode())
                .toList();
        if(CollectionUtils.isEmpty(roles)){
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        return user.getId();
    }

    public void logout(LogoutRequest logoutRequest) throws ParseException, JOSEException {
        var signedJWT = verifyToken(logoutRequest.getToken());

        String jti = signedJWT.getJWTClaimsSet().getJWTID();
        Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                .id(jti)
                .expiryTime(expiryTime)
                .build();

        invalidatedTokenRepository.save(invalidatedToken);
    }

    private SignedJWT verifyToken(String token) throws ParseException, JOSEException {
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());
        SignedJWT signedJWT = SignedJWT.parse(token);
        Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();
        var verified = signedJWT.verify(verifier);
        if(!(verified && expiryTime.after(new Date()))){
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        return signedJWT;
    }

    public AuthenticationResponse refreshToken(RefreshTokenRequest request) throws ParseException, JOSEException {
        var signJWT = verifyToken(request.getToken());

        var jti = signJWT.getJWTClaimsSet().getJWTID();
        var expiryTime = signJWT.getJWTClaimsSet().getExpirationTime();
        InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                                                        .id(jti)
                                                        .expiryTime(expiryTime)
                                                        .build();
        invalidatedTokenRepository.save(invalidatedToken);

        var userEmail = signJWT.getJWTClaimsSet().getSubject();

        var token = generateToken(userEmail);

        return AuthenticationResponse.builder()
                .token(token)
                .authenticated(true)
                .build();
    }

}
