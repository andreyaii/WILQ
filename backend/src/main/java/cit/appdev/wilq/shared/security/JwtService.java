package cit.appdev.wilq.shared.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import cit.appdev.wilq.account.entity.Account;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secretKey;

    private SecretKey getSignInKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(Account account) {
        return Jwts.builder()
                .subject(account.getId().toString())
                .claim("role", account.getRole().getRoleName())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 10))
                .signWith(getSignInKey())
                .compact();
    }

    public UUID extractAccountId(String token) {
        return UUID.fromString(extractClaim(token, claims -> claims.getSubject()));
    }

    public boolean isTokenValid(String token) {
        return !extractClaim(token, claims -> claims.getExpiration()).before(new Date());
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return resolver.apply(claims);
    }
}