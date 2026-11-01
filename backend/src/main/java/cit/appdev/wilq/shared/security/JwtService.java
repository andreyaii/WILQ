// package cit.appdev.wilq.shared.security;

// import org.springframework.stereotype.Service;

// import lombok.Value;

// @Service
// public class JwtService {
//     @Value("${app.jwt.secret}")
//     private String secretKey;

//     public String generateToken(UserDetails userDetails) {
//         return Jwts.builder()
//                 .subject(userDetails.getUsername())
//                 .claim("roles", userDetails.getAuthorities().stream()
//                         .map(GrantedAuthority::getAuthority).collect(Collectors.toList()))
//                 .issuedAt(new Date(System.currentTimeMillis()))
//                 .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 10 hours
//                 .signWith(getSignInKey(), SignatureAlgorithm.HS256)
//                 .compact();
//     }

//     public String extractUsername(String token) {
//         return extractClaim(token, Claims::getSubject);
//     }

//     public boolean isTokenValid(String token, UserDetails userDetails) {
//         final String username = extractUsername(token);
//         return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
//     }
// }
